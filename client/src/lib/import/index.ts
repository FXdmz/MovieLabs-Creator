export { parseOmcJson, type ImportResult } from './json-importer';
export { parseOmcTtl } from './ttl-importer';

import { parseOmcJson, ImportResult } from './json-importer';
import { parseOmcTtl } from './ttl-importer';

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
