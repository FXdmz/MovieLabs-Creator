export const RDF_PREFIXES = {
  omc: "https://movielabs.com/omc/rdf/schema/v2.8#",
  rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
  rdfs: "http://www.w3.org/2000/01/rdf-schema#",
  xsd: "http://www.w3.org/2001/XMLSchema#",
  skos: "http://www.w3.org/2004/02/skos/core#",
  owl: "http://www.w3.org/2002/07/owl#",
  me: "https://me-nexus.com/id/"
} as const;

export function getPrefixDeclarations(): string {
  return Object.entries(RDF_PREFIXES)
    .map(([prefix, uri]) => `@prefix ${prefix}: <${uri}> .`)
    .join("\n");
}

export function toUri(prefix: keyof typeof RDF_PREFIXES, localName: string): string {
  return `${prefix}:${localName}`;
}

export function toFullUri(prefix: keyof typeof RDF_PREFIXES, localName: string): string {
  return `<${RDF_PREFIXES[prefix]}${localName}>`;
}

export function entityTypeToRdfClass(entityType: string): string {
  const classMap: Record<string, string> = {
    Asset: "omc:Asset",
    Task: "omc:Task",
    Participant: "omc:Participant",
    Infrastructure: "omc:Infrastructure",
    Location: "omc:Location",
    CreativeWork: "omc:CreativeWork",
    Character: "omc:Character",
    
    AssetSC: "omc:AssetAsStructure",
    AssetFC: "omc:AssetAsFunction",
    TaskSC: "omc:TaskAsStructure",
    TaskFC: "omc:TaskAsFunction",
    ParticipantSC: "omc:ParticipantAsStructure",
    ParticipantFC: "omc:ParticipantAsFunction",
    
    Person: "omc:Person",
    Organization: "omc:Organization",
    Department: "omc:Department",
    Service: "omc:Service",
    
    DigitalAsset: "omc:DigitalAsset",
    PhysicalAsset: "omc:PhysicalAsset",
    
    NarrativeContext: "omc:NarrativeContext",
    ProductionContext: "omc:ProductionContext",
    MediaCreationContext: "omc:MediaCreationContext",
    
    Sequence: "omc:Sequence",
    Shot: "omc:Shot",
    Take: "omc:Take",
    Slate: "omc:Slate",
    ProductionScene: "omc:ProductionScene",
    NarrativeScene: "omc:NarrativeScene"
  };
  return classMap[entityType] || `omc:${entityType}`;
}
