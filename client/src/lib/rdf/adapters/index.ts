import { NamedNode } from 'n3';
import { OmcRdfStore } from '../store';
import type { AdapterContext } from './base';
import { extractEntityId } from './base';
import { assetToRdf } from './asset';
import { taskToRdf } from './task';
import { participantToRdf } from './participant';
import { creativeWorkToRdf } from './creative-work';
import { infrastructureToRdf } from './infrastructure';
import { locationToRdf } from './location';
import { contextToRdf } from './context';

export type { AdapterContext } from './base';
export { extractEntityId } from './base';
export { assetToRdf } from './asset';
export { taskToRdf } from './task';
export { participantToRdf } from './participant';
export { creativeWorkToRdf } from './creative-work';
export { infrastructureToRdf } from './infrastructure';
export { locationToRdf } from './location';
export { contextToRdf } from './context';
export { 
  rdfAssetToJson,
  rdfTaskToJson,
  rdfParticipantToJson,
  rdfCreativeWorkToJson,
  rdfInfrastructureToJson,
  rdfLocationToJson,
  rdfContextToJson,
  rdfEntityToJson,
  rdfEntitiesToJson
} from './rdf-to-json';

type EntityToRdfAdapter = (ctx: AdapterContext, entityId: string, content: any) => NamedNode | null;

const adapters: Record<string, EntityToRdfAdapter> = {
  Asset: assetToRdf,
  Task: taskToRdf,
  Participant: participantToRdf,
  CreativeWork: creativeWorkToRdf,
  Infrastructure: infrastructureToRdf,
  Location: locationToRdf,
  Context: contextToRdf
};

export function entityToRdf(store: OmcRdfStore, entityId: string, content: any): NamedNode | null {
  const entityType = content.entityType;
  if (!entityType) return null;
  
  const adapter = adapters[entityType];
  if (!adapter) {
    console.warn(`No RDF adapter for entity type: ${entityType}`);
    return null;
  }
  
  const ctx: AdapterContext = { store };
  return adapter(ctx, entityId, content);
}

export function entitiesToRdf(store: OmcRdfStore, entities: Array<{ id: string; content: any }>): void {
  for (const entity of entities) {
    const entityId = extractEntityId(entity.content) || entity.id;
    entityToRdf(store, entityId, entity.content);
  }
}
