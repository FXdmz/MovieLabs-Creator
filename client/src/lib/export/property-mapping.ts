/**
 * Property name mapping from RDF/internal JSON to official OMC JSON Schema
 * Based on MovieLabs OMC-JSON Schema v2.8
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
 * Properties that should be object references with @id instead of strings
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
 * Properties that should NOT have entityType/schemaVersion
 * (nested utility objects, not root entities)
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
 * Pattern to match blank node IDs that should not be exported
 */
const BLANK_NODE_PATTERN = /^b\d+_/;

/**
 * Pattern to match CURIE-style references (prefix:value format)
 * These are string references that should be converted to {\"@id\": value}
 */
const CURIE_PATTERN = /^[a-zA-Z][a-zA-Z0-9-]*:[a-zA-Z0-9-]+$/;

/**
 * Check if a value looks like a blank node ID
 */
export function isBlankNodeId(value: any): boolean {
  if (typeof value !== 'string') return false;
  return BLANK_NODE_PATTERN.test(value);
}

/**
 * Check if a value is a CURIE-style reference string (e.g., "me-nexus:uuid")
 * These should be converted to {\"@id\": value} format
 */
export function isCurieReference(value: any): boolean {
  if (typeof value !== 'string') return false;
  return CURIE_PATTERN.test(value);
}

/**
 * Map a single property name from RDF/internal to OMC JSON
 */
export function mapPropertyName(rdfProperty: string): string {
  return RDF_TO_JSON_PROPERTY_MAP[rdfProperty] || rdfProperty;
}

/**
 * Check if a property should be an object reference
 */
export function isObjectReferenceProperty(propertyName: string): boolean {
  return OBJECT_REFERENCE_PROPERTIES.has(propertyName);
}

/**
 * Check if a property is a nested utility object that shouldn't have metadata
 */
export function isNestedObjectProperty(propertyName: string): boolean {
  return NESTED_OBJECT_PROPERTIES.has(propertyName);
}

/**
 * Convert a string reference to an object reference with @id
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
