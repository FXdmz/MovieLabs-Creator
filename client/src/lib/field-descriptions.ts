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

export function getFieldDescription(entityType: string, fieldKey: string): { description: string; required?: boolean } | undefined {
  if (entityType === 'CreativeWork') {
    return CREATIVE_WORK_FIELD_DESCRIPTIONS[fieldKey] || BASE_ENTITY_FIELD_DESCRIPTIONS[fieldKey];
  }
  return BASE_ENTITY_FIELD_DESCRIPTIONS[fieldKey];
}
