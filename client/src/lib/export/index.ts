import { Entity } from "../store";
import { entitiesToTurtle, entityToTurtle } from "./rdf/serializer";

export type ExportFormat = "json" | "ttl";

export interface ExportOptions {
  format: ExportFormat;
  pretty?: boolean;
}

interface CustomDataEntry {
  domain: string;
  namespace: string;
  value: any;
}

function ensureCustomDataArray(customData: any): CustomDataEntry[] {
  if (!customData) return [];
  if (Array.isArray(customData)) return customData;
  return [customData];
}

function addOrMergeCustomData(
  customData: CustomDataEntry[],
  domain: string,
  namespace: string,
  valueToMerge: any
): CustomDataEntry[] {
  const existingIndex = customData.findIndex(
    entry => entry.domain === domain && entry.namespace === namespace
  );
  
  if (existingIndex >= 0) {
    customData[existingIndex] = {
      ...customData[existingIndex],
      value: {
        ...customData[existingIndex].value,
        ...valueToMerge
      }
    };
  } else {
    customData.push({
      domain,
      namespace,
      value: valueToMerge
    });
  }
  
  return customData;
}

function applySchemaComplianceTransform(content: any, entityType: string): any {
  if (!content) return content;
  
  const result = { ...content };
  let customData = ensureCustomDataArray(result.customData);
  
  if (entityType === "Task") {
    const { state, stateDetails, workUnit, taskClassification, meNexusService, ...taskRest } = result;
    
    if (state !== undefined || stateDetails !== undefined) {
      const workflowValue: any = {};
      if (state !== undefined) workflowValue.state = state;
      if (stateDetails !== undefined) workflowValue.stateDetails = stateDetails;
      customData = addOrMergeCustomData(customData, "me-nexus", "workflow", workflowValue);
    }
    
    if (workUnit !== undefined) {
      customData = addOrMergeCustomData(customData, "me-nexus", "work", { workUnit });
    }
    
    Object.assign(result, taskRest);
    delete result.state;
    delete result.stateDetails;
    delete result.workUnit;
    delete result.taskClassification;
    delete result.meNexusService;
    
    if (result.Context && Array.isArray(result.Context)) {
      result.Context = result.Context.map((ctx: any) => 
        applyContextTransformIndependent(ctx)
      ).filter(Boolean);
      if (result.Context.length === 0) {
        delete result.Context;
      }
    }
  }
  
  if (entityType === "Context") {
    return applyContextTransformIndependent(result);
  }
  
  if (customData.length > 0) {
    result.customData = customData;
  } else {
    delete result.customData;
  }
  
  return result;
}

function applyContextTransformIndependent(context: any): any {
  if (!context) return context;
  
  const { scheduling, hasInputAssets, hasOutputAssets, informs, isInformedBy, ...rest } = context;
  const result = { ...rest };
  let customData = ensureCustomDataArray(result.customData);
  
  if (hasInputAssets && Array.isArray(hasInputAssets) && hasInputAssets.length > 0) {
    result.uses = result.uses || {};
    result.uses.Asset = hasInputAssets;
  }
  
  if (scheduling !== undefined) {
    customData = addOrMergeCustomData(customData, "me-nexus", "scheduling", { scheduling });
  }
  
  if (customData.length > 0) {
    result.customData = customData;
  } else {
    delete result.customData;
  }
  
  return result;
}

function transformEntityForJsonExport(entity: Entity): any {
  return applySchemaComplianceTransform(entity.content, entity.type);
}

function cleanEntityForRdfExport(content: any): any {
  return content;
}

export function prepareEntitiesForJsonExport(entities: Entity[]): Entity[] {
  return entities.map(entity => ({
    ...entity,
    content: transformEntityForJsonExport(entity)
  }));
}

export function prepareEntitiesForRdfExport(entities: Entity[]): Entity[] {
  return entities.map(entity => ({
    ...entity,
    content: cleanEntityForRdfExport(entity.content)
  }));
}

export function exportEntities(entities: Entity[], options: ExportOptions): string {
  const { format, pretty = true } = options;
  
  if (format === "ttl") {
    const rdfEntities = prepareEntitiesForRdfExport(entities);
    return entitiesToTurtle(rdfEntities);
  }
  
  const jsonEntities = prepareEntitiesForJsonExport(entities);
  const transformedContent = jsonEntities.map(e => e.content);
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
