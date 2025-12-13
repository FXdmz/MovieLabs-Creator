/**
 * @fileoverview OMC Entity Export Orchestration Module
 * 
 * This module provides the main export API for converting OMC entities to
 * JSON and RDF/TTL formats. It serves as the central orchestration layer
 * that coordinates between different export strategies.
 * 
 * ## Responsibilities
 * 
 * 1. **Format Selection**: Routes exports to JSON or TTL serializers
 * 2. **Schema Compliance**: Applies transforms to ensure OMC-JSON Schema v2.8 compliance
 * 3. **Custom Data Management**: Moves non-standard properties to customData sections
 * 4. **Download Handling**: Triggers browser file downloads with correct MIME types
 * 
 * ## Export Pipelines
 * 
 * ### JSON Export Pipeline:
 * ```
 * Entity → applySchemaComplianceTransform() → applyAllSchemaTransforms() → JSON.stringify()
 * ```
 * 
 * ### RDF Export Pipeline (default):
 * ```
 * Entity → prepareEntitiesForRdfExport() → entitiesToTurtle()
 * ```
 * 
 * ### RDF Export Pipeline (via RdfStore):
 * ```
 * Entity → entitiesToTurtleViaRdf() (uses OmcRdfStore)
 * ```
 * 
 * ## Usage Examples
 * 
 * ```typescript
 * import { exportEntities, downloadExport } from './export';
 * 
 * // Export to JSON string
 * const jsonStr = exportEntities(entities, { format: 'json', pretty: true });
 * 
 * // Export to TTL string
 * const ttlStr = exportEntities(entities, { format: 'ttl' });
 * 
 * // Trigger browser download
 * downloadExport(entities, { format: 'json' }, 'my-project.json');
 * ```
 * 
 * @module client/src/lib/export
 * @see ./property-mapping.ts for JSON schema transforms
 * @see ./rdf/serializer.ts for TTL serialization
 */

import { Entity } from "../store";
import { entitiesToTurtle, entityToTurtle } from "./rdf/serializer";
import { entitiesToTurtleViaRdf, entitiesToJsonViaRdf } from "../rdf/serializer";
import { applyAllSchemaTransforms } from "./property-mapping";

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Supported export format types.
 * - "json": OMC-JSON Schema v2.8 compliant JSON
 * - "ttl": RDF/Turtle format with OMC ontology predicates
 */
export type ExportFormat = "json" | "ttl";

/**
 * Configuration options for entity export.
 * 
 * @property format - Output format: "json" or "ttl"
 * @property pretty - If true, format output with indentation (default: true)
 * @property useRdfStore - If true, use OmcRdfStore for conversion (enables round-trip parity)
 */
export interface ExportOptions {
  format: ExportFormat;
  pretty?: boolean;
  useRdfStore?: boolean;
}

/**
 * Structure for OMC customData entries.
 * Used to store ME-NEXUS extensions and other non-standard properties.
 * 
 * @property domain - The domain namespace (e.g., "me-nexus")
 * @property namespace - The specific namespace within the domain (e.g., "workflow", "work")
 * @property value - The custom data payload
 */
interface CustomDataEntry {
  domain: string;
  namespace: string;
  value: any;
}

// ============================================================================
// Custom Data Management Utilities
// ============================================================================

/**
 * Normalizes customData to always be an array.
 * Handles cases where customData might be undefined, null, or a single object.
 * 
 * @param customData - The customData value to normalize
 * @returns An array of CustomDataEntry objects
 * 
 * @example
 * ensureCustomDataArray(undefined) // => []
 * ensureCustomDataArray({ domain: "x", namespace: "y", value: {} }) // => [{ domain: "x", ... }]
 */
function ensureCustomDataArray(customData: any): CustomDataEntry[] {
  if (!customData) return [];
  if (Array.isArray(customData)) return customData;
  return [customData];
}

/**
 * Adds or merges a value into the customData array.
 * If an entry with the same domain+namespace exists, merges the values.
 * Otherwise, adds a new entry.
 * 
 * @param customData - The existing customData array (modified in place)
 * @param domain - The domain namespace (e.g., "me-nexus")
 * @param namespace - The specific namespace (e.g., "workflow")
 * @param valueToMerge - The value object to add/merge
 * @returns The modified customData array
 * 
 * @example
 * const cd = [];
 * addOrMergeCustomData(cd, "me-nexus", "workflow", { state: "assigned" });
 * // cd = [{ domain: "me-nexus", namespace: "workflow", value: { state: "assigned" } }]
 */
function addOrMergeCustomData(
  customData: CustomDataEntry[],
  domain: string,
  namespace: string,
  valueToMerge: any
): CustomDataEntry[] {
  const existingIndex = customData.findIndex(
    entry => entry.domain === domain && entry.namespace === namespace
  );
  
  if (existingIndex >= 0) {
    customData[existingIndex] = {
      ...customData[existingIndex],
      value: {
        ...customData[existingIndex].value,
        ...valueToMerge
      }
    };
  } else {
    customData.push({
      domain,
      namespace,
      value: valueToMerge
    });
  }
  
  return customData;
}

// ============================================================================
// Schema Compliance Transforms
// ============================================================================

/**
 * Applies OMC-JSON Schema compliance transforms to entity content.
 * 
 * This function handles properties that are used internally by ME-DMZ
 * but are not part of the standard OMC-JSON Schema. These properties
 * are moved to customData sections to maintain schema compliance.
 * 
 * ## Task Entity Transforms:
 * - `state`, `stateDetails` → customData[me-nexus/workflow]
 * - `workUnit` → customData[me-nexus/work]
 * - `taskClassification`, `meNexusService` → removed (UI-only)
 * - `Context[]` → each context is transformed independently
 * 
 * ## Context Transforms:
 * - `hasInputAssets` → uses.Asset
 * - `scheduling` → customData[me-nexus/scheduling]
 * 
 * @param content - The raw entity content object
 * @param entityType - The OMC entity type (e.g., "Task", "Asset")
 * @returns Transformed content object with schema-compliant structure
 */
function applySchemaComplianceTransform(content: any, entityType: string): any {
  if (!content) return content;
  
  const result = { ...content };
  let customData = ensureCustomDataArray(result.customData);
  
  if (entityType === "Task") {
    const { state, stateDetails, workUnit, taskClassification, meNexusService, ...taskRest } = result;
    
    if (state !== undefined || stateDetails !== undefined) {
      const workflowValue: any = {};
      if (state !== undefined) workflowValue.state = state;
      if (stateDetails !== undefined) workflowValue.stateDetails = stateDetails;
      customData = addOrMergeCustomData(customData, "me-nexus", "workflow", workflowValue);
    }
    
    if (workUnit !== undefined) {
      customData = addOrMergeCustomData(customData, "me-nexus", "work", { workUnit });
    }
    
    Object.assign(result, taskRest);
    delete result.state;
    delete result.stateDetails;
    delete result.workUnit;
    delete result.taskClassification;
    delete result.meNexusService;
    
    if (result.Context && Array.isArray(result.Context)) {
      result.Context = result.Context.map((ctx: any) => 
        applyContextTransformIndependent(ctx)
      ).filter(Boolean);
      if (result.Context.length === 0) {
        delete result.Context;
      }
    }
  }
  
  if (entityType === "Context") {
    return applyContextTransformIndependent(result);
  }
  
  if (customData.length > 0) {
    result.customData = customData;
  } else {
    delete result.customData;
  }
  
  return result;
}

/**
 * Transforms a Context object for schema compliance.
 * 
 * This is applied to both standalone Context entities and Context
 * objects nested within Task entities.
 * 
 * ## Transforms Applied:
 * - `hasInputAssets` → `uses.Asset` (OMC standard structure)
 * - `scheduling` → customData[me-nexus/scheduling]
 * - `hasOutputAssets`, `informs`, `isInformedBy` → removed (handled elsewhere)
 * 
 * @param context - The Context object to transform
 * @returns Transformed Context object
 */
function applyContextTransformIndependent(context: any): any {
  if (!context) return context;
  
  const { scheduling, hasInputAssets, hasOutputAssets, informs, isInformedBy, ...rest } = context;
  const result = { ...rest };
  let customData = ensureCustomDataArray(result.customData);
  
  if (hasInputAssets && Array.isArray(hasInputAssets) && hasInputAssets.length > 0) {
    result.uses = result.uses || {};
    result.uses.Asset = hasInputAssets;
  }
  
  if (scheduling !== undefined) {
    customData = addOrMergeCustomData(customData, "me-nexus", "scheduling", { scheduling });
  }
  
  if (customData.length > 0) {
    result.customData = customData;
  } else {
    delete result.customData;
  }
  
  return result;
}

// ============================================================================
// Entity Transform Pipeline
// ============================================================================

/**
 * Applies the full transform pipeline for JSON export.
 * 
 * Pipeline:
 * 1. applySchemaComplianceTransform() - Move ME-NEXUS fields to customData
 * 2. applyAllSchemaTransforms() - Property name mapping, reference formatting
 * 
 * @param entity - The Entity object to transform
 * @returns Transformed content ready for JSON serialization
 */
function transformEntityForJsonExport(entity: Entity): any {
  const complianceTransformed = applySchemaComplianceTransform(entity.content, entity.type);
  return applyAllSchemaTransforms(complianceTransformed);
}

/**
 * Cleans entity content for RDF export.
 * Currently a pass-through function, but reserved for future RDF-specific transforms.
 * 
 * @param content - The entity content to clean
 * @returns Cleaned content (currently unchanged)
 */
function cleanEntityForRdfExport(content: any): any {
  return content;
}

// ============================================================================
// Public Export API
// ============================================================================

/**
 * Prepares entities for JSON export by applying all transforms.
 * 
 * @param entities - Array of Entity objects to prepare
 * @returns Array of entities with transformed content
 * 
 * @example
 * const prepared = prepareEntitiesForJsonExport(entities);
 * const json = JSON.stringify(prepared.map(e => e.content), null, 2);
 */
export function prepareEntitiesForJsonExport(entities: Entity[]): Entity[] {
  return entities.map(entity => ({
    ...entity,
    content: transformEntityForJsonExport(entity)
  }));
}

/**
 * Prepares entities for RDF export by cleaning content.
 * 
 * @param entities - Array of Entity objects to prepare
 * @returns Array of entities with cleaned content
 */
export function prepareEntitiesForRdfExport(entities: Entity[]): Entity[] {
  return entities.map(entity => ({
    ...entity,
    content: cleanEntityForRdfExport(entity.content)
  }));
}

/**
 * Exports entities to the specified format as a string.
 * 
 * This is the main export function that routes to the appropriate
 * serializer based on the format option.
 * 
 * @param entities - Array of Entity objects to export
 * @param options - Export configuration options
 * @returns Serialized string in the requested format
 * 
 * @example
 * // Export to JSON
 * const json = exportEntities(entities, { format: 'json', pretty: true });
 * 
 * // Export to TTL
 * const ttl = exportEntities(entities, { format: 'ttl' });
 * 
 * // Export via RdfStore (for round-trip parity)
 * const json2 = exportEntities(entities, { format: 'json', useRdfStore: true });
 */
export function exportEntities(entities: Entity[], options: ExportOptions): string {
  const { format, pretty = true, useRdfStore = false } = options;
  
  if (format === "ttl") {
    if (useRdfStore) {
      return entitiesToTurtleViaRdf(entities, { pretty });
    }
    const rdfEntities = prepareEntitiesForRdfExport(entities);
    return entitiesToTurtle(rdfEntities);
  }
  
  if (useRdfStore) {
    return entitiesToJsonViaRdf(entities, { pretty });
  }
  
  const jsonEntities = prepareEntitiesForJsonExport(entities);
  const transformedContent = jsonEntities.map(e => e.content);
  const jsonContent = transformedContent.length === 1 
    ? transformedContent[0] 
    : transformedContent;
    
  return pretty 
    ? JSON.stringify(jsonContent, null, 2) 
    : JSON.stringify(jsonContent);
}

/**
 * Exports a single entity to the specified format.
 * Convenience wrapper around exportEntities for single-entity exports.
 * 
 * @param entity - The Entity object to export
 * @param options - Export configuration options
 * @returns Serialized string in the requested format
 */
export function exportEntity(entity: Entity, options: ExportOptions): string {
  return exportEntities([entity], options);
}

// ============================================================================
// File Type Utilities
// ============================================================================

/**
 * Returns the file extension for the given export format.
 * 
 * @param format - The export format
 * @returns File extension including the dot (e.g., ".json", ".ttl")
 */
export function getFileExtension(format: ExportFormat): string {
  return format === "ttl" ? ".ttl" : ".json";
}

/**
 * Returns the MIME type for the given export format.
 * 
 * @param format - The export format
 * @returns MIME type string (e.g., "application/json", "text/turtle")
 */
export function getMimeType(format: ExportFormat): string {
  return format === "ttl" ? "text/turtle" : "application/json";
}

// ============================================================================
// Browser Download
// ============================================================================

/**
 * Triggers a browser file download for the exported entities.
 * 
 * Creates a Blob from the serialized content, generates a temporary
 * download URL, and programmatically clicks a download link.
 * 
 * @param entities - Array of Entity objects to export
 * @param options - Export configuration options
 * @param filename - Optional filename (auto-generated if not provided)
 * 
 * @example
 * // Download with auto-generated filename
 * downloadExport(entities, { format: 'json' });
 * // Downloads as "omc_entities.json" or "{entityName}.json"
 * 
 * // Download with custom filename
 * downloadExport(entities, { format: 'ttl' }, 'my-project.ttl');
 */
export function downloadExport(
  entities: Entity[], 
  options: ExportOptions, 
  filename?: string
): void {
  const content = exportEntities(entities, options);
  const ext = getFileExtension(options.format);
  const mimeType = getMimeType(options.format);
  
  const defaultName = entities.length === 1 
    ? entities[0].name.replace(/[^a-zA-Z0-9-_]/g, "_")
    : "omc_entities";
    
  const finalFilename = filename || `${defaultName}${ext}`;
  
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = finalFilename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Re-export RDF serializer functions for convenience
export { entitiesToTurtle, entityToTurtle } from "./rdf/serializer";
