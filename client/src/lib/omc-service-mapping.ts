/**
 * @fileoverview ME-NEXUS to OMC Service Mapping.
 * Maps ME-NEXUS hierarchical service classifications (L1/L2/L3)
 * to OMC functional classes for Task entity classification.
 * 
 * @exports MeNexusService - Service definition with hierarchy
 * @exports OmcFunctionalClass - OMC functional class reference
 * @exports getOmcFunctionalClass - Map service to OMC class
 * @exports getServiceDisplayName - Format service hierarchy for display
 * @exports serviceMatchesSearch - Search filter for services
 */
export interface MeNexusService {
  serviceId: string;
  serviceName: string;
  description: string;
  hierarchy: {
    l1: string | null;
    l2: string | null;
    l3: string | null;
  };
}

export interface MeNexusServiceData {
  serviceId: string;
  serviceName: string;
  l1: string | null;
  l2: string | null;
  l3: string | null;
}

export interface OmcFunctionalClass {
  identifier: string;
  name: string;
}

const omcMappings: Record<string, OmcFunctionalClass> = {
  "Animation": { identifier: "omc:CreateVisualEffects", name: "Create Visual Effects" },
  "Asset Creation": { identifier: "omc:CreateVisualEffects", name: "Create Visual Effects" },
  "Compositing": { identifier: "omc:CreateVisualEffects", name: "Create Visual Effects" },
  "FX-Simulation": { identifier: "omc:CreateVisualEffects", name: "Create Visual Effects" },
  "Create Visual Effects": { identifier: "omc:CreateVisualEffects", name: "Create Visual Effects" },
  "Lighting": { identifier: "omc:CreateVisualEffects", name: "Create Visual Effects" },
  "Rendering": { identifier: "omc:CreateVisualEffects", name: "Create Visual Effects" },
  
  "Concept Development": { identifier: "omc:DevelopCreativeStyle", name: "Develop Creative Style" },
  "Creative Research": { identifier: "omc:DevelopCreativeStyle", name: "Develop Creative Style" },
  "Creative Supervision": { identifier: "omc:DevelopCreativeStyle", name: "Develop Creative Style" },
  "Pre-Production": { identifier: "omc:DevelopCreativeStyle", name: "Develop Creative Style" },
  "Previs-Techvis-Postvis": { identifier: "omc:DevelopCreativeStyle", name: "Develop Creative Style" },
  
  "Production Services": { identifier: "omc:Shoot", name: "Shoot" },
  "Principal Photography": { identifier: "omc:Shoot", name: "Shoot" },
  "Virtual Production": { identifier: "omc:Shoot", name: "Shoot" },
  "Virtual Camera": { identifier: "omc:Shoot", name: "Shoot" },
  
  "Post-Production": { identifier: "omc:ConformFinish", name: "Conform & Finish" },
  "Editorial": { identifier: "omc:ConformFinish", name: "Conform & Finish" },
  
  "Game Development": { identifier: "omc:CreateInteractiveContent", name: "Create Interactive Content" },
  "Extended Reality": { identifier: "omc:CreateInteractiveContent", name: "Create Interactive Content" },
  
  "Talent Management": { identifier: "omc:ManageTalent", name: "Manage Talent" },
  "Project Management": { identifier: "omc:ManageProject", name: "Manage Project" },
};

export function getOmcFunctionalClass(service: MeNexusService): OmcFunctionalClass {
  const l1 = service.hierarchy.l1;
  const l2 = service.hierarchy.l2;
  
  if (l2 && omcMappings[l2]) {
    return omcMappings[l2];
  }
  
  if (l1 && omcMappings[l1]) {
    return omcMappings[l1];
  }
  
  return { identifier: "omc:Task", name: "Task" };
}

export function getServiceDisplayName(service: MeNexusService): string {
  const { l1, l2, l3 } = service.hierarchy;
  
  if (l3) {
    return `${l1} > ${l2} > ${l3}`;
  }
  if (l2) {
    return `${l1} > ${l2}`;
  }
  return l1 || service.serviceName;
}

export function serviceMatchesSearch(service: MeNexusService, searchTerm: string): boolean {
  const term = searchTerm.toLowerCase();
  const name = service.serviceName.toLowerCase();
  const desc = service.description.toLowerCase();
  const l1 = (service.hierarchy.l1 || '').toLowerCase();
  const l2 = (service.hierarchy.l2 || '').toLowerCase();
  const l3 = (service.hierarchy.l3 || '').toLowerCase();
  
  return name.includes(term) || 
         desc.includes(term) || 
         l1.includes(term) || 
         l2.includes(term) || 
         l3.includes(term);
}
