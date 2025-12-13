/**
 * @fileoverview Infrastructure Entity RDF Adapter
 * 
 * Converts OMC Infrastructure entities (software, hardware, services) between
 * JSON and RDF formats. Handles structural/functional characteristics,
 * descriptions, and context relationships.
 * 
 * @exports infrastructureToRdf - Converts Infrastructure JSON to RDF triples
 */
import { DataFactory, BlankNode, NamedNode } from 'n3';
import { OmcRdfStore, RdfSubject } from '../store';
import { entityUri, ns, OMC, NAMESPACES } from '../namespaces';
import { getEntityClass } from '../registry';
import { AdapterContext, addIdentifier, addNameLabel, extractEntityId, jsonToRdfBase } from './base';

const { blankNode, namedNode, literal } = DataFactory;

export function infrastructureToRdf(ctx: AdapterContext, entityId: string, content: any): NamedNode | null {
  const subject = jsonToRdfBase(ctx, entityId, content);
  if (!subject) return null;
  
  if (content.description) {
    ctx.store.addLiteral(subject, OMC.hasDescription, content.description);
  }
  
  if (content.InfrastructureSC) {
    addInfrastructureSC(ctx, subject, content.InfrastructureSC);
  }
  
  if (content.structuralCharacteristics) {
    addInfrastructureSC(ctx, subject, content.structuralCharacteristics);
  }
  
  if (content.infrastructureFC) {
    addInfrastructureFC(ctx, subject, content.infrastructureFC);
  }
  
  if (content.Context && Array.isArray(content.Context)) {
    for (const ctxObj of content.Context) {
      addContext(ctx, subject, ctxObj);
    }
  }
  
  return subject;
}

function addInfrastructureSC(ctx: AdapterContext, parent: RdfSubject, infraSC: any): void {
  const scNode = blankNode();
  ctx.store.addQuad(parent, OMC.hasInfrastructureStructuralCharacteristic, scNode);
  ctx.store.addQuad(scNode, ns('rdf', 'type'), ns('omc', 'InfrastructureAsStructure'));
  
  if (infraSC.identifier) {
    addIdentifier(ctx, scNode, infraSC.identifier);
  }
  
  if (infraSC.structuralType) {
    ctx.store.addLiteral(scNode, OMC.hasStructuralType, infraSC.structuralType);
  }
  
  if (infraSC.structuralProperties) {
    const propsNode = blankNode();
    ctx.store.addQuad(scNode, OMC.hasStructuralProperties, propsNode);
    for (const [key, value] of Object.entries(infraSC.structuralProperties)) {
      if (value !== undefined && value !== null && typeof value !== 'object') {
        ctx.store.addLiteral(propsNode, ns('omc', `has${key.charAt(0).toUpperCase() + key.slice(1)}`), value as any);
      }
    }
  }
}

function addInfrastructureFC(ctx: AdapterContext, parent: RdfSubject, infraFC: any): void {
  const fcNode = blankNode();
  ctx.store.addQuad(parent, OMC.hasInfrastructureFunctionalCharacteristic, fcNode);
  ctx.store.addQuad(fcNode, ns('rdf', 'type'), ns('omc', 'InfrastructureAsFunction'));
  
  if (infraFC.functionalType) {
    ctx.store.addLiteral(fcNode, OMC.hasFunctionalType, infraFC.functionalType);
  }
}

function addContext(ctx: AdapterContext, parent: RdfSubject, contextObj: any): void {
  const ctxNode = blankNode();
  ctx.store.addQuad(parent, OMC.hasContext, ctxNode);
  ctx.store.addQuad(ctxNode, ns('rdf', 'type'), OMC.Context);
  
  if (contextObj.identifier) {
    addIdentifier(ctx, ctxNode, contextObj.identifier);
  }
  
  if (contextObj.contextType) {
    ctx.store.addLiteral(ctxNode, OMC.contextType, contextObj.contextType);
  }
}
