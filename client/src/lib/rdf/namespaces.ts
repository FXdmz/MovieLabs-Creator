/**
 * @fileoverview OMC RDF Namespace Definitions and Predicate Constants
 * 
 * This module defines all RDF namespace prefixes and commonly-used predicates
 * for the OMC (Ontology for Media Creation) domain. It provides utilities for
 * creating NamedNodes and converting between prefixed and full URIs.
 * 
 * ## Namespaces Defined
 * 
 * | Prefix  | Namespace                                          | Purpose                    |
 * |---------|----------------------------------------------------|-----------------------------|
 * | omc     | https://movielabs.com/omc/rdf/schema/v2.8#        | Core OMC ontology           |
 * | omcT    | https://movielabs.com/omc/rdf/schema/v2.8Tentative# | Tentative OMC predicates   |
 * | rdf     | http://www.w3.org/1999/02/22-rdf-syntax-ns#       | RDF core vocabulary         |
 * | rdfs    | http://www.w3.org/2000/01/rdf-schema#             | RDF Schema                  |
 * | xsd     | http://www.w3.org/2001/XMLSchema#                 | XML Schema datatypes        |
 * | skos    | http://www.w3.org/2004/02/skos/core#              | SKOS vocabulary             |
 * | owl     | http://www.w3.org/2002/07/owl#                    | OWL ontology                |
 * | me      | https://me-nexus.com/id/                          | ME-NEXUS entity identifiers |
 * | menexus | https://me-nexus.com/schema#                      | ME-NEXUS extensions         |
 * 
 * ## Usage Examples
 * 
 * ```typescript
 * import { ns, entityUri, expandUri, compactUri, OMC, RDF } from './namespaces';
 * 
 * // Create a named node with namespace prefix
 * const predicate = ns('omc', 'hasName');
 * // Result: NamedNode("https://movielabs.com/omc/rdf/schema/v2.8#hasName")
 * 
 * // Create entity URI from ID
 * const subject = entityUri('my-entity-id');
 * // Result: NamedNode("https://me-nexus.com/id/my-entity-id")
 * 
 * // Expand prefixed URI to full form
 * expandUri('omc:Asset');
 * // Result: "https://movielabs.com/omc/rdf/schema/v2.8#Asset"
 * 
 * // Compact full URI to prefixed form
 * compactUri('https://movielabs.com/omc/rdf/schema/v2.8#Asset');
 * // Result: "omc:Asset"
 * 
 * // Use pre-defined predicate constants
 * store.addQuad(subject, RDF.type, OMC.Asset);
 * store.addQuad(subject, OMC.hasLocation, locationSubject);
 * ```
 * 
 * @module client/src/lib/rdf/namespaces
 */

import { DataFactory } from 'n3';

const { namedNode } = DataFactory;

// ============================================================================
// Namespace URI Constants
// ============================================================================

/**
 * All RDF namespace prefixes used in the OMC domain.
 * 
 * These are used for:
 * - Creating NamedNodes via ns() function
 * - Serializing TTL with proper @prefix declarations
 * - Expanding/compacting URIs
 */
export const NAMESPACES = {
  /** MovieLabs OMC core ontology v2.8 */
  omc: "https://movielabs.com/omc/rdf/schema/v2.8#",
  /** MovieLabs OMC tentative predicates (not yet in official spec) */
  omcT: "https://movielabs.com/omc/rdf/schema/v2.8Tentative#",
  /** RDF core vocabulary */
  rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
  /** RDF Schema vocabulary */
  rdfs: "http://www.w3.org/2000/01/rdf-schema#",
  /** XML Schema datatypes */
  xsd: "http://www.w3.org/2001/XMLSchema#",
  /** SKOS concept vocabulary */
  skos: "http://www.w3.org/2004/02/skos/core#",
  /** OWL ontology vocabulary */
  owl: "http://www.w3.org/2002/07/owl#",
  /** ME-NEXUS entity identifier namespace */
  me: "https://me-nexus.com/id/",
  /** ME-NEXUS schema extensions */
  menexus: "https://me-nexus.com/schema#"
} as const;

/**
 * Type for valid namespace prefix keys.
 */
export type NamespaceKey = keyof typeof NAMESPACES;

// ============================================================================
// URI Factory Functions
// ============================================================================

/**
 * Creates a NamedNode from a namespace prefix and local name.
 * 
 * @param prefix - The namespace prefix (e.g., 'omc', 'rdf')
 * @param localName - The local part of the URI (e.g., 'Asset', 'type')
 * @returns A NamedNode with the full URI
 * 
 * @example
 * ns('omc', 'Asset');     // => NamedNode("https://movielabs.com/omc/rdf/schema/v2.8#Asset")
 * ns('rdf', 'type');      // => NamedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#type")
 * ns('menexus', 'l1');    // => NamedNode("https://me-nexus.com/schema#l1")
 */
export function ns(prefix: NamespaceKey, localName: string) {
  return namedNode(`${NAMESPACES[prefix]}${localName}`);
}

/**
 * Creates a NamedNode for an entity URI using the me: namespace.
 * 
 * @param id - The entity identifier (UUID or other unique ID)
 * @returns A NamedNode with the me: prefixed URI
 * 
 * @example
 * entityUri('550e8400-e29b-41d4-a716-446655440000');
 * // => NamedNode("https://me-nexus.com/id/550e8400-e29b-41d4-a716-446655440000")
 */
export function entityUri(id: string) {
  return namedNode(`${NAMESPACES.me}${id}`);
}

/**
 * Expands a prefixed URI to its full form.
 * 
 * @param prefixedUri - URI in prefix:localName format (e.g., "omc:Asset")
 * @returns Full URI string, or original if no prefix matches
 * 
 * @example
 * expandUri('omc:Asset');     // => "https://movielabs.com/omc/rdf/schema/v2.8#Asset"
 * expandUri('rdf:type');      // => "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"
 * expandUri('http://...');    // => "http://..." (returned unchanged)
 */
export function expandUri(prefixedUri: string): string {
  for (const [prefix, namespace] of Object.entries(NAMESPACES)) {
    if (prefixedUri.startsWith(`${prefix}:`)) {
      return namespace + prefixedUri.slice(prefix.length + 1);
    }
  }
  return prefixedUri;
}

/**
 * Compacts a full URI to its prefixed form.
 * 
 * @param fullUri - Full URI string
 * @returns Prefixed URI (e.g., "omc:Asset"), or original if no namespace matches
 * 
 * @example
 * compactUri('https://movielabs.com/omc/rdf/schema/v2.8#Asset');
 * // => "omc:Asset"
 * 
 * compactUri('http://example.org/unknown');
 * // => "http://example.org/unknown" (returned unchanged)
 */
export function compactUri(fullUri: string): string {
  for (const [prefix, namespace] of Object.entries(NAMESPACES)) {
    if (fullUri.startsWith(namespace)) {
      return `${prefix}:${fullUri.slice(namespace.length)}`;
    }
  }
  return fullUri;
}

// ============================================================================
// RDF Core Predicates
// ============================================================================

/**
 * RDF core vocabulary predicates.
 */
export const RDF = {
  /** rdf:type - declares the class of a resource */
  type: ns('rdf', 'type')
};

/**
 * RDFS vocabulary predicates.
 */
export const RDFS = {
  /** rdfs:label - human-readable name */
  label: ns('rdfs', 'label'),
  /** rdfs:comment - human-readable description */
  comment: ns('rdfs', 'comment')
};

/**
 * SKOS vocabulary predicates.
 */
export const SKOS = {
  /** skos:definition - formal definition text */
  definition: ns('skos', 'definition')
};

// ============================================================================
// OMC Entity Type Classes
// ============================================================================

/**
 * OMC (Ontology for Media Creation) vocabulary.
 * Contains entity type classes and common predicates.
 */
export const OMC = {
  // --------------------------------------------------------------------------
  // Top-Level Entity Types
  // --------------------------------------------------------------------------
  
  /** omc:Asset - Digital or physical media asset */
  Asset: ns('omc', 'Asset'),
  /** omc:Task - Production workflow activity */
  Task: ns('omc', 'Task'),
  /** omc:Participant - Person, organization, or service */
  Participant: ns('omc', 'Participant'),
  /** omc:Infrastructure - Technical resource (software, hardware) */
  Infrastructure: ns('omc', 'Infrastructure'),
  /** omc:Location - Physical or virtual place */
  Location: ns('omc', 'Location'),
  /** omc:CreativeWork - Film, show, or production */
  CreativeWork: ns('omc', 'CreativeWork'),
  /** omc:MediaCreationContextComponent - Workflow context grouping */
  Context: ns('omc', 'MediaCreationContextComponent'),
  /** omc:Character - Narrative character */
  Character: ns('omc', 'Character'),
  
  // --------------------------------------------------------------------------
  // Participant Subtypes
  // --------------------------------------------------------------------------
  
  /** omc:Person - Individual human participant */
  Person: ns('omc', 'Person'),
  /** omc:Organization - Company or institution */
  Organization: ns('omc', 'Organization'),
  /** omc:Department - Organizational unit */
  Department: ns('omc', 'Department'),
  /** omc:Service - Service provider */
  Service: ns('omc', 'Service'),
  
  // --------------------------------------------------------------------------
  // Asset Subtypes
  // --------------------------------------------------------------------------
  
  /** omc:DigitalAsset - Digital media file */
  DigitalAsset: ns('omc', 'DigitalAsset'),
  /** omc:PhysicalAsset - Physical media or prop */
  PhysicalAsset: ns('omc', 'PhysicalAsset'),
  
  // --------------------------------------------------------------------------
  // Structural/Functional Characteristic Classes
  // --------------------------------------------------------------------------
  
  AssetAsStructure: ns('omc', 'AssetAsStructure'),
  AssetAsFunction: ns('omc', 'AssetAsFunction'),
  TaskAsStructure: ns('omc', 'TaskAsStructure'),
  TaskAsFunction: ns('omc', 'TaskAsFunction'),
  ParticipantAsStructure: ns('omc', 'ParticipantAsStructure'),
  ParticipantAsFunction: ns('omc', 'ParticipantAsFunction'),
  
  // --------------------------------------------------------------------------
  // Context Types
  // --------------------------------------------------------------------------
  
  /** omc:NarrativeContext - Story/narrative workflow context */
  NarrativeContext: ns('omc', 'NarrativeContext'),
  /** omc:ProductionContext - Production workflow context */
  ProductionContext: ns('omc', 'ProductionContext'),
  /** omc:MediaCreationContext - Generic media creation context */
  MediaCreationContext: ns('omc', 'MediaCreationContext'),
  
  // --------------------------------------------------------------------------
  // Identifier Predicates
  // --------------------------------------------------------------------------
  
  /** omc:schemaVersion - Schema version URI */
  schemaVersion: ns('omc', 'schemaVersion'),
  /** omc:hasIdentifier - Links to identifier node */
  hasIdentifier: ns('omc', 'hasIdentifier'),
  /** omc:hasIdentifierScope - Identifier scope (e.g., "me-nexus") */
  hasIdentifierScope: ns('omc', 'hasIdentifierScope'),
  /** omc:hasIdentifierValue - Identifier value (UUID) */
  hasIdentifierValue: ns('omc', 'hasIdentifierValue'),
  
  // --------------------------------------------------------------------------
  // Characteristic Predicates
  // --------------------------------------------------------------------------
  
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
  
  // --------------------------------------------------------------------------
  // Scheduling Predicates
  // --------------------------------------------------------------------------
  
  hasScheduledStart: ns('omc', 'hasScheduledStart'),
  hasScheduledEnd: ns('omc', 'hasScheduledEnd'),
  hasActualStart: ns('omc', 'hasActualStart'),
  hasActualEnd: ns('omc', 'hasActualEnd'),
  hasStateDescriptor: ns('omc', 'hasStateDescriptor'),
  
  // --------------------------------------------------------------------------
  // Context Predicates
  // --------------------------------------------------------------------------
  
  hasContext: ns('omc', 'hasContext'),
  hasContextComponent: ns('omc', 'hasContextComponent'),
  contextType: ns('omc', 'contextType'),
  contextClass: ns('omc', 'contextClass'),
  hasDescription: ns('omc', 'hasDescription'),
  
  // --------------------------------------------------------------------------
  // Location Predicates
  // --------------------------------------------------------------------------
  
  hasLocation: ns('omc', 'hasLocation'),
  hasAddress: ns('omc', 'hasAddress'),
  hasCoords: ns('omc', 'hasCoords'),
  
  // --------------------------------------------------------------------------
  // Title Predicates
  // --------------------------------------------------------------------------
  
  hasTitle: ns('omc', 'hasTitle'),
  hasTitleName: ns('omc', 'hasTitleName'),
  hasTitleType: ns('omc', 'hasTitleType'),
  
  // --------------------------------------------------------------------------
  // Person/Name Predicates
  // --------------------------------------------------------------------------
  
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
  
  // --------------------------------------------------------------------------
  // Asset/Media Predicates
  // --------------------------------------------------------------------------
  
  hasMediaType: ns('omc', 'hasMediaType'),
  hasFileSize: ns('omc', 'hasFileSize'),
  hasFileName: ns('omc', 'hasFileName'),
  hasFilePath: ns('omc', 'hasFilePath'),
  hasDuration: ns('omc', 'hasDuration'),
  hasFrameRate: ns('omc', 'hasFrameRate'),
  hasFrameHeight: ns('omc', 'hasFrameHeight'),
  hasFrameWidth: ns('omc', 'hasFrameWidth'),
  
  // --------------------------------------------------------------------------
  // Relationship Predicates
  // --------------------------------------------------------------------------
  
  /** omc:uses - Context uses Infrastructure/Asset */
  uses: ns('omc', 'uses'),
  /** omc:contributesTo - Context contributes to CreativeWork */
  contributesTo: ns('omc', 'contributesTo'),
  /** omc:hasWorkUnit - Task has WorkUnit */
  hasWorkUnit: ns('omc', 'hasWorkUnit'),
  /** omc:hasProduct - Task produces Asset */
  hasProduct: ns('omc', 'hasProduct'),
  
  // --------------------------------------------------------------------------
  // Custom Data Predicates
  // --------------------------------------------------------------------------
  
  hasCustomData: ns('omc', 'hasCustomData'),
  hasNamespace: ns('omc', 'hasNamespace'),
  hasValue: ns('omc', 'hasValue')
};

// ============================================================================
// OMC Tentative Predicates
// ============================================================================

/**
 * OMC Tentative vocabulary - predicates not yet in official spec.
 */
export const OMCT = {
  /** omcT:uses - Alternative uses predicate */
  uses: ns('omcT', 'uses'),
  /** omcT:aWorkUnitHas.Participant - WorkUnit participant reference */
  workUnitHasParticipant: ns('omcT', 'aWorkUnitHas.Participant')
};

// ============================================================================
// ME-NEXUS Extension Predicates
// ============================================================================

/**
 * ME-NEXUS extension predicates for hierarchical task classification.
 */
export const MENEXUS = {
  /** menexus:l1Category - Level 1 task category */
  l1Category: ns('menexus', 'l1Category'),
  /** menexus:l2Service - Level 2 service type */
  l2Service: ns('menexus', 'l2Service'),
  /** menexus:l3Service - Level 3 service type */
  l3Service: ns('menexus', 'l3Service'),
  /** menexus:hasInputAssets - Task input assets */
  hasInputAssets: ns('menexus', 'hasInputAssets'),
  /** menexus:hasOutputAssets - Task output assets */
  hasOutputAssets: ns('menexus', 'hasOutputAssets')
};
