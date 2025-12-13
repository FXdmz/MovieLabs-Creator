/**
 * @fileoverview OMC RDF Store - N3.js-based Triple Store Wrapper
 * 
 * This module provides `OmcRdfStore`, a high-level wrapper around the N3.js
 * Store for managing RDF triples in the OMC (Ontology for Media Creation)
 * domain. It provides OMC-specific convenience methods for entity management.
 * 
 * ## Responsibilities
 * 
 * 1. **Triple Storage**: CRUD operations for RDF quads
 * 2. **Entity Management**: Add/remove OMC entities with proper type declarations
 * 3. **Literal Handling**: Type-aware literal creation (string, number, boolean, date)
 * 4. **Reference Management**: Inter-entity reference handling
 * 5. **Query Interface**: Pattern-based quad retrieval
 * 
 * ## Architecture
 * 
 * ```
 * OmcRdfStore (this module)
 *     └── N3.Store (underlying triple store)
 *           └── Quads (subject, predicate, object, graph)
 * ```
 * 
 * ## Usage Examples
 * 
 * ```typescript
 * import { OmcRdfStore, getRdfStore, resetRdfStore } from './store';
 * import { OMC, RDF, ns } from './namespaces';
 * 
 * // Get global singleton store
 * const store = getRdfStore();
 * 
 * // Add an entity with type
 * const subject = store.addEntity('my-entity-id', OMC.Asset);
 * 
 * // Add literal properties
 * store.addLiteral(subject, ns('omc', 'hasName'), 'My Asset');
 * store.addLiteral(subject, ns('omc', 'hasSize'), 1024);
 * 
 * // Add reference to another entity
 * store.addReference(subject, OMC.hasLocation, 'location-entity-id');
 * 
 * // Query for quads
 * const allQuads = store.getQuads(subject);
 * const typeQuad = store.getQuads(subject, RDF.type);
 * 
 * // Get literal value
 * const name = store.getLiteralValue(subject, ns('omc', 'hasName'));
 * 
 * // Reset store (for new project)
 * resetRdfStore();
 * ```
 * 
 * @module client/src/lib/rdf/store
 * @see ./namespaces.ts for namespace definitions and predicate constants
 * @see ./adapters/ for JSON-to-RDF conversion
 */

import { Store, DataFactory, Quad, NamedNode, BlankNode, Literal, Term } from 'n3';
import { NAMESPACES, entityUri, ns, RDF, RDFS, OMC } from './namespaces';

const { namedNode, literal, quad } = DataFactory;

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * RDF subject types: either a named node (URI) or blank node.
 */
export type RdfSubject = NamedNode | BlankNode;

/**
 * RDF object types: named node, blank node, or literal value.
 */
export type RdfObject = NamedNode | BlankNode | Literal;

/**
 * Configuration options for OmcRdfStore.
 * 
 * @property prefixes - Custom namespace prefixes to use (defaults to NAMESPACES)
 */
export interface RdfStoreOptions {
  prefixes?: Record<string, string>;
}

// ============================================================================
// OmcRdfStore Class
// ============================================================================

/**
 * High-level RDF triple store wrapper optimized for OMC entity management.
 * 
 * Wraps N3.js Store with OMC-specific convenience methods for:
 * - Entity lifecycle management
 * - Typed literal creation
 * - Reference handling
 * - Pattern-based queries
 * 
 * @example
 * const store = new OmcRdfStore();
 * const subject = store.addEntity('uuid', OMC.Asset);
 * store.addLiteral(subject, OMC.hasName, 'My Asset');
 */
export class OmcRdfStore {
  private store: Store;
  private prefixes: Record<string, string>;

  /**
   * Creates a new OmcRdfStore instance.
   * 
   * @param options - Configuration options
   */
  constructor(options: RdfStoreOptions = {}) {
    this.store = new Store();
    this.prefixes = options.prefixes || { ...NAMESPACES };
  }

  /**
   * Returns the number of quads in the store.
   */
  get size(): number {
    return this.store.size;
  }

  /**
   * Returns the underlying N3.Store for direct access.
   * Use sparingly - prefer the wrapper methods.
   */
  getN3Store(): Store {
    return this.store;
  }

  // ==========================================================================
  // Quad CRUD Operations
  // ==========================================================================

  /**
   * Adds a single quad to the store.
   * 
   * @param subject - The subject (named node or blank node)
   * @param predicate - The predicate (named node)
   * @param object - The object (named node, blank node, or literal)
   */
  addQuad(subject: RdfSubject, predicate: NamedNode, object: RdfObject): void {
    this.store.addQuad(quad(subject, predicate, object));
  }

  /**
   * Adds multiple quads to the store.
   * 
   * @param quads - Array of Quad objects to add
   */
  addQuads(quads: Quad[]): void {
    this.store.addQuads(quads);
  }

  /**
   * Removes multiple quads from the store.
   * 
   * @param quads - Array of Quad objects to remove
   */
  removeQuads(quads: Quad[]): void {
    this.store.removeQuads(quads);
  }

  /**
   * Retrieves quads matching the given pattern.
   * Pass null for wildcards.
   * 
   * @param subject - Subject to match (or null for any)
   * @param predicate - Predicate to match (or null for any)
   * @param object - Object to match (or null for any)
   * @returns Array of matching quads
   * 
   * @example
   * // Get all quads for a subject
   * store.getQuads(subject);
   * 
   * // Get all type declarations
   * store.getQuads(null, RDF.type);
   */
  getQuads(
    subject?: RdfSubject | null,
    predicate?: NamedNode | null,
    object?: RdfObject | null
  ): Quad[] {
    return this.store.getQuads(subject || null, predicate || null, object || null, null);
  }

  /**
   * Gets all subjects matching the pattern.
   * 
   * @param predicate - Predicate to match (or null for any)
   * @param object - Object to match (or null for any)
   * @returns Array of subject terms
   */
  getSubjects(predicate?: NamedNode | null, object?: RdfObject | null): Term[] {
    return this.store.getSubjects(predicate || null, object || null, null);
  }

  /**
   * Gets all objects matching the pattern.
   * 
   * @param subject - Subject to match (or null for any)
   * @param predicate - Predicate to match (or null for any)
   * @returns Array of object terms
   */
  getObjects(subject?: RdfSubject | null, predicate?: NamedNode | null): Term[] {
    return this.store.getObjects(subject || null, predicate || null, null);
  }

  /**
   * Gets all predicates matching the pattern.
   * 
   * @param subject - Subject to match (or null for any)
   * @param object - Object to match (or null for any)
   * @returns Array of predicate terms
   */
  getPredicates(subject?: RdfSubject | null, object?: RdfObject | null): Term[] {
    return this.store.getPredicates(subject || null, object || null, null);
  }

  /**
   * Checks if a quad matching the pattern exists.
   * 
   * @param subject - Subject to match
   * @param predicate - Predicate to match
   * @param object - Object to match (optional)
   * @returns true if matching quad exists
   */
  has(subject: RdfSubject, predicate: NamedNode, object?: RdfObject): boolean {
    const quads = this.getQuads(subject, predicate, object);
    return quads.length > 0;
  }

  // ==========================================================================
  // Entity Lifecycle
  // ==========================================================================

  /**
   * Adds a new OMC entity with type declaration and schema version.
   * 
   * @param id - The entity identifier (will be prefixed with me: namespace)
   * @param type - The RDF type (e.g., OMC.Asset, OMC.Task)
   * @returns The subject NamedNode for the entity
   * 
   * @example
   * const subject = store.addEntity('my-uuid', OMC.Asset);
   * // Adds: me:my-uuid rdf:type omc:Asset
   * // Adds: me:my-uuid omc:schemaVersion "https://movielabs.com/omc/json/schema/v2.8"
   */
  addEntity(id: string, type: NamedNode): NamedNode {
    const subject = entityUri(id);
    this.addQuad(subject, RDF.type, type);
    this.addQuad(subject, OMC.schemaVersion, literal("https://movielabs.com/omc/json/schema/v2.8"));
    return subject;
  }

  // ==========================================================================
  // Literal Value Management
  // ==========================================================================

  /**
   * Adds a typed literal value.
   * Automatically applies XSD datatypes based on JavaScript type.
   * 
   * @param subject - The subject node
   * @param predicate - The predicate
   * @param value - The value (string, number, or boolean)
   * 
   * @example
   * store.addLiteral(subject, ns('omc', 'hasName'), 'My Asset');
   * store.addLiteral(subject, ns('omc', 'hasSize'), 1024);      // xsd:integer
   * store.addLiteral(subject, ns('omc', 'hasRatio'), 1.5);      // xsd:decimal
   * store.addLiteral(subject, ns('omc', 'isActive'), true);     // xsd:boolean
   */
  addLiteral(subject: RdfSubject, predicate: NamedNode, value: string | number | boolean): void {
    if (value === null || value === undefined) return;
    
    let lit: Literal;
    if (typeof value === 'number') {
      if (Number.isInteger(value)) {
        lit = literal(value.toString(), namedNode(`${NAMESPACES.xsd}integer`));
      } else {
        lit = literal(value.toString(), namedNode(`${NAMESPACES.xsd}decimal`));
      }
    } else if (typeof value === 'boolean') {
      lit = literal(value.toString(), namedNode(`${NAMESPACES.xsd}boolean`));
    } else {
      lit = literal(value);
    }
    
    this.addQuad(subject, predicate, lit);
  }

  /**
   * Adds a date literal with xsd:dateTime datatype.
   * 
   * @param subject - The subject node
   * @param predicate - The predicate
   * @param isoDate - ISO 8601 date string
   */
  addDateLiteral(subject: RdfSubject, predicate: NamedNode, isoDate: string): void {
    if (!isoDate) return;
    const lit = literal(isoDate, namedNode(`${NAMESPACES.xsd}dateTime`));
    this.addQuad(subject, predicate, lit);
  }

  /**
   * Adds a reference to another entity.
   * 
   * @param subject - The source entity
   * @param predicate - The relationship predicate
   * @param targetId - The target entity identifier
   */
  addReference(subject: RdfSubject, predicate: NamedNode, targetId: string): void {
    const target = entityUri(targetId);
    this.addQuad(subject, predicate, target);
  }

  // ==========================================================================
  // Value Retrieval
  // ==========================================================================

  /**
   * Gets the RDF type of an entity.
   * 
   * @param subject - The entity subject
   * @returns The type NamedNode, or null if not found
   */
  getEntityType(subject: RdfSubject): NamedNode | null {
    const types = this.getObjects(subject, RDF.type);
    return types.length > 0 ? (types[0] as NamedNode) : null;
  }

  /**
   * Gets a single literal value, parsed to appropriate JavaScript type.
   * 
   * @param subject - The subject
   * @param predicate - The predicate
   * @returns The parsed value, or null if not found
   */
  getLiteralValue(subject: RdfSubject, predicate: NamedNode): string | number | boolean | null {
    const objects = this.getObjects(subject, predicate);
    if (objects.length === 0) return null;
    
    const obj = objects[0];
    if (obj.termType !== 'Literal') return null;
    
    const lit = obj as Literal;
    const datatype = lit.datatype?.value || '';
    
    if (datatype.endsWith('#integer') || datatype.endsWith('#int')) {
      return parseInt(lit.value, 10);
    }
    if (datatype.endsWith('#decimal') || datatype.endsWith('#double') || datatype.endsWith('#float')) {
      return parseFloat(lit.value);
    }
    if (datatype.endsWith('#boolean')) {
      return lit.value === 'true';
    }
    
    return lit.value;
  }

  /**
   * Gets all literal values for a predicate.
   * 
   * @param subject - The subject
   * @param predicate - The predicate
   * @returns Array of parsed values
   */
  getAllLiteralValues(subject: RdfSubject, predicate: NamedNode): (string | number | boolean)[] {
    const objects = this.getObjects(subject, predicate);
    return objects
      .filter(obj => obj.termType === 'Literal')
      .map(obj => {
        const lit = obj as Literal;
        const datatype = lit.datatype?.value || '';
        
        if (datatype.endsWith('#integer') || datatype.endsWith('#int')) {
          return parseInt(lit.value, 10);
        }
        if (datatype.endsWith('#decimal') || datatype.endsWith('#double') || datatype.endsWith('#float')) {
          return parseFloat(lit.value);
        }
        if (datatype.endsWith('#boolean')) {
          return lit.value === 'true';
        }
        
        return lit.value;
      });
  }

  /**
   * Gets a single reference (entity ID) for a predicate.
   * 
   * @param subject - The subject
   * @param predicate - The relationship predicate
   * @returns The target entity ID, or null if not found
   */
  getReference(subject: RdfSubject, predicate: NamedNode): string | null {
    const objects = this.getObjects(subject, predicate);
    if (objects.length === 0) return null;
    
    const obj = objects[0];
    if (obj.termType !== 'NamedNode') return null;
    
    const uri = obj.value;
    if (uri.startsWith(NAMESPACES.me)) {
      return uri.slice(NAMESPACES.me.length);
    }
    return uri;
  }

  /**
   * Gets all references (entity IDs) for a predicate.
   * 
   * @param subject - The subject
   * @param predicate - The relationship predicate
   * @returns Array of target entity IDs
   */
  getAllReferences(subject: RdfSubject, predicate: NamedNode): string[] {
    const objects = this.getObjects(subject, predicate);
    return objects
      .filter(obj => obj.termType === 'NamedNode')
      .map(obj => {
        const uri = obj.value;
        if (uri.startsWith(NAMESPACES.me)) {
          return uri.slice(NAMESPACES.me.length);
        }
        return uri;
      });
  }

  // ==========================================================================
  // Entity Removal and Store Management
  // ==========================================================================

  /**
   * Removes an entity and all its incoming/outgoing triples.
   * 
   * @param id - The entity identifier to remove
   */
  removeEntity(id: string): void {
    const subject = entityUri(id);
    const quads = this.getQuads(subject);
    this.removeQuads(quads);
    
    const refQuads = this.store.getQuads(null, null, subject, null);
    this.removeQuads(refQuads);
  }

  /**
   * Clears all quads from the store.
   */
  clear(): void {
    const allQuads = this.store.getQuads(null, null, null, null);
    this.store.removeQuads(allQuads);
  }

  /**
   * Gets all entity IDs in the store (entities with rdf:type).
   * 
   * @returns Array of entity IDs
   */
  getAllEntityIds(): string[] {
    const subjects = this.store.getSubjects(RDF.type, null, null);
    return subjects
      .filter(s => s.termType === 'NamedNode' && s.value.startsWith(NAMESPACES.me))
      .map(s => s.value.slice(NAMESPACES.me.length));
  }

  /**
   * Gets all entity IDs of a specific type.
   * 
   * @param type - The RDF type to filter by
   * @returns Array of entity IDs with that type
   */
  getEntitiesByType(type: NamedNode): string[] {
    const subjects = this.store.getSubjects(RDF.type, type, null);
    return subjects
      .filter(s => s.termType === 'NamedNode' && s.value.startsWith(NAMESPACES.me))
      .map(s => s.value.slice(NAMESPACES.me.length));
  }

  /**
   * Gets the namespace prefixes for serialization.
   * 
   * @returns Copy of the prefix map
   */
  getPrefixes(): Record<string, string> {
    return { ...this.prefixes };
  }

  /**
   * Creates a deep clone of this store.
   * 
   * @returns New OmcRdfStore with copied quads
   */
  clone(): OmcRdfStore {
    const newStore = new OmcRdfStore({ prefixes: this.prefixes });
    const allQuads = this.store.getQuads(null, null, null, null);
    newStore.addQuads(allQuads);
    return newStore;
  }
}

// ============================================================================
// Global Singleton
// ============================================================================

/** Global singleton store instance */
let globalRdfStore: OmcRdfStore | null = null;

/**
 * Gets the global OmcRdfStore singleton.
 * Creates one if it doesn't exist.
 * 
 * @returns The global RDF store instance
 */
export function getRdfStore(): OmcRdfStore {
  if (!globalRdfStore) {
    globalRdfStore = new OmcRdfStore();
  }
  return globalRdfStore;
}

/**
 * Resets the global store to a fresh instance.
 * Use when starting a new project or clearing state.
 */
export function resetRdfStore(): void {
  globalRdfStore = new OmcRdfStore();
}
