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
