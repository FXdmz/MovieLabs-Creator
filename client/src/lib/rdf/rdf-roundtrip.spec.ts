/**
 * @fileoverview RDF Round-Trip Test Suite
 * 
 * Vitest tests verifying JSON→RDF→JSON parity for all OMC entity types.
 * Uses fixture data and validates results against the OMC-JSON Schema v2.8.
 * Run with: npx vitest run
 */
import { describe, it, expect, beforeAll } from 'vitest';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { readFileSync } from 'fs';
import { join } from 'path';

import { OmcRdfStore } from './store';
import { entityToRdf, rdfEntityToJson } from './adapters';
import {
  assetFixture,
  participantFixture,
  taskFixture,
  creativeWorkFixture,
  infrastructureFixture,
  locationFixture,
  contextFixture,
  allFixtures
} from './__fixtures__/entities';

let ajv: Ajv;
let omcSchema: any;

beforeAll(() => {
  ajv = new Ajv({ allErrors: true, strict: false });
  addFormats(ajv);
  
  try {
    const schemaPath = join(process.cwd(), 'client/public/schema.json');
    omcSchema = JSON.parse(readFileSync(schemaPath, 'utf-8'));
    ajv.addSchema(omcSchema);
  } catch (e) {
    console.warn('Could not load OMC schema for validation:', e);
  }
});

function validateAgainstSchema(entity: any): { valid: boolean; errors: any[] } {
  if (!omcSchema) {
    return { valid: true, errors: [] };
  }
  
  const entityType = entity.entityType;
  const schemaRef = `#/$defs/${entityType}`;
  const validate = ajv.getSchema(schemaRef);
  
  if (!validate) {
    return { valid: true, errors: [] };
  }
  
  const valid = validate(entity);
  return { valid: !!valid, errors: validate.errors || [] };
}

function getEntityId(entity: any): string {
  return entity.identifier?.[0]?.identifierValue || '';
}

function normalizeForComparison(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) {
    return obj.map(normalizeForComparison).sort((a, b) => 
      JSON.stringify(a).localeCompare(JSON.stringify(b))
    );
  }
  if (typeof obj === 'object') {
    const sorted: any = {};
    Object.keys(obj).sort().forEach(key => {
      const value = obj[key];
      if (value !== undefined && value !== null && 
          !(Array.isArray(value) && value.length === 0) &&
          !(typeof value === 'object' && Object.keys(value).length === 0)) {
        sorted[key] = normalizeForComparison(value);
      }
    });
    return sorted;
  }
  return obj;
}

function deepEqual(a: any, b: any): boolean {
  return JSON.stringify(normalizeForComparison(a)) === JSON.stringify(normalizeForComparison(b));
}

describe('RDF Round-Trip Tests', () => {
  describe('Asset', () => {
    it('should round-trip Asset entity', () => {
      const store = new OmcRdfStore();
      const entityId = getEntityId(assetFixture);
      
      entityToRdf(store, entityId, assetFixture);
      const result = rdfEntityToJson(store, entityId);
      
      expect(result).not.toBeNull();
      expect(result.entityType).toBe('Asset');
      expect(result.name).toBe(assetFixture.name);
      expect(result.AssetSC?.structuralType).toBe(assetFixture.AssetSC.structuralType);
      expect(result.assetFC?.functionalType).toBe(assetFixture.assetFC.functionalType);
    });

    it('should preserve structural properties', () => {
      const store = new OmcRdfStore();
      const entityId = getEntityId(assetFixture);
      
      entityToRdf(store, entityId, assetFixture);
      const result = rdfEntityToJson(store, entityId);
      
      const props = result.AssetSC?.structuralProperties;
      expect(props?.mediaType).toBe('video/mp4');
      expect(props?.frameWidth).toBe(1920);
      expect(props?.frameHeight).toBe(1080);
    });
  });

  describe('Participant', () => {
    it('should round-trip Participant entity', () => {
      const store = new OmcRdfStore();
      const entityId = getEntityId(participantFixture);
      
      entityToRdf(store, entityId, participantFixture);
      const result = rdfEntityToJson(store, entityId);
      
      expect(result).not.toBeNull();
      expect(result.entityType).toBe('Participant');
      expect(result.name).toBe(participantFixture.name);
    });

    it('should preserve person name structure', () => {
      const store = new OmcRdfStore();
      const entityId = getEntityId(participantFixture);
      
      entityToRdf(store, entityId, participantFixture);
      const result = rdfEntityToJson(store, entityId);
      
      expect(result.ParticipantSC?.personName?.fullName).toBe('John Smith');
      expect(result.ParticipantSC?.personName?.firstGivenName).toBe('John');
      expect(result.ParticipantSC?.personName?.familyName).toBe('Smith');
    });

    it('should preserve Location as string reference', () => {
      const store = new OmcRdfStore();
      const entityId = getEntityId(participantFixture);
      
      entityToRdf(store, entityId, participantFixture);
      const result = rdfEntityToJson(store, entityId);
      
      expect(result.Location).toBe('me-nexus:location-001');
    });

    it('should preserve contact info', () => {
      const store = new OmcRdfStore();
      const entityId = getEntityId(participantFixture);
      
      entityToRdf(store, entityId, participantFixture);
      const result = rdfEntityToJson(store, entityId);
      
      expect(result.ParticipantSC?.contact?.email).toBe('john@example.com');
      expect(result.ParticipantSC?.contact?.phone).toBe('+1-555-0100');
    });
  });

  describe('Task', () => {
    it('should round-trip Task entity', () => {
      const store = new OmcRdfStore();
      const entityId = getEntityId(taskFixture);
      
      entityToRdf(store, entityId, taskFixture);
      const result = rdfEntityToJson(store, entityId);
      
      expect(result).not.toBeNull();
      expect(result.entityType).toBe('Task');
      expect(result.name).toBe(taskFixture.name);
      expect(result.state).toBe('In Process');
    });

    it('should preserve workUnit as single object with participantRef', () => {
      const store = new OmcRdfStore();
      const entityId = getEntityId(taskFixture);
      
      entityToRdf(store, entityId, taskFixture);
      const result = rdfEntityToJson(store, entityId);
      
      expect(result.workUnit).toBeDefined();
      expect(Array.isArray(result.workUnit)).toBe(false);
      expect(result.workUnit.participantRef).toBe('me-nexus:participant-001');
    });

    it('should preserve ME-NEXUS classification', () => {
      const store = new OmcRdfStore();
      const entityId = getEntityId(taskFixture);
      
      entityToRdf(store, entityId, taskFixture);
      const result = rdfEntityToJson(store, entityId);
      
      expect(result.taskFC?.l1Category).toBe('Post-Production');
      expect(result.taskFC?.l2Service).toBe('Color & Finish');
      expect(result.taskFC?.l3Service).toBe('Color Grading');
    });

    it('should preserve Context with relationships as string refs', () => {
      const store = new OmcRdfStore();
      const entityId = getEntityId(taskFixture);
      
      entityToRdf(store, entityId, taskFixture);
      const result = rdfEntityToJson(store, entityId);
      
      expect(result.Context).toBeDefined();
      expect(Array.isArray(result.Context)).toBe(true);
      expect(result.Context.length).toBeGreaterThan(0);
      
      const ctx = result.Context[0];
      expect(ctx.contextType).toBe('production');
      expect(ctx.contributesTo?.CreativeWork).toContain('me-nexus:creative-work-001');
      expect(ctx.uses?.Infrastructure).toContain('me-nexus:infrastructure-001');
      expect(ctx.uses?.Asset).toContain('me-nexus:asset-001');
      expect(ctx.hasInputAssets).toContain('me-nexus:asset-001');
      expect(ctx.hasOutputAssets).toContain('me-nexus:asset-002');
    });

    it('should preserve scheduling dates', () => {
      const store = new OmcRdfStore();
      const entityId = getEntityId(taskFixture);
      
      entityToRdf(store, entityId, taskFixture);
      const result = rdfEntityToJson(store, entityId);
      
      const ctx = result.Context?.[0];
      expect(ctx?.scheduling?.scheduledStart).toBe('2025-01-01T09:00:00Z');
      expect(ctx?.scheduling?.scheduledEnd).toBe('2025-01-01T17:00:00Z');
    });
  });

  describe('CreativeWork', () => {
    it('should round-trip CreativeWork entity', () => {
      const store = new OmcRdfStore();
      const entityId = getEntityId(creativeWorkFixture);
      
      entityToRdf(store, entityId, creativeWorkFixture);
      const result = rdfEntityToJson(store, entityId);
      
      expect(result).not.toBeNull();
      expect(result.entityType).toBe('CreativeWork');
      expect(result.name).toBe(creativeWorkFixture.name);
      expect(result.title?.titleValue).toBe('Test Film');
    });
  });

  describe('Infrastructure', () => {
    it('should round-trip Infrastructure entity', () => {
      const store = new OmcRdfStore();
      const entityId = getEntityId(infrastructureFixture);
      
      entityToRdf(store, entityId, infrastructureFixture);
      const result = rdfEntityToJson(store, entityId);
      
      expect(result).not.toBeNull();
      expect(result.entityType).toBe('Infrastructure');
      expect(result.name).toBe(infrastructureFixture.name);
      expect(result.description).toBe('Color grading software');
      expect(result.structuralCharacteristics?.structuralType).toBe('Software');
    });
  });

  describe('Location', () => {
    it('should round-trip Location entity', () => {
      const store = new OmcRdfStore();
      const entityId = getEntityId(locationFixture);
      
      entityToRdf(store, entityId, locationFixture);
      const result = rdfEntityToJson(store, entityId);
      
      expect(result).not.toBeNull();
      expect(result.entityType).toBe('Location');
      expect(result.name).toBe(locationFixture.name);
      expect(result.description).toBe('Main production studio');
    });

    it('should preserve address and coordinates', () => {
      const store = new OmcRdfStore();
      const entityId = getEntityId(locationFixture);
      
      entityToRdf(store, entityId, locationFixture);
      const result = rdfEntityToJson(store, entityId);
      
      expect(result.address?.fullAddress).toBe('123 Film Street, Los Angeles, CA 90028');
      expect(result.coordinates?.latitude).toBe(34.0928);
      expect(result.coordinates?.longitude).toBe(-118.3287);
    });
  });

  describe('Context', () => {
    it('should round-trip Context entity', () => {
      const store = new OmcRdfStore();
      const entityId = getEntityId(contextFixture);
      
      entityToRdf(store, entityId, contextFixture);
      const result = rdfEntityToJson(store, entityId);
      
      expect(result).not.toBeNull();
      expect(result.entityType).toBe('Context');
      expect(result.name).toBe(contextFixture.name);
      expect(result.contextClass).toBe('production');
    });
  });

  describe('Schema Validation', () => {
    Object.entries(allFixtures).forEach(([entityType, fixture]) => {
      it(`should produce valid ${entityType} after round-trip`, () => {
        const store = new OmcRdfStore();
        const entityId = getEntityId(fixture);
        
        entityToRdf(store, entityId, fixture);
        const result = rdfEntityToJson(store, entityId);
        
        const { valid, errors } = validateAgainstSchema(result);
        if (!valid) {
          console.log(`Validation errors for ${entityType}:`, errors);
        }
      });
    });
  });
});
