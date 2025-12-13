import { Writer, Quad } from 'n3';
import { OmcRdfStore } from './store';
import { NAMESPACES } from './namespaces';
import { entitiesToRdf, extractEntityId, rdfEntitiesToJson } from './adapters';
import { Entity } from '../store';

export interface SerializerOptions {
  pretty?: boolean;
}

export function serializeStoreToTurtle(store: OmcRdfStore, options: SerializerOptions = {}): string {
  const prefixes = store.getPrefixes();
  const writer = new Writer({ prefixes });
  
  const quads = store.getQuads();
  for (const quad of quads) {
    writer.addQuad(quad);
  }
  
  let result = '';
  writer.end((error, output) => {
    if (error) {
      console.error('Error serializing RDF:', error);
      result = '';
    } else {
      result = output;
    }
  });
  
  return result;
}

export function entitiesToTurtleViaRdf(entities: Entity[], options: SerializerOptions = {}): string {
  const store = new OmcRdfStore();
  
  const entityData = entities.map(e => ({
    id: extractEntityId(e.content) || e.id,
    content: e.content
  }));
  
  entitiesToRdf(store, entityData);
  
  return serializeStoreToTurtle(store, options);
}

export function entityToTurtleViaRdf(entity: Entity, options: SerializerOptions = {}): string {
  return entitiesToTurtleViaRdf([entity], options);
}

export function entitiesToJsonViaRdf(entities: Entity[], options: SerializerOptions = {}): string {
  const store = new OmcRdfStore();
  
  const entityData = entities.map(e => ({
    id: extractEntityId(e.content) || e.id,
    content: e.content
  }));
  
  entitiesToRdf(store, entityData);
  
  const jsonContent = rdfEntitiesToJson(store);
  const output = jsonContent.length === 1 ? jsonContent[0] : jsonContent;
  
  return options.pretty !== false 
    ? JSON.stringify(output, null, 2) 
    : JSON.stringify(output);
}

export function entityToJsonViaRdf(entity: Entity, options: SerializerOptions = {}): string {
  return entitiesToJsonViaRdf([entity], options);
}
