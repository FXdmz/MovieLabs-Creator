/**
 * @fileoverview RDF-to-JSON Entity Adapters
 * 
 * Converts RDF triples back to OMC JSON entity format. Contains reverse adapters
 * for all entity types: Asset, Task, Participant, CreativeWork, Infrastructure,
 * Location, and Context. Used for TTL file import and round-trip verification.
 * 
 * @exports rdfAssetToJson - Converts Asset RDF triples to JSON
 * @exports rdfTaskToJson - Converts Task RDF triples to JSON
 * @exports rdfParticipantToJson - Converts Participant RDF triples to JSON
 * @exports rdfCreativeWorkToJson - Converts CreativeWork RDF triples to JSON
 * @exports rdfInfrastructureToJson - Converts Infrastructure RDF triples to JSON
 * @exports rdfLocationToJson - Converts Location RDF triples to JSON
 * @exports rdfContextToJson - Converts Context RDF triples to JSON
 * @exports rdfEntitiesToJson - Bulk converts all entities in an RDF store
 */
import { NamedNode, BlankNode, Term } from 'n3';
import { OmcRdfStore, RdfSubject } from '../store';
import { entityUri, ns, OMC, RDFS, RDF, NAMESPACES } from '../namespaces';
import { AdapterContext, rdfToJsonBase } from './base';

export function rdfAssetToJson(ctx: AdapterContext, subject: RdfSubject): any {
  const base = rdfToJsonBase(ctx, subject);
  if (!base) return null;

  const scNodes = ctx.store.getObjects(subject, OMC.hasAssetStructuralCharacteristic);
  if (scNodes.length > 0) {
    base.AssetSC = rdfAssetSCToJson(ctx, scNodes[0] as RdfSubject);
  }

  const fcNodes = ctx.store.getObjects(subject, OMC.hasAssetFunctionalCharacteristic);
  if (fcNodes.length > 0) {
    base.assetFC = rdfAssetFCToJson(ctx, fcNodes[0] as RdfSubject);
  }

  return base;
}

function rdfAssetSCToJson(ctx: AdapterContext, scNode: RdfSubject): any {
  const result: any = {};

  const structuralType = ctx.store.getLiteralValue(scNode, OMC.hasStructuralType);
  if (structuralType) result.structuralType = structuralType;

  const propsNodes = ctx.store.getObjects(scNode, OMC.hasStructuralProperties);
  if (propsNodes.length > 0) {
    result.structuralProperties = rdfStructuralPropertiesToJson(ctx, propsNodes[0] as RdfSubject);
  }

  return result;
}

function rdfStructuralPropertiesToJson(ctx: AdapterContext, propsNode: RdfSubject): any {
  const result: any = {};
  const literalProps = [
    'mediaType', 'fileSize', 'fileName', 'filePath', 'fileExtension',
    'duration', 'frameRate', 'frameHeight', 'frameWidth',
    'codec', 'colorSpace', 'sampleSize', 'audioBitRate'
  ];

  for (const prop of literalProps) {
    const value = ctx.store.getLiteralValue(propsNode, ns('omc', `has${prop.charAt(0).toUpperCase() + prop.slice(1)}`));
    if (value !== null) result[prop] = value;
  }

  return result;
}

function rdfAssetFCToJson(ctx: AdapterContext, fcNode: RdfSubject): any {
  const result: any = {};

  const functionalType = ctx.store.getLiteralValue(fcNode, OMC.hasFunctionalType);
  if (functionalType) result.functionalType = functionalType;

  return result;
}

export function rdfTaskToJson(ctx: AdapterContext, subject: RdfSubject): any {
  const base = rdfToJsonBase(ctx, subject);
  if (!base) return null;

  const description = ctx.store.getLiteralValue(subject, ns('omc', 'hasDescription'));
  if (description) base.description = description;

  const taskFCNodes = ctx.store.getObjects(subject, ns('omc', 'hasTaskFunctionalCharacteristic'));
  if (taskFCNodes.length > 0) {
    base.taskFC = rdfTaskFCToJson(ctx, taskFCNodes[0] as RdfSubject);
  }

  const taskSCNodes = ctx.store.getObjects(subject, ns('omc', 'hasTaskStructuralCharacteristic'));
  if (taskSCNodes.length > 0) {
    base.TaskSC = rdfTaskSCToJson(ctx, taskSCNodes[0] as RdfSubject);
  }

  const workUnitNodes = ctx.store.getObjects(subject, ns('omc', 'hasWorkUnit'));
  if (workUnitNodes.length > 0) {
    const workUnits = workUnitNodes.map(wuNode => rdfWorkUnitToJson(ctx, wuNode as RdfSubject)).filter(Boolean);
    if (workUnits.length > 0) {
      base.workUnit = workUnits[0];
    }
  }

  const stateDescriptor = ctx.store.getLiteralValue(subject, ns('omc', 'hasStateDescriptor'));
  if (stateDescriptor) base.state = stateDescriptor;

  const contextNodes = ctx.store.getObjects(subject, ns('omc', 'hasContext'));
  if (contextNodes.length > 0) {
    base.Context = contextNodes.map(ctxNode => rdfTaskContextToJson(ctx, ctxNode as RdfSubject)).filter(Boolean);
    if (base.Context.length === 0) delete base.Context;
  }

  return base;
}

function rdfTaskFCToJson(ctx: AdapterContext, fcNode: RdfSubject): any {
  const result: any = {};
  
  const functionalType = ctx.store.getLiteralValue(fcNode, ns('omc', 'hasFunctionalType'));
  if (functionalType) result.functionalType = functionalType;
  
  const l1Category = ctx.store.getLiteralValue(fcNode, ns('menexus', 'l1Category'));
  if (l1Category) result.l1Category = l1Category;
  
  const l2Service = ctx.store.getLiteralValue(fcNode, ns('menexus', 'l2Service'));
  if (l2Service) result.l2Service = l2Service;
  
  const l3Service = ctx.store.getLiteralValue(fcNode, ns('menexus', 'l3Service'));
  if (l3Service) result.l3Service = l3Service;
  
  return Object.keys(result).length > 0 ? result : null;
}

function rdfTaskSCToJson(ctx: AdapterContext, scNode: RdfSubject): any {
  const result: any = {};
  
  const structuralType = ctx.store.getLiteralValue(scNode, ns('omc', 'hasStructuralType'));
  if (structuralType) result.structuralType = structuralType;
  
  return Object.keys(result).length > 0 ? result : null;
}

function rdfWorkUnitToJson(ctx: AdapterContext, wuNode: RdfSubject): any {
  const result: any = {};
  
  const identifiers = ctx.store.getObjects(wuNode, ns('omc', 'hasIdentifier'));
  if (identifiers.length > 0) {
    result.identifier = identifiers.map(idNode => {
      const scope = ctx.store.getLiteralValue(idNode as RdfSubject, ns('omc', 'hasIdentifierScope'));
      const value = ctx.store.getLiteralValue(idNode as RdfSubject, ns('omc', 'hasIdentifierValue'));
      return {
        identifierScope: scope,
        identifierValue: value,
        combinedForm: scope && value ? `${scope}:${value}` : undefined
      };
    }).filter(id => id.identifierScope || id.identifierValue);
  }
  
  const participantRefs = ctx.store.getAllReferences(wuNode, ns('omcT', 'aWorkUnitHas.Participant'));
  if (participantRefs.length > 0) {
    result.participantRef = `me-nexus:${participantRefs[0]}`;
  }
  
  return Object.keys(result).length > 0 ? result : null;
}

function rdfTaskContextToJson(ctx: AdapterContext, ctxNode: RdfSubject): any {
  const result: any = {
    entityType: 'Context',
    schemaVersion: 'https://movielabs.com/omc/json/schema/v2.8'
  };
  
  const identifiers = ctx.store.getObjects(ctxNode, ns('omc', 'hasIdentifier'));
  if (identifiers.length > 0) {
    result.identifier = identifiers.map(idNode => {
      const scope = ctx.store.getLiteralValue(idNode as RdfSubject, ns('omc', 'hasIdentifierScope'));
      const value = ctx.store.getLiteralValue(idNode as RdfSubject, ns('omc', 'hasIdentifierValue'));
      return {
        identifierScope: scope,
        identifierValue: value,
        combinedForm: scope && value ? `${scope}:${value}` : undefined
      };
    }).filter(id => id.identifierScope || id.identifierValue);
  }
  
  const contextType = ctx.store.getLiteralValue(ctxNode, ns('omc', 'contextType'));
  if (contextType) result.contextType = contextType;
  
  const scheduledStart = ctx.store.getLiteralValue(ctxNode, ns('omc', 'hasScheduledStart'));
  const scheduledEnd = ctx.store.getLiteralValue(ctxNode, ns('omc', 'hasScheduledEnd'));
  const actualStart = ctx.store.getLiteralValue(ctxNode, ns('omc', 'hasActualStart'));
  const actualEnd = ctx.store.getLiteralValue(ctxNode, ns('omc', 'hasActualEnd'));
  
  if (scheduledStart || scheduledEnd || actualStart || actualEnd) {
    result.scheduling = {};
    if (scheduledStart) result.scheduling.scheduledStart = scheduledStart;
    if (scheduledEnd) result.scheduling.scheduledEnd = scheduledEnd;
    if (actualStart) result.scheduling.actualStart = actualStart;
    if (actualEnd) result.scheduling.actualEnd = actualEnd;
  }
  
  const contributesToNodes = ctx.store.getObjects(ctxNode, ns('omc', 'contributesTo'));
  if (contributesToNodes.length > 0) {
    const ctNode = contributesToNodes[0] as RdfSubject;
    const cwRefs = ctx.store.getAllReferences(ctNode, ns('omc', 'CreativeWork'));
    if (cwRefs.length > 0) {
      result.contributesTo = {
        CreativeWork: cwRefs.map((id: string) => `me-nexus:${id}`)
      };
    }
  }
  
  const usesNodes = ctx.store.getObjects(ctxNode, ns('omcT', 'uses'));
  if (usesNodes.length > 0) {
    const usesNode = usesNodes[0] as RdfSubject;
    const uses: any = {};
    
    const infraRefs = ctx.store.getAllReferences(usesNode, ns('omc', 'Infrastructure'));
    if (infraRefs.length > 0) {
      uses.Infrastructure = infraRefs.map((id: string) => `me-nexus:${id}`);
    }
    
    const assetRefs = ctx.store.getAllReferences(usesNode, ns('omc', 'Asset'));
    if (assetRefs.length > 0) {
      uses.Asset = assetRefs.map((id: string) => `me-nexus:${id}`);
    }
    
    if (Object.keys(uses).length > 0) {
      result.uses = uses;
    }
  }
  
  const inputAssetRefs = ctx.store.getAllReferences(ctxNode, ns('menexus', 'hasInputAssets'));
  if (inputAssetRefs.length > 0) {
    result.hasInputAssets = inputAssetRefs.map((id: string) => `me-nexus:${id}`);
  }
  
  const outputAssetRefs = ctx.store.getAllReferences(ctxNode, ns('menexus', 'hasOutputAssets'));
  if (outputAssetRefs.length > 0) {
    result.hasOutputAssets = outputAssetRefs.map((id: string) => `me-nexus:${id}`);
  }
  
  return result;
}

export function rdfParticipantToJson(ctx: AdapterContext, subject: RdfSubject): any {
  const base = rdfToJsonBase(ctx, subject);
  if (!base) return null;

  const scNodes = ctx.store.getObjects(subject, ns('omc', 'hasParticipantStructuralCharacteristic'));
  if (scNodes.length > 0) {
    base.ParticipantSC = rdfParticipantSCToJson(ctx, scNodes[0] as RdfSubject);
  }

  const fcNodes = ctx.store.getObjects(subject, ns('omc', 'hasParticipantFunctionalCharacteristic'));
  if (fcNodes.length > 0) {
    base.participantFC = rdfParticipantFCToJson(ctx, fcNodes[0] as RdfSubject);
  }

  const locations = ctx.store.getAllReferences(subject, ns('omc', 'hasLocation'));
  if (locations.length > 0) {
    base.Location = `me-nexus:${locations[0]}`;
  }

  return base;
}

function rdfParticipantSCToJson(ctx: AdapterContext, scNode: RdfSubject): any {
  const result: any = {};
  
  const typeNode = ctx.store.getEntityType(scNode);
  if (typeNode) {
    const typeName = typeNode.value.split('#').pop() || '';
    if (['Person', 'Organization', 'Department', 'Service'].includes(typeName)) {
      result.entityType = typeName;
    }
  }
  
  const structuralType = ctx.store.getLiteralValue(scNode, ns('omc', 'hasStructuralType'));
  if (structuralType) result.structuralType = structuralType;
  
  // Infer entityType from structuralType if not already set
  if (!result.entityType && structuralType && typeof structuralType === 'string') {
    const typeMap: Record<string, string> = {
      'person': 'Person',
      'organization': 'Organization',
      'department': 'Department',
      'service': 'Service'
    };
    const inferred = typeMap[structuralType.toLowerCase()];
    if (inferred) result.entityType = inferred;
  }
  
  const personNameNodes = ctx.store.getObjects(scNode, ns('omc', 'hasPersonName'));
  if (personNameNodes.length > 0) {
    const nameNode = personNameNodes[0] as RdfSubject;
    const personName: any = {};
    const fullName = ctx.store.getLiteralValue(nameNode, ns('omc', 'hasFullName'));
    const firstName = ctx.store.getLiteralValue(nameNode, ns('omc', 'givenName'));
    const lastName = ctx.store.getLiteralValue(nameNode, ns('omc', 'familyName'));
    if (fullName) personName.fullName = fullName;
    if (firstName) personName.firstGivenName = firstName;
    if (lastName) personName.familyName = lastName;
    if (Object.keys(personName).length > 0) result.personName = personName;
  }
  
  const orgName = ctx.store.getLiteralValue(scNode, ns('omc', 'hasOrganizationName'));
  if (orgName) result.organizationName = orgName;
  
  const deptName = ctx.store.getLiteralValue(scNode, ns('omc', 'hasDepartmentName'));
  if (deptName) result.departmentName = deptName;
  
  const svcName = ctx.store.getLiteralValue(scNode, ns('omc', 'hasServiceName'));
  if (svcName) result.serviceName = svcName;
  
  const gender = ctx.store.getLiteralValue(scNode, ns('omc', 'hasGender'));
  if (gender) result.gender = gender;
  
  const contactNodes = ctx.store.getObjects(scNode, ns('omc', 'hasContact'));
  if (contactNodes.length > 0) {
    const contactNode = contactNodes[0] as RdfSubject;
    const contact: any = {};
    const email = ctx.store.getLiteralValue(contactNode, ns('omc', 'hasEmail'));
    const phone = ctx.store.getLiteralValue(contactNode, ns('omc', 'hasPhone'));
    if (email) contact.email = email;
    if (phone) contact.phone = phone;
    if (Object.keys(contact).length > 0) result.contact = contact;
  }
  
  return Object.keys(result).length > 0 ? result : null;
}

function rdfParticipantFCToJson(ctx: AdapterContext, fcNode: RdfSubject): any {
  const result: any = {};
  
  const functionalType = ctx.store.getLiteralValue(fcNode, ns('omc', 'hasFunctionalType'));
  if (functionalType) result.functionalType = functionalType;
  
  return Object.keys(result).length > 0 ? result : null;
}

export function rdfCreativeWorkToJson(ctx: AdapterContext, subject: RdfSubject): any {
  const base = rdfToJsonBase(ctx, subject);
  if (!base) return null;

  const titleNodes = ctx.store.getObjects(subject, ns('omc', 'hasTitle'));
  if (titleNodes.length > 0) {
    const titleNode = titleNodes[0] as RdfSubject;
    const titleValue = ctx.store.getLiteralValue(titleNode, ns('omc', 'hasTitleValue'));
    const titleClass = ctx.store.getLiteralValue(titleNode, ns('omc', 'hasTitleClass'));
    if (titleValue || titleClass) {
      base.title = {};
      if (titleValue) base.title.titleValue = titleValue;
      if (titleClass) base.title.titleClass = titleClass;
    }
  }

  return base;
}

export function rdfInfrastructureToJson(ctx: AdapterContext, subject: RdfSubject): any {
  const base = rdfToJsonBase(ctx, subject);
  if (!base) return null;

  const description = ctx.store.getLiteralValue(subject, ns('omc', 'hasDescription'));
  if (description) base.description = description;

  const scNodes = ctx.store.getObjects(subject, ns('omc', 'hasInfrastructureStructuralCharacteristic'));
  if (scNodes.length > 0) {
    const scNode = scNodes[0] as RdfSubject;
    const structuralType = ctx.store.getLiteralValue(scNode, ns('omc', 'hasStructuralType'));
    if (structuralType) {
      base.structuralCharacteristics = { structuralType };
    }
  }

  return base;
}

export function rdfLocationToJson(ctx: AdapterContext, subject: RdfSubject): any {
  const base = rdfToJsonBase(ctx, subject);
  if (!base) return null;

  const description = ctx.store.getLiteralValue(subject, ns('omc', 'hasDescription'));
  if (description) base.description = description;

  const addressNodes = ctx.store.getObjects(subject, ns('omc', 'hasAddress'));
  if (addressNodes.length > 0) {
    const addrNode = addressNodes[0] as RdfSubject;
    const address: any = {};
    
    const fullAddress = ctx.store.getLiteralValue(addrNode, ns('omc', 'hasFullAddress'));
    if (fullAddress) address.fullAddress = fullAddress;
    
    const street = ctx.store.getLiteralValue(addrNode, ns('omc', 'hasStreetNumberAndName'));
    if (street) address.street = street;
    
    const locality = ctx.store.getLiteralValue(addrNode, ns('omc', 'hasCity'));
    if (locality) address.locality = locality;
    
    const region = ctx.store.getLiteralValue(addrNode, ns('omc', 'hasState'));
    if (region) address.region = region;
    
    const postalCode = ctx.store.getLiteralValue(addrNode, ns('omc', 'hasPostalCode'));
    if (postalCode) address.postalCode = postalCode;
    
    const country = ctx.store.getLiteralValue(addrNode, ns('omc', 'hasCountry'));
    if (country) address.country = country;
    
    const countryCode = ctx.store.getLiteralValue(addrNode, ns('omc', 'hasCountryCode'));
    if (countryCode) address.countryCode = countryCode;
    
    if (Object.keys(address).length > 0) {
      base.address = address;
    }
  }

  const coordNodes = ctx.store.getObjects(subject, ns('omc', 'hasCoords'));
  if (coordNodes.length > 0) {
    const coordNode = coordNodes[0] as RdfSubject;
    const lat = ctx.store.getLiteralValue(coordNode, ns('omc', 'hasLatitude'));
    const lon = ctx.store.getLiteralValue(coordNode, ns('omc', 'hasLongitude'));
    if (lat !== null && lon !== null) {
      base.location = { lat, lon };
    }
  }

  return base;
}

export function rdfContextToJson(ctx: AdapterContext, subject: RdfSubject): any {
  const base = rdfToJsonBase(ctx, subject);
  if (!base) return null;

  const contextClass = ctx.store.getLiteralValue(subject, ns('omc', 'contextClass'));
  if (contextClass) {
    base.contextClass = contextClass;
  }

  const contextType = ctx.store.getLiteralValue(subject, ns('omc', 'contextType'));
  if (contextType) {
    base.contextType = contextType;
  }

  return base;
}

type RdfToJsonAdapter = (ctx: AdapterContext, subject: RdfSubject) => any;

const rdfAdapters: Record<string, RdfToJsonAdapter> = {
  Asset: rdfAssetToJson,
  Task: rdfTaskToJson,
  Participant: rdfParticipantToJson,
  CreativeWork: rdfCreativeWorkToJson,
  Infrastructure: rdfInfrastructureToJson,
  Location: rdfLocationToJson,
  Context: rdfContextToJson,
  MediaCreationContextComponent: rdfContextToJson
};

export function rdfEntityToJson(store: OmcRdfStore, entityId: string): any | null {
  const subject = entityUri(entityId);
  const typeNode = store.getEntityType(subject);
  if (!typeNode) return null;

  const typeName = typeNode.value.split('#').pop() || typeNode.value.split('/').pop() || '';
  const adapter = rdfAdapters[typeName];
  if (!adapter) {
    console.warn(`No RDF-to-JSON adapter for type: ${typeName}`);
    return null;
  }

  const ctx: AdapterContext = { store };
  return adapter(ctx, subject);
}

export function rdfEntitiesToJson(store: OmcRdfStore): any[] {
  const entityIds = store.getAllEntityIds();
  const results: any[] = [];

  for (const id of entityIds) {
    const json = rdfEntityToJson(store, id);
    if (json) {
      results.push(json);
    }
  }

  return results;
}
