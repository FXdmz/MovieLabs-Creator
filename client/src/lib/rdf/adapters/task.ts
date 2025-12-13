import { DataFactory, BlankNode, NamedNode } from 'n3';
import { OmcRdfStore, RdfSubject } from '../store';
import { entityUri, ns, OMC, OMCT, MENEXUS, NAMESPACES } from '../namespaces';
import { getEntityClass } from '../registry';
import { AdapterContext, addIdentifier, addNameLabel, extractEntityId, jsonToRdfBase } from './base';

const { blankNode, namedNode, literal } = DataFactory;

export function taskToRdf(ctx: AdapterContext, entityId: string, content: any): NamedNode | null {
  const subject = jsonToRdfBase(ctx, entityId, content);
  if (!subject) return null;
  
  if (content.TaskSC) {
    addTaskSC(ctx, subject, content.TaskSC);
  }
  
  if (content.taskFC) {
    addTaskFC(ctx, subject, content.taskFC);
  }
  
  if (content.state) {
    const stateValue = typeof content.state === 'string' 
      ? content.state 
      : content.state.stateDescriptor || 'assigned';
    ctx.store.addLiteral(subject, OMC.hasStateDescriptor, stateValue);
  }
  
  if (content.workUnit) {
    addWorkUnit(ctx, subject, content.workUnit);
  }
  
  if (content.Context && Array.isArray(content.Context)) {
    for (const ctxObj of content.Context) {
      addContext(ctx, subject, ctxObj);
    }
  }
  
  return subject;
}

function addTaskSC(ctx: AdapterContext, parent: RdfSubject, taskSC: any): void {
  const scNode = blankNode();
  ctx.store.addQuad(parent, OMC.hasTaskStructuralCharacteristic, scNode);
  ctx.store.addQuad(scNode, ns('rdf', 'type'), OMC.TaskAsStructure);
  
  if (taskSC.identifier) {
    addIdentifier(ctx, scNode, taskSC.identifier);
  }
  
  if (taskSC.structuralType) {
    ctx.store.addLiteral(scNode, OMC.hasStructuralType, taskSC.structuralType);
  }
}

function addTaskFC(ctx: AdapterContext, parent: RdfSubject, taskFC: any): void {
  const fcNode = blankNode();
  ctx.store.addQuad(parent, OMC.hasTaskFunctionalCharacteristic, fcNode);
  ctx.store.addQuad(fcNode, ns('rdf', 'type'), OMC.TaskAsFunction);
  
  if (taskFC.functionalType) {
    ctx.store.addLiteral(fcNode, OMC.hasFunctionalType, taskFC.functionalType);
  }
  
  if (taskFC.l1Category) {
    ctx.store.addLiteral(fcNode, MENEXUS.l1Category, taskFC.l1Category);
  }
  if (taskFC.l2Service) {
    ctx.store.addLiteral(fcNode, MENEXUS.l2Service, taskFC.l2Service);
  }
  if (taskFC.l3Service) {
    ctx.store.addLiteral(fcNode, MENEXUS.l3Service, taskFC.l3Service);
  }
}

function addWorkUnit(ctx: AdapterContext, parent: RdfSubject, workUnit: any): void {
  const wuNode = blankNode();
  ctx.store.addQuad(parent, OMC.hasWorkUnit, wuNode);
  ctx.store.addQuad(wuNode, ns('rdf', 'type'), ns('omc', 'WorkUnit'));
  
  if (workUnit.identifier) {
    addIdentifier(ctx, wuNode, workUnit.identifier);
  }
  
  if (workUnit.Participant) {
    const participants = Array.isArray(workUnit.Participant) ? workUnit.Participant : [workUnit.Participant];
    for (const p of participants) {
      const refId = extractEntityId(p);
      if (refId) {
        ctx.store.addReference(wuNode, OMCT.workUnitHasParticipant, refId);
      }
    }
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
  
  if (contextObj.scheduling) {
    if (contextObj.scheduling.scheduledStart) {
      ctx.store.addDateLiteral(ctxNode, OMC.hasScheduledStart, contextObj.scheduling.scheduledStart);
    }
    if (contextObj.scheduling.scheduledEnd) {
      ctx.store.addDateLiteral(ctxNode, OMC.hasScheduledEnd, contextObj.scheduling.scheduledEnd);
    }
    if (contextObj.scheduling.actualStart) {
      ctx.store.addDateLiteral(ctxNode, OMC.hasActualStart, contextObj.scheduling.actualStart);
    }
    if (contextObj.scheduling.actualEnd) {
      ctx.store.addDateLiteral(ctxNode, OMC.hasActualEnd, contextObj.scheduling.actualEnd);
    }
  }
  
  if (contextObj.contributesTo) {
    addContributesTo(ctx, ctxNode, contextObj.contributesTo);
  }
  
  if (contextObj.uses) {
    addUses(ctx, ctxNode, contextObj.uses);
  }
  
  if (contextObj.hasInputAssets && Array.isArray(contextObj.hasInputAssets)) {
    for (const ref of contextObj.hasInputAssets) {
      const refId = typeof ref === 'string' ? (ref.startsWith('me-nexus:') ? ref.slice(9) : ref) : extractEntityId(ref);
      if (refId) {
        ctx.store.addReference(ctxNode, MENEXUS.hasInputAssets, refId);
      }
    }
  }
  
  if (contextObj.hasOutputAssets && Array.isArray(contextObj.hasOutputAssets)) {
    for (const ref of contextObj.hasOutputAssets) {
      const refId = typeof ref === 'string' ? (ref.startsWith('me-nexus:') ? ref.slice(9) : ref) : extractEntityId(ref);
      if (refId) {
        ctx.store.addReference(ctxNode, MENEXUS.hasOutputAssets, refId);
      }
    }
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
