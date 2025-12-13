/**
 * @fileoverview Application Constants - Core entity type definitions.
 * Lists all OMC entity types supported by the application.
 * 
 * @exports ENTITY_TYPES - Readonly array of all OMC entity type names
 * @exports EntityType - Union type of all entity type strings
 */
export const ENTITY_TYPES = [
  "CreativeWork",
  "Asset",
  "Character",
  "Collection",
  "Composition",
  "Context",
  "Depiction",
  "Effect",
  "Infrastructure",
  "Location",
  "NarrativeAction",
  "NarrativeAudio",
  "NarrativeLocation",
  "NarrativeObject",
  "NarrativeScene",
  "NarrativeStyling",
  "NarrativeWardrobe",
  "Participant",
  "ProductionLocation",
  "ProductionScene",
  "Role",
  "Sequence",
  "Slate",
  "SpecialAction",
  "Task"
] as const;

export type EntityType = typeof ENTITY_TYPES[number];
