import { EntityType, ENTITY_TYPES } from '../constants';

export interface ImportedEntity {
  entityType: EntityType;
  entityId: string;
  content: any;
  name: string;
}

export interface ImportResult {
  success: boolean;
  entityType?: EntityType;
  entityId?: string;
  content?: any;
  error?: string;
}

export interface MultiImportResult {
  success: boolean;
  entities: ImportedEntity[];
  error?: string;
  warnings?: string[];
}

const VALID_ENTITY_TYPES: readonly string[] = ENTITY_TYPES;

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

function transformEntity(parsed: any): any {
  if (parsed.entityType === 'Task') {
    return transformTaskEntity(parsed);
  }
  return parsed;
}

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
  
  // For backwards compatibility, return first entity but this shouldn't be used
  const entity = result.entities[0];
  return {
    success: true,
    entityType: entity.entityType,
    entityId: entity.entityId,
    content: entity.content
  };
}

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

  // Handle array of entities
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
  // Handle object with "entities" array
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
  // Handle single entity object
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
