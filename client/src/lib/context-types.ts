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
  ShootDayContext: ['shootDate', 'callTime', 'wrapTime', 'ProductionScene', 'ProductionLocation', 'Participant'],
  EditorialContext: ['Sequence', 'Asset', 'Participant'],
  VFXContext: ['Sequence', 'Asset', 'Participant', 'Task'],
  ColorContext: ['Sequence', 'Asset', 'Participant'],
  AudioContext: ['Asset', 'Participant', 'Task'],
};

export function getContextStructuralProperties(structuralType: string | undefined): string[] {
  if (!structuralType) return [];
  return CONTEXT_STRUCTURAL_PROPERTIES[structuralType] || [];
}

export function getContextStructuralDefaults(structuralType: string | undefined): Record<string, any> {
  const baseDefaults: Record<string, any> = {
    structuralType: structuralType?.toLowerCase() || null,
  };

  switch (structuralType) {
    case 'NarrativeContext':
      return {
        ...baseDefaults,
        structuralType: 'narrativeContext',
        NarrativeScene: null,
        NarrativeLocation: null,
        Character: null,
      };
    case 'ProductionContext':
      return {
        ...baseDefaults,
        structuralType: 'productionContext',
        ProductionScene: null,
        ProductionLocation: null,
        Participant: null,
      };
    case 'ShootDayContext':
      return {
        ...baseDefaults,
        structuralType: 'shootDayContext',
        shootDate: null,
        callTime: null,
        wrapTime: null,
      };
    case 'EditorialContext':
      return {
        ...baseDefaults,
        structuralType: 'editorialContext',
        Sequence: null,
        Asset: null,
      };
    case 'VFXContext':
      return {
        ...baseDefaults,
        structuralType: 'vfxContext',
        Sequence: null,
        Asset: null,
      };
    case 'ColorContext':
      return {
        ...baseDefaults,
        structuralType: 'colorContext',
        Sequence: null,
        Asset: null,
      };
    case 'AudioContext':
      return {
        ...baseDefaults,
        structuralType: 'audioContext',
        Asset: null,
      };
    default:
      return baseDefaults;
  }
}
