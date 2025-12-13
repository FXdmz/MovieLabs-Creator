/**
 * @fileoverview Context Type Definitions - OMC Context entity types.
 * Defines workflow grouping contexts for media production (narrative,
 * production, editorial, VFX, color, audio contexts).
 * 
 * @exports CONTEXT_STRUCTURAL_TYPES - Available context type options
 * @exports getContextStructuralProperties - Get properties for context type
 * @exports getContextStructuralDefaults - Get default values for context type
 */
export const CONTEXT_STRUCTURAL_TYPES = [
  { value: "NarrativeContext", label: "Narrative Context - Story elements and narrative structure" },
  { value: "ProductionContext", label: "Production Context - Production planning and execution" },
  { value: "ShootDayContext", label: "Shoot Day Context - Daily production activities" },
  { value: "EditorialContext", label: "Editorial Context - Post-production and editing" },
  { value: "VFXContext", label: "VFX Context - Visual effects work" },
  { value: "ColorContext", label: "Color Context - Color grading and correction" },
  { value: "AudioContext", label: "Audio Context - Sound design and mixing" },
] as const;

export type ContextStructuralType = typeof CONTEXT_STRUCTURAL_TYPES[number]['value'];

const CONTEXT_STRUCTURAL_PROPERTIES: Record<string, string[]> = {
  NarrativeContext: ['NarrativeScene', 'NarrativeLocation', 'Character', 'NarrativeObject', 'NarrativeAction', 'NarrativeAudio', 'NarrativeStyling', 'NarrativeWardrobe'],
  ProductionContext: ['ProductionScene', 'ProductionLocation', 'Participant', 'Task', 'Infrastructure', 'Asset'],
  ShootDayContext: ['shootDate', 'callTime', 'wrapTime', 'ProductionScene', 'ProductionLocation', 'Participant', 'Task', 'Infrastructure', 'Asset'],
  EditorialContext: ['Sequence', 'Asset', 'Participant', 'Task'],
  VFXContext: ['Sequence', 'Asset', 'Participant', 'Task'],
  ColorContext: ['Sequence', 'Asset', 'Participant', 'Task'],
  AudioContext: ['Asset', 'Participant', 'Task', 'Sequence'],
};

export function getContextStructuralProperties(structuralType: string | undefined): string[] {
  if (!structuralType) return [];
  return CONTEXT_STRUCTURAL_PROPERTIES[structuralType] || [];
}

export function getContextStructuralDefaults(structuralType: string | undefined): Record<string, any> {
  const structuralTypeLower = structuralType ? 
    structuralType.charAt(0).toLowerCase() + structuralType.slice(1) : null;
  
  return {
    structuralType: structuralTypeLower,
  };
}
