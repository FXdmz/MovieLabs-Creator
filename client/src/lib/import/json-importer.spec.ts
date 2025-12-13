/**
 * @fileoverview JSON Importer Test Suite
 * 
 * Vitest tests for the JSON import functionality including single/multi entity
 * import, validation, and transformation logic.
 */
import { describe, it, expect } from 'vitest';
import { parseOmcJson, parseOmcJsonMulti } from './json-importer';

const validTaskJson = JSON.stringify({
  entityType: 'Task',
  schemaVersion: 'https://movielabs.com/omc/json/schema/v2.8',
  name: 'Color Grading',
  identifier: [{
    identifierScope: 'me-nexus',
    identifierValue: 'task-001',
    combinedForm: 'me-nexus:task-001'
  }]
});

const validAssetJson = JSON.stringify({
  entityType: 'Asset',
  schemaVersion: 'https://movielabs.com/omc/json/schema/v2.8',
  name: 'Test Asset',
  identifier: [{
    identifierScope: 'me-nexus',
    identifierValue: 'asset-001',
    combinedForm: 'me-nexus:asset-001'
  }],
  AssetSC: {
    structuralType: 'digital.audioVisual'
  }
});

describe('JSON Importer', () => {
  describe('parseOmcJson - Single Entity Import', () => {
    it('should successfully parse a valid Task entity', () => {
      const result = parseOmcJson(validTaskJson);
      
      expect(result.success).toBe(true);
      expect(result.entityType).toBe('Task');
      expect(result.entityId).toBe('task-001');
      expect(result.content?.name).toBe('Color Grading');
    });

    it('should successfully parse a valid Asset entity', () => {
      const result = parseOmcJson(validAssetJson);
      
      expect(result.success).toBe(true);
      expect(result.entityType).toBe('Asset');
      expect(result.entityId).toBe('asset-001');
    });

    it('should fail on invalid JSON', () => {
      const result = parseOmcJson('not valid json {');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid JSON format');
    });

    it('should fail when entityType is missing', () => {
      const json = JSON.stringify({
        schemaVersion: 'https://movielabs.com/omc/json/schema/v2.8',
        name: 'Test'
      });
      
      const result = parseOmcJson(json);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('entityType');
    });

    it('should fail when schemaVersion is missing', () => {
      const json = JSON.stringify({
        entityType: 'Task',
        name: 'Test'
      });
      
      const result = parseOmcJson(json);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('schemaVersion');
    });

    it('should fail when schemaVersion is invalid', () => {
      const json = JSON.stringify({
        entityType: 'Task',
        schemaVersion: 'invalid-schema',
        name: 'Test'
      });
      
      const result = parseOmcJson(json);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid schema version');
    });

    it('should fail on unknown entity type', () => {
      const json = JSON.stringify({
        entityType: 'UnknownType',
        schemaVersion: 'https://movielabs.com/omc/json/schema/v2.8',
        name: 'Test'
      });
      
      const result = parseOmcJson(json);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Unknown entity type');
    });

    it('should auto-generate identifier if missing', () => {
      const json = JSON.stringify({
        entityType: 'Task',
        schemaVersion: 'https://movielabs.com/omc/json/schema/v2.8',
        name: 'Test Task'
      });
      
      const result = parseOmcJson(json);
      
      expect(result.success).toBe(true);
      expect(result.entityId).toBeDefined();
      expect(result.entityId!.length).toBeGreaterThan(0);
      expect(result.content?.identifier).toBeDefined();
      expect(result.content?.identifier[0].identifierScope).toBe('me-nexus');
    });
  });

  describe('parseOmcJsonMulti - Multi Entity Import', () => {
    it('should parse array of entities', () => {
      const json = JSON.stringify([
        {
          entityType: 'Task',
          schemaVersion: 'https://movielabs.com/omc/json/schema/v2.8',
          name: 'Task 1',
          identifier: [{ identifierScope: 'me-nexus', identifierValue: 'task-1' }]
        },
        {
          entityType: 'Asset',
          schemaVersion: 'https://movielabs.com/omc/json/schema/v2.8',
          name: 'Asset 1',
          identifier: [{ identifierScope: 'me-nexus', identifierValue: 'asset-1' }]
        }
      ]);
      
      const result = parseOmcJsonMulti(json);
      
      expect(result.success).toBe(true);
      expect(result.entities).toHaveLength(2);
      expect(result.entities[0].entityType).toBe('Task');
      expect(result.entities[1].entityType).toBe('Asset');
    });

    it('should parse entities wrapper format', () => {
      const json = JSON.stringify({
        entities: [
          {
            entityType: 'Task',
            schemaVersion: 'https://movielabs.com/omc/json/schema/v2.8',
            name: 'Task 1',
            identifier: [{ identifierScope: 'me-nexus', identifierValue: 'task-1' }]
          }
        ]
      });
      
      const result = parseOmcJsonMulti(json);
      
      expect(result.success).toBe(true);
      expect(result.entities).toHaveLength(1);
    });

    it('should handle single entity object', () => {
      const result = parseOmcJsonMulti(validTaskJson);
      
      expect(result.success).toBe(true);
      expect(result.entities).toHaveLength(1);
    });

    it('should detect and report duplicate IDs', () => {
      const json = JSON.stringify([
        {
          entityType: 'Task',
          schemaVersion: 'https://movielabs.com/omc/json/schema/v2.8',
          name: 'Task 1',
          identifier: [{ identifierScope: 'me-nexus', identifierValue: 'same-id' }]
        },
        {
          entityType: 'Task',
          schemaVersion: 'https://movielabs.com/omc/json/schema/v2.8',
          name: 'Task 2',
          identifier: [{ identifierScope: 'me-nexus', identifierValue: 'same-id' }]
        }
      ]);
      
      const result = parseOmcJsonMulti(json);
      
      expect(result.success).toBe(true);
      expect(result.entities).toHaveLength(1); // First one wins
      expect(result.warnings).toBeDefined();
      expect(result.warnings!.some(w => w.includes('Duplicate'))).toBe(true);
    });

    it('should skip invalid entities and continue', () => {
      const json = JSON.stringify([
        {
          entityType: 'Task',
          schemaVersion: 'https://movielabs.com/omc/json/schema/v2.8',
          name: 'Valid Task',
          identifier: [{ identifierScope: 'me-nexus', identifierValue: 'valid-1' }]
        },
        {
          entityType: 'InvalidType',
          schemaVersion: 'https://movielabs.com/omc/json/schema/v2.8',
          name: 'Invalid'
        },
        {
          entityType: 'Asset',
          schemaVersion: 'https://movielabs.com/omc/json/schema/v2.8',
          name: 'Valid Asset',
          identifier: [{ identifierScope: 'me-nexus', identifierValue: 'valid-2' }]
        }
      ]);
      
      const result = parseOmcJsonMulti(json);
      
      expect(result.success).toBe(true);
      expect(result.entities).toHaveLength(2);
      expect(result.warnings).toBeDefined();
    });

    it('should fail when no valid entities found', () => {
      const json = JSON.stringify([
        { entityType: 'InvalidType', schemaVersion: 'invalid', name: 'Bad 1' },
        { entityType: 'AlsoBad', schemaVersion: 'invalid', name: 'Bad 2' }
      ]);
      
      const result = parseOmcJsonMulti(json);
      
      expect(result.success).toBe(false);
      expect(result.entities).toHaveLength(0);
    });
  });

  describe('Task Transformation', () => {
    it('should extract workUnit from customData', () => {
      const json = JSON.stringify({
        entityType: 'Task',
        schemaVersion: 'https://movielabs.com/omc/json/schema/v2.8',
        name: 'Task with workUnit',
        identifier: [{ identifierScope: 'me-nexus', identifierValue: 'task-wu' }],
        customData: [
          {
            namespace: 'work',
            value: {
              workUnit: { participantRef: 'me-nexus:participant-001' }
            }
          }
        ]
      });
      
      const result = parseOmcJson(json);
      
      expect(result.success).toBe(true);
      expect(result.content?.workUnit).toBeDefined();
      expect(result.content?.workUnit.participantRef).toBe('me-nexus:participant-001');
    });

    it('should extract state from customData', () => {
      const json = JSON.stringify({
        entityType: 'Task',
        schemaVersion: 'https://movielabs.com/omc/json/schema/v2.8',
        name: 'Task with state',
        identifier: [{ identifierScope: 'me-nexus', identifierValue: 'task-state' }],
        customData: [
          {
            namespace: 'workflow',
            value: {
              state: 'complete',
              stateDetails: 'Finished on time'
            }
          }
        ]
      });
      
      const result = parseOmcJson(json);
      
      expect(result.success).toBe(true);
      expect(result.content?.state).toBe('complete');
      expect(result.content?.stateDetails).toBe('Finished on time');
    });

    it('should extract scheduling from Context customData', () => {
      const json = JSON.stringify({
        entityType: 'Task',
        schemaVersion: 'https://movielabs.com/omc/json/schema/v2.8',
        name: 'Task with scheduling',
        identifier: [{ identifierScope: 'me-nexus', identifierValue: 'task-sched' }],
        Context: [{
          contextType: 'production',
          customData: [{
            namespace: 'scheduling',
            value: {
              scheduling: {
                scheduledStart: '2025-01-01T09:00:00Z',
                scheduledEnd: '2025-01-01T17:00:00Z'
              }
            }
          }]
        }]
      });
      
      const result = parseOmcJson(json);
      
      expect(result.success).toBe(true);
      expect(result.content?.Context[0].scheduling).toBeDefined();
      expect(result.content?.Context[0].scheduling.scheduledStart).toBe('2025-01-01T09:00:00Z');
    });

    it('should normalize uses.Asset to hasInputAssets', () => {
      const json = JSON.stringify({
        entityType: 'Task',
        schemaVersion: 'https://movielabs.com/omc/json/schema/v2.8',
        name: 'Task with assets',
        identifier: [{ identifierScope: 'me-nexus', identifierValue: 'task-assets' }],
        Context: [{
          contextType: 'production',
          uses: {
            Asset: ['me-nexus:asset-001', 'me-nexus:asset-002']
          }
        }]
      });
      
      const result = parseOmcJson(json);
      
      expect(result.success).toBe(true);
      expect(result.content?.Context[0].hasInputAssets).toBeDefined();
      expect(result.content?.Context[0].hasInputAssets).toContain('me-nexus:asset-001');
    });
  });

  describe('Entity Name Extraction', () => {
    it('should extract name field for standard entities', () => {
      const result = parseOmcJson(validTaskJson);
      expect(result.content?.name).toBe('Color Grading');
    });

    it('should extract characterName for Character entities', () => {
      const json = JSON.stringify({
        entityType: 'Character',
        schemaVersion: 'https://movielabs.com/omc/json/schema/v2.8',
        characterName: 'John Doe',
        identifier: [{ identifierScope: 'me-nexus', identifierValue: 'char-001' }]
      });
      
      const result = parseOmcJson(json);
      
      expect(result.success).toBe(true);
    });

    it('should generate default name if none provided', () => {
      const json = JSON.stringify({
        entityType: 'Task',
        schemaVersion: 'https://movielabs.com/omc/json/schema/v2.8',
        identifier: [{ identifierScope: 'me-nexus', identifierValue: 'task-no-name' }]
      });
      
      const result = parseOmcJson(json);
      
      expect(result.success).toBe(true);
    });
  });

  describe('Edge Cases - Malformed Data', () => {
    it('should handle empty customData array', () => {
      const json = JSON.stringify({
        entityType: 'Task',
        schemaVersion: 'https://movielabs.com/omc/json/schema/v2.8',
        name: 'Task with empty customData',
        identifier: [{ identifierScope: 'me-nexus', identifierValue: 'task-empty-cd' }],
        customData: []
      });
      
      const result = parseOmcJson(json);
      
      expect(result.success).toBe(true);
    });

    it('should handle customData with missing value property', () => {
      const json = JSON.stringify({
        entityType: 'Task',
        schemaVersion: 'https://movielabs.com/omc/json/schema/v2.8',
        name: 'Task with malformed customData',
        identifier: [{ identifierScope: 'me-nexus', identifierValue: 'task-bad-cd' }],
        customData: [{ namespace: 'work' }]
      });
      
      const result = parseOmcJson(json);
      
      expect(result.success).toBe(true);
    });

    it('should handle customData with null value', () => {
      const json = JSON.stringify({
        entityType: 'Task',
        schemaVersion: 'https://movielabs.com/omc/json/schema/v2.8',
        name: 'Task with null customData value',
        identifier: [{ identifierScope: 'me-nexus', identifierValue: 'task-null-cd' }],
        customData: [{ namespace: 'work', value: null }]
      });
      
      const result = parseOmcJson(json);
      
      expect(result.success).toBe(true);
    });

    it('should handle empty identifier array', () => {
      const json = JSON.stringify({
        entityType: 'Task',
        schemaVersion: 'https://movielabs.com/omc/json/schema/v2.8',
        name: 'Task with empty identifiers',
        identifier: []
      });
      
      const result = parseOmcJson(json);
      
      expect(result.success).toBe(true);
      expect(result.entityId).toBeDefined();
    });

    it('should handle identifier with missing identifierValue', () => {
      const json = JSON.stringify({
        entityType: 'Task',
        schemaVersion: 'https://movielabs.com/omc/json/schema/v2.8',
        name: 'Task with incomplete identifier',
        identifier: [{ identifierScope: 'me-nexus' }]
      });
      
      const result = parseOmcJson(json);
      
      expect(result.success).toBe(true);
    });

    it('should handle empty Context array', () => {
      const json = JSON.stringify({
        entityType: 'Task',
        schemaVersion: 'https://movielabs.com/omc/json/schema/v2.8',
        name: 'Task with empty Context',
        identifier: [{ identifierScope: 'me-nexus', identifierValue: 'task-empty-ctx' }],
        Context: []
      });
      
      const result = parseOmcJson(json);
      
      expect(result.success).toBe(true);
    });

    it('should handle Context with empty customData', () => {
      const json = JSON.stringify({
        entityType: 'Task',
        schemaVersion: 'https://movielabs.com/omc/json/schema/v2.8',
        name: 'Task with Context empty customData',
        identifier: [{ identifierScope: 'me-nexus', identifierValue: 'task-ctx-cd' }],
        Context: [{
          contextType: 'production',
          customData: []
        }]
      });
      
      const result = parseOmcJson(json);
      
      expect(result.success).toBe(true);
    });

    it('should handle empty string name', () => {
      const json = JSON.stringify({
        entityType: 'Task',
        schemaVersion: 'https://movielabs.com/omc/json/schema/v2.8',
        name: '',
        identifier: [{ identifierScope: 'me-nexus', identifierValue: 'task-empty-name' }]
      });
      
      const result = parseOmcJson(json);
      
      expect(result.success).toBe(true);
    });

    it('should handle multi-import with all entities missing identifiers', () => {
      const json = JSON.stringify([
        {
          entityType: 'Task',
          schemaVersion: 'https://movielabs.com/omc/json/schema/v2.8',
          name: 'Task 1'
        },
        {
          entityType: 'Asset',
          schemaVersion: 'https://movielabs.com/omc/json/schema/v2.8',
          name: 'Asset 1'
        }
      ]);
      
      const result = parseOmcJsonMulti(json);
      
      expect(result.success).toBe(true);
      expect(result.entities).toHaveLength(2);
    });

    it('should handle multi-import with empty array', () => {
      const json = JSON.stringify([]);
      
      const result = parseOmcJsonMulti(json);
      
      expect(result.success).toBe(false);
      expect(result.entities).toHaveLength(0);
    });

    it('should handle nested participantRef in workUnit', () => {
      const json = JSON.stringify({
        entityType: 'Task',
        schemaVersion: 'https://movielabs.com/omc/json/schema/v2.8',
        name: 'Task with nested participantRef',
        identifier: [{ identifierScope: 'me-nexus', identifierValue: 'task-nested' }],
        customData: [
          {
            namespace: 'work',
            value: {
              workUnit: {
                participantRef: {
                  identifier: [{ identifierScope: 'me-nexus', identifierValue: 'participant-001' }]
                }
              }
            }
          }
        ]
      });
      
      const result = parseOmcJson(json);
      
      expect(result.success).toBe(true);
    });
  });
});
