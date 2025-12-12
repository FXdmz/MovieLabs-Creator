import { Entity } from "../../store";
import { getPrefixDeclarations, entityTypeToRdfClass } from "./prefixes";

interface Triple {
  subject: string;
  predicate: string;
  object: string;
}

function escapeString(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\t/g, "\\t");
}

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
  firstName: "omc:hasFirstName",
  firstGivenName: "omc:hasFirstName",
  lastName: "omc:hasLastName",
  familyName: "omc:hasLastName",
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
  apiVersion: "omc:hasAPIVersion"
};

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

function jsonKeyToRdfPredicate(key: string): string | null {
  if (skipProperties.has(key)) {
    return null;
  }
  return jsonToRdfPredicate[key] || `omc:${key}`;
}

let blankNodeCounter = 0;

function generateBlankNodeId(prefix: string): string {
  blankNodeCounter++;
  return `_:${prefix}_${blankNodeCounter}`;
}

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

function processTaskSpecificProperties(subject: string, content: any, triples: Triple[]): void {
  if (content.state) {
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

  const contexts = content.Context || [];
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
    
    if (context.hasInputAssets && Array.isArray(context.hasInputAssets)) {
      context.hasInputAssets.forEach((assetRef: string) => {
        triples.push({ subject, predicate: "omc:uses", object: combinedFormToUri(assetRef) });
      });
    }
    
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
      triples.push({ subject: subj, predicate, object: formatLiteral(value) });
    }
  }
  
  if (content) {
    Object.entries(content).forEach(([key, value]) => {
      if (key !== "entityType" && key !== "schemaVersion") {
        if (entity.type === "Task" && key === "Context" && Array.isArray(value)) {
          const taskContextSkipFields = new Set([
            "scheduling", "hasInputAssets", "hasOutputAssets", 
            "informs", "isInformedBy", "identifier", "contextType", "description"
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
        lines.push(`    ${predicate} ${obj}${terminator}`);
      });
    });
    lines.push("");
  });
  
  return lines.join("\n");
}

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

export function entityToTurtle(entity: Entity): string {
  return entitiesToTurtle([entity]);
}
