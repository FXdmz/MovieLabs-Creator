import { DataFactory, BlankNode, NamedNode } from 'n3';
import { OmcRdfStore, RdfSubject } from '../store';
import { entityUri, ns, OMC, NAMESPACES } from '../namespaces';
import { getEntityClass } from '../registry';
import { AdapterContext, addIdentifier, addNameLabel, jsonToRdfBase } from './base';

const { blankNode, namedNode, literal } = DataFactory;

export function locationToRdf(ctx: AdapterContext, entityId: string, content: any): NamedNode | null {
  const subject = jsonToRdfBase(ctx, entityId, content);
  if (!subject) return null;
  
  if (content.address) {
    addAddress(ctx, subject, content.address);
  }
  
  if (content.geo) {
    addCoords(ctx, subject, content.geo);
  }
  
  return subject;
}

function addAddress(ctx: AdapterContext, parent: RdfSubject, address: any): void {
  const addrNode = blankNode();
  ctx.store.addQuad(parent, OMC.hasAddress, addrNode);
  ctx.store.addQuad(addrNode, ns('rdf', 'type'), ns('omc', 'Address'));
  
  if (address.streetNumberAndName) {
    ctx.store.addLiteral(addrNode, ns('omc', 'hasStreetNumberAndName'), address.streetNumberAndName);
  }
  if (address.city) {
    ctx.store.addLiteral(addrNode, ns('omc', 'hasCity'), address.city);
  }
  if (address.state) {
    ctx.store.addLiteral(addrNode, ns('omc', 'hasState'), address.state);
  }
  if (address.postalCode) {
    ctx.store.addLiteral(addrNode, ns('omc', 'hasPostalCode'), address.postalCode);
  }
  if (address.country) {
    ctx.store.addLiteral(addrNode, ns('omc', 'hasCountry'), address.country);
  }
  if (address.countryCode) {
    ctx.store.addLiteral(addrNode, ns('omc', 'hasCountryCode'), address.countryCode);
  }
}

function addCoords(ctx: AdapterContext, parent: RdfSubject, geo: any): void {
  const geoNode = blankNode();
  ctx.store.addQuad(parent, OMC.hasCoords, geoNode);
  ctx.store.addQuad(geoNode, ns('rdf', 'type'), ns('omc', 'LatLon'));
  
  if (geo.latitude !== undefined && geo.latitude !== null) {
    ctx.store.addLiteral(geoNode, ns('omc', 'hasLatitude'), geo.latitude);
  }
  if (geo.longitude !== undefined && geo.longitude !== null) {
    ctx.store.addLiteral(geoNode, ns('omc', 'hasLongitude'), geo.longitude);
  }
}
