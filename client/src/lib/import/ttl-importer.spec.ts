/**
 * @fileoverview TTL Importer Test Suite
 * 
 * Vitest tests for the RDF/TTL import functionality including single/multi entity
 * import, namespace handling, and transformation logic.
 */
import { describe, it, expect } from 'vitest';
import { parseOmcTtl, parseOmcTtlMulti } from './ttl-importer';

const validTaskTtl = `
@prefix omc: <https://movielabs.com/omc/rdf/schema/v2.8#> .
@prefix me: <https://me-nexus.com/id/> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .

me:task-001 a omc:Task ;
    rdfs:label "Color Grading" ;
    omc:schemaVersion "https://movielabs.com/omc/json/schema/v2.8" ;
    omc:hasIdentifier [
        omc:hasIdentifierScope "me-nexus" ;
        omc:hasIdentifierValue "task-001"
    ] .
`;

const validAssetTtl = `
@prefix omc: <https://movielabs.com/omc/rdf/schema/v2.8#> .
@prefix me: <https://me-nexus.com/id/> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .

me:asset-001 a omc:Asset ;
    rdfs:label "Test Video" ;
    omc:schemaVersion "https://movielabs.com/omc/json/schema/v2.8" ;
    omc:hasIdentifier [
        omc:hasIdentifierScope "me-nexus" ;
        omc:hasIdentifierValue "asset-001"
    ] ;
    omc:hasAssetStructuralCharacteristic [
        a omc:DigitalAsset ;
        omc:hasStructuralType "digital.audioVisual"
    ] .
`;

const multiEntityTtl = `
@prefix omc: <https://movielabs.com/omc/rdf/schema/v2.8#> .
@prefix me: <https://me-nexus.com/id/> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .

me:task-001 a omc:Task ;
    rdfs:label "Task One" ;
    omc:schemaVersion "https://movielabs.com/omc/json/schema/v2.8" ;
    omc:hasIdentifier [
        omc:hasIdentifierScope "me-nexus" ;
        omc:hasIdentifierValue "task-001"
    ] .

me:asset-001 a omc:Asset ;
    rdfs:label "Asset One" ;
    omc:schemaVersion "https://movielabs.com/omc/json/schema/v2.8" ;
    omc:hasIdentifier [
        omc:hasIdentifierScope "me-nexus" ;
        omc:hasIdentifierValue "asset-001"
    ] .
`;

describe('TTL Importer', () => {
  describe('parseOmcTtl - Single Entity Import', () => {
    it('should successfully parse a valid Task TTL', async () => {
      const result = await parseOmcTtl(validTaskTtl);
      
      expect(result.success).toBe(true);
      expect(result.entityType).toBe('Task');
      expect(result.content?.name).toBe('Color Grading');
    });

    it('should successfully parse a valid Asset TTL', async () => {
      const result = await parseOmcTtl(validAssetTtl);
      
      expect(result.success).toBe(true);
      expect(result.entityType).toBe('Asset');
      expect(result.content?.name).toBe('Test Video');
    });

    it('should fail on invalid TTL syntax', async () => {
      const result = await parseOmcTtl('this is not valid turtle syntax @@@');
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should fail when no recognized entity types found', async () => {
      const ttl = `
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
<http://example.org/something> rdfs:label "Just some data" .
`;
      const result = await parseOmcTtl(ttl);
      
      expect(result.success).toBe(false);
    });

    it('should extract identifier from TTL', async () => {
      const result = await parseOmcTtl(validTaskTtl);
      
      expect(result.success).toBe(true);
      expect(result.entityId).toBeDefined();
    });
  });

  describe('parseOmcTtlMulti - Multi Entity Import', () => {
    it('should parse multiple entities from single TTL file', async () => {
      const result = await parseOmcTtlMulti(multiEntityTtl);
      
      expect(result.success).toBe(true);
      expect(result.entities.length).toBeGreaterThanOrEqual(2);
    });

    it('should identify entity types correctly', async () => {
      const result = await parseOmcTtlMulti(multiEntityTtl);
      
      expect(result.success).toBe(true);
      const entityTypes = result.entities.map(e => e.entityType);
      expect(entityTypes).toContain('Task');
      expect(entityTypes).toContain('Asset');
    });

    it('should handle empty TTL', async () => {
      const result = await parseOmcTtlMulti('');
      
      expect(result.success).toBe(false);
    });
  });

  describe('Entity Type Detection', () => {
    it('should detect Task from omc:Task type', async () => {
      const result = await parseOmcTtl(validTaskTtl);
      expect(result.entityType).toBe('Task');
    });

    it('should detect Asset from omc:Asset type', async () => {
      const result = await parseOmcTtl(validAssetTtl);
      expect(result.entityType).toBe('Asset');
    });

    it('should detect Participant from omc:Participant type', async () => {
      const ttl = `
@prefix omc: <https://movielabs.com/omc/rdf/schema/v2.8#> .
@prefix me: <https://me-nexus.com/id/> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .

me:participant-001 a omc:Participant ;
    rdfs:label "John Smith" ;
    omc:schemaVersion "https://movielabs.com/omc/json/schema/v2.8" ;
    omc:hasIdentifier [
        omc:hasIdentifierScope "me-nexus" ;
        omc:hasIdentifierValue "participant-001"
    ] .
`;
      const result = await parseOmcTtl(ttl);
      expect(result.entityType).toBe('Participant');
    });

    it('should detect Infrastructure from omc:Infrastructure type', async () => {
      const ttl = `
@prefix omc: <https://movielabs.com/omc/rdf/schema/v2.8#> .
@prefix me: <https://me-nexus.com/id/> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .

me:infra-001 a omc:Infrastructure ;
    rdfs:label "DaVinci Resolve" ;
    omc:schemaVersion "https://movielabs.com/omc/json/schema/v2.8" ;
    omc:hasIdentifier [
        omc:hasIdentifierScope "me-nexus" ;
        omc:hasIdentifierValue "infra-001"
    ] .
`;
      const result = await parseOmcTtl(ttl);
      expect(result.entityType).toBe('Infrastructure');
    });

    it('should detect CreativeWork from omc:CreativeWork type', async () => {
      const ttl = `
@prefix omc: <https://movielabs.com/omc/rdf/schema/v2.8#> .
@prefix me: <https://me-nexus.com/id/> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .

me:cw-001 a omc:CreativeWork ;
    rdfs:label "Test Film" ;
    omc:schemaVersion "https://movielabs.com/omc/json/schema/v2.8" ;
    omc:hasIdentifier [
        omc:hasIdentifierScope "me-nexus" ;
        omc:hasIdentifierValue "cw-001"
    ] .
`;
      const result = await parseOmcTtl(ttl);
      expect(result.entityType).toBe('CreativeWork');
    });
  });

  describe('Property Extraction', () => {
    it('should extract name from rdfs:label', async () => {
      const result = await parseOmcTtl(validTaskTtl);
      expect(result.content?.name).toBe('Color Grading');
    });

    it('should extract schemaVersion', async () => {
      const result = await parseOmcTtl(validTaskTtl);
      expect(result.content?.schemaVersion).toBe('https://movielabs.com/omc/json/schema/v2.8');
    });

    it('should extract structural type from Asset', async () => {
      const result = await parseOmcTtl(validAssetTtl);
      expect(result.content?.AssetSC?.structuralType).toBe('digital.audioVisual');
    });
  });

  describe('Namespace Handling', () => {
    it('should handle standard OMC namespace', async () => {
      const result = await parseOmcTtl(validTaskTtl);
      expect(result.success).toBe(true);
    });

    it('should handle custom me-nexus namespace', async () => {
      const result = await parseOmcTtl(validTaskTtl);
      expect(result.success).toBe(true);
    });

    it('should handle missing prefixes with full URIs', async () => {
      const ttl = `
<https://me-nexus.com/id/task-001> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <https://movielabs.com/omc/rdf/schema/v2.8#Task> .
<https://me-nexus.com/id/task-001> <http://www.w3.org/2000/01/rdf-schema#label> "Task No Prefix" .
<https://me-nexus.com/id/task-001> <https://movielabs.com/omc/rdf/schema/v2.8#schemaVersion> "https://movielabs.com/omc/json/schema/v2.8" .
`;
      const result = await parseOmcTtl(ttl);
      expect(result.success).toBe(true);
      expect(result.entityType).toBe('Task');
    });
  });
});
