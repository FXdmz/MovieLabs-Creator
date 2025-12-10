export const ENTITY_TYPES = [
  "CreativeWork",
  "Asset",
  "Participant",
  "Context",
  "Depiction",
  "NarrativeAudio",
  "NarrativeLocation",
  "NarrativeObject",
  "NarrativeScene",
  "NarrativeStyling",
  "NarrativeWardrobe",
  "ProductionLocation",
  "ProductionScene",
  "Slate",
  "SpecialAction",
  "Effect",
  "Sequence",
  "Role",
  "Person",
  "Department",
  "Organization",
  "Service",
  "Task",
  "Location",
  "Composition"
] as const;

export type EntityType = typeof ENTITY_TYPES[number];
