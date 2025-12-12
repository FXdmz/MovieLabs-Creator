import { Entity } from "../store";
import { entitiesToTurtle, entityToTurtle } from "./rdf/serializer";
import { v4 as uuidv4 } from "uuid";
import servicesData from "../me-nexus-services.json";

export type ExportFormat = "json" | "ttl";

export interface ExportOptions {
  format: ExportFormat;
  pretty?: boolean;
}

interface TaskClassification {
  l1Category: string | null;
  serviceId: string | null;
  serviceName: string | null;
  fullPath: string | null;
  l1: string | null;
  l2: string | null;
  l3: string | null;
  description: string | null;
}

function sanitizeForUri(name: string): string {
  return name.replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-');
}

function mapToOMC(l1: string | null, l2: string | null): string {
  switch (l1) {
    case 'Animation':
    case 'Compositing':
    case 'Asset Creation':
    case 'FX-Simulation':
    case 'Lighting':
    case 'Rendering':
    case 'Layout':
    case 'Create Visual Effects':
      return 'omc:CreateVisualEffects';
    
    case 'Production Services':
      if (l2?.includes('Pre-Production')) return 'omc:DevelopCreativeStyle';
      if (l2?.includes('Principal Photography')) return 'omc:Shoot';
      if (l2?.includes('Post-Production')) return 'omc:ConformFinish';
      return 'omc:Shoot';
    
    case 'Editorial':
      return 'omc:ConformFinish';
    
    case 'Game Development':
    case 'Extended Reality':
      return 'omc:CreateInteractiveContent';
    
    case 'Concept Development':
    case 'Creative Research':
    case 'Creative Supervision':
    case 'Previs-Techvis-Postvis':
      return 'omc:DevelopCreativeStyle';
    
    case 'Virtual Production':
      return 'omc:Shoot';
    
    default:
      return 'omc:Task';
  }
}

function transformTaskForExport(content: any): any {
  const classification = content.taskClassification as TaskClassification | undefined;
  const { taskClassification, meNexusService, ...rest } = content;
  
  if (!classification?.l1Category) {
    return rest;
  }
  
  const taskScId = uuidv4();
  const taskFcId = uuidv4();
  
  const omcEquivalent = mapToOMC(classification.l1, classification.l2);
  
  const existingTaskSC = rest.TaskSC || {};
  const existingTaskFC = rest.taskFC || {};
  
  const updatedTaskSC = {
    ...existingTaskSC,
    entityType: "TaskSC",
    schemaVersion: "https://movielabs.com/omc/json/schema/v2.8",
    identifier: existingTaskSC.identifier || [{
      identifierScope: "me-nexus",
      identifierValue: taskScId,
      combinedForm: `me-nexus:${taskScId}`
    }],
    structuralType: `menexus:${sanitizeForUri(classification.l1Category)}`,
    structuralProperties: {
      meNexusL1: classification.l1Category,
      description: `${classification.l1Category} services category`
    }
  };
  
  let updatedTaskFC = existingTaskFC;
  
  if (classification.serviceId) {
    updatedTaskFC = {
      entityType: "TaskFC",
      schemaVersion: "https://movielabs.com/omc/json/schema/v2.8",
      identifier: existingTaskFC.identifier || [{
        identifierScope: "me-nexus",
        identifierValue: taskFcId,
        combinedForm: `me-nexus:${taskFcId}`
      }],
      functionalType: `menexus:${sanitizeForUri(classification.serviceName || '')}`,
      functionalProperties: {
        meNexusService: {
          serviceId: classification.serviceId,
          serviceName: classification.serviceName,
          fullPath: classification.fullPath,
          l1: classification.l1,
          l2: classification.l2,
          l3: classification.l3,
          description: classification.description
        },
        omcEquivalent
      }
    };
  }
  
  return {
    ...rest,
    TaskSC: updatedTaskSC,
    taskFC: updatedTaskFC
  };
}

function transformEntityForExport(entity: Entity): any {
  if (entity.type === 'Task') {
    return transformTaskForExport(entity.content);
  }
  return entity.content;
}

export function exportEntities(entities: Entity[], options: ExportOptions): string {
  const { format, pretty = true } = options;
  
  if (format === "ttl") {
    return entitiesToTurtle(entities);
  }
  
  const transformedContent = entities.map(e => transformEntityForExport(e));
  const jsonContent = transformedContent.length === 1 
    ? transformedContent[0] 
    : transformedContent;
    
  return pretty 
    ? JSON.stringify(jsonContent, null, 2) 
    : JSON.stringify(jsonContent);
}

export function exportEntity(entity: Entity, options: ExportOptions): string {
  return exportEntities([entity], options);
}

export function getFileExtension(format: ExportFormat): string {
  return format === "ttl" ? ".ttl" : ".json";
}

export function getMimeType(format: ExportFormat): string {
  return format === "ttl" ? "text/turtle" : "application/json";
}

export function downloadExport(
  entities: Entity[], 
  options: ExportOptions, 
  filename?: string
): void {
  const content = exportEntities(entities, options);
  const ext = getFileExtension(options.format);
  const mimeType = getMimeType(options.format);
  
  const defaultName = entities.length === 1 
    ? entities[0].name.replace(/[^a-zA-Z0-9-_]/g, "_")
    : "omc_entities";
    
  const finalFilename = filename || `${defaultName}${ext}`;
  
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = finalFilename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export { entitiesToTurtle, entityToTurtle } from "./rdf/serializer";
