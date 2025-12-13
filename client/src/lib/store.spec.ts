/**
 * @fileoverview Zustand Store Test Suite
 * 
 * Vitest tests for the ontology store including CRUD operations,
 * undo/redo functionality, and export capabilities.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { useOntologyStore, Entity } from './store';

describe('Ontology Store', () => {
  beforeEach(() => {
    useOntologyStore.setState({
      entities: [],
      selectedEntityId: null,
      past: [],
      future: []
    });
  });

  describe('Entity CRUD Operations', () => {
    describe('addEntity', () => {
      it('should add a Task entity with default content', () => {
        const store = useOntologyStore.getState();
        store.addEntity('Task');
        
        const entities = useOntologyStore.getState().entities;
        expect(entities).toHaveLength(1);
        expect(entities[0].type).toBe('Task');
        expect(entities[0].content.entityType).toBe('Task');
        expect(entities[0].content.schemaVersion).toContain('movielabs.com/omc');
      });

      it('should add an Asset entity with default AssetSC and assetFC', () => {
        const store = useOntologyStore.getState();
        store.addEntity('Asset');
        
        const entities = useOntologyStore.getState().entities;
        expect(entities[0].content.AssetSC).toBeDefined();
        expect(entities[0].content.assetFC).toBeDefined();
      });

      it('should add a Participant entity with PersonSC defaults', () => {
        const store = useOntologyStore.getState();
        store.addEntity('Participant');
        
        const entities = useOntologyStore.getState().entities;
        expect(entities[0].content.ParticipantSC).toBeDefined();
        expect(entities[0].content.ParticipantSC.entityType).toBe('Person');
      });

      it('should add an Infrastructure entity with InfrastructureSC', () => {
        const store = useOntologyStore.getState();
        store.addEntity('Infrastructure');
        
        const entities = useOntologyStore.getState().entities;
        expect(entities[0].content.InfrastructureSC).toBeDefined();
      });

      it('should add a CreativeWork entity with title array', () => {
        const store = useOntologyStore.getState();
        store.addEntity('CreativeWork');
        
        const entities = useOntologyStore.getState().entities;
        expect(entities[0].content.creativeWorkTitle).toBeDefined();
        expect(Array.isArray(entities[0].content.creativeWorkTitle)).toBe(true);
      });

      it('should select newly added entity', () => {
        const store = useOntologyStore.getState();
        store.addEntity('Task');
        
        const state = useOntologyStore.getState();
        expect(state.selectedEntityId).toBe(state.entities[0].id);
      });

      it('should generate unique identifier for each entity', () => {
        const store = useOntologyStore.getState();
        store.addEntity('Task');
        store.addEntity('Task');
        
        const entities = useOntologyStore.getState().entities;
        expect(entities[0].id).not.toBe(entities[1].id);
        expect(entities[0].content.identifier[0].identifierValue).not.toBe(
          entities[1].content.identifier[0].identifierValue
        );
      });
    });

    describe('addEntityFromContent', () => {
      it('should add entity with provided content', () => {
        const content = {
          entityType: 'Task',
          name: 'Imported Task',
          schemaVersion: 'https://movielabs.com/omc/json/schema/v2.8',
          identifier: [{ identifierScope: 'me-nexus', identifierValue: 'import-001' }]
        };
        
        const store = useOntologyStore.getState();
        store.addEntityFromContent('Task', 'import-001', content);
        
        const entities = useOntologyStore.getState().entities;
        expect(entities).toHaveLength(1);
        expect(entities[0].name).toBe('Imported Task');
        expect(entities[0].content).toEqual(content);
      });

      it('should use default name if content has no name', () => {
        const content = {
          entityType: 'Asset',
          schemaVersion: 'https://movielabs.com/omc/json/schema/v2.8'
        };
        
        const store = useOntologyStore.getState();
        store.addEntityFromContent('Asset', 'asset-001', content);
        
        const entities = useOntologyStore.getState().entities;
        expect(entities[0].name).toBe('New Asset');
      });
    });

    describe('updateEntity', () => {
      it('should update entity content', () => {
        const store = useOntologyStore.getState();
        store.addEntity('Task');
        
        const entityId = useOntologyStore.getState().entities[0].id;
        const newContent = {
          entityType: 'Task',
          name: 'Updated Task Name',
          schemaVersion: 'https://movielabs.com/omc/json/schema/v2.8'
        };
        
        store.updateEntity(entityId, newContent);
        
        const entities = useOntologyStore.getState().entities;
        expect(entities[0].content.name).toBe('Updated Task Name');
        expect(entities[0].name).toBe('Updated Task Name');
      });

      it('should preserve entity name if content has no name', () => {
        const store = useOntologyStore.getState();
        store.addEntity('Task');
        
        const entity = useOntologyStore.getState().entities[0];
        const originalName = entity.name;
        
        const newContent = {
          entityType: 'Task',
          schemaVersion: 'https://movielabs.com/omc/json/schema/v2.8'
        };
        
        store.updateEntity(entity.id, newContent);
        
        const updated = useOntologyStore.getState().entities[0];
        expect(updated.name).toBe(originalName);
      });
    });

    describe('removeEntity', () => {
      it('should remove entity by id', () => {
        const store = useOntologyStore.getState();
        store.addEntity('Task');
        store.addEntity('Asset');
        
        const taskId = useOntologyStore.getState().entities[0].id;
        store.removeEntity(taskId);
        
        const entities = useOntologyStore.getState().entities;
        expect(entities).toHaveLength(1);
        expect(entities[0].type).toBe('Asset');
      });

      it('should clear selection if removed entity was selected', () => {
        const store = useOntologyStore.getState();
        store.addEntity('Task');
        
        const entityId = useOntologyStore.getState().selectedEntityId;
        store.removeEntity(entityId!);
        
        expect(useOntologyStore.getState().selectedEntityId).toBeNull();
      });

      it('should preserve selection if different entity removed', () => {
        const store = useOntologyStore.getState();
        store.addEntity('Task');
        store.addEntity('Asset');
        
        const [task, asset] = useOntologyStore.getState().entities;
        store.selectEntity(task.id);
        store.removeEntity(asset.id);
        
        expect(useOntologyStore.getState().selectedEntityId).toBe(task.id);
      });
    });

    describe('selectEntity', () => {
      it('should set selectedEntityId', () => {
        const store = useOntologyStore.getState();
        store.addEntity('Task');
        
        const entityId = useOntologyStore.getState().entities[0].id;
        store.selectEntity(entityId);
        
        expect(useOntologyStore.getState().selectedEntityId).toBe(entityId);
      });

      it('should allow null selection', () => {
        const store = useOntologyStore.getState();
        store.addEntity('Task');
        store.selectEntity(null);
        
        expect(useOntologyStore.getState().selectedEntityId).toBeNull();
      });
    });

    describe('getSelectedEntity', () => {
      it('should return selected entity', () => {
        const store = useOntologyStore.getState();
        store.addEntity('Task');
        
        const entity = store.getSelectedEntity();
        expect(entity).not.toBeNull();
        expect(entity?.type).toBe('Task');
      });

      it('should return null if no entity selected', () => {
        const store = useOntologyStore.getState();
        store.selectEntity(null);
        
        const entity = store.getSelectedEntity();
        expect(entity).toBeNull();
      });
    });
  });

  describe('Undo/Redo', () => {
    describe('undo', () => {
      it('should restore previous state after addEntity', () => {
        const store = useOntologyStore.getState();
        store.addEntity('Task');
        
        expect(useOntologyStore.getState().entities).toHaveLength(1);
        
        store.undo();
        
        expect(useOntologyStore.getState().entities).toHaveLength(0);
      });

      it('should restore previous state after updateEntity', () => {
        const store = useOntologyStore.getState();
        store.addEntity('Task');
        
        const entityId = useOntologyStore.getState().entities[0].id;
        store.updateEntity(entityId, { 
          entityType: 'Task', 
          name: 'Updated',
          schemaVersion: 'https://movielabs.com/omc/json/schema/v2.8'
        });
        
        expect(useOntologyStore.getState().entities[0].name).toBe('Updated');
        
        store.undo();
        
        expect(useOntologyStore.getState().entities[0].name).toBe('New Task');
      });

      it('should restore previous state after removeEntity', () => {
        const store = useOntologyStore.getState();
        store.addEntity('Task');
        
        const entityId = useOntologyStore.getState().entities[0].id;
        store.removeEntity(entityId);
        
        expect(useOntologyStore.getState().entities).toHaveLength(0);
        
        store.undo();
        
        expect(useOntologyStore.getState().entities).toHaveLength(1);
      });

      it('should do nothing when history is empty', () => {
        const store = useOntologyStore.getState();
        store.undo();
        
        expect(useOntologyStore.getState().entities).toHaveLength(0);
      });
    });

    describe('redo', () => {
      it('should restore undone state', () => {
        const store = useOntologyStore.getState();
        store.addEntity('Task');
        store.undo();
        
        expect(useOntologyStore.getState().entities).toHaveLength(0);
        
        store.redo();
        
        expect(useOntologyStore.getState().entities).toHaveLength(1);
      });

      it('should do nothing when future is empty', () => {
        const store = useOntologyStore.getState();
        store.addEntity('Task');
        store.redo();
        
        expect(useOntologyStore.getState().entities).toHaveLength(1);
      });

      it('should clear future on new action', () => {
        const store = useOntologyStore.getState();
        store.addEntity('Task');
        store.undo();
        store.addEntity('Asset');
        
        store.redo();
        
        expect(useOntologyStore.getState().entities).toHaveLength(1);
        expect(useOntologyStore.getState().entities[0].type).toBe('Asset');
      });
    });

    describe('canUndo/canRedo', () => {
      it('canUndo should return false initially', () => {
        expect(useOntologyStore.getState().canUndo()).toBe(false);
      });

      it('canUndo should return true after action', () => {
        const store = useOntologyStore.getState();
        store.addEntity('Task');
        
        expect(store.canUndo()).toBe(true);
      });

      it('canRedo should return false initially', () => {
        expect(useOntologyStore.getState().canRedo()).toBe(false);
      });

      it('canRedo should return true after undo', () => {
        const store = useOntologyStore.getState();
        store.addEntity('Task');
        store.undo();
        
        expect(store.canRedo()).toBe(true);
      });
    });

    describe('history limit', () => {
      it('should limit history to MAX_HISTORY states', () => {
        const store = useOntologyStore.getState();
        
        for (let i = 0; i < 60; i++) {
          store.addEntity('Task');
        }
        
        const past = useOntologyStore.getState().past;
        expect(past.length).toBeLessThanOrEqual(50);
      });
    });
  });

  describe('Export Functions', () => {
    describe('exportJson', () => {
      it('should export single entity as object', () => {
        const store = useOntologyStore.getState();
        store.addEntity('Task');
        
        const exported = store.exportJson();
        expect(exported.entityType).toBe('Task');
      });

      it('should export multiple entities as array', () => {
        const store = useOntologyStore.getState();
        store.addEntity('Task');
        store.addEntity('Asset');
        
        const exported = store.exportJson();
        expect(Array.isArray(exported)).toBe(true);
        expect(exported).toHaveLength(2);
      });
    });

    describe('exportAs', () => {
      it('should export as JSON format', () => {
        const store = useOntologyStore.getState();
        store.addEntity('Task');
        
        const exported = store.exportAs('json');
        expect(typeof exported).toBe('string');
        const parsed = JSON.parse(exported);
        expect(parsed.entityType).toBe('Task');
      });

      it('should export as TTL format', () => {
        const store = useOntologyStore.getState();
        store.addEntity('Task');
        
        const exported = store.exportAs('ttl');
        expect(typeof exported).toBe('string');
        expect(exported).toContain('@prefix');
      });
    });

    describe('export edge cases', () => {
      it('should handle export with no entities', () => {
        const store = useOntologyStore.getState();
        const exported = store.exportJson();
        expect(exported).toEqual([]);
      });

      it('should export all entity types', () => {
        const store = useOntologyStore.getState();
        store.addEntity('Task');
        store.addEntity('Asset');
        store.addEntity('Participant');
        store.addEntity('Infrastructure');
        store.addEntity('CreativeWork');
        
        const exported = store.exportJson();
        expect(exported).toHaveLength(5);
      });
    });
  });

  describe('Edge Cases - Boundary Conditions', () => {
    describe('repeated undo operations', () => {
      it('should stop at history beginning', () => {
        const store = useOntologyStore.getState();
        store.addEntity('Task');
        
        store.undo();
        store.undo();
        store.undo();
        
        expect(useOntologyStore.getState().entities).toHaveLength(0);
        expect(store.canUndo()).toBe(false);
      });

      it('should handle undo all and redo all', () => {
        const store = useOntologyStore.getState();
        store.addEntity('Task');
        store.addEntity('Asset');
        store.addEntity('Participant');
        
        store.undo();
        store.undo();
        store.undo();
        
        expect(useOntologyStore.getState().entities).toHaveLength(0);
        
        store.redo();
        store.redo();
        store.redo();
        
        expect(useOntologyStore.getState().entities).toHaveLength(3);
      });

      it('should handle alternating undo/redo', () => {
        const store = useOntologyStore.getState();
        store.addEntity('Task');
        
        store.undo();
        store.redo();
        store.undo();
        store.redo();
        
        expect(useOntologyStore.getState().entities).toHaveLength(1);
      });
    });

    describe('entity operations on empty store', () => {
      it('should handle removeEntity on non-existent id', () => {
        const store = useOntologyStore.getState();
        store.removeEntity('non-existent-id');
        
        expect(useOntologyStore.getState().entities).toHaveLength(0);
      });

      it('should handle updateEntity on non-existent id', () => {
        const store = useOntologyStore.getState();
        store.updateEntity('non-existent-id', { entityType: 'Task', name: 'Test' });
        
        expect(useOntologyStore.getState().entities).toHaveLength(0);
      });

      it('should handle selectEntity with non-existent id', () => {
        const store = useOntologyStore.getState();
        store.selectEntity('non-existent-id');
        
        expect(useOntologyStore.getState().selectedEntityId).toBe('non-existent-id');
        expect(store.getSelectedEntity()).toBeFalsy();
      });
    });

    describe('rapid operations', () => {
      it('should handle multiple rapid adds', () => {
        const store = useOntologyStore.getState();
        
        for (let i = 0; i < 10; i++) {
          store.addEntity('Task');
        }
        
        expect(useOntologyStore.getState().entities).toHaveLength(10);
      });

      it('should handle add and immediate remove', () => {
        const store = useOntologyStore.getState();
        store.addEntity('Task');
        
        const entityId = useOntologyStore.getState().entities[0].id;
        store.removeEntity(entityId);
        
        expect(useOntologyStore.getState().entities).toHaveLength(0);
      });
    });

    describe('entity type validation', () => {
      it('should add Location entity type', () => {
        const store = useOntologyStore.getState();
        store.addEntity('Location');
        
        const entities = useOntologyStore.getState().entities;
        expect(entities[0].type).toBe('Location');
      });

      it('should add Context entity type', () => {
        const store = useOntologyStore.getState();
        store.addEntity('Context');
        
        const entities = useOntologyStore.getState().entities;
        expect(entities[0].type).toBe('Context');
      });
    });
  });
});
