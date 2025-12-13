import { NamedNode, DataFactory } from 'n3';
import { NAMESPACES, ns, OMC, OMCT, MENEXUS, RDF, RDFS, SKOS } from './namespaces';

const { namedNode } = DataFactory;

export interface PropertyMapping {
  predicate: NamedNode;
  isArray?: boolean;
  isReference?: boolean;
  isDate?: boolean;
  nestedType?: string;
}

const jsonToRdf: Record<string, PropertyMapping> = {
  name: { predicate: RDFS.label },
  comment: { predicate: RDFS.comment },
  description: { predicate: SKOS.definition },
  schemaVersion: { predicate: OMC.schemaVersion },
  
  identifier: { predicate: OMC.hasIdentifier, isArray: true, nestedType: 'Identifier' },
  identifierScope: { predicate: ns('omc', 'hasIdentifierScope') },
  identifierValue: { predicate: ns('omc', 'hasIdentifierValue') },
  
  AssetSC: { predicate: OMC.hasAssetStructuralCharacteristic, nestedType: 'AssetSC' },
  assetFC: { predicate: OMC.hasAssetFunctionalCharacteristic, nestedType: 'AssetFC' },
  TaskSC: { predicate: OMC.hasTaskStructuralCharacteristic, nestedType: 'TaskSC' },
  taskFC: { predicate: OMC.hasTaskFunctionalCharacteristic, nestedType: 'TaskFC' },
  ParticipantSC: { predicate: OMC.hasParticipantStructuralCharacteristic, nestedType: 'ParticipantSC' },
  participantFC: { predicate: OMC.hasParticipantFunctionalCharacteristic, nestedType: 'ParticipantFC' },
  InfrastructureSC: { predicate: OMC.hasInfrastructureStructuralCharacteristic, nestedType: 'InfrastructureSC' },
  infrastructureFC: { predicate: OMC.hasInfrastructureFunctionalCharacteristic, nestedType: 'InfrastructureFC' },
  
  structuralType: { predicate: OMC.hasStructuralType },
  functionalType: { predicate: OMC.hasFunctionalType },
  structuralProperties: { predicate: OMC.hasStructuralProperties, nestedType: 'StructuralProperties' },
  
  scheduledStart: { predicate: OMC.hasScheduledStart, isDate: true },
  scheduledEnd: { predicate: OMC.hasScheduledEnd, isDate: true },
  actualStart: { predicate: OMC.hasActualStart, isDate: true },
  actualEnd: { predicate: OMC.hasActualEnd, isDate: true },
  state: { predicate: OMC.hasStateDescriptor },
  
  Context: { predicate: OMC.hasContext, isArray: true, nestedType: 'Context' },
  contextType: { predicate: OMC.contextType },
  
  Location: { predicate: OMC.hasLocation, nestedType: 'Location', isReference: true },
  address: { predicate: OMC.hasAddress, nestedType: 'Address' },
  geo: { predicate: OMC.hasCoords, nestedType: 'Coords' },
  
  streetNumberAndName: { predicate: ns('omc', 'hasStreetNumberAndName') },
  city: { predicate: ns('omc', 'hasCity') },
  postalCode: { predicate: ns('omc', 'hasPostalCode') },
  country: { predicate: ns('omc', 'hasCountry') },
  countryCode: { predicate: ns('omc', 'hasCountryCode') },
  latitude: { predicate: ns('omc', 'hasLatitude') },
  longitude: { predicate: ns('omc', 'hasLongitude') },
  
  creativeWorkTitle: { predicate: OMC.hasTitle, isArray: true, nestedType: 'Title' },
  titleName: { predicate: ns('omc', 'hasTitleName') },
  titleType: { predicate: ns('omc', 'hasTitleType') },
  titleLanguage: { predicate: ns('omc', 'titleLanguage') },
  
  personName: { predicate: OMC.hasPersonName, nestedType: 'PersonName' },
  fullName: { predicate: OMC.hasFullName },
  firstName: { predicate: OMC.hasFirstName },
  lastName: { predicate: OMC.hasLastName },
  organizationName: { predicate: OMC.hasOrganizationName },
  departmentName: { predicate: OMC.hasDepartmentName },
  serviceName: { predicate: OMC.hasServiceName },
  gender: { predicate: OMC.hasGender },
  contact: { predicate: OMC.hasContact, nestedType: 'Contact' },
  email: { predicate: OMC.hasEmail },
  phone: { predicate: OMC.hasPhone },
  
  mediaType: { predicate: OMC.hasMediaType },
  fileSize: { predicate: OMC.hasFileSize },
  fileName: { predicate: OMC.hasFileName },
  filePath: { predicate: OMC.hasFilePath },
  duration: { predicate: OMC.hasDuration },
  frameRate: { predicate: OMC.hasFrameRate },
  frameHeight: { predicate: OMC.hasFrameHeight },
  frameWidth: { predicate: OMC.hasFrameWidth },
  
  uses: { predicate: OMCT.uses, nestedType: 'Uses' },
  contributesTo: { predicate: OMC.contributesTo, nestedType: 'ContributesTo' },
  workUnit: { predicate: OMC.hasWorkUnit, nestedType: 'WorkUnit' },
  hasProduct: { predicate: OMC.hasProduct, isArray: true, isReference: true },
  
  customData: { predicate: OMC.hasCustomData, isArray: true, nestedType: 'CustomData' },
  namespace: { predicate: OMC.hasNamespace },
  value: { predicate: OMC.hasValue },
  
  l1Category: { predicate: MENEXUS.l1Category },
  l2Service: { predicate: MENEXUS.l2Service },
  l3Service: { predicate: MENEXUS.l3Service },
  hasInputAssets: { predicate: MENEXUS.hasInputAssets, isArray: true, isReference: true },
  hasOutputAssets: { predicate: MENEXUS.hasOutputAssets, isArray: true, isReference: true }
};

const rdfToJson: Map<string, string> = new Map();
for (const [jsonKey, mapping] of Object.entries(jsonToRdf)) {
  rdfToJson.set(mapping.predicate.value, jsonKey);
}

const entityTypeToClass: Record<string, NamedNode> = {
  Asset: OMC.Asset,
  Task: OMC.Task,
  Participant: OMC.Participant,
  Infrastructure: OMC.Infrastructure,
  Location: ns('omc', 'Location'),
  CreativeWork: OMC.CreativeWork,
  Context: OMC.Context,
  Character: OMC.Character,
  
  Person: OMC.Person,
  Organization: OMC.Organization,
  Department: OMC.Department,
  Service: OMC.Service,
  
  DigitalAsset: OMC.DigitalAsset,
  PhysicalAsset: OMC.PhysicalAsset,
  
  AssetSC: OMC.AssetAsStructure,
  AssetFC: OMC.AssetAsFunction,
  TaskSC: OMC.TaskAsStructure,
  TaskFC: OMC.TaskAsFunction,
  ParticipantSC: OMC.ParticipantAsStructure,
  ParticipantFC: OMC.ParticipantAsFunction,
  
  NarrativeContext: OMC.NarrativeContext,
  ProductionContext: OMC.ProductionContext,
  MediaCreationContext: OMC.MediaCreationContext
};

const classToEntityType: Map<string, string> = new Map();
for (const [entityType, rdfClass] of Object.entries(entityTypeToClass)) {
  classToEntityType.set(rdfClass.value, entityType);
}

export function getPropertyMapping(jsonKey: string): PropertyMapping | null {
  return jsonToRdf[jsonKey] || null;
}

export function getJsonKey(predicateUri: string): string | null {
  return rdfToJson.get(predicateUri) || null;
}

export function getEntityClass(entityType: string): NamedNode | null {
  return entityTypeToClass[entityType] || null;
}

export function getEntityTypeFromClass(classUri: string): string | null {
  return classToEntityType.get(classUri) || null;
}

export function getAllPropertyMappings(): Record<string, PropertyMapping> {
  return { ...jsonToRdf };
}
