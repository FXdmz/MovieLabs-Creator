import { EntityType, ENTITY_TYPES } from '../constants';

export interface ImportResult {
  success: boolean;
  entityType?: EntityType;
  entityId?: string;
  content?: any;
  error?: string;
}

const VALID_ENTITY_TYPES: readonly string[] = ENTITY_TYPES;

export function parseOmcJson(jsonText: string): ImportResult {
  let parsed: any;
  
  try {
    parsed = JSON.parse(jsonText);
  } catch (e) {
    return { success: false, error: 'Invalid JSON format' };
  }

  if (Array.isArray(parsed)) {
    return { success: false, error: 'File contains multiple entities. Please import single-entity files.' };
  }

  if (typeof parsed !== 'object' || parsed === null) {
    return { success: false, error: 'JSON must be an object representing an OMC entity' };
  }

  const entityType = parsed.entityType;
  if (!entityType) {
    return { success: false, error: 'Missing entityType field. This does not appear to be a valid OMC entity.' };
  }

  if (!VALID_ENTITY_TYPES.includes(entityType)) {
    return { success: false, error: `Unknown entity type: "${entityType}". Supported types: ${VALID_ENTITY_TYPES.join(', ')}` };
  }

  const schemaVersion = parsed.schemaVersion;
  if (!schemaVersion) {
    return { success: false, error: 'Missing schemaVersion field. OMC entities require a schema version.' };
  }

  if (!schemaVersion.includes('movielabs.com/omc')) {
    return { success: false, error: `Invalid schema version: "${schemaVersion}". Expected MovieLabs OMC schema.` };
  }

  let entityId: string | undefined;
  if (parsed.identifier && Array.isArray(parsed.identifier) && parsed.identifier.length > 0) {
    const primaryId = parsed.identifier[0];
    entityId = primaryId.identifierValue || primaryId.combinedForm;
  }

  if (!entityId) {
    entityId = crypto.randomUUID();
    parsed.identifier = [{
      identifierScope: 'me-nexus',
      identifierValue: entityId,
      combinedForm: `me-nexus:${entityId}`
    }];
  }

  return {
    success: true,
    entityType: entityType as EntityType,
    entityId,
    content: parsed
  };
}
