import { Entity } from "../store";
import { entitiesToTurtle, entityToTurtle } from "./rdf/serializer";

export type ExportFormat = "json" | "ttl";

export interface ExportOptions {
  format: ExportFormat;
  pretty?: boolean;
}

function cleanEntityForExport(content: any): any {
  const { taskClassification, meNexusService, ...rest } = content || {};
  return rest;
}

function transformEntityForExport(entity: Entity): any {
  return cleanEntityForExport(entity.content);
}

export function prepareEntitiesForExport(entities: Entity[]): Entity[] {
  return entities.map(entity => ({
    ...entity,
    content: transformEntityForExport(entity)
  }));
}

export function exportEntities(entities: Entity[], options: ExportOptions): string {
  const { format, pretty = true } = options;
  
  const transformedEntities = prepareEntitiesForExport(entities);
  
  if (format === "ttl") {
    return entitiesToTurtle(transformedEntities);
  }
  
  const transformedContent = transformedEntities.map(e => e.content);
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
