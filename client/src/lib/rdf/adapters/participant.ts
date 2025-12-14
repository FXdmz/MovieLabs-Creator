/**
 * @fileoverview Participant Entity RDF Adapter
 * 
 * Converts OMC Participant entities (Person, Organization, Department, Service)
 * between JSON and RDF formats. Handles structural characteristics with person
 * names, contact info, and location references.
 * 
 * @exports participantToRdf - Converts Participant JSON to RDF triples
 */
import { DataFactory, BlankNode, NamedNode } from 'n3';
import { OmcRdfStore, RdfSubject } from '../store';
import { entityUri, ns, OMC, NAMESPACES } from '../namespaces';
import { getEntityClass } from '../registry';
import { AdapterContext, addIdentifier, addNameLabel, extractEntityId, jsonToRdfBase } from './base';

const { blankNode, namedNode, literal } = DataFactory;

export function participantToRdf(ctx: AdapterContext, entityId: string, content: any): NamedNode | null {
  const subject = jsonToRdfBase(ctx, entityId, content);
  if (!subject) return null;
  
  if (content.ParticipantSC) {
    addParticipantSC(ctx, subject, content.ParticipantSC);
  }
  
  if (content.participantFC) {
    addParticipantFC(ctx, subject, content.participantFC);
  }
  
  if (content.Location) {
    let locId: string | null = null;
    if (typeof content.Location === 'string') {
      locId = content.Location.startsWith('me-nexus:') 
        ? content.Location.slice(9) 
        : content.Location;
    } else {
      locId = extractEntityId(content.Location);
    }
    if (locId) {
      ctx.store.addReference(subject, OMC.hasLocation, locId);
    }
  }
  
  return subject;
}

function addParticipantSC(ctx: AdapterContext, parent: RdfSubject, participantSC: any): void {
  const scNode = blankNode();
  
  const entityType = participantSC.entityType || 'Person';
  let rdfClass = OMC.ParticipantAsStructure;
  if (entityType === 'Person') rdfClass = OMC.Person;
  else if (entityType === 'Organization') rdfClass = OMC.Organization;
  else if (entityType === 'Department') rdfClass = OMC.Department;
  else if (entityType === 'Service') rdfClass = OMC.Service;
  
  ctx.store.addQuad(parent, OMC.hasParticipantStructuralCharacteristic, scNode);
  ctx.store.addQuad(scNode, ns('rdf', 'type'), rdfClass);
  
  if (participantSC.identifier) {
    addIdentifier(ctx, scNode, participantSC.identifier);
  }
  
  if (participantSC.structuralType) {
    ctx.store.addLiteral(scNode, OMC.hasStructuralType, participantSC.structuralType);
  }
  
  if (participantSC.personName) {
    addPersonName(ctx, scNode, participantSC.personName);
  }
  
  if (participantSC.organizationName) {
    ctx.store.addLiteral(scNode, OMC.hasOrganizationName, participantSC.organizationName);
  }
  
  if (participantSC.departmentName) {
    ctx.store.addLiteral(scNode, OMC.hasDepartmentName, participantSC.departmentName);
  }
  
  if (participantSC.serviceName) {
    ctx.store.addLiteral(scNode, OMC.hasServiceName, participantSC.serviceName);
  }
  
  if (participantSC.gender) {
    ctx.store.addLiteral(scNode, OMC.hasGender, participantSC.gender);
  }
  
  if (participantSC.contact) {
    addContact(ctx, scNode, participantSC.contact);
  }
}

function addPersonName(ctx: AdapterContext, parent: RdfSubject, personName: any): void {
  const nameNode = blankNode();
  ctx.store.addQuad(parent, OMC.hasPersonName, nameNode);
  
  if (personName.fullName) {
    ctx.store.addLiteral(nameNode, OMC.hasFullName, personName.fullName);
  }
  if (personName.firstGivenName || personName.firstName) {
    ctx.store.addLiteral(nameNode, OMC.givenName, personName.firstGivenName || personName.firstName);
  }
  if (personName.familyName || personName.lastName) {
    ctx.store.addLiteral(nameNode, OMC.familyName, personName.familyName || personName.lastName);
  }
}

function addContact(ctx: AdapterContext, parent: RdfSubject, contact: any): void {
  const contactNode = blankNode();
  ctx.store.addQuad(parent, OMC.hasContact, contactNode);
  
  if (contact.email) {
    ctx.store.addLiteral(contactNode, OMC.hasEmail, contact.email);
  }
  if (contact.phone) {
    ctx.store.addLiteral(contactNode, OMC.hasPhone, contact.phone);
  }
}

function addParticipantFC(ctx: AdapterContext, parent: RdfSubject, participantFC: any): void {
  const fcNode = blankNode();
  ctx.store.addQuad(parent, OMC.hasParticipantFunctionalCharacteristic, fcNode);
  ctx.store.addQuad(fcNode, ns('rdf', 'type'), OMC.ParticipantAsFunction);
  
  if (participantFC.functionalType) {
    ctx.store.addLiteral(fcNode, OMC.hasFunctionalType, participantFC.functionalType);
  }
}
