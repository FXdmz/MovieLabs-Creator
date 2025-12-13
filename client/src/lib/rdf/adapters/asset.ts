/**
 * @fileoverview Asset Entity RDF Adapter
 * 
 * Converts OMC Asset entities between JSON and RDF formats. Handles structural
 * characteristics (digital/physical assets), functional characteristics, and
 * structural properties like media type, file size, dimensions.
 * 
 * @exports assetToRdf - Converts Asset JSON to RDF triples
 */
import { DataFactory, BlankNode, NamedNode } from 'n3';
import { OmcRdfStore, RdfSubject } from '../store';
import { entityUri, ns, OMC, NAMESPACES } from '../namespaces';
import { getEntityClass } from '../registry';
import { AdapterContext, addIdentifier, addNameLabel, extractEntityId, jsonToRdfBase } from './base';

const { blankNode, namedNode, literal } = DataFactory;

export function assetToRdf(ctx: AdapterContext, entityId: string, content: any): NamedNode | null {
  const subject = jsonToRdfBase(ctx, entityId, content);
  if (!subject) return null;
  
  if (content.AssetSC) {
    addAssetSC(ctx, subject, content.AssetSC);
  }
  
  if (content.assetFC) {
    addAssetFC(ctx, subject, content.assetFC);
  }
  
  return subject;
}

function addAssetSC(ctx: AdapterContext, parent: RdfSubject, assetSC: any): void {
  const scNode = blankNode();
  
  const structuralType = assetSC.structuralType;
  let rdfClass = OMC.AssetAsStructure;
  if (structuralType === 'digital.image' || structuralType === 'digital.video' || 
      structuralType === 'digital.audio' || structuralType?.startsWith('digital')) {
    rdfClass = OMC.DigitalAsset;
  } else if (structuralType?.startsWith('physical')) {
    rdfClass = OMC.PhysicalAsset;
  }
  
  ctx.store.addQuad(parent, OMC.hasAssetStructuralCharacteristic, scNode);
  ctx.store.addQuad(scNode, ns('rdf', 'type'), rdfClass);
  
  if (assetSC.identifier) {
    addIdentifier(ctx, scNode, assetSC.identifier);
  }
  
  if (structuralType) {
    ctx.store.addLiteral(scNode, OMC.hasStructuralType, structuralType);
  }
  
  if (assetSC.structuralProperties) {
    addStructuralProperties(ctx, scNode, assetSC.structuralProperties);
  }
}

function addStructuralProperties(ctx: AdapterContext, parent: RdfSubject, props: any): void {
  const propsNode = blankNode();
  ctx.store.addQuad(parent, OMC.hasStructuralProperties, propsNode);
  
  const literalProps = [
    'mediaType', 'fileSize', 'fileName', 'filePath', 'fileExtension',
    'duration', 'frameRate', 'frameHeight', 'frameWidth',
    'codec', 'colorSpace', 'sampleSize', 'audioBitRate'
  ];
  
  for (const prop of literalProps) {
    if (props[prop] !== undefined && props[prop] !== null) {
      ctx.store.addLiteral(propsNode, ns('omc', `has${prop.charAt(0).toUpperCase() + prop.slice(1)}`), props[prop]);
    }
  }
  
  if (props.fileDetails) {
    const detailsNode = blankNode();
    ctx.store.addQuad(propsNode, ns('omc', 'hasFileDetails'), detailsNode);
    for (const [key, value] of Object.entries(props.fileDetails)) {
      if (value !== undefined && value !== null && typeof value !== 'object') {
        ctx.store.addLiteral(detailsNode, ns('omc', `has${key.charAt(0).toUpperCase() + key.slice(1)}`), value as any);
      }
    }
  }
}

function addAssetFC(ctx: AdapterContext, parent: RdfSubject, assetFC: any): void {
  const fcNode = blankNode();
  ctx.store.addQuad(parent, OMC.hasAssetFunctionalCharacteristic, fcNode);
  ctx.store.addQuad(fcNode, ns('rdf', 'type'), OMC.AssetAsFunction);
  
  if (assetFC.functionalType) {
    ctx.store.addLiteral(fcNode, OMC.hasFunctionalType, assetFC.functionalType);
  }
  
  if (assetFC.functionalProperties) {
    const propsNode = blankNode();
    ctx.store.addQuad(fcNode, ns('omc', 'functionalProperties'), propsNode);
    for (const [key, value] of Object.entries(assetFC.functionalProperties)) {
      if (value !== undefined && value !== null && typeof value !== 'object') {
        ctx.store.addLiteral(propsNode, ns('omc', key), value as any);
      }
    }
  }
}
