/**
 * @fileoverview Property Mapping Module for OMC JSON Schema Compliance
 * 
 * This module handles the transformation of entity data from internal/RDF format
 * to the official MovieLabs OMC-JSON Schema v2.8 format. It is a critical component
 * of the export pipeline that ensures exported JSON validates against the OMC schema.
 * 
 * ## Purpose
 * The application stores entity data using property names that may differ from the
 * official OMC schema (e.g., 'firstName' vs 'givenName'). This module provides the
 * mapping layer to convert between these formats.
 * 
 * ## Key Responsibilities
 * 1. **Property Name Mapping** - Convert RDF/internal property names to OMC schema names
 * 2. **Object Reference Conversion** - Convert CURIE strings to {@id: value} objects
 * 3. **Identifier Structure Cleanup** - Flatten nested identifiers, remove combinedForm
 * 4. **Metadata Cleanup** - Remove entityType/schemaVersion from nested objects
 * 5. **Blank Node Filtering** - Remove temporary blank node references from output
 * 
 * ## Data Flow
 * ```
 * Entity Content → transformPropertyNames() → fixObjectReferences() 
 *   → fixIdentifierStructure() → cleanNestedObjects() → removeBlankNodeReferences()
 *   → Schema-Compliant JSON
 * ```
 * 
 * ## Usage
 * ```typescript
 * import { applyAllSchemaTransforms } from './property-mapping';
 * 
 * const schemaCompliant = applyAllSchemaTransforms(entityContent);
 * ```
 * 
 * ## Related Files
 * - `./index.ts` - Export orchestration that calls these transforms
 * - `../rdf/adapters/rdf-to-json.ts` - RDF→JSON conversion using similar mappings
 * - `./rdf/serializer.ts` - JSON→RDF predicate mappings (inverse direction)
 * 
 * @module property-mapping
 * @see https://movielabs.com/omc/json/schema/v2.8 - Official OMC JSON Schema
 */

/**
 * Mapping from internal/RDF property names to official OMC JSON Schema property names.
 * 
 * These mappings correct property names that differ between:
 * - How data is stored internally (often matching RDF predicate local names)
 * - What the OMC-JSON Schema v2.8 expects
 * 
 * @example
 * // Internal storage uses 'firstName', but OMC schema expects 'givenName'
 * const mapped = mapPropertyName('firstName'); // Returns 'givenName'
 * 
 * @constant
 */
const RDF_TO_JSON_PROPERTY_MAP: Record<string, string> = {
  // Address properties
  'streetNumberAndName': 'street',
  'city': 'locality',
  
  // Coordinates (parent object name)
  'geo': 'coordinates',
  
  // Person name properties
  'firstName': 'givenName',
  'firstGivenName': 'givenName',
  'lastName': 'familyName',
  'middleName': 'additionalName',
  
  // CreativeWork title properties
  'creativeWorkTitle': 'title',
  'titleName': 'titleText',
  'titleLanguage': 'language',
};

/**
 * Properties that represent entity references and should be converted to object format.
 * 
 * In OMC-JSON, entity references are expressed as objects with an @id property:
 * ```json
 * { "Location": { "@id": "me-nexus:uuid-here" } }
 * ```
 * 
 * NOT as simple strings:
 * ```json
 * { "Location": "me-nexus:uuid-here" }  // WRONG
 * ```
 * 
 * This set defines which property names should trigger this conversion.
 * 
 * @constant
 */
const OBJECT_REFERENCE_PROPERTIES = new Set([
  'Location',
  'Participant',
  'Asset',
  'Context',
  'CreativeWork',
  'Infrastructure',
  'Task',
]);

/**
 * Properties containing nested utility objects that should NOT have metadata fields.
 * 
 * In OMC-JSON, only root-level entities should have `entityType` and `schemaVersion`.
 * Nested utility objects (like address, personName, coordinates) are structural
 * helpers and should not contain these metadata fields.
 * 
 * This set identifies property names that contain such utility objects, allowing
 * the cleanup process to strip metadata from them.
 * 
 * @example
 * // CORRECT: No metadata in nested address
 * {
 *   "Location": {
 *     "address": { "street": "123 Main", "locality": "LA" }
 *   }
 * }
 * 
 * // WRONG: Nested object has metadata
 * {
 *   "Location": {
 *     "address": { "entityType": "Address", "street": "123 Main" }
 *   }
 * }
 * 
 * @constant
 */
const NESTED_OBJECT_PROPERTIES = new Set([
  'address',
  'coordinates',
  'geo',
  'personName',
  'fileDetails',
  'title',
  'creativeWorkTitle',
  'contactInfo',
  'scheduling',
  'scheduledStart',
  'scheduledEnd',
  'actualStart',
  'actualEnd',
]);

/**
 * Regular expression pattern to identify blank node IDs.
 * 
 * Blank nodes are temporary identifiers created during RDF processing that look like:
 * - "b0_identifier"
 * - "b1_something"
 * - "b123_value"
 * 
 * These should be filtered out of the final JSON export as they are implementation
 * artifacts, not meaningful identifiers.
 * 
 * @constant
 */
const BLANK_NODE_PATTERN = /^b\d+_/;

/**
 * Regular expression pattern to identify CURIE-style reference strings.
 * 
 * CURIEs (Compact URIs) are used internally to reference other entities:
 * - "me-nexus:uuid-value" → references an entity with that ID
 * - "omc:Asset" → references the Asset type
 * 
 * These string references need to be converted to object references for JSON export:
 * ```json
 * { "@id": "me-nexus:uuid-value" }
 * ```
 * 
 * The pattern matches: prefix (letters, numbers, hyphens) + colon + local name
 * Examples that match: "me-nexus:abc123", "omc:Asset", "xsd:string"
 * Examples that don't match: "http://example.com", "just-text", ":no-prefix"
 * 
 * @constant
 */
const CURIE_PATTERN = /^[a-zA-Z][a-zA-Z0-9-]*:[a-zA-Z0-9-]+$/;

// =============================================================================
// DETECTION FUNCTIONS
// These functions identify specific patterns in values for conditional processing
// =============================================================================

/**
 * Determines if a value is a blank node ID that should be filtered from output.
 * 
 * Blank nodes are temporary identifiers created during RDF round-trip processing.
 * They should not appear in the final exported JSON.
 * 
 * @param value - Any value to check
 * @returns true if the value matches the blank node pattern (e.g., "b0_xyz")
 * 
 * @example
 * isBlankNodeId("b0_12345");      // true
 * isBlankNodeId("me-nexus:uuid"); // false
 * isBlankNodeId(123);             // false
 */
export function isBlankNodeId(value: any): boolean {
  if (typeof value !== 'string') return false;
  return BLANK_NODE_PATTERN.test(value);
}

/**
 * Determines if a value is a CURIE-style entity reference string.
 * 
 * CURIEs (Compact URIs) are used internally to reference entities. They need
 * to be converted to object references with @id for OMC-JSON compliance.
 * 
 * @param value - Any value to check
 * @returns true if the value is a CURIE string (e.g., "me-nexus:uuid")
 * 
 * @example
 * isCurieReference("me-nexus:abc-123");  // true
 * isCurieReference("omc:Asset");          // true
 * isCurieReference("http://example.com"); // false (has //)
 * isCurieReference("plain-text");         // false (no colon)
 */
export function isCurieReference(value: any): boolean {
  if (typeof value !== 'string') return false;
  return CURIE_PATTERN.test(value);
}

// =============================================================================
// PROPERTY NAME MAPPING
// Convert internal property names to OMC schema-compliant names
// =============================================================================

/**
 * Maps a single property name from internal/RDF format to OMC JSON Schema format.
 * 
 * If the property has a mapping defined in RDF_TO_JSON_PROPERTY_MAP, the mapped
 * name is returned. Otherwise, the original name is returned unchanged.
 * 
 * @param rdfProperty - The internal/RDF property name
 * @returns The OMC-JSON Schema compliant property name
 * 
 * @example
 * mapPropertyName('firstName');    // 'givenName'
 * mapPropertyName('city');         // 'locality'
 * mapPropertyName('name');         // 'name' (no mapping, returned as-is)
 */
export function mapPropertyName(rdfProperty: string): string {
  return RDF_TO_JSON_PROPERTY_MAP[rdfProperty] || rdfProperty;
}

/**
 * Checks if a property should contain an object reference with @id.
 * 
 * Entity reference properties (Location, Participant, Asset, etc.) should be
 * objects with an @id property, not simple strings.
 * 
 * @param propertyName - The property name to check
 * @returns true if this property should be an object reference
 * 
 * @example
 * isObjectReferenceProperty('Location');  // true
 * isObjectReferenceProperty('name');      // false
 */
export function isObjectReferenceProperty(propertyName: string): boolean {
  return OBJECT_REFERENCE_PROPERTIES.has(propertyName);
}

/**
 * Checks if a property contains a nested utility object.
 * 
 * Nested utility objects should not have entityType or schemaVersion fields.
 * This function identifies such properties for metadata cleanup.
 * 
 * @param propertyName - The property name to check
 * @returns true if this property contains a nested utility object
 * 
 * @example
 * isNestedObjectProperty('address');      // true
 * isNestedObjectProperty('personName');   // true
 * isNestedObjectProperty('name');         // false
 */
export function isNestedObjectProperty(propertyName: string): boolean {
  return NESTED_OBJECT_PROPERTIES.has(propertyName);
}

/**
 * Converts a CURIE string reference to an object reference with @id.
 * 
 * This is the core transformation for entity references in OMC-JSON format.
 * 
 * @param value - The CURIE string reference
 * @returns An object with the @id property containing the reference
 * 
 * @example
 * toObjectReference("me-nexus:abc-123");
 * // Returns: { "@id": "me-nexus:abc-123" }
 */
export function toObjectReference(value: string): { "@id": string } {
  return { "@id": value };
}

/**
 * Fix identifier structure - flatten double-nested identifiers and remove combinedForm
 */
export function fixIdentifierStructure(identifiers: any): any[] {
  if (!identifiers) return [];
  
  // Handle non-array identifiers by wrapping them
  const idArray = Array.isArray(identifiers) ? identifiers : [identifiers];
  
  const result: any[] = [];
  
  for (const item of idArray) {
    if (item && typeof item === 'object') {
      // Check if double-nested (has identifier array inside)
      if (Array.isArray(item.identifier)) {
        // Flatten: extract inner identifiers
        for (const inner of item.identifier) {
          if (inner && typeof inner === 'object') {
            const cleaned = cleanIdentifierObject(inner);
            if (cleaned) result.push(cleaned);
          }
        }
      } else {
        // Single level - just clean it
        const cleaned = cleanIdentifierObject(item);
        if (cleaned) result.push(cleaned);
      }
    }
  }
  
  return result;
}

/**
 * Clean an individual identifier object
 */
function cleanIdentifierObject(obj: any): any | null {
  if (!obj || typeof obj !== 'object') return null;
  
  const { combinedForm, ...rest } = obj;
  
  // Must have identifierScope and identifierValue
  if (!rest.identifierScope && !rest.identifierValue) return null;
  
  return rest;
}

/**
 * Remove entityType and schemaVersion from nested objects
 */
export function cleanNestedMetadata(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  
  const { entityType, schemaVersion, ...rest } = obj;
  return rest;
}

/**
 * Transform property names recursively throughout an object
 */
export function transformPropertyNames(obj: any, parentKey?: string): any {
  if (Array.isArray(obj)) {
    return obj.map(item => transformPropertyNames(item, parentKey));
  }
  
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }
  
  const transformed: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    const mappedKey = mapPropertyName(key);
    transformed[mappedKey] = transformPropertyNames(value, key);
  }
  
  return transformed;
}

/**
 * Fix object references - convert CURIE string refs to {\"@id\": value} format
 * Only converts actual string references (CURIE format), leaves embedded objects intact
 */
export function fixObjectReferences(obj: any, parentKey?: string): any {
  if (Array.isArray(obj)) {
    return obj.map(item => fixObjectReferences(item, parentKey));
  }
  
  if (typeof obj !== 'object' || obj === null) {
    // Only convert if it's a CURIE-style reference string under an object reference property
    if (parentKey && isObjectReferenceProperty(parentKey) && isCurieReference(obj) && !isBlankNodeId(obj)) {
      return toObjectReference(obj);
    }
    return obj;
  }
  
  const result: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (isObjectReferenceProperty(key)) {
      // This property might be an object reference (if string CURIE) or embedded object
      if (typeof value === 'string') {
        // Only convert CURIE-style string references
        if (isCurieReference(value) && !isBlankNodeId(value)) {
          result[key] = toObjectReference(value);
        } else if (!isBlankNodeId(value)) {
          // Keep other strings as-is
          result[key] = value;
        }
        // Skip blank node IDs entirely
      } else if (Array.isArray(value)) {
        result[key] = value.map(item => {
          if (typeof item === 'string') {
            if (isCurieReference(item) && !isBlankNodeId(item)) {
              return toObjectReference(item);
            } else if (!isBlankNodeId(item)) {
              return item;
            }
            return undefined;
          }
          // Embedded objects - recursively process but don't convert to reference
          return fixObjectReferences(item, key);
        }).filter(item => item !== undefined);
      } else {
        // Embedded object - recursively process but keep as object
        result[key] = fixObjectReferences(value, key);
      }
    } else {
      result[key] = fixObjectReferences(value, key);
    }
  }
  
  return result;
}

/**
 * Remove metadata from nested objects, keeping it only on root
 */
export function cleanNestedObjects(obj: any, isRoot: boolean = true): any {
  if (Array.isArray(obj)) {
    return obj.map(item => cleanNestedObjects(item, false));
  }
  
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }
  
  const result: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (isNestedObjectProperty(key) && typeof value === 'object' && value !== null) {
      // Clean metadata from nested objects
      if (Array.isArray(value)) {
        result[key] = value.map(item => cleanNestedObjects(cleanNestedMetadata(item), false));
      } else {
        result[key] = cleanNestedObjects(cleanNestedMetadata(value), false);
      }
    } else if (!isRoot && (key === 'entityType' || key === 'schemaVersion')) {
      // Skip these on non-root objects
      continue;
    } else {
      result[key] = cleanNestedObjects(value, false);
    }
  }
  
  return result;
}

/**
 * Handle blank node IDs - remove properties that are just blank node references
 */
export function removeBlankNodeReferences(obj: any): any {
  if (Array.isArray(obj)) {
    return obj
      .map(item => removeBlankNodeReferences(item))
      .filter(item => item !== null && item !== undefined);
  }
  
  if (typeof obj !== 'object' || obj === null) {
    // Remove blank node ID strings
    if (isBlankNodeId(obj)) {
      return undefined;
    }
    return obj;
  }
  
  const result: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    const cleaned = removeBlankNodeReferences(value);
    
    // Skip if the cleaned value is undefined or an empty object/array
    if (cleaned === undefined) continue;
    if (Array.isArray(cleaned) && cleaned.length === 0) continue;
    if (typeof cleaned === 'object' && cleaned !== null && Object.keys(cleaned).length === 0) continue;
    
    result[key] = cleaned;
  }
  
  return result;
}

/**
 * Apply all schema compliance transforms to an entity
 */
export function applyAllSchemaTransforms(content: any): any {
  if (!content) return content;
  
  let result = content;
  
  // 1. Transform property names (RDF -> JSON)
  result = transformPropertyNames(result);
  
  // 2. Fix object references
  result = fixObjectReferences(result);
  
  // 3. Fix identifier structure
  if (result.identifier) {
    result.identifier = fixIdentifierStructure(result.identifier);
    if (result.identifier.length === 0) {
      delete result.identifier;
    }
  }
  
  // 4. Clean nested object metadata
  result = cleanNestedObjects(result, true);
  
  // 5. Remove blank node references
  result = removeBlankNodeReferences(result);
  
  return result;
}
