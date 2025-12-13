/**
 * @fileoverview Participant Type Definitions - OMC Participant entity types.
 * Defines structural and functional classifications for production participants
 * (Person, Department, Organization, Service) per OMC v2.8 specification.
 * 
 * @exports PARTICIPANT_STRUCTURAL_TYPES - Person, Department, Organization, Service
 * @exports PARTICIPANT_FUNCTIONAL_TYPES - Role-based classifications by type
 * @exports getParticipantStructuralProperties - Get fields for participant type
 * @exports getParticipantStructuralDefaults - Get default values by type
 * @exports getParticipantFunctionalTypes - Get functional options by structural type
 */
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

export const PARTICIPANT_FUNCTIONAL_TYPES: Record<string, { value: string; label: string }[]> = {
  Person: [
    { value: 'cast', label: 'Cast - Performing role in the production' },
    { value: 'crew', label: 'Crew - Technical/creative production staff' },
    { value: 'talent', label: 'Talent - On-screen or voice talent' },
    { value: 'contractor', label: 'Contractor - External service provider' },
  ],
  Department: [
    { value: 'production', label: 'Production - Core production department' },
    { value: 'post-production', label: 'Post-Production - Editing, VFX, sound' },
    { value: 'support', label: 'Support - Administrative/logistics support' },
  ],
  Organization: [
    { value: 'studio', label: 'Studio - Production studio' },
    { value: 'vendor', label: 'Vendor - External service vendor' },
    { value: 'union', label: 'Union - Labor organization' },
    { value: 'financier', label: 'Financier - Funding entity' },
    { value: 'distributor', label: 'Distributor - Distribution partner' },
  ],
  Service: [
    { value: 'automation', label: 'Automation - Automated processing service' },
    { value: 'ai-agent', label: 'AI Agent - AI-powered service' },
    { value: 'pipeline', label: 'Pipeline - Workflow pipeline service' },
    { value: 'transcoding', label: 'Transcoding - Media transcoding service' },
  ],
};

export function getParticipantFunctionalTypes(structuralClass: string | null | undefined): { value: string; label: string }[] {
  if (!structuralClass) return [];
  return PARTICIPANT_FUNCTIONAL_TYPES[structuralClass] || [];
}
