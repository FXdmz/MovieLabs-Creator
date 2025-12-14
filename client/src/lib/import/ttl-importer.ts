/**
 * @fileoverview RDF/TTL Import Module for OMC Entities
 * 
 * This module provides functionality to parse and import MovieLabs OMC entities
 * from RDF/TTL (Turtle) format. It uses the N3.js library to parse TTL syntax
 * and converts RDF triples into OMC-JSON compliant entity objects.
 * 
 * @module import/ttl-importer
 * 
 * @description
 * The importer performs these key operations:
 * 1. Parses TTL text into an RDF quad store using N3.js
 * 2. Identifies root entities by their rdf:type (omc:Asset, omc:Task, etc.)
 * 3. Recursively builds JSON objects from RDF triples
 * 4. Maps RDF predicates to JSON property names
 * 5. Handles references between entities (creates CURIE strings)
 * 6. Applies Task-specific transformations for scheduling, state, etc.
 * 
 * Namespace handling:
 * - omc: MovieLabs OMC schema (v2.8)
 * - omcT: MovieLabs tentative predicates
 * - me: ME-NEXUS entity identifiers
 * - menexus: ME-NEXUS custom schema extensions
 * 
 * @example
 * // Import TTL file
 * const ttlContent = await fetch('project.ttl').then(r => r.text());
 * const result = await parseOmcTtlMulti(ttlContent);
 * if (result.success) {
 *   result.entities.forEach(e => store.addEntityFromContent(e.entityType, e.entityId, e.content));
 * }
 * 
 * @see {@link parseOmcTtl} for single-entity import (legacy API)
 * @see {@link parseOmcTtlMulti} for multi-entity import
 */

import * as N3 from 'n3';
import { EntityType, ENTITY_TYPES } from '../constants';
import { ImportResult, ImportedEntity, MultiImportResult } from './json-importer';

// ============================================================================
// TASK TRANSFORMATION
// ============================================================================

/**
 * Transforms a Task entity to normalize RDF-specific property formats.
 * 
 * This function handles Task-specific transformations after RDF→JSON conversion:
 * 
 * 1. customData extraction:
 *    - namespace='work' → workUnit
 *    - namespace='workflow' → state, stateDetails
 * 
 * 2. State object normalization:
 *    - state.stateDescriptor → state (string)
 *    - state.comment → stateDetails
 * 
 * 3. Scheduling to Context:
 *    - scheduledStart/scheduledEnd → Context[0].scheduling
 * 
 * 4. Asset references:
 *    - uses array → Context[0].hasInputAssets
 * 
 * 5. Context normalization:
 *    - Ensures contributesTo.CreativeWork is always array
 *    - Ensures uses.Infrastructure and uses.Asset are arrays
 *    - Sets hasInputAssets from uses.Asset
 * 
 * @param {any} parsed - Raw parsed Task entity from RDF
 * @returns {any} Transformed Task entity with normalized properties
 */
function transformTaskEntity(parsed: any): any {
  const transformed = { ...parsed };

  if (Array.isArray(parsed.customData)) {
    for (const cd of parsed.customData) {
      if (cd.namespace === 'work' && cd.value?.workUnit) {
        transformed.workUnit = cd.value.workUnit;
      }
      if (cd.namespace === 'workflow' && cd.value) {
        if (cd.value.state) {
          transformed.state = cd.value.state;
        }
        if (cd.value.stateDetails) {
          transformed.stateDetails = cd.value.stateDetails;
        }
      }
    }
  }

  if (parsed.state && typeof parsed.state === 'object') {
    if (parsed.state.stateDescriptor) {
      const stateValue = parsed.state.stateDescriptor;
      if (typeof stateValue === 'string') {
        const stateLower = stateValue.toLowerCase().replace('omc:', '').replace('https://movielabs.com/omc/rdf/schema/v2.8#', '');
        transformed.state = stateLower;
      }
    }
    if (parsed.state.comment) {
      transformed.stateDetails = parsed.state.comment;
    }
  }

  if (parsed.scheduledStart || parsed.scheduledEnd) {
    const contextId = crypto.randomUUID();
    const existingContext = Array.isArray(parsed.Context) && parsed.Context.length > 0 
      ? parsed.Context[0] 
      : {
          entityType: "Context",
          schemaVersion: "https://movielabs.com/omc/json/schema/v2.8",
          identifier: [{
            identifierScope: 'me-nexus',
            identifierValue: contextId,
            combinedForm: `me-nexus:${contextId}`
          }],
          contextType: "production"
        };
    
    existingContext.scheduling = {
      scheduledStart: parsed.scheduledStart || null,
      scheduledEnd: parsed.scheduledEnd || null
    };
    
    transformed.Context = [existingContext];
    delete transformed.scheduledStart;
    delete transformed.scheduledEnd;
  }

  if (parsed.uses && !transformed.Context?.[0]?.hasInputAssets) {
    const usesArray = Array.isArray(parsed.uses) ? parsed.uses : [parsed.uses];
    const assetRefs = usesArray.filter((ref: any) => typeof ref === 'string' && ref.startsWith('me-nexus:'));
    
    if (assetRefs.length > 0) {
      if (!transformed.Context || transformed.Context.length === 0) {
        const contextId = crypto.randomUUID();
        transformed.Context = [{
          entityType: "Context",
          schemaVersion: "https://movielabs.com/omc/json/schema/v2.8",
          identifier: [{
            identifierScope: 'me-nexus',
            identifierValue: contextId,
            combinedForm: `me-nexus:${contextId}`
          }],
          contextType: "production"
        }];
      }
      transformed.Context[0].hasInputAssets = assetRefs;
    }
  }

  if (Array.isArray(parsed.Context)) {
    transformed.Context = parsed.Context.map((ctx: any) => {
      const transformedCtx = { ...ctx };
      
      if (Array.isArray(ctx.customData)) {
        for (const cd of ctx.customData) {
          if (cd.namespace === 'scheduling' && cd.value?.scheduling) {
            transformedCtx.scheduling = cd.value.scheduling;
          }
        }
      }
      
      if (ctx.contributesTo && ctx.contributesTo.CreativeWork) {
        const cwRef = ctx.contributesTo.CreativeWork;
        transformedCtx.contributesTo = {
          ...ctx.contributesTo,
          CreativeWork: Array.isArray(cwRef) ? cwRef : [cwRef]
        };
      }
      
      if (ctx.uses) {
        const normalizedUses: Record<string, any> = { ...ctx.uses };
        if (ctx.uses.Infrastructure) {
          normalizedUses.Infrastructure = Array.isArray(ctx.uses.Infrastructure) 
            ? ctx.uses.Infrastructure 
            : [ctx.uses.Infrastructure];
        }
        if (ctx.uses.Asset) {
          normalizedUses.Asset = Array.isArray(ctx.uses.Asset) 
            ? ctx.uses.Asset 
            : [ctx.uses.Asset];
        }
        transformedCtx.uses = normalizedUses;
        
        if (normalizedUses.Asset && Array.isArray(normalizedUses.Asset)) {
          transformedCtx.hasInputAssets = normalizedUses.Asset;
        }
      }
      
      return transformedCtx;
    });
  }

  return transformed;
}

/**
 * Dispatches entity transformation based on entity type.
 * 
 * Currently only Task entities receive special transformation.
 * Other entity types are returned unchanged.
 * 
 * @param {any} parsed - Raw parsed entity from RDF
 * @returns {any} Transformed entity
 */
function transformEntity(parsed: any): any {
  if (parsed.entityType === 'Task') {
    return transformTaskEntity(parsed);
  }
  return parsed;
}

// ============================================================================
// RDF NAMESPACE DEFINITIONS
// ============================================================================

/**
 * RDF namespace prefix mappings.
 * 
 * These prefixes are used throughout the importer for:
 * - Matching rdf:type values to entity types
 * - Converting predicate URIs to JSON property names
 * - Extracting entity IDs from me: URIs
 * 
 * @constant {Record<string, string>}
 */
const RDF_PREFIXES: Record<string, string> = {
  omc: "https://movielabs.com/omc/rdf/schema/v2.8#",
  omcT: "https://movielabs.com/omc/rdf/schema/v2.8Tentative#",
  rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
  rdfs: "http://www.w3.org/2000/01/rdf-schema#",
  xsd: "http://www.w3.org/2001/XMLSchema#",
  skos: "http://www.w3.org/2004/02/skos/core#",
  owl: "http://www.w3.org/2002/07/owl#",
  me: "https://me-nexus.com/id/",
  menexus: "https://me-nexus.com/schema#"
};

/**
 * Mapping from RDF class URIs to OMC entity type names.
 * 
 * Used to identify root entities in the RDF graph by their rdf:type.
 * Includes both top-level entity types and structural characteristics.
 * 
 * @constant {Record<string, string>}
 */
const rdfClassToEntityType: Record<string, string> = {
  [`${RDF_PREFIXES.omc}Asset`]: "Asset",
  [`${RDF_PREFIXES.omc}Task`]: "Task",
  [`${RDF_PREFIXES.omc}Participant`]: "Participant",
  [`${RDF_PREFIXES.omc}Infrastructure`]: "Infrastructure",
  [`${RDF_PREFIXES.omc}Location`]: "Location",
  [`${RDF_PREFIXES.omc}CreativeWork`]: "CreativeWork",
  [`${RDF_PREFIXES.omc}Character`]: "Character",
  [`${RDF_PREFIXES.omc}Context`]: "Context",
  [`${RDF_PREFIXES.omc}Sequence`]: "Sequence",
  [`${RDF_PREFIXES.omc}Slate`]: "Slate",
  [`${RDF_PREFIXES.omc}ProductionScene`]: "ProductionScene",
  [`${RDF_PREFIXES.omc}NarrativeScene`]: "NarrativeScene",
  [`${RDF_PREFIXES.omc}AssetAsStructure`]: "AssetSC",
  [`${RDF_PREFIXES.omc}AssetAsFunction`]: "AssetFC",
  [`${RDF_PREFIXES.omc}TaskAsStructure`]: "TaskSC",
  [`${RDF_PREFIXES.omc}TaskAsFunction`]: "TaskFC",
  [`${RDF_PREFIXES.omc}ParticipantAsStructure`]: "ParticipantSC",
  [`${RDF_PREFIXES.omc}ParticipantAsFunction`]: "ParticipantFC",
  [`${RDF_PREFIXES.omc}Person`]: "Person",
  [`${RDF_PREFIXES.omc}Organization`]: "Organization",
  [`${RDF_PREFIXES.omc}Department`]: "Department",
  [`${RDF_PREFIXES.omc}Service`]: "Service",
  [`${RDF_PREFIXES.omc}DigitalAsset`]: "DigitalAsset",
  [`${RDF_PREFIXES.omc}PhysicalAsset`]: "PhysicalAsset",
  [`${RDF_PREFIXES.omc}NarrativeContext`]: "NarrativeContext",
  [`${RDF_PREFIXES.omc}ProductionContext`]: "ProductionContext",
  [`${RDF_PREFIXES.omc}MediaCreationContext`]: "MediaCreationContext",
  [`${RDF_PREFIXES.omc}MediaCreationContextComponent`]: "Context",
  [`${RDF_PREFIXES.omc}Address`]: "Address",
  [`${RDF_PREFIXES.omc}LatLon`]: "LatLon"
};

/**
 * Mapping from RDF predicate URIs to JSON property names.
 * 
 * This comprehensive mapping covers:
 * - Standard RDF/RDFS predicates (rdfs:label → name)
 * - OMC core predicates (omc:hasIdentifier → identifier)
 * - Entity characteristics (omc:hasAssetStructuralCharacteristic → AssetSC)
 * - Relationship predicates (omc:uses, omc:contributesTo)
 * - Media-specific properties (omc:hasFrameRate → frameRate)
 * 
 * @constant {Record<string, string>}
 */
const rdfPredicateToJsonKey: Record<string, string> = {
  [`${RDF_PREFIXES.rdfs}label`]: "name",
  [`${RDF_PREFIXES.rdfs}comment`]: "comment",
  [`${RDF_PREFIXES.skos}definition`]: "description",
  [`${RDF_PREFIXES.omc}schemaVersion`]: "schemaVersion",
  [`${RDF_PREFIXES.omc}hasIdentifier`]: "identifier",
  [`${RDF_PREFIXES.omc}hasIdentifierScope`]: "identifierScope",
  [`${RDF_PREFIXES.omc}hasIdentifierValue`]: "identifierValue",
  
  [`${RDF_PREFIXES.omc}hasScheduledStart`]: "scheduledStart",
  [`${RDF_PREFIXES.omc}hasScheduledEnd`]: "scheduledEnd",
  [`${RDF_PREFIXES.omc}hasActualStart`]: "actualStart",
  [`${RDF_PREFIXES.omc}hasActualEnd`]: "actualEnd",
  [`${RDF_PREFIXES.omc}hasStateDescriptor`]: "stateDescriptor",
  [`${RDF_PREFIXES.omc}contextType`]: "contextType",
  
  [`${RDF_PREFIXES.omc}hasAssetStructuralCharacteristic`]: "AssetSC",
  [`${RDF_PREFIXES.omc}hasAssetFunctionalCharacteristic`]: "assetFC",
  [`${RDF_PREFIXES.omc}AssetFC`]: "assetFC",
  [`${RDF_PREFIXES.omc}hasFunctionalType`]: "functionalType",
  [`${RDF_PREFIXES.omc}hasStructuralType`]: "structuralType",
  [`${RDF_PREFIXES.omc}hasStructuralProperties`]: "structuralProperties",
  
  [`${RDF_PREFIXES.omc}hasTaskStructuralCharacteristic`]: "TaskSC",
  [`${RDF_PREFIXES.omc}hasTaskFunctionalCharacteristic`]: "taskFC",
  [`${RDF_PREFIXES.omc}hasTaskName`]: "taskName",
  
  [`${RDF_PREFIXES.omc}hasParticipantStructuralCharacteristic`]: "ParticipantSC",
  [`${RDF_PREFIXES.omc}hasParticipantFunctionalCharacteristic`]: "participantFC",
  [`${RDF_PREFIXES.omc}hasPersonName`]: "personName",
  [`${RDF_PREFIXES.omc}hasPersonNameValue`]: "personNameValue",
  [`${RDF_PREFIXES.omc}hasPersonNameLanguage`]: "personNameLanguage",
  [`${RDF_PREFIXES.omc}hasOrganizationName`]: "organizationName",
  [`${RDF_PREFIXES.omc}hasDepartmentName`]: "departmentName",
  [`${RDF_PREFIXES.omc}hasServiceName`]: "serviceName",
  [`${RDF_PREFIXES.omc}hasCompanyName`]: "companyName",
  [`${RDF_PREFIXES.omc}hasFullName`]: "fullName",
  [`${RDF_PREFIXES.omc}hasFirstName`]: "firstGivenName",
  [`${RDF_PREFIXES.omc}hasLastName`]: "familyName",
  [`${RDF_PREFIXES.omc}givenName`]: "firstGivenName",
  [`${RDF_PREFIXES.omc}familyName`]: "familyName",
  [`${RDF_PREFIXES.omc}hasGender`]: "gender",
  [`${RDF_PREFIXES.omc}hasContact`]: "contact",
  [`${RDF_PREFIXES.omc}hasEmail`]: "email",
  [`${RDF_PREFIXES.omc}hasPhone`]: "phone",
  [`${RDF_PREFIXES.omc}hasJobTitle`]: "jobTitle",
  [`${RDF_PREFIXES.omc}hasCreditName`]: "creditName",
  [`${RDF_PREFIXES.omc}hasGuildName`]: "guildName",
  
  [`${RDF_PREFIXES.omc}hasInfrastructureStructuralCharacteristic`]: "InfrastructureSC",
  [`${RDF_PREFIXES.omc}hasInfrastructureFunctionalCharacteristic`]: "infrastructureFC",
  
  [`${RDF_PREFIXES.omc}hasLocation`]: "Location",
  [`${RDF_PREFIXES.omc}hasAssociatedLocation`]: "associatedLocation",
  [`${RDF_PREFIXES.omc}hasAddress`]: "address",
  [`${RDF_PREFIXES.omc}hasStreetNumberAndName`]: "streetNumberAndName",
  [`${RDF_PREFIXES.omc}hasCity`]: "city",
  [`${RDF_PREFIXES.omc}hasState`]: "state",
  [`${RDF_PREFIXES.omc}hasPostalCode`]: "postalCode",
  [`${RDF_PREFIXES.omc}hasCountry`]: "country",
  [`${RDF_PREFIXES.omc}hasCountryCode`]: "countryCode",
  [`${RDF_PREFIXES.omc}hasCountryName`]: "countryName",
  [`${RDF_PREFIXES.omc}hasCoords`]: "geo",
  [`${RDF_PREFIXES.omc}hasLatitude`]: "latitude",
  [`${RDF_PREFIXES.omc}hasLongitude`]: "longitude",
  [`${RDF_PREFIXES.omc}hasXCoord`]: "xCoord",
  [`${RDF_PREFIXES.omc}hasYCoord`]: "yCoord",
  [`${RDF_PREFIXES.omc}hasZCoord`]: "zCoord",
  
  [`${RDF_PREFIXES.omc}hasContext`]: "Context",
  [`${RDF_PREFIXES.omc}hasContextComponent`]: "contextComponent",
  [`${RDF_PREFIXES.omc}hasNarrativeContext`]: "NarrativeContext",
  [`${RDF_PREFIXES.omc}hasProductionContext`]: "ProductionContext",
  
  [`${RDF_PREFIXES.omc}hasMediaType`]: "mediaType",
  [`${RDF_PREFIXES.omc}hasFileSize`]: "fileSize",
  [`${RDF_PREFIXES.omc}hasFileName`]: "fileName",
  [`${RDF_PREFIXES.omc}hasFilePath`]: "filePath",
  [`${RDF_PREFIXES.omc}hasFileExtension`]: "fileExtension",
  [`${RDF_PREFIXES.omc}hasFileFormat`]: "fileFormat",
  [`${RDF_PREFIXES.omc}hasFileDetails`]: "fileDetails",
  [`${RDF_PREFIXES.omc}hasDuration`]: "duration",
  [`${RDF_PREFIXES.omc}hasDimensions`]: "dimensions",
  [`${RDF_PREFIXES.omc}hasFrameHeight`]: "frameHeight",
  [`${RDF_PREFIXES.omc}hasFrameWidth`]: "frameWidth",
  [`${RDF_PREFIXES.omc}hasHeight`]: "height",
  [`${RDF_PREFIXES.omc}hasWidth`]: "width",
  [`${RDF_PREFIXES.omc}hasDepth`]: "depth",
  [`${RDF_PREFIXES.omc}hasFrameRate`]: "frameRate",
  [`${RDF_PREFIXES.omc}hasSampleSize`]: "sampleSize",
  [`${RDF_PREFIXES.omc}hasAudioBitRate`]: "audioBitRate",
  
  [`${RDF_PREFIXES.omc}hasCreativeWork`]: "creativeWork",
  [`${RDF_PREFIXES.omc}hasCreativeWorkName`]: "creativeWorkName",
  [`${RDF_PREFIXES.omc}hasTitle`]: "creativeWorkTitle",
  [`${RDF_PREFIXES.omc}hasTitleName`]: "titleName",
  [`${RDF_PREFIXES.omc}hasTitleType`]: "titleType",
  [`${RDF_PREFIXES.omc}titleLanguage`]: "titleLanguage",
  
  [`${RDF_PREFIXES.omc}depicts`]: "depicts",
  [`${RDF_PREFIXES.omc}hasDepiction`]: "depiction",
  [`${RDF_PREFIXES.omc}hasDepictionType`]: "depictionType",
  
  [`${RDF_PREFIXES.omc}hasAuthor`]: "author",
  [`${RDF_PREFIXES.omc}hasDirector`]: "director",
  
  [`${RDF_PREFIXES.omc}hasCustomData`]: "customData",
  [`${RDF_PREFIXES.omc}hasTag`]: "tag",
  [`${RDF_PREFIXES.omc}hasTagValue`]: "tagValue",
  
  [`${RDF_PREFIXES.omc}hasParticipant`]: "participant",
  [`${RDF_PREFIXES.omc}hasParticipantComponent`]: "participantComponent",
  [`${RDF_PREFIXES.omc}hasTask`]: "task",
  [`${RDF_PREFIXES.omc}hasTaskComponent`]: "taskComponent",
  [`${RDF_PREFIXES.omc}hasAssetComponent`]: "asset",
  [`${RDF_PREFIXES.omc}hasAssetGroup`]: "assetGroup",
  
  [`${RDF_PREFIXES.omc}hasVersion`]: "version",
  [`${RDF_PREFIXES.omc}hasVersionNumber`]: "versionNumber",
  
  [`${RDF_PREFIXES.omc}hasCharacterName`]: "characterName",
  [`${RDF_PREFIXES.omc}hasDateOfBirth`]: "dateOfBirth",
  [`${RDF_PREFIXES.omc}hasSpecies`]: "species",
  
  [`${RDF_PREFIXES.omc}hasShootDay`]: "shootDay",
  [`${RDF_PREFIXES.omc}hasShootDate`]: "shootDate",
  [`${RDF_PREFIXES.omc}hasSlateUID`]: "slateUID",
  [`${RDF_PREFIXES.omc}hasTake`]: "take",
  [`${RDF_PREFIXES.omc}hasShotNumber`]: "shotNumber",
  
  [`${RDF_PREFIXES.omc}hasTimecode`]: "timecode",
  [`${RDF_PREFIXES.omc}hasTimecodeStart`]: "timecodeStart",
  [`${RDF_PREFIXES.omc}hasTimecodeEnd`]: "timecodeEnd",
  
  [`${RDF_PREFIXES.omc}hasCodec`]: "codec",
  [`${RDF_PREFIXES.omc}hasColorSpace`]: "colorSpace",
  [`${RDF_PREFIXES.omc}hasColorSpaceName`]: "colorSpaceName",
  
  [`${RDF_PREFIXES.omc}hasCameraLabel`]: "cameraLabel",
  [`${RDF_PREFIXES.omc}hasCameraMake`]: "cameraMake",
  [`${RDF_PREFIXES.omc}hasCameraModel`]: "cameraModel",
  [`${RDF_PREFIXES.omc}hasCameraSerialNumber`]: "cameraSerialNumber",
  [`${RDF_PREFIXES.omc}hasCameraMetadata`]: "cameraMetadata",
  
  [`${RDF_PREFIXES.omc}hasNamespace`]: "namespace",
  [`${RDF_PREFIXES.omc}hasValue`]: "value",
  [`${RDF_PREFIXES.omc}hasUnit`]: "unit",
  [`${RDF_PREFIXES.omc}hasText`]: "text",
  
  [`${RDF_PREFIXES.omc}hasStart`]: "start",
  [`${RDF_PREFIXES.omc}hasEnd`]: "end",
  [`${RDF_PREFIXES.omc}hasSourceStart`]: "sourceStart",
  [`${RDF_PREFIXES.omc}hasSourceEnd`]: "sourceEnd",
  
  [`${RDF_PREFIXES.omc}hasSubject`]: "subject",
  [`${RDF_PREFIXES.omc}hasSource`]: "source",
  [`${RDF_PREFIXES.omc}hasSoftware`]: "software",
  [`${RDF_PREFIXES.omc}hasSoftwareVersion`]: "softwareVersion",
  [`${RDF_PREFIXES.omc}hasAPIVersion`]: "apiVersion",
  
  [`${RDF_PREFIXES.omc}functionalProperties`]: "functionalProperties",
  [`${RDF_PREFIXES.omc}isOrdered`]: "isOrdered",
  
  [`${RDF_PREFIXES.omc}creativeWorkType`]: "creativeWorkType",
  [`${RDF_PREFIXES.omc}creativeWorkCategory`]: "creativeWorkCategory",
  [`${RDF_PREFIXES.omc}approximateLength`]: "approximateLength",
  
  [`${RDF_PREFIXES.omc}uses`]: "uses",
  [`${RDF_PREFIXES.omc}contributesTo`]: "contributesTo",
  [`${RDF_PREFIXES.omc}hasWorkUnit`]: "workUnit",
  [`${RDF_PREFIXES.omc}informs`]: "informs",
  [`${RDF_PREFIXES.omc}isInformedBy`]: "isInformedBy",
  [`${RDF_PREFIXES.omc}hasProduct`]: "hasProduct",
  [`${RDF_PREFIXES.omcT}aWorkUnitHas.Participant`]: "participantRef",
  
  [`${RDF_PREFIXES.omc}CreativeWork`]: "CreativeWork",
  [`${RDF_PREFIXES.omc}Infrastructure`]: "Infrastructure",
  [`${RDF_PREFIXES.omc}Asset`]: "Asset"
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Converts an RDF predicate URI to a JSON property name.
 * 
 * Resolution order:
 * 1. Check explicit mapping in rdfPredicateToJsonKey
 * 2. For omc: predicates, strip "has" prefix and lowercase first letter
 * 3. For omcT: predicates, use local name directly
 * 4. For menexus: predicates, use local name directly
 * 5. Return null for unknown predicates
 * 
 * @param {string} predicateUri - Full predicate URI
 * @returns {string|null} JSON property name or null if unmapped
 * 
 * @example
 * predicateUriToJsonKey('https://movielabs.com/omc/rdf/schema/v2.8#hasName')
 * // Returns: 'name'
 * 
 * predicateUriToJsonKey('https://movielabs.com/omc/rdf/schema/v2.8#hasFrameRate')
 * // Returns: 'frameRate' (via "has" stripping fallback)
 */
function predicateUriToJsonKey(predicateUri: string): string | null {
  if (rdfPredicateToJsonKey[predicateUri]) {
    return rdfPredicateToJsonKey[predicateUri];
  }
  if (predicateUri.startsWith(RDF_PREFIXES.omc)) {
    const localName = predicateUri.slice(RDF_PREFIXES.omc.length);
    if (localName.startsWith('has')) {
      const key = localName.slice(3);
      return key.charAt(0).toLowerCase() + key.slice(1);
    }
    return localName;
  }
  if (predicateUri.startsWith(RDF_PREFIXES.omcT)) {
    const localName = predicateUri.slice(RDF_PREFIXES.omcT.length);
    return localName;
  }
  if (predicateUri.startsWith(RDF_PREFIXES.menexus)) {
    const localName = predicateUri.slice(RDF_PREFIXES.menexus.length);
    return localName;
  }
  return null;
}

/**
 * Extracts an entity ID from a URI.
 * 
 * Supports two URI formats:
 * 1. me: namespace: `https://me-nexus.com/id/{id}` → `{id}`
 * 2. URN format: `urn:{scope}:{id}` → `{id}`
 * 
 * @param {string} uri - Full URI to extract ID from
 * @returns {string|null} Extracted ID or null if not parseable
 * 
 * @example
 * extractIdFromUri('https://me-nexus.com/id/550e8400-e29b-41d4-a716-446655440000')
 * // Returns: '550e8400-e29b-41d4-a716-446655440000'
 */
function extractIdFromUri(uri: string): string | null {
  if (uri.startsWith(RDF_PREFIXES.me)) {
    return uri.slice(RDF_PREFIXES.me.length);
  }
  const match = uri.match(/urn:([^:]+):(.+)/);
  if (match) {
    return match[2];
  }
  return null;
}

/**
 * Parses an N3 literal term into a JavaScript value.
 * 
 * Handles XSD datatype conversions:
 * - xsd:integer, xsd:int → number (parseInt)
 * - xsd:decimal, xsd:double, xsd:float → number (parseFloat)
 * - xsd:boolean → boolean
 * - xsd:dateTime → string (ISO format preserved)
 * - Other/untyped → string
 * 
 * @param {N3.Term} term - N3.js term to parse
 * @returns {unknown} Parsed JavaScript value
 */
function parseLiteral(term: N3.Term): unknown {
  if (term.termType !== 'Literal') {
    return term.value;
  }
  
  const literal = term as N3.Literal;
  const datatype = literal.datatype?.value || '';
  
  if (datatype.endsWith('#integer') || datatype.endsWith('#int')) {
    return parseInt(literal.value, 10);
  }
  if (datatype.endsWith('#decimal') || datatype.endsWith('#double') || datatype.endsWith('#float')) {
    return parseFloat(literal.value);
  }
  if (datatype.endsWith('#boolean')) {
    return literal.value === 'true';
  }
  if (datatype.endsWith('#dateTime')) {
    return literal.value;
  }
  
  return literal.value;
}

// ============================================================================
// PUBLIC API - SINGLE ENTITY IMPORT
// ============================================================================

/**
 * Parses OMC TTL text and returns a single entity.
 * 
 * This is the legacy API for backward compatibility.
 * For multi-entity support, use parseOmcTtlMulti() instead.
 * 
 * If the input contains multiple entities, only the first is returned.
 * 
 * @param {string} ttlText - Raw TTL text to parse
 * @returns {Promise<ImportResult>} Import result with single entity or error
 * 
 * @example
 * const result = await parseOmcTtl(ttlContent);
 * if (result.success) {
 *   store.addEntityFromContent(result.entityType, result.entityId, result.content);
 * }
 */
export async function parseOmcTtl(ttlText: string): Promise<ImportResult> {
  const result = await parseOmcTtlMulti(ttlText);
  
  if (!result.success) {
    return { success: false, error: result.error };
  }
  
  if (result.entities.length === 0) {
    return { success: false, error: 'No valid entities found' };
  }
  
  const entity = result.entities[0];
  return {
    success: true,
    entityType: entity.entityType,
    entityId: entity.entityId,
    content: entity.content
  };
}

// ============================================================================
// PUBLIC API - MULTI ENTITY IMPORT
// ============================================================================

/**
 * Parses OMC TTL text and returns all valid entities.
 * 
 * The parsing process:
 * 1. Parse TTL into N3.Store using N3.Parser
 * 2. Find all subjects with valid omc:* rdf:type
 * 3. For each root entity, recursively build JSON object
 * 4. Handle references to other root entities as CURIE strings
 * 5. Apply entity-specific transformations
 * 6. Validate and return entities
 * 
 * @param {string} ttlText - Raw TTL text to parse
 * @returns {Promise<MultiImportResult>} Import result with all entities and warnings
 * 
 * @example
 * const ttl = `
 *   @prefix omc: <https://movielabs.com/omc/rdf/schema/v2.8#> .
 *   @prefix me: <https://me-nexus.com/id/> .
 *   
 *   me:task-001 a omc:Task ;
 *     rdfs:label "Color Grading" .
 * `;
 * 
 * const result = await parseOmcTtlMulti(ttl);
 * if (result.success) {
 *   result.entities.forEach(e => {
 *     console.log(e.entityType, e.name); // 'Task', 'Color Grading'
 *   });
 * }
 */
export async function parseOmcTtlMulti(ttlText: string): Promise<MultiImportResult> {
  return new Promise((resolve) => {
    const parser = new N3.Parser();
    const store = new N3.Store();
    
    try {
      const quads = parser.parse(ttlText);
      store.addQuads(quads);
    } catch (e: any) {
      resolve({ success: false, entities: [], error: `Invalid TTL format: ${e.message}` });
      return;
    }
    
    const allSubjects = new Map<string, N3.Term>();
    store.forEach((quad) => {
      if (quad.subject.termType === 'NamedNode' || quad.subject.termType === 'BlankNode') {
        allSubjects.set(quad.subject.value, quad.subject);
      }
    }, null, null, null, null);
    
    const entityRoots: { term: N3.Term; entityType: string; entityId: string }[] = [];
    
    allSubjects.forEach((term, subject) => {
      let entityType: string | null = null;
      
      store.forEach((quad) => {
        if (quad.predicate.value === `${RDF_PREFIXES.rdf}type`) {
          const typeUri = quad.object.value;
          if (rdfClassToEntityType[typeUri]) {
            const mapped = rdfClassToEntityType[typeUri];
            if (ENTITY_TYPES.includes(mapped as any)) {
              entityType = mapped;
            }
          }
        }
      }, term, null, null, null);
      
      if (entityType) {
        const entityId = extractIdFromUri(term.value) || crypto.randomUUID();
        entityRoots.push({ term, entityType, entityId });
      }
    });
    
    if (entityRoots.length === 0) {
      resolve({ success: false, entities: [], error: 'No valid OMC entities found in TTL file' });
      return;
    }
    
    const rootUris = new Set(entityRoots.map(r => r.term.value));
    
    const entities: ImportedEntity[] = [];
    const warnings: string[] = [];
    
    for (const { term: rootSubjectTerm, entityType, entityId } of entityRoots) {
      const visited = new Set<string>();
      
      /**
       * Recursively builds a JSON object from RDF triples.
       * 
       * @param {N3.Term} subjectTerm - RDF subject to build from
       * @param {number} depth - Current recursion depth (max 10)
       * @returns {Record<string, any>} Built JSON object
       */
      const buildObject = (subjectTerm: N3.Term, depth: number = 0): Record<string, any> => {
        if (depth > 10) return {};
        
        const subjectKey = subjectTerm.value;
        
        if (depth > 0 && rootUris.has(subjectKey)) {
          const refId = extractIdFromUri(subjectKey);
          if (refId) {
            return {
              identifier: [{
                identifierScope: 'me-nexus',
                identifierValue: refId,
                combinedForm: `me-nexus:${refId}`
              }]
            };
          }
        }
        
        if (visited.has(subjectKey)) return {};
        visited.add(subjectKey);
        
        const obj: Record<string, any> = {};
        const arrayProps: Record<string, any[]> = {};
        
        let nestedEntityType: string | null = null;
        store.forEach((quad) => {
          if (quad.predicate.value === `${RDF_PREFIXES.rdf}type`) {
            const typeUri = quad.object.value;
            if (rdfClassToEntityType[typeUri]) {
              nestedEntityType = rdfClassToEntityType[typeUri];
            }
          }
        }, subjectTerm, null, null, null);
        
        if (nestedEntityType && depth > 0) {
          obj.entityType = nestedEntityType;
          obj.schemaVersion = "https://movielabs.com/omc/json/schema/v2.8";
        }
        
        store.forEach((quad) => {
          const predicateUri = quad.predicate.value;
          
          if (predicateUri === `${RDF_PREFIXES.rdf}type`) return;
          
          const jsonKey = predicateUriToJsonKey(predicateUri);
          if (!jsonKey) return;
          
          let value: any;
          
          if (quad.object.termType === 'Literal') {
            value = parseLiteral(quad.object);
          } else if (quad.object.termType === 'NamedNode' || quad.object.termType === 'BlankNode') {
            const nestedQuads = store.getQuads(quad.object, null, null, null);
            if (nestedQuads.length > 0) {
              const isRootEntity = rootUris.has(quad.object.value);
              if (isRootEntity) {
                const refId = extractIdFromUri(quad.object.value);
                if (refId) {
                  value = `me-nexus:${refId}`;
                } else {
                  value = buildObject(quad.object, depth + 1);
                }
              } else {
                value = buildObject(quad.object, depth + 1);
              
                if (quad.object.termType === 'NamedNode') {
                  const nestedId = extractIdFromUri(quad.object.value);
                  if (nestedId && !value.identifier) {
                    value.identifier = [{
                      identifierScope: 'me-nexus',
                      identifierValue: nestedId,
                      combinedForm: `me-nexus:${nestedId}`
                    }];
                  }
                }
              }
            } else {
              const refId = extractIdFromUri(quad.object.value);
              if (refId && quad.object.value.startsWith(RDF_PREFIXES.me)) {
                value = `me-nexus:${refId}`;
              } else {
                value = quad.object.value;
              }
            }
          }
          
          const alwaysArrayKeys = [
            'identifier', 'creativeWorkTitle', 'participant', 'participantComponent',
            'task', 'taskComponent', 'asset', 'assetComponent', 'contextComponent',
            'depicts', 'depiction', 'tag', 'Asset', 'uses', 'informs', 'isInformedBy', 'hasProduct'
          ];
          if (alwaysArrayKeys.includes(jsonKey)) {
            if (!arrayProps[jsonKey]) arrayProps[jsonKey] = [];
            arrayProps[jsonKey].push(value);
          } else if (obj[jsonKey] !== undefined) {
            if (!Array.isArray(obj[jsonKey])) {
              obj[jsonKey] = [obj[jsonKey]];
            }
            obj[jsonKey].push(value);
          } else {
            obj[jsonKey] = value;
          }
        }, subjectTerm, null, null, null);
        
        for (const [key, values] of Object.entries(arrayProps)) {
          obj[key] = values;
        }
        
        return obj;
      };
      
      let content = buildObject(rootSubjectTerm);
      content.entityType = entityType;
      content.schemaVersion = "https://movielabs.com/omc/json/schema/v2.8";
      
      // Normalize identifier array - ensure proper structure with scope, value, and combinedForm
      const normalizeIdentifier = (id: any, fallbackId: string): any => {
        if (typeof id !== 'object' || id === null) {
          return {
            identifierScope: 'me-nexus',
            identifierValue: fallbackId,
            combinedForm: `me-nexus:${fallbackId}`
          };
        }
        const scope = id.identifierScope || 'me-nexus';
        const value = id.identifierValue || fallbackId;
        return {
          identifierScope: scope,
          identifierValue: value,
          combinedForm: id.combinedForm || `${scope}:${value}`
        };
      };
      
      if (!content.identifier || content.identifier.length === 0 || 
          (Array.isArray(content.identifier) && typeof content.identifier[0] === 'string')) {
        content.identifier = [normalizeIdentifier({
          identifierScope: content.identifierScope,
          identifierValue: content.identifierValue
        }, entityId)];
      } else if (Array.isArray(content.identifier)) {
        content.identifier = content.identifier.map((id: any) => normalizeIdentifier(id, entityId));
      }
      delete content.identifierScope;
      delete content.identifierValue;
      
      content = transformEntity(content);
      
      const name = content.name || content.characterName || 
        (content.creativeWorkTitle?.[0]?.titleName) || 
        `${entityType} ${entityId.slice(0, 8)}`;
      
      entities.push({
        entityType: entityType as EntityType,
        entityId,
        content,
        name
      });
    }
    
    resolve({
      success: true,
      entities,
      warnings: warnings.length > 0 ? warnings : undefined
    });
  });
}
