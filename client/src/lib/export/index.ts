import { Entity } from "../store";
import { entitiesToTurtle, entityToTurtle } from "./rdf/serializer";

export type ExportFormat = "json" | "ttl";

export interface ExportOptions {
  format: ExportFormat;
  pretty?: boolean;
}

export function exportEntities(entities: Entity[], options: ExportOptions): string {
  const { format, pretty = true } = options;
  
  if (format === "ttl") {
    return entitiesToTurtle(entities);
  }
  
  const jsonContent = entities.length === 1 
    ? entities[0].content 
    : entities.map(e => e.content);
    
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
