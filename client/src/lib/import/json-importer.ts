/**
 * @fileoverview JSON Import Module for OMC Entities
 * 
 * This module provides functionality to parse and import MovieLabs OMC-JSON
 * compliant entities from JSON text. It supports both single-entity and
 * multi-entity imports with validation and transformation.
 * 
 * @module import/json-importer
 * 
 * @description
 * The importer handles three JSON input formats:
 * 1. Single entity object: `{ entityType: "Task", ... }`
 * 2. Array of entities: `[{ entityType: "Task", ... }, ...]`
 * 3. Wrapper with entities array: `{ entities: [...] }`
 * 
 * Each entity is validated for:
 * - Required entityType field
 * - Required schemaVersion field (must contain 'movielabs.com/omc')
 * - Valid identifier structure (or auto-generates one)
 * 
 * Task entities receive special transformation to normalize:
 * - customData → workUnit, state, stateDetails
 * - Context customData → scheduling
 * - uses.Asset → hasInputAssets
 * 
 * @example
 * // Import a single entity
 * const json = '{"entityType": "Task", "name": "Color Grade", ...}';
 * const result = parseOmcJson(json);
 * if (result.success) {
 *   console.log(result.entityType, result.content);
 * }
 * 
 * @example
 * // Import multiple entities
 * const json = '[{"entityType": "Task", ...}, {"entityType": "Asset", ...}]';
 * const result = parseOmcJsonMulti(json);
 * if (result.success) {
 *   result.entities.forEach(e => console.log(e.entityType, e.name));
 * }
 */

import { EntityType, ENTITY_TYPES } from '../constants';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Represents a successfully imported OMC entity.
 * 
 * @interface ImportedEntity
 * @property {EntityType} entityType - The OMC entity type (Task, Asset, etc.)
 * @property {string} entityId - Unique identifier extracted or generated
 * @property {any} content - Full transformed entity content
 * @property {string} name - Display name for the entity
 */
export interface ImportedEntity {
  entityType: EntityType;
  entityId: string;
  content: any;
  name: string;
}

/**
 * Result of a single-entity import operation.
 * 
 * @interface ImportResult
 * @property {boolean} success - Whether the import succeeded
 * @property {EntityType} [entityType] - Entity type if successful
 * @property {string} [entityId] - Entity ID if successful
 * @property {any} [content] - Entity content if successful
 * @property {string} [error] - Error message if failed
 */
export interface ImportResult {
  success: boolean;
  entityType?: EntityType;
  entityId?: string;
  content?: any;
  error?: string;
}

/**
 * Result of a multi-entity import operation.
 * 
 * @interface MultiImportResult
 * @property {boolean} success - Whether at least one entity was imported
 * @property {ImportedEntity[]} entities - Array of successfully imported entities
 * @property {string} [error] - Error message if completely failed
 * @property {string[]} [warnings] - Warnings about skipped or problematic entities
 */
export interface MultiImportResult {
  success: boolean;
  entities: ImportedEntity[];
  error?: string;
  warnings?: string[];
}

/**
 * Valid entity types from constants module.
 * Used for validation during import.
 */
const VALID_ENTITY_TYPES: readonly string[] = ENTITY_TYPES;

// ============================================================================
// TASK TRANSFORMATION
// ============================================================================

/**
 * Transforms a Task entity to normalize various property formats.
 * 
 * This function handles Task-specific transformations:
 * 1. Extracts workUnit from customData with namespace 'work'
 * 2. Extracts state/stateDetails from customData with namespace 'workflow'
 * 3. Processes Context array to extract scheduling from customData
 * 4. Normalizes uses.Asset to hasInputAssets for backward compatibility
 * 
 * @param {any} parsed - Raw parsed Task entity
 * @returns {any} Transformed Task entity with normalized properties
 * 
 * @example
 * // Input with customData
 * {
 *   entityType: 'Task',
 *   customData: [
 *     { namespace: 'work', value: { workUnit: [...] } },
 *     { namespace: 'workflow', value: { state: 'complete' } }
 *   ]
 * }
 * 
 * // Output with extracted properties
 * {
 *   entityType: 'Task',
 *   workUnit: [...],
 *   state: 'complete',
 *   customData: [...]
 * }
 */
function transformTaskEntity(parsed: any): any {
  const transformed = { ...parsed };

  if (Array.isArray(parsed.customData)) {
    for (const cd of parsed.customData) {
      if (cd.namespace === 'work' && cd.value?.workUnit) {
        transformed.workUnit = cd.value.workUnit;
      }
      if (cd.namespace === 'workflow' && cd.value) {
        if (cd.value.state) {
          transformed.state = cd.value.state;
        }
        if (cd.value.stateDetails) {
          transformed.stateDetails = cd.value.stateDetails;
        }
      }
    }
  }

  if (Array.isArray(parsed.Context)) {
    transformed.Context = parsed.Context.map((ctx: any) => {
      const transformedCtx = { ...ctx };
      
      if (Array.isArray(ctx.customData)) {
        for (const cd of ctx.customData) {
          if (cd.namespace === 'scheduling' && cd.value?.scheduling) {
            transformedCtx.scheduling = cd.value.scheduling;
          }
        }
      }
      
      if (ctx.uses?.Asset && Array.isArray(ctx.uses.Asset)) {
        transformedCtx.hasInputAssets = ctx.uses.Asset;
      }
      
      return transformedCtx;
    });
  }

  return transformed;
}

/**
 * Dispatches entity transformation based on entity type.
 * 
 * Currently only Task entities receive special transformation.
 * Other entity types are returned unchanged.
 * 
 * @param {any} parsed - Raw parsed entity
 * @returns {any} Transformed entity
 */
/**
 * Transforms a Participant entity to normalize field names and ensure
 * required fields are present for form binding.
 * 
 * Normalizations:
 * 1. Ensures ParticipantSC.entityType is set based on structuralType
 * 2. Converts personName.givenName → personName.firstGivenName
 * 
 * @param {any} parsed - Raw parsed Participant entity
 * @returns {any} Transformed Participant entity
 */
function transformParticipantEntity(parsed: any): any {
  const transformed = { ...parsed };
  
  if (parsed.ParticipantSC) {
    const sc = { ...parsed.ParticipantSC };
    
    // Ensure entityType is set based on structuralType
    if (!sc.entityType && sc.structuralType) {
      const typeMap: Record<string, string> = {
        'person': 'Person',
        'organization': 'Organization',
        'department': 'Department',
        'service': 'Service'
      };
      sc.entityType = typeMap[sc.structuralType.toLowerCase()] || 'Person';
    }
    
    // Normalize personName.givenName → personName.firstGivenName
    if (sc.personName && sc.personName.givenName && !sc.personName.firstGivenName) {
      sc.personName = {
        ...sc.personName,
        firstGivenName: sc.personName.givenName
      };
      delete sc.personName.givenName;
    }
    
    transformed.ParticipantSC = sc;
  }
  
  return transformed;
}

/**
 * Transforms Location entity address and coordinate field names for form compatibility.
 * 
 * Address normalizations:
 * 1. Converts address.streetNumberAndName → address.street
 * 2. Converts address.city → address.locality
 * 3. Converts address.state → address.region
 * 
 * Coordinate normalizations:
 * 1. Converts geo.latitude/longitude → coordinates.latitude/longitude
 * 2. Converts location.lat/lon → coordinates.latitude/longitude
 * 
 * @param {any} parsed - Raw parsed Location entity
 * @returns {any} Transformed Location entity
 */
function transformLocationEntity(parsed: any): any {
  console.log('[LOCATION-TRANSFORM DEBUG] Input:', JSON.stringify(parsed, null, 2));
  const transformed = { ...parsed };
  
  // Transform address fields
  if (parsed.address) {
    const addr = { ...parsed.address };
    
    // Normalize streetNumberAndName → street
    if (addr.streetNumberAndName && !addr.street) {
      addr.street = addr.streetNumberAndName;
      delete addr.streetNumberAndName;
    }
    
    // Normalize city → locality
    if (addr.city && !addr.locality) {
      addr.locality = addr.city;
      delete addr.city;
    }
    
    // Normalize state → region
    if (addr.state && !addr.region) {
      addr.region = addr.state;
      delete addr.state;
    }
    
    transformed.address = addr;
  }
  
  // Transform coordinate fields: geo → coordinates
  if (parsed.geo && !parsed.coordinates) {
    const coords: any = {};
    if (parsed.geo.latitude !== undefined) coords.latitude = parsed.geo.latitude;
    if (parsed.geo.longitude !== undefined) coords.longitude = parsed.geo.longitude;
    if (Object.keys(coords).length > 0) {
      transformed.coordinates = coords;
    }
    delete transformed.geo;
  }
  
  // Transform coordinate fields: location (lat/lon) → coordinates
  if (parsed.location && !parsed.coordinates) {
    const coords: any = {};
    if (parsed.location.lat !== undefined) coords.latitude = parsed.location.lat;
    if (parsed.location.lon !== undefined) coords.longitude = parsed.location.lon;
    if (Object.keys(coords).length > 0) {
      transformed.coordinates = coords;
    }
    delete transformed.location;
  }
  
  console.log('[LOCATION-TRANSFORM DEBUG] Output:', JSON.stringify(transformed, null, 2));
  console.log('[LOCATION-TRANSFORM DEBUG] address:', JSON.stringify(transformed.address, null, 2));
  console.log('[LOCATION-TRANSFORM DEBUG] coordinates:', JSON.stringify(transformed.coordinates, null, 2));
  return transformed;
}

function transformEntity(parsed: any): any {
  if (parsed.entityType === 'Task') {
    return transformTaskEntity(parsed);
  }
  if (parsed.entityType === 'Participant') {
    return transformParticipantEntity(parsed);
  }
  if (parsed.entityType === 'Location') {
    return transformLocationEntity(parsed);
  }
  return parsed;
}

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Validates and extracts an entity from a parsed JSON object.
 * 
 * Validation checks:
 * 1. Must be a non-null object
 * 2. Must have entityType field with valid value
 * 3. Must have schemaVersion containing 'movielabs.com/omc'
 * 
 * If no identifier exists, one is auto-generated.
 * 
 * @param {any} parsed - Raw parsed JSON object
 * @returns {{ valid: boolean; entity?: ImportedEntity; error?: string }}
 *          Validation result with entity if valid
 * 
 * @example
 * const result = validateAndExtractEntity({
 *   entityType: 'Task',
 *   schemaVersion: 'https://movielabs.com/omc/json/schema/v2.8',
 *   name: 'My Task'
 * });
 * 
 * if (result.valid) {
 *   console.log(result.entity.name); // 'My Task'
 * }
 */
function validateAndExtractEntity(parsed: any): { valid: boolean; entity?: ImportedEntity; error?: string } {
  if (typeof parsed !== 'object' || parsed === null) {
    return { valid: false, error: 'Entity must be an object' };
  }

  const entityType = parsed.entityType;
  if (!entityType) {
    return { valid: false, error: 'Missing entityType field' };
  }

  if (!VALID_ENTITY_TYPES.includes(entityType)) {
    return { valid: false, error: `Unknown entity type: "${entityType}"` };
  }

  const schemaVersion = parsed.schemaVersion;
  if (!schemaVersion) {
    return { valid: false, error: 'Missing schemaVersion field' };
  }

  if (!schemaVersion.includes('movielabs.com/omc')) {
    return { valid: false, error: `Invalid schema version: "${schemaVersion}"` };
  }

  let entityId: string;
  if (parsed.identifier && Array.isArray(parsed.identifier) && parsed.identifier.length > 0) {
    const primaryId = parsed.identifier[0];
    entityId = primaryId.identifierValue || primaryId.combinedForm?.split(':')[1] || crypto.randomUUID();
  } else {
    entityId = crypto.randomUUID();
    parsed.identifier = [{
      identifierScope: 'me-nexus',
      identifierValue: entityId,
      combinedForm: `me-nexus:${entityId}`
    }];
  }

  const name = parsed.name || parsed.characterName || 
    (parsed.creativeWorkTitle?.[0]?.titleName) || 
    `${entityType} ${entityId.slice(0, 8)}`;

  const transformedContent = transformEntity(parsed);

  return {
    valid: true,
    entity: {
      entityType: entityType as EntityType,
      entityId,
      content: transformedContent,
      name
    }
  };
}

// ============================================================================
// PUBLIC API - SINGLE ENTITY IMPORT
// ============================================================================

/**
 * Parses OMC-JSON text and returns a single entity.
 * 
 * This is the legacy API for backward compatibility.
 * For multi-entity support, use parseOmcJsonMulti() instead.
 * 
 * If the input contains multiple entities, only the first is returned.
 * 
 * @param {string} jsonText - Raw JSON text to parse
 * @returns {ImportResult} Import result with single entity or error
 * 
 * @example
 * const result = parseOmcJson('{"entityType": "Task", ...}');
 * if (result.success) {
 *   store.addEntityFromContent(result.entityType, result.entityId, result.content);
 * } else {
 *   console.error(result.error);
 * }
 */
export function parseOmcJson(jsonText: string): ImportResult {
  const result = parseOmcJsonMulti(jsonText);
  
  if (!result.success) {
    return { success: false, error: result.error };
  }
  
  if (result.entities.length === 0) {
    return { success: false, error: 'No valid entities found' };
  }
  
  if (result.entities.length === 1) {
    const entity = result.entities[0];
    return {
      success: true,
      entityType: entity.entityType,
      entityId: entity.entityId,
      content: entity.content
    };
  }
  
  const entity = result.entities[0];
  return {
    success: true,
    entityType: entity.entityType,
    entityId: entity.entityId,
    content: entity.content
  };
}

// ============================================================================
// PUBLIC API - MULTI ENTITY IMPORT
// ============================================================================

/**
 * Parses OMC-JSON text and returns all valid entities.
 * 
 * Supports three input formats:
 * 1. Single entity: `{ entityType: "Task", ... }`
 * 2. Array: `[{ entityType: "Task", ... }, ...]`
 * 3. Wrapper: `{ entities: [...] }`
 * 
 * Tracks duplicate IDs and generates warnings for:
 * - Duplicate identifiers (first wins)
 * - Invalid entities (skipped with warning)
 * 
 * @param {string} jsonText - Raw JSON text to parse
 * @returns {MultiImportResult} Import result with all entities and warnings
 * 
 * @example
 * const result = parseOmcJsonMulti(jsonArray);
 * if (result.success) {
 *   result.entities.forEach(entity => {
 *     store.addEntityFromContent(entity.entityType, entity.entityId, entity.content);
 *   });
 *   if (result.warnings) {
 *     result.warnings.forEach(w => console.warn(w));
 *   }
 * }
 */
export function parseOmcJsonMulti(jsonText: string): MultiImportResult {
  let parsed: any;
  
  try {
    parsed = JSON.parse(jsonText);
  } catch (e: any) {
    return { success: false, entities: [], error: `Invalid JSON format: ${e.message}` };
  }

  const entities: ImportedEntity[] = [];
  const warnings: string[] = [];
  const seenIds = new Set<string>();

  if (Array.isArray(parsed)) {
    for (let i = 0; i < parsed.length; i++) {
      const result = validateAndExtractEntity(parsed[i]);
      if (result.valid && result.entity) {
        if (seenIds.has(result.entity.entityId)) {
          warnings.push(`Duplicate identifier at index ${i}: ${result.entity.entityId}`);
        } else {
          seenIds.add(result.entity.entityId);
          entities.push(result.entity);
        }
      } else {
        warnings.push(`Entity at index ${i}: ${result.error}`);
      }
    }
  }
  else if (parsed.entities && Array.isArray(parsed.entities)) {
    for (let i = 0; i < parsed.entities.length; i++) {
      const result = validateAndExtractEntity(parsed.entities[i]);
      if (result.valid && result.entity) {
        if (seenIds.has(result.entity.entityId)) {
          warnings.push(`Duplicate identifier at index ${i}: ${result.entity.entityId}`);
        } else {
          seenIds.add(result.entity.entityId);
          entities.push(result.entity);
        }
      } else {
        warnings.push(`Entity at index ${i}: ${result.error}`);
      }
    }
  }
  else if (typeof parsed === 'object' && parsed !== null) {
    const result = validateAndExtractEntity(parsed);
    if (result.valid && result.entity) {
      entities.push(result.entity);
    } else {
      return { success: false, entities: [], error: result.error };
    }
  } else {
    return { success: false, entities: [], error: 'JSON must be an object or array of OMC entities' };
  }

  if (entities.length === 0) {
    return { 
      success: false, 
      entities: [], 
      error: 'No valid entities found in file',
      warnings: warnings.length > 0 ? warnings : undefined
    };
  }

  return {
    success: true,
    entities,
    warnings: warnings.length > 0 ? warnings : undefined
  };
}
