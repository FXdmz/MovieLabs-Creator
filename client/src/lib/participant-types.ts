export const PARTICIPANT_STRUCTURAL_TYPES = [
  { value: 'Person', label: 'Person - Individual associated with the production' },
  { value: 'Department', label: 'Department - Part of an organization with specific responsibilities' },
  { value: 'Organization', label: 'Organization - Legal entity or group associated with the production' },
  { value: 'Service', label: 'Service - Computer-driven agent that performs tasks' },
];

export const PARTICIPANT_STRUCTURAL_TYPE_PROPERTIES: Record<string, string[]> = {
  Person: ['personName', 'jobTitle', 'gender', 'contact', 'Location'],
  Department: ['departmentName', 'contact', 'Location'],
  Organization: ['organizationName', 'contact', 'Location'],
  Service: ['serviceName', 'contact'],
};

export const PARTICIPANT_STRUCTURAL_TYPE_DEFAULTS: Record<string, any> = {
  Person: {
    structuralType: 'person',
    personName: null,
    jobTitle: null,
    gender: null,
    contact: null,
  },
  Department: {
    structuralType: 'department',
    departmentName: null,
    contact: null,
  },
  Organization: {
    structuralType: 'organization',
    organizationName: null,
    contact: null,
  },
  Service: {
    structuralType: 'service',
    serviceName: null,
    contact: null,
  },
};

export function getParticipantStructuralProperties(structuralClass: string | null | undefined): string[] {
  if (!structuralClass) return [];
  return PARTICIPANT_STRUCTURAL_TYPE_PROPERTIES[structuralClass] || [];
}

export function getParticipantStructuralDefaults(entityType: string): any {
  return PARTICIPANT_STRUCTURAL_TYPE_DEFAULTS[entityType] || {};
}
