import * as N3 from 'n3';
import { EntityType, ENTITY_TYPES } from '../constants';
import { ImportResult, ImportedEntity, MultiImportResult } from './json-importer';

const RDF_PREFIXES: Record<string, string> = {
  omc: "https://movielabs.com/omc/rdf/schema/v2.8#",
  rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
  rdfs: "http://www.w3.org/2000/01/rdf-schema#",
  xsd: "http://www.w3.org/2001/XMLSchema#",
  skos: "http://www.w3.org/2004/02/skos/core#",
  owl: "http://www.w3.org/2002/07/owl#",
  me: "https://me-nexus.com/id/"
};

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
  [`${RDF_PREFIXES.omc}Address`]: "Address",
  [`${RDF_PREFIXES.omc}LatLon`]: "LatLon"
};

const rdfPredicateToJsonKey: Record<string, string> = {
  [`${RDF_PREFIXES.rdfs}label`]: "name",
  [`${RDF_PREFIXES.skos}definition`]: "description",
  [`${RDF_PREFIXES.omc}schemaVersion`]: "schemaVersion",
  [`${RDF_PREFIXES.omc}hasIdentifier`]: "identifier",
  [`${RDF_PREFIXES.omc}hasIdentifierScope`]: "identifierScope",
  [`${RDF_PREFIXES.omc}hasIdentifierValue`]: "identifierValue",
  
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
  [`${RDF_PREFIXES.omc}hasFirstName`]: "firstName",
  [`${RDF_PREFIXES.omc}hasLastName`]: "lastName",
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
  [`${RDF_PREFIXES.omc}hasActualStart`]: "actualStart",
  [`${RDF_PREFIXES.omc}hasActualEnd`]: "actualEnd",
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
  [`${RDF_PREFIXES.omc}approximateLength`]: "approximateLength"
};

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
  return null;
}

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

// Backwards compatible single-entity import
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

// Multi-entity import
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
    
    // Find all subjects in the graph
    const allSubjects = new Map<string, N3.Term>();
    store.forEach((quad) => {
      if (quad.subject.termType === 'NamedNode' || quad.subject.termType === 'BlankNode') {
        allSubjects.set(quad.subject.value, quad.subject);
      }
    }, null, null, null, null);
    
    // Find ALL subjects that have a valid OMC entity type (not just unreferenced ones)
    // This ensures Participants, Infrastructure, etc. are included even when referenced by Tasks
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
    
    // Set of all root entity URIs for reference detection
    const rootUris = new Set(entityRoots.map(r => r.term.value));
    
    // Build entity objects
    const entities: ImportedEntity[] = [];
    const warnings: string[] = [];
    
    for (const { term: rootSubjectTerm, entityType, entityId } of entityRoots) {
      const visited = new Set<string>();
      
      const buildObject = (subjectTerm: N3.Term, depth: number = 0): Record<string, any> => {
        if (depth > 10) return {};
        
        const subjectKey = subjectTerm.value;
        
        // If this is another root entity, return just a reference
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
              // Check if this is a reference to another root entity
              if (rootUris.has(quad.object.value)) {
                // Return as a reference string for relationships
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
              // No nested quads - check if it's a me: URI reference
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
            'depicts', 'depiction', 'tag', 'Asset'
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
      }
      
      const content = buildObject(rootSubjectTerm);
      content.entityType = entityType;
      content.schemaVersion = "https://movielabs.com/omc/json/schema/v2.8";
      
      if (!content.identifier || content.identifier.length === 0) {
        content.identifier = [{
          identifierScope: 'me-nexus',
          identifierValue: entityId,
          combinedForm: `me-nexus:${entityId}`
        }];
      }
      
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
