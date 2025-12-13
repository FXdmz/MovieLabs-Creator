import { DataFactory, BlankNode, NamedNode } from 'n3';
import { OmcRdfStore, RdfSubject } from '../store';
import { entityUri, ns, OMC, OMCT, MENEXUS, NAMESPACES } from '../namespaces';
import { getEntityClass } from '../registry';
import { AdapterContext, addIdentifier, addNameLabel, extractEntityId, jsonToRdfBase } from './base';

const { blankNode, namedNode, literal } = DataFactory;

export function contextToRdf(ctx: AdapterContext, entityId: string, content: any): NamedNode | null {
  const subject = jsonToRdfBase(ctx, entityId, content);
  if (!subject) return null;
  
  if (content.contextType) {
    ctx.store.addLiteral(subject, OMC.contextType, content.contextType);
  }
  
  if (content.contextClass) {
    ctx.store.addLiteral(subject, OMC.contextClass, content.contextClass);
  }
  
  if (content.ContextSC) {
    addContextSC(ctx, subject, content.ContextSC);
  }
  
  if (content.scheduling) {
    if (content.scheduling.scheduledStart) {
      ctx.store.addDateLiteral(subject, OMC.hasScheduledStart, content.scheduling.scheduledStart);
    }
    if (content.scheduling.scheduledEnd) {
      ctx.store.addDateLiteral(subject, OMC.hasScheduledEnd, content.scheduling.scheduledEnd);
    }
  }
  
  if (content.contributesTo) {
    addContributesTo(ctx, subject, content.contributesTo);
  }
  
  if (content.uses) {
    addUses(ctx, subject, content.uses);
  }
  
  return subject;
}

function addContextSC(ctx: AdapterContext, parent: RdfSubject, contextSC: any): void {
  const scNode = blankNode();
  
  const structuralType = contextSC.structuralType || contextSC.entityType || 'NarrativeContext';
  let rdfClass = OMC.Context;
  if (structuralType === 'narrativeContext' || structuralType === 'NarrativeContext') {
    rdfClass = OMC.NarrativeContext;
  } else if (structuralType === 'productionContext' || structuralType === 'ProductionContext') {
    rdfClass = OMC.ProductionContext;
  }
  
  ctx.store.addQuad(parent, OMC.hasContextComponent, scNode);
  ctx.store.addQuad(scNode, ns('rdf', 'type'), rdfClass);
  
  if (contextSC.identifier) {
    addIdentifier(ctx, scNode, contextSC.identifier);
  }
  
  if (contextSC.structuralType) {
    ctx.store.addLiteral(scNode, OMC.hasStructuralType, contextSC.structuralType);
  }
}

function addContributesTo(ctx: AdapterContext, parent: RdfSubject, contributesTo: any): void {
  const ctNode = blankNode();
  ctx.store.addQuad(parent, OMC.contributesTo, ctNode);
  
  if (contributesTo.CreativeWork) {
    const cws = Array.isArray(contributesTo.CreativeWork) ? contributesTo.CreativeWork : [contributesTo.CreativeWork];
    for (const cw of cws) {
      const refId = typeof cw === 'string' ? (cw.startsWith('me-nexus:') ? cw.slice(9) : cw) : extractEntityId(cw);
      if (refId) {
        ctx.store.addReference(ctNode, ns('omc', 'CreativeWork'), refId);
      }
    }
  }
}

function addUses(ctx: AdapterContext, parent: RdfSubject, uses: any): void {
  const usesNode = blankNode();
  ctx.store.addQuad(parent, OMCT.uses, usesNode);
  
  if (uses.Infrastructure) {
    const infras = Array.isArray(uses.Infrastructure) ? uses.Infrastructure : [uses.Infrastructure];
    for (const infra of infras) {
      const refId = typeof infra === 'string' ? (infra.startsWith('me-nexus:') ? infra.slice(9) : infra) : extractEntityId(infra);
      if (refId) {
        ctx.store.addReference(usesNode, ns('omc', 'Infrastructure'), refId);
      }
    }
  }
  
  if (uses.Asset) {
    const assets = Array.isArray(uses.Asset) ? uses.Asset : [uses.Asset];
    for (const asset of assets) {
      const refId = typeof asset === 'string' ? (asset.startsWith('me-nexus:') ? asset.slice(9) : asset) : extractEntityId(asset);
      if (refId) {
        ctx.store.addReference(usesNode, ns('omc', 'Asset'), refId);
      }
    }
  }
}
