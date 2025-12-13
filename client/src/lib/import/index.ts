/**
 * @fileoverview OMC File Import Module - Barrel file for import functionality.
 * Provides unified API for importing OMC entities from JSON and RDF/TTL files.
 * 
 * @features
 * - Single and multi-entity import from JSON files
 * - Single and multi-entity import from RDF/TTL files
 * - Automatic file type detection based on extension
 * - RDF store integration for imported entities
 * 
 * @exports parseOmcFile - Single entity import with auto-detection
 * @exports parseOmcFileMulti - Multi-entity import with auto-detection
 * @exports parseOmcFileToRdf - Import and convert to RDF store
 * @exports importEntitiesToRdfStore - Convert imported entities to RDF
 */
export { parseOmcJson, parseOmcJsonMulti, type ImportResult, type ImportedEntity, type MultiImportResult } from './json-importer';
export { parseOmcTtl, parseOmcTtlMulti } from './ttl-importer';

import { parseOmcJson, parseOmcJsonMulti, ImportResult, MultiImportResult, ImportedEntity } from './json-importer';
import { parseOmcTtl, parseOmcTtlMulti } from './ttl-importer';
import { OmcRdfStore, entitiesToRdf, extractEntityId } from '../rdf';

// Single entity import (backwards compatible)
export async function parseOmcFile(fileContent: string, fileName: string): Promise<ImportResult> {
  const extension = fileName.toLowerCase().split('.').pop();
  
  if (extension === 'json') {
    return parseOmcJson(fileContent);
  }
  
  if (extension === 'ttl' || extension === 'turtle' || extension === 'rdf') {
    return await parseOmcTtl(fileContent);
  }
  
  return { 
    success: false, 
    error: `Unsupported file type: .${extension}. Please use .json or .ttl files.` 
  };
}

// Multi-entity import
export async function parseOmcFileMulti(fileContent: string, fileName: string): Promise<MultiImportResult> {
  const extension = fileName.toLowerCase().split('.').pop();
  
  if (extension === 'json') {
    return parseOmcJsonMulti(fileContent);
  }
  
  if (extension === 'ttl' || extension === 'turtle' || extension === 'rdf') {
    return await parseOmcTtlMulti(fileContent);
  }
  
  return { 
    success: false,
    entities: [],
    error: `Unsupported file type: .${extension}. Please use .json or .ttl files.` 
  };
}

export interface ImportToRdfOptions {
  store?: OmcRdfStore;
}

export function importEntitiesToRdfStore(
  entities: ImportedEntity[], 
  options: ImportToRdfOptions = {}
): OmcRdfStore {
  const store = options.store || new OmcRdfStore();
  
  const entityData = entities.map(e => ({
    id: extractEntityId(e.content) || e.entityId,
    content: e.content
  }));
  
  entitiesToRdf(store, entityData);
  
  return store;
}

export async function parseOmcFileToRdf(
  fileContent: string, 
  fileName: string,
  options: ImportToRdfOptions = {}
): Promise<{ result: MultiImportResult; store: OmcRdfStore | null }> {
  const result = await parseOmcFileMulti(fileContent, fileName);
  
  if (!result.success || result.entities.length === 0) {
    return { result, store: null };
  }
  
  const store = importEntitiesToRdfStore(result.entities, options);
  
  return { result, store };
}
