import { DataFactory } from 'n3';

const { namedNode } = DataFactory;

export const NAMESPACES = {
  omc: "https://movielabs.com/omc/rdf/schema/v2.8#",
  omcT: "https://movielabs.com/omc/rdf/schema/v2.8Tentative#",
  rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
  rdfs: "http://www.w3.org/2000/01/rdf-schema#",
  xsd: "http://www.w3.org/2001/XMLSchema#",
  skos: "http://www.w3.org/2004/02/skos/core#",
  owl: "http://www.w3.org/2002/07/owl#",
  me: "https://me-nexus.com/id/",
  menexus: "https://me-nexus.com/schema#"
} as const;

export type NamespaceKey = keyof typeof NAMESPACES;

export function ns(prefix: NamespaceKey, localName: string) {
  return namedNode(`${NAMESPACES[prefix]}${localName}`);
}

export function entityUri(id: string) {
  return namedNode(`${NAMESPACES.me}${id}`);
}

export function expandUri(prefixedUri: string): string {
  for (const [prefix, namespace] of Object.entries(NAMESPACES)) {
    if (prefixedUri.startsWith(`${prefix}:`)) {
      return namespace + prefixedUri.slice(prefix.length + 1);
    }
  }
  return prefixedUri;
}

export function compactUri(fullUri: string): string {
  for (const [prefix, namespace] of Object.entries(NAMESPACES)) {
    if (fullUri.startsWith(namespace)) {
      return `${prefix}:${fullUri.slice(namespace.length)}`;
    }
  }
  return fullUri;
}

export const RDF = {
  type: ns('rdf', 'type')
};

export const RDFS = {
  label: ns('rdfs', 'label'),
  comment: ns('rdfs', 'comment')
};

export const SKOS = {
  definition: ns('skos', 'definition')
};

export const OMC = {
  Asset: ns('omc', 'Asset'),
  Task: ns('omc', 'Task'),
  Participant: ns('omc', 'Participant'),
  Infrastructure: ns('omc', 'Infrastructure'),
  Location: ns('omc', 'Location'),
  CreativeWork: ns('omc', 'CreativeWork'),
  Context: ns('omc', 'MediaCreationContextComponent'),
  Character: ns('omc', 'Character'),
  
  Person: ns('omc', 'Person'),
  Organization: ns('omc', 'Organization'),
  Department: ns('omc', 'Department'),
  Service: ns('omc', 'Service'),
  
  DigitalAsset: ns('omc', 'DigitalAsset'),
  PhysicalAsset: ns('omc', 'PhysicalAsset'),
  
  AssetAsStructure: ns('omc', 'AssetAsStructure'),
  AssetAsFunction: ns('omc', 'AssetAsFunction'),
  TaskAsStructure: ns('omc', 'TaskAsStructure'),
  TaskAsFunction: ns('omc', 'TaskAsFunction'),
  ParticipantAsStructure: ns('omc', 'ParticipantAsStructure'),
  ParticipantAsFunction: ns('omc', 'ParticipantAsFunction'),
  
  NarrativeContext: ns('omc', 'NarrativeContext'),
  ProductionContext: ns('omc', 'ProductionContext'),
  MediaCreationContext: ns('omc', 'MediaCreationContext'),
  
  schemaVersion: ns('omc', 'schemaVersion'),
  hasIdentifier: ns('omc', 'hasIdentifier'),
  hasIdentifierScope: ns('omc', 'hasIdentifierScope'),
  hasIdentifierValue: ns('omc', 'hasIdentifierValue'),
  
  hasAssetStructuralCharacteristic: ns('omc', 'hasAssetStructuralCharacteristic'),
  hasAssetFunctionalCharacteristic: ns('omc', 'hasAssetFunctionalCharacteristic'),
  hasTaskStructuralCharacteristic: ns('omc', 'hasTaskStructuralCharacteristic'),
  hasTaskFunctionalCharacteristic: ns('omc', 'hasTaskFunctionalCharacteristic'),
  hasParticipantStructuralCharacteristic: ns('omc', 'hasParticipantStructuralCharacteristic'),
  hasParticipantFunctionalCharacteristic: ns('omc', 'hasParticipantFunctionalCharacteristic'),
  hasInfrastructureStructuralCharacteristic: ns('omc', 'hasInfrastructureStructuralCharacteristic'),
  hasInfrastructureFunctionalCharacteristic: ns('omc', 'hasInfrastructureFunctionalCharacteristic'),
  
  hasFunctionalType: ns('omc', 'hasFunctionalType'),
  hasStructuralType: ns('omc', 'hasStructuralType'),
  hasStructuralProperties: ns('omc', 'hasStructuralProperties'),
  
  hasScheduledStart: ns('omc', 'hasScheduledStart'),
  hasScheduledEnd: ns('omc', 'hasScheduledEnd'),
  hasActualStart: ns('omc', 'hasActualStart'),
  hasActualEnd: ns('omc', 'hasActualEnd'),
  hasStateDescriptor: ns('omc', 'hasStateDescriptor'),
  
  hasContext: ns('omc', 'hasContext'),
  hasContextComponent: ns('omc', 'hasContextComponent'),
  contextType: ns('omc', 'contextType'),
  
  hasLocation: ns('omc', 'hasLocation'),
  hasAddress: ns('omc', 'hasAddress'),
  hasCoords: ns('omc', 'hasCoords'),
  
  hasTitle: ns('omc', 'hasTitle'),
  hasTitleName: ns('omc', 'hasTitleName'),
  hasTitleType: ns('omc', 'hasTitleType'),
  
  hasPersonName: ns('omc', 'hasPersonName'),
  hasFullName: ns('omc', 'hasFullName'),
  hasFirstName: ns('omc', 'hasFirstName'),
  hasLastName: ns('omc', 'hasLastName'),
  hasOrganizationName: ns('omc', 'hasOrganizationName'),
  hasDepartmentName: ns('omc', 'hasDepartmentName'),
  hasServiceName: ns('omc', 'hasServiceName'),
  hasGender: ns('omc', 'hasGender'),
  hasContact: ns('omc', 'hasContact'),
  hasEmail: ns('omc', 'hasEmail'),
  hasPhone: ns('omc', 'hasPhone'),
  
  hasMediaType: ns('omc', 'hasMediaType'),
  hasFileSize: ns('omc', 'hasFileSize'),
  hasFileName: ns('omc', 'hasFileName'),
  hasFilePath: ns('omc', 'hasFilePath'),
  hasDuration: ns('omc', 'hasDuration'),
  hasFrameRate: ns('omc', 'hasFrameRate'),
  hasFrameHeight: ns('omc', 'hasFrameHeight'),
  hasFrameWidth: ns('omc', 'hasFrameWidth'),
  
  uses: ns('omc', 'uses'),
  contributesTo: ns('omc', 'contributesTo'),
  hasWorkUnit: ns('omc', 'hasWorkUnit'),
  hasProduct: ns('omc', 'hasProduct'),
  
  hasCustomData: ns('omc', 'hasCustomData'),
  hasNamespace: ns('omc', 'hasNamespace'),
  hasValue: ns('omc', 'hasValue')
};

export const OMCT = {
  uses: ns('omcT', 'uses'),
  workUnitHasParticipant: ns('omcT', 'aWorkUnitHas.Participant')
};

export const MENEXUS = {
  l1Category: ns('menexus', 'l1Category'),
  l2Service: ns('menexus', 'l2Service'),
  l3Service: ns('menexus', 'l3Service'),
  hasInputAssets: ns('menexus', 'hasInputAssets'),
  hasOutputAssets: ns('menexus', 'hasOutputAssets')
};
