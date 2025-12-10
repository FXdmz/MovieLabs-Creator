export const CREATIVE_WORK_FIELD_DESCRIPTIONS: Record<string, { description: string; required?: boolean }> = {
  entityType: {
    description: "The type of OMC entity. For Creative Works, this is always 'CreativeWork'.",
    required: true
  },
  schemaVersion: {
    description: "Describes the version of OMC-JSON schema that was used to create this instance.",
    required: true
  },
  identifier: {
    description: "One or more identifiers for the Creative Work. At least one should be resolvable within the production environment; others might point to sources with fuller information.",
    required: true
  },
  name: {
    description: "A human-readable name for the Creative Work used for display purposes.",
    required: false
  },
  creativeWorkType: {
    description: "Specifies whether this is a standalone creative work, a series, a season, or an episode. Default is 'creativeWork'.",
    required: false
  },
  creativeWorkCategory: {
    description: "The type or form of a Creative Work: movie (theatrical feature), tv (television program), short (short-form content), or supplemental (bonus/extra content).",
    required: false
  },
  creativeWorkTitle: {
    description: "A structured array of titles for the Creative Work. Each title has a name, type (working, internal, regional, or release), and optional language.",
    required: false
  },
  title: {
    description: "DEPRECATED: Use 'creativeWorkTitle' instead. Legacy title object with workingTitle, officialTitle, and internalTitle fields.",
    required: false
  },
  approximateLength: {
    description: "The approximate runtime of the Creative Work. This field is optional and may change over the course of production. It can only be approximate until production is finished and may vary for different distribution channels.",
    required: false
  },
  seasonNumber: {
    description: "For episodic content, the season number this Creative Work belongs to or represents.",
    required: false
  },
  episodeSequence: {
    description: "Episode sequencing information including house sequence (internal episode number) and distribution number (broadcast order position).",
    required: false
  },
  Series: {
    description: "Reference to the parent Series that this Season or Episode belongs to.",
    required: false
  },
  Season: {
    description: "For Episodes: the Season(s) this Episode belongs to. For Series: the Seasons that are part of this Series.",
    required: false
  },
  Episode: {
    description: "Episodes that belong to this Series or Season.",
    required: false
  },
  ProductionCompany: {
    description: "The production companies responsible for the production of this Creative Work.",
    required: false
  },
  originalLanguage: {
    description: "The language or languages spoken in the Creative Work.",
    required: false
  },
  Context: {
    description: "Links to Context entities that provide additional metadata and relationships for this Creative Work.",
    required: false
  },
  customData: {
    description: "A user-defined set of custom data in the payload of the instance, used where the formal schema lacks required properties.",
    required: false
  },
  notes: {
    description: "Human readable commentary, explanation, or information about this Creative Work.",
    required: false
  }
};

export const ASSET_FIELD_DESCRIPTIONS: Record<string, { description: string; required?: boolean }> = {
  entityType: {
    description: "The type of OMC entity. For Assets, this is always 'Asset'.",
    required: true
  },
  schemaVersion: {
    description: "Describes the version of OMC-JSON schema that was used to create this instance.",
    required: true
  },
  identifier: {
    description: "One or more identifiers for the Asset. At least one should be resolvable within the production environment.",
    required: true
  },
  name: {
    description: "A human-readable name for the Asset used for display purposes.",
    required: false
  },
  description: {
    description: "A textual description of this Asset.",
    required: false
  },
  functionalType: {
    description: "The functional purpose of an Asset. Examples include 'digital.image', 'digital.audio', 'digital.video', 'physical.prop', 'physical.camera', etc.",
    required: false
  },
  structuralType: {
    description: "The internal structure of an Asset: 'atomic' for indivisible assets, 'set' for unordered collections, 'sequence' for ordered collections, or 'complex' for structured containers.",
    required: false
  },
  assetFC: {
    description: "The Functional Characteristics of the Asset, describing its specific technical or operational properties.",
    required: false
  },
  assetSC: {
    description: "The Structural Characteristics of the Asset, describing its physical or data structure properties.",
    required: false
  },
  AssetGroup: {
    description: "Reference to an Asset Group that this Asset belongs to, used for organizing related assets.",
    required: false
  },
  AssetSC: {
    description: "Asset Structural Class: Describes the form of an Asset along with the attributes specific to that asset's form. Film and television production have been moving from the physical world to the digital world, but many Assets are still physical – cars, props an actor holds, and printed scripts. Some Assets that were once physical (sound and video) are now mostly digital.",
    required: false
  },
  provenance: {
    description: "Information about the origin or source of this Asset.",
    required: false
  },
  Asset: {
    description: "For container Assets: the child Assets contained within this Asset.",
    required: false
  },
  Context: {
    description: "Links to Context entities that provide additional metadata and relationships for this Asset.",
    required: false
  },
  customData: {
    description: "A user-defined set of custom data in the payload of the instance.",
    required: false
  },
  notes: {
    description: "Human readable commentary, explanation, or information about this Asset.",
    required: false
  }
};

export const BASE_ENTITY_FIELD_DESCRIPTIONS: Record<string, { description: string; required?: boolean }> = {
  entityType: {
    description: "The type of OMC entity being described.",
    required: true
  },
  schemaVersion: {
    description: "The OMC-JSON schema version used to create this entity instance.",
    required: true
  },
  identifier: {
    description: "An array of identifiers that uniquely identify this entity. Each identifier has a scope and value.",
    required: true
  },
  name: {
    description: "A human-readable name for this entity.",
    required: false
  },
  description: {
    description: "A textual description of this entity.",
    required: false
  },
  notes: {
    description: "Human readable commentary, explanation, or information.",
    required: false
  },
  customData: {
    description: "User-defined custom data where the formal schema lacks required properties.",
    required: false
  }
};

export const LOCATION_FIELD_DESCRIPTIONS: Record<string, { description: string; required?: boolean }> = {
  entityType: {
    description: "The type of OMC entity. For Locations, this is always 'Location'.",
    required: true
  },
  schemaVersion: {
    description: "Describes the version of OMC-JSON schema that was used to create this instance.",
    required: true
  },
  identifier: {
    description: "One or more identifiers for the Location. At least one should be resolvable within the production environment.",
    required: true
  },
  name: {
    description: "A human-readable name for this Location, such as 'Main Studio' or 'Beach Location'.",
    required: false
  },
  description: {
    description: "A textual description of this Location.",
    required: false
  },
  address: {
    description: "The postal address of this Location, including street, locality, region, postal code, and country.",
    required: false
  },
  street: {
    description: "The street address, including building number and street name.",
    required: false
  },
  locality: {
    description: "The city, town, or locality where this Location is situated.",
    required: false
  },
  region: {
    description: "The state, province, or region where this Location is situated.",
    required: false
  },
  postalCode: {
    description: "The postal or ZIP code for this Location.",
    required: false
  },
  country: {
    description: "The ISO 3166-1 alpha-2 country code (e.g., 'US' for United States, 'GB' for United Kingdom).",
    required: false
  },
  coordinates: {
    description: "GPS coordinates for this Location in WGS 84 format.",
    required: false
  },
  latitude: {
    description: "The latitude coordinate (between -90 and 90 degrees).",
    required: false
  },
  longitude: {
    description: "The longitude coordinate (between -180 and 180 degrees).",
    required: false
  },
  Context: {
    description: "Links to Context entities that provide additional metadata and relationships for this Location.",
    required: false
  }
};

export const ASSET_SC_FIELD_DESCRIPTIONS: Record<string, { description: string; required?: boolean }> = {
  entityType: {
    description: "The type of OMC entity. For Asset Structural Classes, this is always 'AssetSC'.",
    required: true
  },
  schemaVersion: {
    description: "Describes the version of OMC-JSON schema that was used to create this instance.",
    required: true
  },
  identifier: {
    description: "One or more identifiers for this AssetSC. At least one should be resolvable within the production environment.",
    required: true
  },
  structuralType: {
    description: "A canonical description of the asset's form. Options include digital (audio, video, image, document), physical (props, documents), geometry, or assetGroup.",
    required: false
  },
  structuralProperties: {
    description: "A set of properties that describe the asset in this form, including codec, dimensions, file details, and more.",
    required: false
  },
  dimensions: {
    description: "Physical or digital dimensions of the asset.",
    required: false
  },
  height: {
    description: "Height in format: pixels (1080px), metric (10cm, 5m), or imperial (6ft, 12in). Leave empty if not applicable.",
    required: false
  },
  width: {
    description: "Width in format: pixels (1920px), metric (10cm, 5m), or imperial (6ft, 12in). Leave empty if not applicable.",
    required: false
  },
  depth: {
    description: "Depth in format: pixels (100px), metric (10cm, 5m), or imperial (6ft, 12in). Leave empty if not applicable.",
    required: false
  },
  isAnalog: {
    description: "True if the Asset is an analog (non-digital) asset.",
    required: false
  },
  software: {
    description: "A description of any software connected to this AssetSC, typically the one that generated it.",
    required: false
  },
  Carrier: {
    description: "For describing the physical storage device on which the digital essence is stored.",
    required: false
  },
  provenance: {
    description: "Information about the origin or source of this asset's structural form.",
    required: false
  }
};

export const TASK_FIELD_DESCRIPTIONS: Record<string, { description: string; required?: boolean }> = {
  entityType: {
    description: "The type of OMC entity. For Tasks, this is always 'Task'.",
    required: true
  },
  schemaVersion: {
    description: "Describes the version of OMC-JSON schema that was used to create this instance.",
    required: true
  },
  identifier: {
    description: "One or more identifiers for the Task. At least one should be resolvable within the production environment.",
    required: true
  },
  name: {
    description: "A human-readable name for this Task, such as 'Write Script' or 'Edit Scene 5'.",
    required: false
  },
  description: {
    description: "A textual description of this Task.",
    required: false
  },
  TaskSC: {
    description: "Task Structural Characteristics: Describes the form of the Task along with the attributes specific to that task's form.",
    required: false
  },
  taskFC: {
    description: "Task Functional Characteristics: Describes the purpose of the Task within the production process.",
    required: false
  },
  structuralType: {
    description: "A structured description of the Task's form.",
    required: false
  },
  structuralProperties: {
    description: "A set of properties that describe the Task in this form.",
    required: false
  },
  functionalType: {
    description: "The use or purpose of a Task within the production process.",
    required: false
  },
  functionalProperties: {
    description: "A set of properties that describe the task's functional use.",
    required: false
  },
  Context: {
    description: "Links to Context entities that provide additional metadata and relationships for this Task.",
    required: false
  },
  customData: {
    description: "User-defined custom data as an array of objects with domain, namespace, schema, and value properties.",
    required: false
  },
  notes: {
    description: "Human readable commentary, explanation, or information about this Task.",
    required: false
  }
};

export const INFRASTRUCTURE_FIELD_DESCRIPTIONS: Record<string, { description: string; required?: boolean }> = {
  entityType: {
    description: "The type of OMC entity. For Infrastructure, this is always 'Infrastructure'.",
    required: true
  },
  schemaVersion: {
    description: "Describes the version of OMC-JSON schema that was used to create this instance.",
    required: true
  },
  identifier: {
    description: "One or more identifiers for the Infrastructure. At least one should be resolvable within the production environment.",
    required: true
  },
  name: {
    description: "A human-readable name for this Infrastructure, such as 'Render Farm' or 'Storage Array'.",
    required: false
  },
  description: {
    description: "A textual description of this Infrastructure.",
    required: false
  },
  InfrastructureSC: {
    description: "Infrastructure Structural Characteristics: Describes the form of the Infrastructure.",
    required: false
  },
  infrastructureFC: {
    description: "Infrastructure Functional Characteristics: Describes the purpose of the Infrastructure.",
    required: false
  },
  structuralType: {
    description: "A structured description of the Infrastructure's form.",
    required: false
  },
  structuralProperties: {
    description: "A set of properties that describe the Infrastructure in this form.",
    required: false
  },
  functionalType: {
    description: "The use or purpose of an Infrastructure within the production process.",
    required: false
  },
  functionalProperties: {
    description: "A set of properties that describe the infrastructure's functional use.",
    required: false
  },
  Context: {
    description: "Links to Context entities that provide additional metadata and relationships.",
    required: false
  },
  customData: {
    description: "User-defined custom data as an array of objects with domain, namespace, schema, and value properties.",
    required: false
  }
};

export const PARTICIPANT_FIELD_DESCRIPTIONS: Record<string, { description: string; required?: boolean }> = {
  entityType: {
    description: "The type of OMC entity. For Participants, this is always 'Participant'.",
    required: true
  },
  schemaVersion: {
    description: "Describes the version of OMC-JSON schema that was used to create this instance.",
    required: true
  },
  identifier: {
    description: "One or more identifiers for the Participant. At least one should be resolvable within the production environment.",
    required: true
  },
  name: {
    description: "A human-readable name for this Participant.",
    required: false
  },
  ParticipantSC: {
    description: "Participant Structural Characteristics: Defines whether this is a Person, Organization, Department, or Service, with type-specific properties.",
    required: false
  },
  participantFC: {
    description: "Participant Functional Characteristics: Describes the functional role and job title of the Participant.",
    required: false
  },
  structuralType: {
    description: "The type of Participant: person, organization, department, or service.",
    required: false
  },
  personName: {
    description: "The canonical name or set of names and titles for a Person.",
    required: false
  },
  organizationName: {
    description: "The official name of an Organization.",
    required: false
  },
  departmentName: {
    description: "The name of a Department.",
    required: false
  },
  serviceName: {
    description: "The name of a Service.",
    required: false
  },
  gender: {
    description: "The gender of a Person participant.",
    required: false
  },
  contact: {
    description: "Contact information for the Participant.",
    required: false
  },
  jobTitle: {
    description: "A formal name for the position a Person holds in relation to the production.",
    required: false
  },
  functionalType: {
    description: "The functional type or role of the Participant.",
    required: false
  },
  Role: {
    description: "The combination of a Task and the Participant responsible for it.",
    required: false
  },
  Context: {
    description: "Links to Context entities that provide additional metadata and relationships.",
    required: false
  }
};

export const CONTEXT_FIELD_DESCRIPTIONS: Record<string, { description: string; required?: boolean }> = {
  entityType: {
    description: "The type of OMC entity. For Contexts, this is always 'Context'.",
    required: true
  },
  schemaVersion: {
    description: "Describes the version of OMC-JSON schema that was used to create this instance.",
    required: true
  },
  identifier: {
    description: "One or more identifiers for the Context. At least one should be resolvable within the production environment.",
    required: true
  },
  name: {
    description: "A human-readable name for the Context used for display purposes.",
    required: false
  },
  ContextSC: {
    description: "The structural characteristics of the Context, defining its type and related properties.",
    required: false
  },
  contextFC: {
    description: "The functional characteristics describing the purpose of this Context within production.",
    required: false
  },
  structuralType: {
    description: "The type of Context: narrativeContext, productionContext, shootDayContext, editorialContext, vfxContext, colorContext, or audioContext.",
    required: false
  },
  NarrativeScene: {
    description: "Narrative scenes associated with this Context.",
    required: false
  },
  NarrativeLocation: {
    description: "Narrative locations associated with this Context.",
    required: false
  },
  ProductionScene: {
    description: "Production scenes associated with this Context.",
    required: false
  },
  ProductionLocation: {
    description: "Production locations associated with this Context.",
    required: false
  },
  shootDate: {
    description: "The date of the shoot for this Context.",
    required: false
  },
  callTime: {
    description: "The call time for crew and cast.",
    required: false
  },
  wrapTime: {
    description: "The expected or actual wrap time.",
    required: false
  },
  Sequence: {
    description: "Sequences associated with this Context.",
    required: false
  },
  Character: {
    description: "Characters associated with this Context.",
    required: false
  }
};

export function getFieldDescription(entityType: string, fieldKey: string, path?: string): { description: string; required?: boolean } | undefined {
  if (entityType === 'CreativeWork') {
    return CREATIVE_WORK_FIELD_DESCRIPTIONS[fieldKey] || BASE_ENTITY_FIELD_DESCRIPTIONS[fieldKey];
  }
  if (entityType === 'Asset') {
    if (path?.includes('AssetSC')) {
      return ASSET_SC_FIELD_DESCRIPTIONS[fieldKey] || ASSET_FIELD_DESCRIPTIONS[fieldKey] || BASE_ENTITY_FIELD_DESCRIPTIONS[fieldKey];
    }
    return ASSET_FIELD_DESCRIPTIONS[fieldKey] || BASE_ENTITY_FIELD_DESCRIPTIONS[fieldKey];
  }
  if (entityType === 'Location') {
    return LOCATION_FIELD_DESCRIPTIONS[fieldKey] || BASE_ENTITY_FIELD_DESCRIPTIONS[fieldKey];
  }
  if (entityType === 'Task') {
    return TASK_FIELD_DESCRIPTIONS[fieldKey] || BASE_ENTITY_FIELD_DESCRIPTIONS[fieldKey];
  }
  if (entityType === 'Infrastructure') {
    return INFRASTRUCTURE_FIELD_DESCRIPTIONS[fieldKey] || BASE_ENTITY_FIELD_DESCRIPTIONS[fieldKey];
  }
  if (entityType === 'Participant') {
    return PARTICIPANT_FIELD_DESCRIPTIONS[fieldKey] || BASE_ENTITY_FIELD_DESCRIPTIONS[fieldKey];
  }
  if (entityType === 'Context') {
    return CONTEXT_FIELD_DESCRIPTIONS[fieldKey] || BASE_ENTITY_FIELD_DESCRIPTIONS[fieldKey];
  }
  return BASE_ENTITY_FIELD_DESCRIPTIONS[fieldKey];
}
