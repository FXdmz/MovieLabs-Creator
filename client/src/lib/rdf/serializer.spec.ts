/**
 * @fileoverview RDF Serializer Test Suite
 * 
 * Vitest tests for the RDF serialization functions including Turtle output,
 * entity-to-RDF conversion, and round-trip consistency.
 */
import { describe, it, expect } from 'vitest';
import {
  serializeStoreToTurtle,
  entitiesToTurtleViaRdf,
  entityToTurtleViaRdf,
  entitiesToJsonViaRdf
} from './serializer';
import { OmcRdfStore } from './store';
import { Entity } from '../store';

const createTestEntity = (type: string, id: string, name: string): Entity => ({
  id,
  type: type as any,
  name,
  content: {
    entityType: type,
    name,
    schemaVersion: 'https://movielabs.com/omc/json/schema/v2.8',
    identifier: [{
      identifierScope: 'me-nexus',
      identifierValue: id,
      combinedForm: `me-nexus:${id}`
    }]
  }
});

const createTaskEntity = (id: string): Entity => ({
  id,
  type: 'Task',
  name: 'Test Task',
  content: {
    entityType: 'Task',
    name: 'Test Task',
    schemaVersion: 'https://movielabs.com/omc/json/schema/v2.8',
    identifier: [{
      identifierScope: 'me-nexus',
      identifierValue: id,
      combinedForm: `me-nexus:${id}`
    }],
    state: 'In Process',
    taskFC: {
      l1Category: 'Post-Production',
      l2Service: 'Color & Finish',
      l3Service: 'Color Grading'
    }
  }
});

const createAssetEntity = (id: string): Entity => ({
  id,
  type: 'Asset',
  name: 'Test Asset',
  content: {
    entityType: 'Asset',
    name: 'Test Asset',
    schemaVersion: 'https://movielabs.com/omc/json/schema/v2.8',
    identifier: [{
      identifierScope: 'me-nexus',
      identifierValue: id,
      combinedForm: `me-nexus:${id}`
    }],
    AssetSC: {
      structuralType: 'digital.audioVisual',
      structuralProperties: {
        mediaType: 'video/mp4',
        frameWidth: 1920,
        frameHeight: 1080
      }
    },
    assetFC: {
      functionalType: 'capture.ocf'
    }
  }
});

describe('RDF Serializer', () => {
  describe('serializeStoreToTurtle', () => {
    it('should serialize empty store', () => {
      const store = new OmcRdfStore();
      const ttl = serializeStoreToTurtle(store);
      
      expect(typeof ttl).toBe('string');
    });

    it('should include prefixes', () => {
      const store = new OmcRdfStore();
      const ttl = serializeStoreToTurtle(store);
      
      expect(ttl).toContain('@prefix');
    });
  });

  describe('entitiesToTurtleViaRdf', () => {
    it('should convert single entity to Turtle', () => {
      const entity = createTestEntity('Task', 'task-001', 'Test Task');
      const ttl = entitiesToTurtleViaRdf([entity]);
      
      expect(ttl).toContain('@prefix');
      expect(ttl).toContain('Task');
    });

    it('should convert multiple entities to Turtle', () => {
      const entities = [
        createTestEntity('Task', 'task-001', 'Task One'),
        createTestEntity('Asset', 'asset-001', 'Asset One')
      ];
      
      const ttl = entitiesToTurtleViaRdf(entities);
      
      expect(ttl).toContain('task-001');
      expect(ttl).toContain('asset-001');
    });

    it('should include omc namespace', () => {
      const entity = createTestEntity('Task', 'task-001', 'Test Task');
      const ttl = entitiesToTurtleViaRdf([entity]);
      
      expect(ttl).toContain('movielabs.com/omc');
    });

    it('should include me-nexus namespace', () => {
      const entity = createTestEntity('Task', 'task-001', 'Test Task');
      const ttl = entitiesToTurtleViaRdf([entity]);
      
      expect(ttl).toContain('me-nexus.com');
    });

    it('should serialize entity name as rdfs:label', () => {
      const entity = createTestEntity('Task', 'task-001', 'My Task Name');
      const ttl = entitiesToTurtleViaRdf([entity]);
      
      expect(ttl).toContain('My Task Name');
    });

    it('should serialize schemaVersion', () => {
      const entity = createTestEntity('Task', 'task-001', 'Test Task');
      const ttl = entitiesToTurtleViaRdf([entity]);
      
      expect(ttl).toContain('movielabs.com/omc/json/schema/v2.8');
    });

    it('should handle empty entities array', () => {
      const ttl = entitiesToTurtleViaRdf([]);
      
      expect(typeof ttl).toBe('string');
    });
  });

  describe('entityToTurtleViaRdf', () => {
    it('should convert single entity to Turtle', () => {
      const entity = createTaskEntity('task-001');
      const ttl = entityToTurtleViaRdf(entity);
      
      expect(ttl).toContain('@prefix');
      expect(ttl).toContain('Task');
    });

    it('should include Task state', () => {
      const entity = createTaskEntity('task-001');
      const ttl = entityToTurtleViaRdf(entity);
      
      expect(ttl.toLowerCase()).toMatch(/in.?process|state/i);
    });

    it('should include Asset structural properties', () => {
      const entity = createAssetEntity('asset-001');
      const ttl = entityToTurtleViaRdf(entity);
      
      expect(ttl).toContain('1920');
      expect(ttl).toContain('1080');
    });
  });

  describe('entitiesToJsonViaRdf', () => {
    it('should round-trip entity through RDF back to JSON', () => {
      const entity = createTestEntity('Task', 'task-001', 'Test Task');
      const jsonStr = entitiesToJsonViaRdf([entity]);
      
      expect(typeof jsonStr).toBe('string');
      const parsed = JSON.parse(jsonStr);
      expect(parsed.entityType).toBe('Task');
      expect(parsed.name).toBe('Test Task');
    });

    it('should return array for multiple entities', () => {
      const entities = [
        createTestEntity('Task', 'task-001', 'Task One'),
        createTestEntity('Asset', 'asset-001', 'Asset One')
      ];
      
      const jsonStr = entitiesToJsonViaRdf(entities);
      const parsed = JSON.parse(jsonStr);
      
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed).toHaveLength(2);
    });

    it('should preserve schemaVersion through round-trip', () => {
      const entity = createTestEntity('Task', 'task-001', 'Test Task');
      const jsonStr = entitiesToJsonViaRdf([entity]);
      const parsed = JSON.parse(jsonStr);
      
      expect(parsed.schemaVersion).toContain('movielabs.com/omc');
    });

    it('should preserve identifier through round-trip', () => {
      const entity = createTestEntity('Task', 'task-001', 'Test Task');
      const jsonStr = entitiesToJsonViaRdf([entity]);
      const parsed = JSON.parse(jsonStr);
      
      expect(parsed.identifier).toBeDefined();
      expect(parsed.identifier[0].identifierValue).toBe('task-001');
    });

    it('should support pretty printing option', () => {
      const entity = createTestEntity('Task', 'task-001', 'Test Task');
      
      const prettyJson = entitiesToJsonViaRdf([entity], { pretty: true });
      const compactJson = entitiesToJsonViaRdf([entity], { pretty: false });
      
      expect(prettyJson.includes('\n')).toBe(true);
      expect(compactJson.includes('\n')).toBe(false);
    });
  });

  describe('Round-Trip Consistency', () => {
    it('should preserve Task entity type through round-trip', () => {
      const entity = createTaskEntity('task-001');
      const jsonStr = entitiesToJsonViaRdf([entity]);
      const parsed = JSON.parse(jsonStr);
      
      expect(parsed.entityType).toBe('Task');
    });

    it('should preserve Asset entity type through round-trip', () => {
      const entity = createAssetEntity('asset-001');
      const jsonStr = entitiesToJsonViaRdf([entity]);
      const parsed = JSON.parse(jsonStr);
      
      expect(parsed.entityType).toBe('Asset');
    });

    it('should preserve structural properties through round-trip', () => {
      const entity = createAssetEntity('asset-001');
      const jsonStr = entitiesToJsonViaRdf([entity]);
      const parsed = JSON.parse(jsonStr);
      
      expect(parsed.AssetSC?.structuralType).toBe('digital.audioVisual');
    });

    it('should preserve Task classification through round-trip', () => {
      const entity = createTaskEntity('task-001');
      const jsonStr = entitiesToJsonViaRdf([entity]);
      const parsed = JSON.parse(jsonStr);
      
      expect(parsed.taskFC?.l1Category).toBe('Post-Production');
      expect(parsed.taskFC?.l2Service).toBe('Color & Finish');
      expect(parsed.taskFC?.l3Service).toBe('Color Grading');
    });
  });
});
