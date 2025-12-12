export { parseOmcJson, parseOmcJsonMulti, type ImportResult, type ImportedEntity, type MultiImportResult } from './json-importer';
export { parseOmcTtl, parseOmcTtlMulti } from './ttl-importer';

import { parseOmcJson, parseOmcJsonMulti, ImportResult, MultiImportResult } from './json-importer';
import { parseOmcTtl, parseOmcTtlMulti } from './ttl-importer';

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
