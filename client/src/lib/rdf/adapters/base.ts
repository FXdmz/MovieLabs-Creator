/**
 * @fileoverview Base RDF Adapter Utilities
 * 
 * Core utilities and interfaces shared by all entity-specific RDF adapters.
 * Provides common functions for identifier handling, property mapping, and
 * base entity conversion in both directions (JSON↔RDF).
 * 
 * @exports AdapterContext - Shared context containing RDF store
 * @exports jsonToRdfBase - Base JSON→RDF conversion for common entity fields
 * @exports rdfToJsonBase - Base RDF→JSON conversion for common entity fields
 * @exports addIdentifier - Adds identifier triples to RDF graph
 * @exports addNameLabel - Adds name/label triples
 * @exports extractEntityId - Extracts entity ID from JSON content
 */
import { DataFactory, BlankNode, NamedNode } from 'n3';
import { OmcRdfStore, RdfSubject } from '../store';
import { entityUri, NAMESPACES, ns, RDF, RDFS, OMC } from '../namespaces';
import { getPropertyMapping, getEntityClass } from '../registry';

const { namedNode, blankNode, literal } = DataFactory;

export interface AdapterContext {
  store: OmcRdfStore;
  visited?: Set<string>;
}

export function extractEntityId(content: any): string | null {
  if (content.identifier && Array.isArray(content.identifier) && content.identifier.length > 0) {
    const id = content.identifier[0];
    if (id.identifierValue) return id.identifierValue;
    if (id.combinedForm && id.combinedForm.includes(':')) {
      return id.combinedForm.split(':').slice(1).join(':');
    }
  }
  return null;
}

export function addIdentifier(ctx: AdapterContext, subject: RdfSubject, identifier: any[]): void {
  if (!identifier || !Array.isArray(identifier)) return;
  
  for (const id of identifier) {
    const idNode = blankNode();
    ctx.store.addQuad(subject, OMC.hasIdentifier, idNode);
    
    if (id.identifierScope) {
      ctx.store.addLiteral(idNode, ns('omc', 'hasIdentifierScope'), id.identifierScope);
    }
    if (id.identifierValue) {
      ctx.store.addLiteral(idNode, ns('omc', 'hasIdentifierValue'), id.identifierValue);
    }
  }
}

export function addLiteralProperty(ctx: AdapterContext, subject: RdfSubject, content: any, jsonKey: string): void {
  const value = content[jsonKey];
  if (value === null || value === undefined) return;
  
  const mapping = getPropertyMapping(jsonKey);
  if (!mapping) return;
  
  if (mapping.isDate) {
    ctx.store.addDateLiteral(subject, mapping.predicate, value);
  } else if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    ctx.store.addLiteral(subject, mapping.predicate, value);
  }
}

export function addReferenceProperty(ctx: AdapterContext, subject: RdfSubject, content: any, jsonKey: string): void {
  const value = content[jsonKey];
  if (value === null || value === undefined) return;
  
  const mapping = getPropertyMapping(jsonKey);
  if (!mapping || !mapping.isReference) return;
  
  const refs = Array.isArray(value) ? value : [value];
  for (const ref of refs) {
    let refId: string;
    if (typeof ref === 'string') {
      refId = ref.startsWith('me-nexus:') ? ref.slice(9) : ref;
    } else if (ref && ref.identifier && Array.isArray(ref.identifier) && ref.identifier.length > 0) {
      refId = extractEntityId(ref) || '';
    } else {
      continue;
    }
    
    if (refId) {
      ctx.store.addReference(subject, mapping.predicate, refId);
    }
  }
}

export function addNameLabel(ctx: AdapterContext, subject: RdfSubject, content: any): void {
  if (content.name) {
    ctx.store.addLiteral(subject, RDFS.label, content.name);
  }
}

export function jsonToRdfBase(ctx: AdapterContext, entityId: string, content: any): NamedNode | null {
  const entityType = content.entityType;
  if (!entityType) return null;
  
  const rdfClass = getEntityClass(entityType);
  if (!rdfClass) return null;
  
  const subject = ctx.store.addEntity(entityId, rdfClass);
  
  addNameLabel(ctx, subject, content);
  addIdentifier(ctx, subject, content.identifier);
  
  return subject;
}

export function rdfToJsonBase(ctx: AdapterContext, subject: RdfSubject): any {
  const typeNode = ctx.store.getEntityType(subject);
  if (!typeNode) return null;
  
  let typeName = typeNode.value.split('#').pop() || '';
  if (typeName === 'MediaCreationContextComponent') {
    typeName = 'Context';
  }
  
  const name = ctx.store.getLiteralValue(subject, RDFS.label);
  
  const identifiers = ctx.store.getObjects(subject, OMC.hasIdentifier);
  const identifier = identifiers.map(idNode => {
    const scope = ctx.store.getLiteralValue(idNode as RdfSubject, ns('omc', 'hasIdentifierScope'));
    const value = ctx.store.getLiteralValue(idNode as RdfSubject, ns('omc', 'hasIdentifierValue'));
    return {
      identifierScope: scope,
      identifierValue: value,
      combinedForm: scope && value ? `${scope}:${value}` : undefined
    };
  }).filter(id => id.identifierScope || id.identifierValue);
  
  return {
    entityType: typeName,
    schemaVersion: "https://movielabs.com/omc/json/schema/v2.8",
    name: name || undefined,
    identifier: identifier.length > 0 ? identifier : undefined
  };
}
