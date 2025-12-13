/**
 * @fileoverview Property Mapping Registry Test Suite
 * 
 * Vitest tests for the JSON-to-RDF property mapping registry including
 * property lookups, entity class mappings, and bidirectional conversions.
 */
import { describe, it, expect } from 'vitest';
import {
  getPropertyMapping,
  getJsonKey,
  getEntityClass,
  getEntityTypeFromClass,
  getAllPropertyMappings
} from './registry';

describe('Property Mapping Registry', () => {
  describe('getPropertyMapping', () => {
    it('should return mapping for common properties', () => {
      const nameMapping = getPropertyMapping('name');
      expect(nameMapping).not.toBeNull();
      expect(nameMapping?.predicate.value).toContain('label');
    });

    it('should return mapping for description', () => {
      const descMapping = getPropertyMapping('description');
      expect(descMapping).not.toBeNull();
      expect(descMapping?.predicate.value).toContain('definition');
    });

    it('should return mapping for schemaVersion', () => {
      const mapping = getPropertyMapping('schemaVersion');
      expect(mapping).not.toBeNull();
      expect(mapping?.predicate.value).toContain('schemaVersion');
    });

    it('should return mapping for identifier with array flag', () => {
      const mapping = getPropertyMapping('identifier');
      expect(mapping).not.toBeNull();
      expect(mapping?.isArray).toBe(true);
      expect(mapping?.nestedType).toBe('Identifier');
    });

    it('should return mapping for AssetSC', () => {
      const mapping = getPropertyMapping('AssetSC');
      expect(mapping).not.toBeNull();
      expect(mapping?.nestedType).toBe('AssetSC');
    });

    it('should return mapping for assetFC', () => {
      const mapping = getPropertyMapping('assetFC');
      expect(mapping).not.toBeNull();
      expect(mapping?.nestedType).toBe('AssetFC');
    });

    it('should return mapping for TaskSC', () => {
      const mapping = getPropertyMapping('TaskSC');
      expect(mapping).not.toBeNull();
      expect(mapping?.nestedType).toBe('TaskSC');
    });

    it('should return mapping for ParticipantSC', () => {
      const mapping = getPropertyMapping('ParticipantSC');
      expect(mapping).not.toBeNull();
      expect(mapping?.nestedType).toBe('ParticipantSC');
    });

    it('should return mapping for date properties with isDate flag', () => {
      const scheduledStart = getPropertyMapping('scheduledStart');
      expect(scheduledStart?.isDate).toBe(true);
      
      const scheduledEnd = getPropertyMapping('scheduledEnd');
      expect(scheduledEnd?.isDate).toBe(true);
    });

    it('should return mapping for reference properties with isReference flag', () => {
      const location = getPropertyMapping('Location');
      expect(location?.isReference).toBe(true);
    });

    it('should return mapping for array properties with isArray flag', () => {
      const context = getPropertyMapping('Context');
      expect(context?.isArray).toBe(true);
    });

    it('should return mapping for ME-NEXUS custom properties', () => {
      const l1 = getPropertyMapping('l1Category');
      expect(l1).not.toBeNull();
      
      const l2 = getPropertyMapping('l2Service');
      expect(l2).not.toBeNull();
      
      const l3 = getPropertyMapping('l3Service');
      expect(l3).not.toBeNull();
    });

    it('should return null for unknown properties', () => {
      const mapping = getPropertyMapping('unknownProperty');
      expect(mapping).toBeNull();
    });
  });

  describe('getJsonKey', () => {
    it('should return JSON key for rdfs:label', () => {
      const key = getJsonKey('http://www.w3.org/2000/01/rdf-schema#label');
      expect(key).toBe('name');
    });

    it('should return JSON key for skos:definition', () => {
      const key = getJsonKey('http://www.w3.org/2004/02/skos/core#definition');
      expect(key).toBe('description');
    });

    it('should return JSON key for omc properties', () => {
      const key = getJsonKey('https://movielabs.com/omc/rdf/schema/v2.8#schemaVersion');
      expect(key).toBe('schemaVersion');
    });

    it('should return null for unknown predicates', () => {
      const key = getJsonKey('http://unknown.org/predicate');
      expect(key).toBeNull();
    });
  });

  describe('getEntityClass', () => {
    it('should return NamedNode for Asset', () => {
      const cls = getEntityClass('Asset');
      expect(cls).not.toBeNull();
      expect(cls?.value).toContain('Asset');
    });

    it('should return NamedNode for Task', () => {
      const cls = getEntityClass('Task');
      expect(cls).not.toBeNull();
      expect(cls?.value).toContain('Task');
    });

    it('should return NamedNode for Participant', () => {
      const cls = getEntityClass('Participant');
      expect(cls).not.toBeNull();
      expect(cls?.value).toContain('Participant');
    });

    it('should return NamedNode for Infrastructure', () => {
      const cls = getEntityClass('Infrastructure');
      expect(cls).not.toBeNull();
      expect(cls?.value).toContain('Infrastructure');
    });

    it('should return NamedNode for Location', () => {
      const cls = getEntityClass('Location');
      expect(cls).not.toBeNull();
      expect(cls?.value).toContain('Location');
    });

    it('should return NamedNode for CreativeWork', () => {
      const cls = getEntityClass('CreativeWork');
      expect(cls).not.toBeNull();
      expect(cls?.value).toContain('CreativeWork');
    });

    it('should return NamedNode for Context', () => {
      const cls = getEntityClass('Context');
      expect(cls).not.toBeNull();
      expect(cls?.value).toContain('Context');
    });

    it('should return NamedNode for structural characteristic types', () => {
      expect(getEntityClass('Person')).not.toBeNull();
      expect(getEntityClass('Organization')).not.toBeNull();
      expect(getEntityClass('DigitalAsset')).not.toBeNull();
    });

    it('should return NamedNode for characteristic types', () => {
      expect(getEntityClass('AssetSC')).not.toBeNull();
      expect(getEntityClass('AssetFC')).not.toBeNull();
      expect(getEntityClass('TaskSC')).not.toBeNull();
      expect(getEntityClass('TaskFC')).not.toBeNull();
    });

    it('should return null for unknown entity types', () => {
      const cls = getEntityClass('UnknownType');
      expect(cls).toBeNull();
    });
  });

  describe('getEntityTypeFromClass', () => {
    it('should return Asset for omc:Asset URI', () => {
      const type = getEntityTypeFromClass('https://movielabs.com/omc/rdf/schema/v2.8#Asset');
      expect(type).toBe('Asset');
    });

    it('should return Task for omc:Task URI', () => {
      const type = getEntityTypeFromClass('https://movielabs.com/omc/rdf/schema/v2.8#Task');
      expect(type).toBe('Task');
    });

    it('should return Participant for omc:Participant URI', () => {
      const type = getEntityTypeFromClass('https://movielabs.com/omc/rdf/schema/v2.8#Participant');
      expect(type).toBe('Participant');
    });

    it('should return null for unknown class URIs', () => {
      const type = getEntityTypeFromClass('http://unknown.org/SomeClass');
      expect(type).toBeNull();
    });
  });

  describe('getAllPropertyMappings', () => {
    it('should return all mappings as object', () => {
      const mappings = getAllPropertyMappings();
      expect(typeof mappings).toBe('object');
      expect(Object.keys(mappings).length).toBeGreaterThan(0);
    });

    it('should include common properties', () => {
      const mappings = getAllPropertyMappings();
      expect(mappings.name).toBeDefined();
      expect(mappings.description).toBeDefined();
      expect(mappings.schemaVersion).toBeDefined();
      expect(mappings.identifier).toBeDefined();
    });

    it('should include entity characteristic properties', () => {
      const mappings = getAllPropertyMappings();
      expect(mappings.AssetSC).toBeDefined();
      expect(mappings.assetFC).toBeDefined();
      expect(mappings.TaskSC).toBeDefined();
      expect(mappings.taskFC).toBeDefined();
      expect(mappings.ParticipantSC).toBeDefined();
    });

    it('should return a copy (not the original)', () => {
      const mappings1 = getAllPropertyMappings();
      const mappings2 = getAllPropertyMappings();
      expect(mappings1).not.toBe(mappings2);
      expect(mappings1).toEqual(mappings2);
    });
  });

  describe('Bidirectional Consistency', () => {
    it('should have consistent forward and reverse mappings', () => {
      const mappings = getAllPropertyMappings();
      
      for (const [jsonKey, mapping] of Object.entries(mappings)) {
        const reverseKey = getJsonKey(mapping.predicate.value);
        if (reverseKey !== null) {
          expect(reverseKey).toBe(jsonKey);
        }
      }
    });

    it('should have consistent entity class and type mappings', () => {
      const entityTypes = ['Asset', 'Task', 'Participant', 'Infrastructure', 'Location', 'CreativeWork', 'Context'];
      
      for (const entityType of entityTypes) {
        const cls = getEntityClass(entityType);
        expect(cls).not.toBeNull();
        
        const reversedType = getEntityTypeFromClass(cls!.value);
        expect(reversedType).toBe(entityType);
      }
    });
  });
});
