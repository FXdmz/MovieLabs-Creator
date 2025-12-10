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

export function getFieldDescription(entityType: string, fieldKey: string): { description: string; required?: boolean } | undefined {
  if (entityType === 'CreativeWork') {
    return CREATIVE_WORK_FIELD_DESCRIPTIONS[fieldKey] || BASE_ENTITY_FIELD_DESCRIPTIONS[fieldKey];
  }
  if (entityType === 'Asset') {
    return ASSET_FIELD_DESCRIPTIONS[fieldKey] || BASE_ENTITY_FIELD_DESCRIPTIONS[fieldKey];
  }
  if (entityType === 'AssetSC') {
    return ASSET_SC_FIELD_DESCRIPTIONS[fieldKey] || BASE_ENTITY_FIELD_DESCRIPTIONS[fieldKey];
  }
  return BASE_ENTITY_FIELD_DESCRIPTIONS[fieldKey];
}
