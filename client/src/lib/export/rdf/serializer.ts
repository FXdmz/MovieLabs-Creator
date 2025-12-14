/**
 * @fileoverview RDF/TTL Serializer for OMC Entities
 * 
 * Converts OMC JSON entities to RDF triples and serializes them as Turtle (TTL) format.
 * This is the primary export mechanism for generating RDF-compliant output from the
 * ontology builder's internal entity representation.
 * 
 * ## Architecture
 * 
 * The serialization pipeline follows these stages:
 * 1. **Entity → Triples**: Each entity is converted to a set of RDF triples
 * 2. **Triples → Turtle**: Triples are grouped by subject and formatted as TTL
 * 
 * ## Key Concepts
 * 
 * - **Triple**: RDF's fundamental unit (subject, predicate, object)
 * - **Blank Nodes**: Anonymous nodes for nested structures (e.g., `_:state_1`)
 * - **CURIE**: Compact URI format (e.g., `me:uuid123` for `me-nexus:uuid123`)
 * - **Literal**: Typed string values with optional XSD datatypes
 * 
 * ## Data Flow
 * 
 * ```
 * Entity (JSON)
 *   ↓ entityToTriples()
 * Triple[] (intermediate)
 *   ↓ triplesToTurtle()
 * TTL string (output)
 * ```
 * 
 * ## Usage
 * 
 * ```typescript
 * import { entitiesToTurtle, entityToTurtle } from './rdf/serializer';
 * 
 * // Export all entities to TTL
 * const ttl = entitiesToTurtle(entities);
 * 
 * // Export single entity to TTL
 * const singleTtl = entityToTurtle(entity);
 * ```
 * 
 * ## Special Handling
 * 
 * - **Task entities**: Complex nested structures (state, workUnit, Context) 
 *   are handled by `processTaskSpecificProperties()`
 * - **Entity references**: String refs like "me-nexus:uuid" are converted to URIs
 * - **Scheduling**: DateTime values get XSD datatype annotations
 * 
 * @module rdf/serializer
 */

import { Entity } from "../../store";
import { getPrefixDeclarations, entityTypeToRdfClass } from "./prefixes";

/**
 * Represents a single RDF triple (statement).
 * 
 * RDF triples are the fundamental building blocks of RDF data,
 * expressing facts as subject-predicate-object statements.
 * 
 * @example
 * // "Entity me:task1 has type omc:Task"
 * { subject: "me:task1", predicate: "rdf:type", object: "omc:Task" }
 * 
 * @example
 * // "Entity me:task1 has label 'Color Grading'"
 * { subject: "me:task1", predicate: "rdfs:label", object: '"Color Grading"' }
 */
interface Triple {
  subject: string;
  predicate: string;
  object: string;
}

// ============================================================================
// STRING FORMATTING UTILITIES
// ============================================================================

/**
 * Escapes special characters in a string for Turtle literal format.
 * 
 * Handles: backslash, quotes, newlines, carriage returns, tabs.
 * 
 * @param value - The string to escape
 * @returns Escaped string safe for use in TTL literals
 * 
 * @example
 * escapeString('Hello "World"') // 'Hello \\"World\\"'
 * escapeString('Line1\nLine2')  // 'Line1\\nLine2'
 */
function escapeString(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\t/g, "\\t");
}

/**
 * Formats a JavaScript value as an RDF literal with appropriate XSD datatype.
 * 
 * @param value - The value to format (string, number, boolean, Date, or other)
 * @returns Turtle-formatted literal string with optional XSD type annotation
 * 
 * @example
 * formatLiteral("hello")       // '"hello"'
 * formatLiteral(42)            // '"42"^^xsd:integer'
 * formatLiteral(3.14)          // '"3.14"^^xsd:decimal'
 * formatLiteral(true)          // '"true"^^xsd:boolean'
 * formatLiteral(new Date())    // '"2025-12-13T..."^^xsd:dateTime'
 */
function formatLiteral(value: unknown): string {
  if (typeof value === "string") {
    return `"${escapeString(value)}"`;
  }
  if (typeof value === "number") {
    if (Number.isInteger(value)) {
      return `"${value}"^^xsd:integer`;
    }
    return `"${value}"^^xsd:decimal`;
  }
  if (typeof value === "boolean") {
    return `"${value}"^^xsd:boolean`;
  }
  if (value instanceof Date) {
    return `"${value.toISOString()}"^^xsd:dateTime`;
  }
  return `"${escapeString(String(value))}"`;
}

// ============================================================================
// URI AND IDENTIFIER UTILITIES
// ============================================================================

/**
 * Generates the RDF URI for an entity based on its identifier.
 * 
 * Uses the entity's first identifier to construct a CURIE or URN.
 * Falls back to using the entity's internal ID with the `me:` prefix.
 * 
 * @param entity - The entity to get a URI for
 * @returns RDF URI string (e.g., "me:uuid123" or "<urn:scope:value>")
 * 
 * @example
 * // Entity with me-nexus identifier
 * getEntityUri({ content: { identifier: [{ identifierScope: "me-nexus", identifierValue: "abc" }] }})
 * // Returns: "me:abc"
 * 
 * @example
 * // Entity with custom scope
 * getEntityUri({ content: { identifier: [{ identifierScope: "imdb", identifierValue: "tt123" }] }})
 * // Returns: "<urn:imdb:tt123>"
 */
function getEntityUri(entity: Entity): string {
  const identifier = entity.content?.identifier;
  if (Array.isArray(identifier) && identifier.length > 0) {
    const id = identifier[0];
    const scope = id.identifierScope || "me-nexus";
    const value = id.identifierValue || entity.id;
    if (scope === "me-nexus") {
      return `me:${value}`;
    }
    return `<urn:${scope}:${value}>`;
  }
  return `me:${entity.id}`;
}

// ============================================================================
// PREDICATE MAPPING CONFIGURATION
// ============================================================================

/**
 * Maps JSON property names to RDF predicates.
 * 
 * This is the core mapping table that translates OMC-JSON property names
 * to their corresponding RDF predicates from the OMC ontology and related
 * namespaces (omc:, omcT:, menexus:, rdfs:, skos:).
 * 
 * ## Namespace Prefixes Used
 * - `omc:` - MovieLabs OMC ontology properties
 * - `omcT:` - OMC topology/relationship properties
 * - `menexus:` - ME-NEXUS extension properties
 * - `rdfs:` - RDF Schema vocabulary
 * - `skos:` - SKOS vocabulary (for descriptions)
 * - `rdf:` - Core RDF vocabulary
 * 
 * ## Mapping Categories
 * - **Core**: name, entityType, identifier, description
 * - **Asset**: AssetSC, assetFC, structuralType, functionalType
 * - **Task**: TaskSC, taskFC, taskName
 * - **Participant**: ParticipantSC, personName, organizationName
 * - **Location**: address, street, city, geo, coordinates
 * - **Creative Work**: title, titleName, depicts
 * - **Media**: mimeType, fileSize, duration, dimensions
 * - **ME-NEXUS**: meNexusService, l1, l2, l3
 * 
 * Properties not in this map default to `omc:{propertyName}`.
 */
const jsonToRdfPredicate: Record<string, string> = {
  name: "rdfs:label",
  entityType: "rdf:type",
  schemaVersion: "omc:schemaVersion",
  description: "skos:definition",
  identifier: "omc:hasIdentifier",
  identifierScope: "omc:hasIdentifierScope",
  identifierValue: "omc:hasIdentifierValue",
  
  AssetSC: "omc:hasAssetStructuralCharacteristic",
  assetSC: "omc:hasAssetStructuralCharacteristic",
  assetFC: "omc:hasAssetFunctionalCharacteristic",
  AssetFC: "omc:hasAssetFunctionalCharacteristic",
  functionalType: "omc:hasFunctionalType",
  structuralType: "omc:hasStructuralType",
  structuralProperties: "omc:hasStructuralProperties",
  
  TaskSC: "omc:hasTaskStructuralCharacteristic",
  taskSC: "omc:hasTaskStructuralCharacteristic",
  taskFC: "omc:hasTaskFunctionalCharacteristic",
  TaskFC: "omc:hasTaskFunctionalCharacteristic",
  taskName: "omc:hasTaskName",
  
  ParticipantSC: "omc:hasParticipantStructuralCharacteristic",
  participantSC: "omc:hasParticipantStructuralCharacteristic",
  participantFC: "omc:hasParticipantFunctionalCharacteristic",
  ParticipantFC: "omc:hasParticipantFunctionalCharacteristic",
  personName: "omc:hasPersonName",
  personNameValue: "omc:hasPersonNameValue",
  personNameLanguage: "omc:hasPersonNameLanguage",
  organizationName: "omc:hasOrganizationName",
  departmentName: "omc:hasDepartmentName",
  serviceName: "omc:hasServiceName",
  companyName: "omc:hasCompanyName",
  fullName: "omc:hasFullName",
  firstName: "omc:givenName",
  givenName: "omc:givenName",
  firstGivenName: "omc:givenName",
  lastName: "omc:familyName",
  familyName: "omc:familyName",
  gender: "omc:hasGender",
  contact: "omc:hasContact",
  email: "omc:hasEmail",
  phone: "omc:hasPhone",
  jobTitle: "omc:hasJobTitle",
  creditName: "omc:hasCreditName",
  guildName: "omc:hasGuildName",
  
  InfrastructureSC: "omc:hasInfrastructureStructuralCharacteristic",
  infrastructureSC: "omc:hasInfrastructureStructuralCharacteristic",
  infrastructureFC: "omc:hasInfrastructureFunctionalCharacteristic",
  InfrastructureFC: "omc:hasInfrastructureFunctionalCharacteristic",
  
  Location: "omc:hasLocation",
  location: "omc:hasLocation",
  associatedLocation: "omc:hasAssociatedLocation",
  address: "omc:hasAddress",
  street: "omc:hasStreetNumberAndName",
  streetNumber: "omc:hasStreetNumberAndName",
  streetNumberAndName: "omc:hasStreetNumberAndName",
  city: "omc:hasCity",
  locality: "omc:hasCity",
  state: "omc:hasState",
  postalCode: "omc:hasPostalCode",
  country: "omc:hasCountry",
  countryCode: "omc:hasCountryCode",
  countryName: "omc:hasCountryName",
  geo: "omc:hasCoords",
  coords: "omc:hasCoords",
  coordinates: "omc:hasCoords",
  latitude: "omc:hasLatitude",
  longitude: "omc:hasLongitude",
  xCoord: "omc:hasXCoord",
  yCoord: "omc:hasYCoord",
  zCoord: "omc:hasZCoord",
  
  Context: "omc:hasContext",
  context: "omc:hasContext",
  contextComponent: "omc:hasContextComponent",
  NarrativeContext: "omc:hasNarrativeContext",
  narrativeContext: "omc:hasNarrativeContext",
  ProductionContext: "omc:hasProductionContext",
  productionContext: "omc:hasProductionContext",
  
  mediaType: "omc:hasMediaType",
  mimeType: "omc:hasMediaType",
  fileSize: "omc:hasFileSize",
  fileName: "omc:hasFileName",
  filePath: "omc:hasFilePath",
  fileExtension: "omc:hasFileExtension",
  fileFormat: "omc:hasFileFormat",
  fileDetails: "omc:hasFileDetails",
  duration: "omc:hasDuration",
  dimensions: "omc:hasDimensions",
  frameHeight: "omc:hasFrameHeight",
  frameWidth: "omc:hasFrameWidth",
  height: "omc:hasHeight",
  width: "omc:hasWidth",
  depth: "omc:hasDepth",
  frameRate: "omc:hasFrameRate",
  sampleSize: "omc:hasSampleSize",
  audioBitRate: "omc:hasAudioBitRate",
  
  creativeWork: "omc:hasCreativeWork",
  creativeWorkName: "omc:hasCreativeWorkName",
  creativeWorkTitle: "omc:hasTitle",
  title: "omc:hasTitle",
  titleName: "omc:hasTitleName",
  titleType: "omc:hasTitleType",
  
  depicts: "omc:depicts",
  depiction: "omc:hasDepiction",
  depictionType: "omc:hasDepictionType",
  
  author: "omc:hasAuthor",
  director: "omc:hasDirector",
  
  customData: "omc:hasCustomData",
  tag: "omc:hasTag",
  tagValue: "omc:hasTagValue",
  
  meNexusService: "menexus:hasService",
  serviceId: "menexus:serviceId",
  l1: "menexus:l1",
  l2: "menexus:l2",
  l3: "menexus:l3",
  fullPath: "menexus:fullPath",
  omcEquivalent: "menexus:omcEquivalent",
  meNexusL1: "menexus:l1Category",
  functionalProperties: "omc:hasFunctionalProperties",
  taskFunctionalCharacteristics: "omc:hasTaskFunctionalCharacteristic",
  
  participant: "omc:hasParticipant",
  participantComponent: "omc:hasParticipantComponent",
  task: "omc:hasTask",
  taskComponent: "omc:hasTaskComponent",
  asset: "omc:hasAssetComponent",
  assetComponent: "omc:hasAssetComponent",
  assetGroup: "omc:hasAssetGroup",
  
  version: "omc:hasVersion",
  versionNumber: "omc:hasVersionNumber",
  
  characterName: "omc:hasCharacterName",
  dateOfBirth: "omc:hasDateOfBirth",
  species: "omc:hasSpecies",
  
  shootDay: "omc:hasShootDay",
  shootDate: "omc:hasShootDate",
  slateUID: "omc:hasSlateUID",
  take: "omc:hasTake",
  shotNumber: "omc:hasShotNumber",
  
  timecode: "omc:hasTimecode",
  timecodeStart: "omc:hasTimecodeStart",
  timecodeEnd: "omc:hasTimecodeEnd",
  
  codec: "omc:hasCodec",
  colorSpace: "omc:hasColorSpace",
  colorSpaceName: "omc:hasColorSpaceName",
  
  cameraLabel: "omc:hasCameraLabel",
  cameraMake: "omc:hasCameraMake",
  cameraModel: "omc:hasCameraModel",
  cameraSerialNumber: "omc:hasCameraSerialNumber",
  cameraMetadata: "omc:hasCameraMetadata",
  
  namespace: "omc:hasNamespace",
  value: "omc:hasValue",
  unit: "omc:hasUnit",
  text: "omc:hasText",
  
  start: "omc:hasStart",
  end: "omc:hasEnd",
  actualStart: "omc:hasActualStart",
  actualEnd: "omc:hasActualEnd",
  sourceStart: "omc:hasSourceStart",
  sourceEnd: "omc:hasSourceEnd",
  
  subject: "omc:hasSubject",
  source: "omc:hasSource",
  software: "omc:hasSoftware",
  softwareVersion: "omc:hasSoftwareVersion",
  apiVersion: "omc:hasAPIVersion",
  
  contributesTo: "omc:contributesTo",
  uses: "omc:uses",
  CreativeWork: "omc:CreativeWork",
  Infrastructure: "omc:Infrastructure",
  Asset: "omc:Asset"
};

/**
 * Properties to skip during generic property processing.
 * 
 * These properties are either:
 * - Handled specially by dedicated processing functions (state, workUnit)
 * - Internal/computed values not needed in RDF output (combinedForm)
 * - Processed elsewhere in the pipeline (schemaVersion, meNexusService)
 */
const skipProperties = new Set([
  "combinedForm",
  "region",
  "schemaVersion",
  "state",
  "stateDetails",
  "workUnit",
  "taskClassification",
  "meNexusService"
]);

/**
 * Maps task state string values to OMC State Descriptor URIs.
 * 
 * Normalizes various state string formats (with/without hyphens, underscores)
 * to their canonical OMC ontology representations.
 * 
 * @example
 * "in_process" -> "omc:InProcess"
 * "in-process" -> "omc:InProcess"
 * "complete"   -> "omc:Completed"
 */
const STATE_DESCRIPTOR_MAP: Record<string, string> = {
  "assigned": "omc:Assigned",
  "in_process": "omc:InProcess",
  "in-process": "omc:InProcess",
  "inprocess": "omc:InProcess",
  "complete": "omc:Completed",
  "completed": "omc:Completed",
  "waiting": "omc:Waiting",
  "blocked": "omc:Blocked",
  "pending": "omc:Pending",
  "cancelled": "omc:Cancelled"
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Converts a JSON property key to its corresponding RDF predicate.
 * 
 * Looks up the key in `jsonToRdfPredicate` mapping, returning null for
 * properties that should be skipped, or defaulting to `omc:{key}`.
 * 
 * @param key - The JSON property name
 * @returns RDF predicate string, or null if property should be skipped
 * 
 * @example
 * jsonKeyToRdfPredicate("name")        // "rdfs:label"
 * jsonKeyToRdfPredicate("duration")    // "omc:hasDuration"
 * jsonKeyToRdfPredicate("combinedForm") // null (skipped)
 * jsonKeyToRdfPredicate("customProp")  // "omc:customProp"
 */
function jsonKeyToRdfPredicate(key: string): string | null {
  if (skipProperties.has(key)) {
    return null;
  }
  return jsonToRdfPredicate[key] || `omc:${key}`;
}

/** Counter for generating unique blank node identifiers. Reset before each export. */
let blankNodeCounter = 0;

/**
 * Generates a unique blank node identifier for anonymous RDF nodes.
 * 
 * Used for nested structures that don't have their own identifier,
 * such as state objects, scheduling info, or structural characteristics.
 * 
 * @param prefix - Descriptive prefix for the blank node (e.g., "state", "workunit")
 * @returns Blank node identifier in format `_:{prefix}_{counter}`
 * 
 * @example
 * generateBlankNodeId("state")    // "_:state_1"
 * generateBlankNodeId("address")  // "_:address_2"
 */
function generateBlankNodeId(prefix: string): string {
  blankNodeCounter++;
  return `_:${prefix}_${blankNodeCounter}`;
}

/**
 * Converts a combined form identifier string to an RDF URI.
 * 
 * Combined form is the `scope:value` format used in OMC identifiers.
 * This function converts it to appropriate RDF URI notation.
 * 
 * @param combinedForm - Identifier in "scope:value" format
 * @returns RDF URI (CURIE for me-nexus, URN for other scopes)
 * 
 * @example
 * combinedFormToUri("me-nexus:abc123")  // "me:abc123"
 * combinedFormToUri("imdb:tt1234567")   // "<urn:imdb:tt1234567>"
 * combinedFormToUri("abc123")            // "me:abc123"
 */
function combinedFormToUri(combinedForm: string): string {
  if (combinedForm.startsWith("me-nexus:")) {
    return `me:${combinedForm.replace("me-nexus:", "")}`;
  }
  const colonIndex = combinedForm.indexOf(":");
  if (colonIndex > 0) {
    const scope = combinedForm.substring(0, colonIndex);
    const value = combinedForm.substring(colonIndex + 1);
    return `<urn:${scope}:${value}>`;
  }
  return `me:${combinedForm}`;
}

// ============================================================================
// TASK-SPECIFIC PROCESSING
// ============================================================================

/**
 * Processes Task-specific properties that require special RDF serialization.
 * 
 * Task entities have complex nested structures that need custom handling:
 * - **State**: Serialized as a typed omc:State node with descriptor
 * - **Context**: Each context becomes a MediaCreationContextComponent with
 *   scheduling, contributesTo, and uses relationships
 * - **WorkUnit**: Serialized with participant references using omcT predicates
 * 
 * This function handles these complex structures before the generic
 * property processing runs.
 * 
 * @param subject - The RDF URI of the Task entity
 * @param content - The Task's content object
 * @param triples - Array to append generated triples to (mutated)
 * 
 * ## Generated Triple Patterns
 * 
 * For State:
 * ```turtle
 * me:task1 omc:hasState _:state_1 .
 * _:state_1 rdf:type omc:State ;
 *           omc:hasStateDescriptor omc:InProcess .
 * ```
 * 
 * For WorkUnit with Participant:
 * ```turtle
 * me:task1 omc:hasWorkUnit me:workunit1 .
 * me:workunit1 omcT:aWorkUnitHas.Participant me:person1 .
 * me:person1 omc:hasWorkUnit me:workunit1 .
 * ```
 */
function processTaskSpecificProperties(subject: string, content: any, triples: Triple[]): void {
  if (content.state && typeof content.state === 'string') {
    const stateNodeId = generateBlankNodeId("state");
    triples.push({ subject, predicate: "omc:hasState", object: stateNodeId });
    triples.push({ subject: stateNodeId, predicate: "rdf:type", object: "omc:State" });
    
    const normalizedState = content.state.toLowerCase().replace(/[\s-]+/g, "_");
    const stateDescriptor = STATE_DESCRIPTOR_MAP[normalizedState] || formatLiteral(content.state);
    triples.push({ subject: stateNodeId, predicate: "omc:hasStateDescriptor", object: stateDescriptor });
    
    if (content.stateDetails) {
      triples.push({ subject: stateNodeId, predicate: "rdfs:comment", object: formatLiteral(content.stateDetails) });
    }
  }

  const contextValue = content.Context;
  const contexts = Array.isArray(contextValue) ? contextValue : (contextValue ? [contextValue] : []);
  contexts.forEach((context: any, index: number) => {
    if (context?.scheduling) {
      const sched = context.scheduling;
      if (sched.scheduledStart) {
        triples.push({ subject, predicate: "omc:hasScheduledStart", object: `"${sched.scheduledStart}"^^xsd:dateTime` });
      }
      if (sched.scheduledEnd) {
        triples.push({ subject, predicate: "omc:hasScheduledEnd", object: `"${sched.scheduledEnd}"^^xsd:dateTime` });
      }
      if (sched.actualStart) {
        triples.push({ subject, predicate: "omc:hasActualStart", object: `"${sched.actualStart}"^^xsd:dateTime` });
      }
      if (sched.actualEnd) {
        triples.push({ subject, predicate: "omc:hasActualEnd", object: `"${sched.actualEnd}"^^xsd:dateTime` });
      }
    }
    
    // Note: Assets are now always output via the nested uses structure on Context, never as direct triples on Task
    
    if (context.hasOutputAssets && Array.isArray(context.hasOutputAssets)) {
      context.hasOutputAssets.forEach((assetRef: string) => {
        triples.push({ subject, predicate: "omc:hasProduct", object: combinedFormToUri(assetRef) });
      });
    }
    
    if (context.informs && Array.isArray(context.informs)) {
      context.informs.forEach((taskRef: string) => {
        triples.push({ subject, predicate: "omc:informs", object: combinedFormToUri(taskRef) });
      });
    }
    
    if (context.isInformedBy && Array.isArray(context.isInformedBy)) {
      context.isInformedBy.forEach((taskRef: string) => {
        triples.push({ subject, predicate: "omc:isInformedBy", object: combinedFormToUri(taskRef) });
      });
    }
    
    const ctxId = context.identifier?.[0]?.identifierValue || `context_${blankNodeCounter++}`;
    const ctxScope = context.identifier?.[0]?.identifierScope || "me-nexus";
    const ctxSubject = ctxScope === "me-nexus" ? `me:${ctxId}` : `<urn:${ctxScope}:${ctxId}>`;
    
    triples.push({ subject, predicate: "omc:hasContext", object: ctxSubject });
    triples.push({ subject: ctxSubject, predicate: "rdf:type", object: "omc:MediaCreationContextComponent" });
    
    if (context.identifier?.[0]) {
      const id = context.identifier[0];
      if (id.identifierScope) {
        triples.push({ subject: ctxSubject, predicate: "omc:hasIdentifierScope", object: formatLiteral(id.identifierScope) });
      }
      if (id.identifierValue) {
        triples.push({ subject: ctxSubject, predicate: "omc:hasIdentifierValue", object: formatLiteral(id.identifierValue) });
      }
    }
    
    if (context.contextType) {
      triples.push({ subject: ctxSubject, predicate: "omc:contextType", object: formatLiteral(context.contextType) });
    }
    
    if (context.description) {
      triples.push({ subject: ctxSubject, predicate: "skos:definition", object: formatLiteral(context.description) });
    }
    
    // Export contributesTo nested object
    if (context.contributesTo) {
      const contributesToNode = generateBlankNodeId("contributesTo");
      triples.push({ subject: ctxSubject, predicate: "omc:contributesTo", object: contributesToNode });
      
      if (context.contributesTo.CreativeWork) {
        const cwRefs = Array.isArray(context.contributesTo.CreativeWork) 
          ? context.contributesTo.CreativeWork 
          : [context.contributesTo.CreativeWork];
        cwRefs.forEach((cwRef: string) => {
          triples.push({ subject: contributesToNode, predicate: "omc:CreativeWork", object: combinedFormToUri(cwRef) });
        });
      }
    }
    
    // Export uses nested object (with full structure)
    // Use hasInputAssets as fallback/primary source for Assets (form uses hasInputAssets, import may have uses.Asset)
    const usesInfraRaw = context.uses?.Infrastructure;
    const usesAssetsRaw = context.uses?.Asset || context.hasInputAssets;
    
    // Normalize to arrays and filter out empty values
    const infraRefs = usesInfraRaw 
      ? (Array.isArray(usesInfraRaw) ? usesInfraRaw : [usesInfraRaw]).filter(Boolean)
      : [];
    const assetRefs = usesAssetsRaw 
      ? (Array.isArray(usesAssetsRaw) ? usesAssetsRaw : [usesAssetsRaw]).filter(Boolean)
      : [];
    
    // Only create uses node if there's actual content
    if (infraRefs.length > 0 || assetRefs.length > 0) {
      const usesNode = generateBlankNodeId("uses");
      triples.push({ subject: ctxSubject, predicate: "omc:uses", object: usesNode });
      
      infraRefs.forEach((infraRef: string) => {
        triples.push({ subject: usesNode, predicate: "omc:Infrastructure", object: combinedFormToUri(infraRef) });
      });
      
      assetRefs.forEach((assetRef: string) => {
        triples.push({ subject: usesNode, predicate: "omc:Asset", object: combinedFormToUri(assetRef) });
      });
    }
  });

  if (content.workUnit) {
    const wu = content.workUnit;
    const hasId = wu.identifier?.[0]?.identifierValue;
    let wuSubject: string;
    
    if (hasId) {
      const wuScope = wu.identifier[0].identifierScope || "me-nexus";
      wuSubject = wuScope === "me-nexus" ? `me:${hasId}` : `<urn:${wuScope}:${hasId}>`;
    } else {
      wuSubject = generateBlankNodeId("workunit");
    }
    
    triples.push({ subject, predicate: "omc:hasWorkUnit", object: wuSubject });
    triples.push({ subject: wuSubject, predicate: "rdf:type", object: "omc:WorkUnit" });
    
    if (wu.identifier?.[0]) {
      const id = wu.identifier[0];
      if (id.identifierScope) {
        triples.push({ subject: wuSubject, predicate: "omc:hasIdentifierScope", object: formatLiteral(id.identifierScope) });
      }
      if (id.identifierValue) {
        triples.push({ subject: wuSubject, predicate: "omc:hasIdentifierValue", object: formatLiteral(id.identifierValue) });
      }
    }
    
    if (wu.participantRef) {
      const participantUri = combinedFormToUri(wu.participantRef);
      
      triples.push({
        subject: wuSubject,
        predicate: "omcT:aWorkUnitHas.Participant",
        object: participantUri
      });
      
      if (!participantUri.startsWith('"')) {
        triples.push({ subject: participantUri, predicate: "omc:hasWorkUnit", object: wuSubject });
      }
    }
  }
}

// ============================================================================
// ENTITY TO TRIPLES CONVERSION
// ============================================================================

/**
 * Converts an entity to an array of RDF triples.
 * 
 * This is the main conversion function that transforms a single entity
 * into its RDF representation. It handles:
 * 
 * 1. Core entity type and label
 * 2. Task-specific properties via processTaskSpecificProperties()
 * 3. All other properties via recursive processValue()
 * 
 * @param entity - The entity to convert
 * @returns Array of Triple objects representing the entity in RDF
 * 
 * @example
 * const triples = entityToTriples({
 *   id: "abc123",
 *   type: "Asset",
 *   name: "Hero Shot",
 *   content: { entityType: "Asset", ... }
 * });
 * // Returns triples like:
 * // { subject: "me:abc123", predicate: "rdf:type", object: "omc:Asset" }
 * // { subject: "me:abc123", predicate: "rdfs:label", object: '"Hero Shot"' }
 */
function entityToTriples(entity: Entity): Triple[] {
  const triples: Triple[] = [];
  const subject = getEntityUri(entity);
  const content = entity.content;
  
  triples.push({
    subject,
    predicate: "rdf:type",
    object: entityTypeToRdfClass(entity.type)
  });
  
  triples.push({
    subject,
    predicate: "rdfs:label",
    object: formatLiteral(entity.name)
  });

  if (entity.type === "Task" && content) {
    processTaskSpecificProperties(subject, content, triples);
  }
  
  function processValue(subj: string, key: string, value: unknown, depth: number = 0): void {
    if (value === null || value === undefined || value === "") return;
    if (depth > 5) return;
    
    const predicate = jsonKeyToRdfPredicate(key);
    
    if (predicate === null) {
      return;
    }
    
    if (key === "entityType" && depth === 0) {
      return;
    }
    
    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        if (typeof item === "object" && item !== null) {
          const itemObj = item as Record<string, unknown>;
          let nestedSubject: string;
          
          if (itemObj.identifierValue && itemObj.identifierScope) {
            const scope = itemObj.identifierScope as string;
            const val = itemObj.identifierValue as string;
            nestedSubject = scope === "me-nexus" ? `me:${val}` : `<urn:${scope}:${val}>`;
          } else {
            nestedSubject = generateBlankNodeId(`${key}${index}`);
          }
          
          triples.push({ subject: subj, predicate, object: nestedSubject });
          Object.entries(itemObj).forEach(([k, v]) => {
            processValue(nestedSubject, k, v, depth + 1);
          });
        } else if (item !== undefined && item !== null && item !== "") {
          triples.push({ subject: subj, predicate, object: formatLiteral(item) });
        }
      });
    } else if (typeof value === "object") {
      const valueObj = value as Record<string, unknown>;
      if (key === "entityType") return;
      
      const nestedType = valueObj.entityType as string | undefined;
      let nestedSubject: string;
      
      if (valueObj.identifierValue && valueObj.identifierScope) {
        const scope = valueObj.identifierScope as string;
        const val = valueObj.identifierValue as string;
        nestedSubject = scope === "me-nexus" ? `me:${val}` : `<urn:${scope}:${val}>`;
      } else if (valueObj.identifier && Array.isArray(valueObj.identifier) && valueObj.identifier.length > 0) {
        const id = valueObj.identifier[0] as Record<string, unknown>;
        const scope = (id.identifierScope || "me-nexus") as string;
        const val = (id.identifierValue || `anon_${blankNodeCounter++}`) as string;
        nestedSubject = scope === "me-nexus" ? `me:${val}` : `<urn:${scope}:${val}>`;
      } else {
        nestedSubject = generateBlankNodeId(key);
      }
      
      triples.push({ subject: subj, predicate, object: nestedSubject });
      
      if (nestedType) {
        triples.push({
          subject: nestedSubject,
          predicate: "rdf:type",
          object: entityTypeToRdfClass(nestedType)
        });
      } else if (key === "address") {
        triples.push({
          subject: nestedSubject,
          predicate: "rdf:type",
          object: "omc:Address"
        });
      } else if (key === "geo" || key === "coordinates") {
        triples.push({
          subject: nestedSubject,
          predicate: "rdf:type",
          object: "omc:LatLon"
        });
      }
      
      Object.entries(valueObj).forEach(([k, v]) => {
        if (k !== "entityType" && k !== "schemaVersion") {
          processValue(nestedSubject, k, v, depth + 1);
        }
      });
    } else {
      // Check if this is an entity reference property that should be a URI, not a literal
      const entityRefProperties = new Set(['Location', 'location', 'Participant', 'participant', 'Asset', 'asset', 'Context', 'context', 'CreativeWork', 'creativeWork', 'Infrastructure', 'infrastructure', 'Task', 'task']);
      if (entityRefProperties.has(key) && typeof value === 'string') {
        // Convert CURIE string to URI (e.g., "me-nexus:uuid" -> "me:uuid")
        const uri = combinedFormToUri(value as string);
        triples.push({ subject: subj, predicate, object: uri });
      } else {
        triples.push({ subject: subj, predicate, object: formatLiteral(value) });
      }
    }
  }
  
  if (content) {
    Object.entries(content).forEach(([key, value]) => {
      if (key !== "entityType" && key !== "schemaVersion") {
        if (entity.type === "Task" && key === "Context" && Array.isArray(value)) {
          const taskContextSkipFields = new Set([
            "scheduling", "hasInputAssets", "hasOutputAssets", 
            "informs", "isInformedBy", "identifier", "contextType", "description",
            "contributesTo", "uses"
          ]);
          
          value.forEach((ctx: any, ctxIndex: number) => {
            const ctxId = ctx.identifier?.[0]?.identifierValue || `context_${blankNodeCounter++}`;
            const ctxScope = ctx.identifier?.[0]?.identifierScope || "me-nexus";
            const ctxSubject = ctxScope === "me-nexus" ? `me:${ctxId}` : `<urn:${ctxScope}:${ctxId}>`;
            
            Object.entries(ctx).forEach(([ctxKey, ctxValue]) => {
              if (!taskContextSkipFields.has(ctxKey) && ctxKey !== "entityType" && ctxKey !== "schemaVersion") {
                processValue(ctxSubject, ctxKey, ctxValue, 1);
              }
            });
          });
        } else {
          processValue(subject, key, value, 0);
        }
      }
    });
  }
  
  return triples;
}

// ============================================================================
// TURTLE SERIALIZATION
// ============================================================================

/**
 * Converts an array of triples to Turtle (TTL) format string.
 * 
 * Groups triples by subject and formats them using Turtle's abbreviated
 * notation with `;` for predicate continuation and `,` for object continuation.
 * 
 * @param triples - Array of Triple objects to serialize
 * @returns Formatted Turtle string (without prefix declarations)
 * 
 * @example
 * // Input triples:
 * [
 *   { subject: "me:task1", predicate: "rdf:type", object: "omc:Task" },
 *   { subject: "me:task1", predicate: "rdfs:label", object: '"Color Grading"' }
 * ]
 * 
 * // Output:
 * // me:task1
 * //     rdf:type omc:Task ;
 * //     rdfs:label "Color Grading" .
 */
function triplesToTurtle(triples: Triple[]): string {
  const grouped: Map<string, Map<string, Set<string>>> = new Map();
  
  triples.forEach(({ subject, predicate, object }) => {
    if (!grouped.has(subject)) {
      grouped.set(subject, new Map());
    }
    const predicates = grouped.get(subject)!;
    if (!predicates.has(predicate)) {
      predicates.set(predicate, new Set());
    }
    predicates.get(predicate)!.add(object);
  });
  
  const lines: string[] = [];
  
  grouped.forEach((predicates, subject) => {
    lines.push(`${subject}`);
    const predicateEntries = Array.from(predicates.entries());
    predicateEntries.forEach(([predicate, objects], pIndex) => {
      const isLastPredicate = pIndex === predicateEntries.length - 1;
      const objectsArray = Array.from(objects);
      objectsArray.forEach((obj, oIndex) => {
        const isLastObject = oIndex === objectsArray.length - 1;
        const terminator = isLastPredicate && isLastObject ? " ." : (isLastObject ? " ;" : " ,");
        if (oIndex === 0) {
          lines.push(`    ${predicate} ${obj}${terminator}`);
        } else {
          lines.push(`        ${obj}${terminator}`);
        }
      });
    });
    lines.push("");
  });
  
  return lines.join("\n");
}

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Converts multiple entities to a complete Turtle document.
 * 
 * This is the main export function for RDF/TTL output. It:
 * 1. Resets the blank node counter for consistent output
 * 2. Generates namespace prefix declarations
 * 3. Converts all entities to triples
 * 4. Serializes triples to Turtle format
 * 
 * @param entities - Array of entities to convert
 * @returns Complete Turtle document string with prefixes
 * 
 * @example
 * import { entitiesToTurtle } from './rdf/serializer';
 * 
 * const entities = store.getState().entities;
 * const ttlDocument = entitiesToTurtle(entities);
 * 
 * // Download as file
 * const blob = new Blob([ttlDocument], { type: 'text/turtle' });
 * 
 * @see entityToTurtle - For single entity export
 */
export function entitiesToTurtle(entities: Entity[]): string {
  blankNodeCounter = 0;
  const prefixes = getPrefixDeclarations();
  const allTriples: Triple[] = [];
  
  entities.forEach(entity => {
    allTriples.push(...entityToTriples(entity));
  });
  
  const turtleBody = triplesToTurtle(allTriples);
  
  return `${prefixes}\n\n${turtleBody}`;
}

/**
 * Converts a single entity to a complete Turtle document.
 * 
 * Convenience wrapper around entitiesToTurtle for single-entity export.
 * Includes full prefix declarations and proper formatting.
 * 
 * @param entity - The entity to convert
 * @returns Complete Turtle document string with prefixes
 * 
 * @example
 * import { entityToTurtle } from './rdf/serializer';
 * 
 * const selectedEntity = store.getState().getSelectedEntity();
 * const ttl = entityToTurtle(selectedEntity);
 * 
 * @see entitiesToTurtle - For multi-entity export
 */
export function entityToTurtle(entity: Entity): string {
  return entitiesToTurtle([entity]);
}
