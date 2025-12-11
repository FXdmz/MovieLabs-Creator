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
  combinedForm: "omc:combinedForm",
  
  AssetSC: "omc:hasAssetStructuralCharacteristic",
  assetFC: "omc:hasAssetFunctionalCharacteristic",
  AssetFC: "omc:hasAssetFunctionalCharacteristic",
  functionalType: "omc:functionalType",
  structuralType: "omc:structuralType",
  structuralProperties: "omc:hasStructuralComponent",
  
  TaskSC: "omc:hasTaskStructuralCharacteristic",
  taskFC: "omc:hasTaskFunctionalCharacteristic",
  TaskFC: "omc:hasTaskFunctionalCharacteristic",
  
  ParticipantSC: "omc:hasParticipantStructuralCharacteristic",
  participantFC: "omc:hasParticipantFunctionalCharacteristic",
  ParticipantFC: "omc:hasParticipantFunctionalCharacteristic",
  personName: "omc:hasPersonName",
  organizationName: "omc:organizationName",
  departmentName: "omc:departmentName",
  serviceName: "omc:serviceName",
  fullName: "omc:fullName",
  firstGivenName: "omc:firstGivenName",
  familyName: "omc:familyName",
  gender: "omc:hasPersonGender",
  contact: "omc:contact",
  email: "omc:email",
  phone: "omc:phone",
  jobTitle: "omc:hasParticipantJobTitle",
  
  Location: "omc:hasLocation",
  location: "omc:hasLocation",
  address: "omc:hasAddress",
  street: "omc:street",
  city: "omc:city",
  region: "omc:region",
  postalCode: "omc:postalCode",
  country: "omc:hasCountry",
  geo: "omc:hasCoords",
  latitude: "omc:latitude",
  longitude: "omc:longitude",
  
  Context: "omc:hasContext",
  context: "omc:hasContext",
  NarrativeContext: "omc:hasNarrativeContext",
  ProductionContext: "omc:hasProductionContext",
  
  mimeType: "omc:mimeType",
  fileSize: "omc:fileSize",
  fileName: "omc:fileName",
  filePath: "omc:filePath",
  fileDetails: "omc:hasFileDetails",
  duration: "omc:duration",
  dimensions: "omc:hasDimensions",
  frameRate: "omc:frameRate",
  
  creativeWorkTitle: "omc:hasCreativeWorkTitle",
  titleName: "omc:titleName",
  titleType: "omc:titleType",
  
  depicts: "omc:depicts",
  depiction: "omc:hasDepiction",
  
  author: "omc:hasAuthor",
  
  customData: "omc:hasCustomData",
  
  participant: "omc:hasParticipant",
  task: "omc:hasTask",
  asset: "omc:hasAssetComponent"
};

function jsonKeyToRdfPredicate(key: string): string {
  return jsonToRdfPredicate[key] || `omc:${key}`;
}

let blankNodeCounter = 0;

function generateBlankNodeId(prefix: string): string {
  blankNodeCounter++;
  return `_:${prefix}_${blankNodeCounter}`;
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
  
  function processValue(subj: string, key: string, value: unknown, depth: number = 0): void {
    if (value === null || value === undefined || value === "") return;
    if (depth > 5) return;
    
    const predicate = jsonKeyToRdfPredicate(key);
    
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
        processValue(subject, key, value, 0);
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
