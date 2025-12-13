import { DataFactory, BlankNode, NamedNode } from 'n3';
import { OmcRdfStore, RdfSubject } from '../store';
import { entityUri, ns, OMC, NAMESPACES } from '../namespaces';
import { getEntityClass } from '../registry';
import { AdapterContext, addIdentifier, addNameLabel, jsonToRdfBase } from './base';

const { blankNode, namedNode, literal } = DataFactory;

export function creativeWorkToRdf(ctx: AdapterContext, entityId: string, content: any): NamedNode | null {
  const subject = jsonToRdfBase(ctx, entityId, content);
  if (!subject) return null;
  
  if (content.creativeWorkTitle && Array.isArray(content.creativeWorkTitle)) {
    for (const title of content.creativeWorkTitle) {
      addTitle(ctx, subject, title);
    }
  }
  
  if (content.creativeWorkType) {
    ctx.store.addLiteral(subject, ns('omc', 'creativeWorkType'), content.creativeWorkType);
  }
  
  if (content.creativeWorkCategory) {
    ctx.store.addLiteral(subject, ns('omc', 'creativeWorkCategory'), content.creativeWorkCategory);
  }
  
  if (content.approximateLength) {
    ctx.store.addLiteral(subject, ns('omc', 'approximateLength'), content.approximateLength);
  }
  
  return subject;
}

function addTitle(ctx: AdapterContext, parent: RdfSubject, title: any): void {
  const titleNode = blankNode();
  ctx.store.addQuad(parent, OMC.hasTitle, titleNode);
  
  if (title.titleName) {
    ctx.store.addLiteral(titleNode, ns('omc', 'hasTitleName'), title.titleName);
  }
  if (title.titleType) {
    ctx.store.addLiteral(titleNode, ns('omc', 'hasTitleType'), title.titleType);
  }
  if (title.titleLanguage) {
    ctx.store.addLiteral(titleNode, ns('omc', 'titleLanguage'), title.titleLanguage);
  }
}
