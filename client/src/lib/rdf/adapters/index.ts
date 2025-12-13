/**
 * @fileoverview RDF Adapter Registry and Dispatch Functions
 * 
 * Central hub for JSON↔RDF bidirectional entity conversion. This module provides:
 * 
 * ## Responsibilities
 * 
 * 1. **Adapter Registry**: Maps entity types to their conversion functions
 * 2. **Dispatch Functions**: Routes entities to the correct adapter by type
 * 3. **Re-exports**: Provides unified access to all individual adapters
 * 
 * ## Architecture
 * 
 * The adapter system uses a strategy pattern where each entity type
 * (Asset, Task, Participant, etc.) has its own adapter module that knows
 * how to convert that type between JSON and RDF formats.
 * 
 * ```
 * entityToRdf(store, id, content)
 *   ↓ Look up adapter by content.entityType
 * adapters[entityType](ctx, id, content)
 *   ↓ Type-specific conversion
 * NamedNode (RDF subject)
 * ```
 * 
 * ## Usage
 * 
 * ```typescript
 * import { entityToRdf, entitiesToRdf, rdfEntitiesToJson } from './adapters';
 * 
 * // JSON → RDF
 * const store = new OmcRdfStore();
 * entityToRdf(store, entityId, entityContent);
 * const ttl = store.toTurtle();
 * 
 * // RDF → JSON
 * const entities = rdfEntitiesToJson(store);
 * ```
 * 
 * ## Available Adapters
 * 
 * - **Asset**: assetToRdf, rdfAssetToJson
 * - **Task**: taskToRdf, rdfTaskToJson
 * - **Participant**: participantToRdf, rdfParticipantToJson
 * - **CreativeWork**: creativeWorkToRdf, rdfCreativeWorkToJson
 * - **Infrastructure**: infrastructureToRdf, rdfInfrastructureToJson
 * - **Location**: locationToRdf, rdfLocationToJson
 * - **Context**: contextToRdf, rdfContextToJson
 * 
 * @module rdf/adapters
 */

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

// Re-export individual adapters for direct access
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

/**
 * Function signature for JSON-to-RDF entity adapters.
 * 
 * @param ctx - Adapter context containing the RDF store
 * @param entityId - The entity's unique identifier
 * @param content - The entity's JSON content object
 * @returns NamedNode representing the entity's RDF subject, or null if conversion failed
 */
type EntityToRdfAdapter = (ctx: AdapterContext, entityId: string, content: any) => NamedNode | null;

/**
 * Registry mapping entity types to their JSON→RDF conversion functions.
 * 
 * Add new entity types here when implementing additional adapters.
 */
const adapters: Record<string, EntityToRdfAdapter> = {
  Asset: assetToRdf,
  Task: taskToRdf,
  Participant: participantToRdf,
  CreativeWork: creativeWorkToRdf,
  Infrastructure: infrastructureToRdf,
  Location: locationToRdf,
  Context: contextToRdf
};

/**
 * Converts a single entity from JSON to RDF, adding triples to the store.
 * 
 * Dispatches to the appropriate type-specific adapter based on `content.entityType`.
 * Returns the NamedNode subject of the created entity, or null if conversion failed.
 * 
 * @param store - The OmcRdfStore to add triples to
 * @param entityId - The entity's unique identifier
 * @param content - The entity's JSON content (must include entityType)
 * @returns NamedNode representing the entity subject, or null if no adapter found
 * 
 * @example
 * const store = new OmcRdfStore();
 * const subject = entityToRdf(store, "abc123", {
 *   entityType: "Asset",
 *   name: "Hero Shot",
 *   ...
 * });
 */
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

/**
 * Converts multiple entities from JSON to RDF, adding all triples to the store.
 * 
 * Iterates through the entities array and calls entityToRdf for each.
 * Extracts entity IDs from content.identifier or falls back to entity.id.
 * 
 * @param store - The OmcRdfStore to add triples to
 * @param entities - Array of objects with id and content properties
 * 
 * @example
 * const store = new OmcRdfStore();
 * entitiesToRdf(store, [
 *   { id: "abc", content: { entityType: "Asset", ... } },
 *   { id: "def", content: { entityType: "Task", ... } }
 * ]);
 * const ttl = store.toTurtle();
 */
export function entitiesToRdf(store: OmcRdfStore, entities: Array<{ id: string; content: any }>): void {
  for (const entity of entities) {
    const entityId = extractEntityId(entity.content) || entity.id;
    entityToRdf(store, entityId, entity.content);
  }
}
