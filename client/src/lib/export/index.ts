import { Entity } from "../store";
import { entitiesToTurtle, entityToTurtle } from "./rdf/serializer";
import { getOmcFunctionalClass, MeNexusServiceData } from "../omc-service-mapping";
import servicesData from "../me-nexus-services.json";

export type ExportFormat = "json" | "ttl";

export interface ExportOptions {
  format: ExportFormat;
  pretty?: boolean;
}

function transformTaskForExport(content: any): any {
  if (content.entityType !== 'Task' || !content.meNexusService) {
    const { meNexusService, ...rest } = content;
    return rest;
  }

  const serviceData = content.meNexusService as MeNexusServiceData;
  
  const service = servicesData.services.find(s => s.serviceId === serviceData.serviceId);
  const omcClass = service ? getOmcFunctionalClass(service) : { identifier: "omc:Task", name: "Task" };

  const { meNexusService, ...rest } = content;

  return {
    ...rest,
    taskFunctionalCharacteristics: {
      identifier: omcClass.identifier,
      name: omcClass.name,
      customData: {
        meNexusService: {
          serviceId: serviceData.serviceId,
          serviceName: serviceData.serviceName,
          l1: serviceData.l1,
          l2: serviceData.l2,
          l3: serviceData.l3
        }
      }
    }
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
