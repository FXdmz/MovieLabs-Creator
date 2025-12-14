import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, ChevronDown, ChevronRight, Info, X, MapPin } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getFieldDescription } from "@/lib/field-descriptions";
import { useOntologyStore } from "@/lib/store";
import { IETF_LANGUAGE_CODES } from "@/lib/language-codes";
import { ISO_COUNTRY_CODES } from "@/lib/country-codes";
import { ASSET_STRUCTURAL_TYPES, ASSET_FUNCTIONAL_TYPES } from "@/lib/asset-types";
import { getRelevantStructuralProperties } from "@/lib/structural-properties-map";
import { getRelevantFunctionalProperties, hasFunctionalProperties } from "@/lib/functional-properties-map";
import { PARTICIPANT_STRUCTURAL_TYPES, getParticipantStructuralProperties, getParticipantStructuralDefaults, getParticipantFunctionalTypes } from "@/lib/participant-types";
import { CONTEXT_STRUCTURAL_TYPES, getContextStructuralProperties, getContextStructuralDefaults } from "@/lib/context-types";
import { CreativeWorkHeader } from "./creativework-header";
import { LocationHeader } from "./location-header";
import { InfrastructureHeader } from "./infrastructure-header";
import { TaskHeader } from "./task-header";
import { ParticipantHeader } from "./participant-header";
import { ContextHeader } from "./context-header";
import { AssetHeader } from "./asset-header";
import { DurationInput } from "./duration-input";
import { DimensionInput } from "./dimension-input";

const ISO8601_DURATION_PATTERN = /^\(-\?\)P\(\?=\.\)/;

const EPISODIC_FIELDS = ['seasonNumber', 'episodeSequence', 'Series', 'Season', 'Episode'];
const SERIES_FIELDS = ['Season', 'Episode'];
const SEASON_FIELDS = ['seasonNumber', 'Series', 'Episode'];
const EPISODE_FIELDS = ['seasonNumber', 'episodeSequence', 'Series', 'Season'];

// This is a simplified recursive form generator
// In a real production app, we would parse the full JSON Schema to generate Zod schemas dynamically
// For this prototype, we'll build a flexible dynamic input system

interface SchemaFieldProps {
  fieldKey: string;
  schema: any;
  value: any;
  onChange: (value: any) => void;
  path?: string;
  level?: number;
  entityType?: string;
  participantStructuralClass?: string;
}

const FieldLabel = ({ label, required, description }: { label: string, required?: boolean, description?: string }) => (
  <div className="flex flex-col gap-1 mb-2">
    <div className="flex items-center gap-2">
      <Label className="text-sm font-medium text-foreground">
        {label}
      </Label>
      {required && (
        <Badge variant="destructive" className="text-[9px] h-4 px-1.5 font-medium">
          Required
        </Badge>
      )}
    </div>
    {description && <span className="text-xs text-muted-foreground leading-relaxed">{description}</span>}
  </div>
);

export function SchemaField({ fieldKey, schema, value, onChange, path = "", level = 0, rootSchema, entityType, participantStructuralClass }: SchemaFieldProps & { rootSchema?: any }) {
  // Open by default if: top level, OR if the field has data (e.g., from file import)
  const hasData = value && typeof value === 'object' && Object.keys(value).length > 0;
  const isAssetSection = ['AssetSC', 'assetFC'].includes(fieldKey);
  const [isOpen, setIsOpen] = useState(level < 1 || hasData || isAssetSection);
  
  // Get field description from our descriptions file (for enhanced UX)
  const fieldMeta = entityType ? getFieldDescription(entityType, fieldKey, path) : undefined;
  const enhancedDescription = fieldMeta?.description || schema.description;
  const isRequired = fieldMeta?.required || false;

  if (!schema) return null;

  // Lazy Resolve Ref inside component to avoid pre-calculating the world
  if (schema.$ref && rootSchema) {
      const refPath = schema.$ref.replace('#/', '').split('/');
      let current = rootSchema;
      for (const p of refPath) {
        if(current) current = current[p];
      }
      
      // If we found it, render it. If it's a circular ref that points back to a parent we've already rendered,
      // we need to be careful. For now, we rely on the user expanding the tree to trigger the next render.
      // This "Lazy Render" approach is safer for React than the recursive function above.
      if (current) {
        // Prevent infinite loops if current is same as schema (direct loop)
        if (current === schema) return <div className="text-xs text-muted-foreground">Circular Reference</div>;
        
        return <SchemaField 
          fieldKey={fieldKey} 
          schema={current} 
          value={value} 
          onChange={onChange} 
          path={path} 
          level={level} 
          rootSchema={rootSchema}
          entityType={entityType}
          participantStructuralClass={participantStructuralClass}
        />;
      }
  }

  // Normalize type (handle ["array", "null"] -> "array")
  const schemaType = Array.isArray(schema.type) 
    ? schema.type.find((t: string) => t !== 'null') || schema.type[0]
    : schema.type;

  // Handle Array
  if (schemaType === 'array') {
    const items = Array.isArray(value) ? value : [];
    return (
      <div className="space-y-2 mt-4">
        <div className="flex items-center justify-between">
          <FieldLabel label={schema.title || fieldKey} description={enhancedDescription} required={isRequired} />
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onChange([...items, {}])} // Add empty object for now, needs default value gen
            className="h-7 text-xs"
          >
            <Plus className="h-3 w-3 mr-1" /> Add Item
          </Button>
        </div>
        
        <div className="space-y-3 pl-2 border-l-2 border-border/50">
          {items.map((item: any, index: number) => (
            <div key={index} className="relative group">
               <div className="absolute right-2 top-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 text-destructive hover:bg-destructive/10"
                  onClick={() => {
                    const newItems = [...items];
                    newItems.splice(index, 1);
                    onChange(newItems);
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
               </div>
               <SchemaField 
                 fieldKey={`${fieldKey}[${index}]`} 
                 schema={schema.items} 
                 value={item} 
                 onChange={(val) => {
                   const newItems = [...items];
                   newItems[index] = val;
                   onChange(newItems);
                 }} 
                 path={`${path}[${index}]`}
                 level={level + 1}
                 rootSchema={rootSchema}
                 entityType={entityType}
                 participantStructuralClass={participantStructuralClass}
               />
            </div>
          ))}
          {items.length === 0 && (
            <div className="text-xs text-muted-foreground italic py-2">No items</div>
          )}
        </div>
      </div>
    );
  }

  // Handle Object
  if (schemaType === 'object' || schema.properties) {
    if (level === 0) {
      // Root object - render fields directly
      return (
        <div className="space-y-6">
          {Object.entries(schema.properties || {}).map(([key, propSchema]: [string, any]) => (
            <div key={key}>
               <SchemaField 
                 fieldKey={key} 
                 schema={propSchema} 
                 value={value?.[key]} 
                 onChange={(val) => onChange({ ...value, [key]: val })} 
                 path={`${path}.${key}`}
                 level={level + 1}
                 rootSchema={rootSchema}
                 entityType={entityType}
                 participantStructuralClass={participantStructuralClass}
               />
            </div>
          ))}
        </div>
      );
    }

    // Nested Object - render collapsible card
    return (
      <Card className="mt-4 border-l-4 border-l-primary/20">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CardHeader className="py-3 px-4 flex flex-row items-center justify-between space-y-0 cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setIsOpen(!isOpen)}>
            <div className="flex items-center gap-2">
              {isOpen ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
              <CardTitle className="text-sm font-medium">{schema.title || fieldKey}</CardTitle>
              {schema.description && (
                <Badge variant="secondary" className="font-normal text-[10px] bg-muted/50 text-muted-foreground hover:bg-muted">?</Badge>
              )}
            </div>
          </CardHeader>
          <CollapsibleContent>
            <CardContent className="pt-0 pb-4 px-4 space-y-4">
              {schema.description && <p className="text-xs text-muted-foreground mb-4">{schema.description}</p>}
              {Object.entries(schema.properties || {}).map(([key, propSchema]: [string, any]) => (
                 <SchemaField 
                   key={key}
                   fieldKey={key} 
                   schema={propSchema} 
                   value={value?.[key]} 
                   onChange={(val) => onChange({ ...value, [key]: val })} 
                   path={`${path}.${key}`}
                   level={level + 1}
                   rootSchema={rootSchema}
                   entityType={entityType}
                   participantStructuralClass={participantStructuralClass}
                 />
              ))}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    );
  }

  // Handle Primitives
  const handleChange = (e: any) => {
    const val = e.target.value;
    if (schemaType === 'number' || schemaType === 'integer') {
      onChange(Number(val));
    } else {
      onChange(val);
    }
  };

  // Safety check: if value is object/array and we're rendering a primitive, skip it
  if ((typeof value === 'object' && value !== null) && schemaType !== 'object' && schemaType !== 'array') {
    return (
      <div className="space-y-1.5">
        <FieldLabel label={schema.title || fieldKey} description={enhancedDescription} required={isRequired} />
        <div className="text-xs text-muted-foreground italic p-2 bg-muted/30 rounded">
          Complex value (use JSON editor)
        </div>
      </div>
    );
  }

  // Check if this is a language field
  const isLanguageField = fieldKey.toLowerCase().includes('language') || 
                          schema.description?.toLowerCase().includes('ietf') ||
                          schema.description?.toLowerCase().includes('bcp 47');
  
  // Check if this is a country field (ISO 3166-1 alpha-2)
  const isCountryField = fieldKey === 'country' ||
                         schema.description?.toLowerCase().includes('iso 3166') ||
                         schema.pattern === '^[A-Z][A-Z]$';

  // Check if this is a duration field (ISO 8601 duration pattern)
  const isDurationField = fieldKey.toLowerCase().includes('length') ||
                          fieldKey.toLowerCase().includes('duration') ||
                          schema.pattern?.includes('P(?=.)') ||
                          schema.description?.toLowerCase().includes('iso 8601');

  // Check if this is a read-only field (entityType is required and shouldn't be changed)
  // But NOT if it's within ParticipantSC or ContextSC where entityType is the structural class selector
  // Also make schemaVersion read-only in structural characteristic sections
  const isReadOnlyField = (fieldKey === 'entityType' && !path.includes('ParticipantSC') && !path.includes('ContextSC')) ||
    (fieldKey === 'schemaVersion' && (path.includes('ParticipantSC') || path.includes('ContextSC') || path.includes('AssetSC') || path.includes('TaskSC') || path.includes('InfrastructureSC')));

  // Check if this is an Asset structuralType or functionalType field
  // structuralType appears in AssetSC entities
  const isAssetStructuralType = fieldKey === 'structuralType' && 
    (entityType === 'AssetSC' || path.includes('AssetSC'));
  // functionalType appears in Asset.assetFC
  const isAssetFunctionalType = fieldKey === 'functionalType' && 
    (entityType === 'Asset' || path.includes('assetFC'));
  // Make Asset SC/FC types read-only when they have values (set by wizard)
  const isAssetTypeReadOnly = (isAssetStructuralType || isAssetFunctionalType) && value;
  // Check if this is a Participant structural class selector (entityType within ParticipantSC)
  const isParticipantStructuralClass = fieldKey === 'entityType' && 
    path.includes('ParticipantSC') && entityType === 'Participant';
  // Check if this is a Participant functional type field
  const isParticipantFunctionalType = fieldKey === 'functionalType' && 
    path.includes('participantFC') && entityType === 'Participant';
  // Check if this is a Context structural class selector (entityType within ContextSC)
  const isContextStructuralClass = fieldKey === 'entityType' && 
    path.includes('ContextSC') && entityType === 'Context';
  // Dimension fields need special format hints
  const isDimensionField = ['height', 'width', 'depth'].includes(fieldKey) && 
    path.includes('dimensions');

  return (
    <div className="space-y-1.5">
      <FieldLabel label={schema.title || fieldKey} required={isRequired} description={enhancedDescription} />
      
      {isReadOnlyField || isAssetTypeReadOnly ? (
        <div className="flex items-center gap-2">
          <Input 
            value={value || ''} 
            disabled
            className="bg-muted/50 text-muted-foreground cursor-not-allowed"
          />
          <Badge variant="secondary" className="text-xs whitespace-nowrap">
            {isAssetTypeReadOnly ? 'From Wizard' : 'Read-only'}
          </Badge>
        </div>
      ) : schema.enum ? (
        <Select value={value ?? ""} onValueChange={onChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select..." />
          </SelectTrigger>
          <SelectContent>
            {schema.enum.filter((opt: any) => opt !== null).map((opt: string) => (
              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : isDurationField ? (
        <DurationInput value={value || ''} onChange={onChange} />
      ) : isLanguageField ? (
        <Select value={value ?? ""} onValueChange={onChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select language..." />
          </SelectTrigger>
          <SelectContent>
            <ScrollArea className="h-60">
              {IETF_LANGUAGE_CODES.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  {lang.code} - {lang.name}
                </SelectItem>
              ))}
            </ScrollArea>
          </SelectContent>
        </Select>
      ) : isCountryField ? (
        <Select value={value ?? ""} onValueChange={onChange}>
          <SelectTrigger data-testid="select-country">
            <SelectValue placeholder="Select country..." />
          </SelectTrigger>
          <SelectContent>
            <ScrollArea className="h-60">
              {ISO_COUNTRY_CODES.map((country) => (
                <SelectItem key={country.code} value={country.code}>
                  {country.code} - {country.name}
                </SelectItem>
              ))}
            </ScrollArea>
          </SelectContent>
        </Select>
      ) : isAssetStructuralType ? (
        <Select value={value ?? ""} onValueChange={onChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select structural type..." />
          </SelectTrigger>
          <SelectContent>
            <ScrollArea className="h-60">
              {ASSET_STRUCTURAL_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </ScrollArea>
          </SelectContent>
        </Select>
      ) : isAssetFunctionalType ? (
        <Select value={value ?? ""} onValueChange={onChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select functional type..." />
          </SelectTrigger>
          <SelectContent>
            <ScrollArea className="h-60">
              {ASSET_FUNCTIONAL_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </ScrollArea>
          </SelectContent>
        </Select>
      ) : isParticipantStructuralClass ? (
        <Select value={value ?? ""} onValueChange={onChange}>
          <SelectTrigger data-testid="select-participant-structural-class">
            <SelectValue placeholder="Select participant type..." />
          </SelectTrigger>
          <SelectContent>
            {PARTICIPANT_STRUCTURAL_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : isParticipantFunctionalType ? (
        <Select value={value ?? ""} onValueChange={onChange}>
          <SelectTrigger data-testid="select-participant-functional-type">
            <SelectValue placeholder="Select functional role..." />
          </SelectTrigger>
          <SelectContent>
            {participantStructuralClass ? (
              getParticipantFunctionalTypes(participantStructuralClass).map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))
            ) : (
              <SelectItem value="__placeholder__" disabled>Select a participant type first</SelectItem>
            )}
          </SelectContent>
        </Select>
      ) : isContextStructuralClass ? (
        <Select value={value ?? ""} onValueChange={onChange}>
          <SelectTrigger data-testid="select-context-structural-class">
            <SelectValue placeholder="Select context type..." />
          </SelectTrigger>
          <SelectContent>
            {CONTEXT_STRUCTURAL_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : schemaType === 'boolean' ? (
        <div className="flex items-center space-x-2 h-10">
          <Switch checked={value} onCheckedChange={onChange} />
          <span className="text-sm text-muted-foreground">{value ? 'Yes' : 'No'}</span>
        </div>
      ) : isDimensionField ? (
        <DimensionInput 
          value={value}
          onChange={onChange}
          placeholder="Enter value"
        />
      ) : schema['x-entity-reference'] === 'Location' ? (
        <LocationEntityPicker value={value} onChange={onChange} />
      ) : (
        <Input 
          value={value || ''} 
          onChange={handleChange} 
          type={schemaType === 'number' || schemaType === 'integer' ? 'number' : 'text'}
          className="bg-background"
        />
      )}
    </div>
  );
}

function LocationEntityPicker({ value, onChange }: { value: string | undefined; onChange: (val: string | undefined) => void }) {
  const { entities } = useOntologyStore();
  
  const locationEntities = entities.filter(e => e.type === 'Location');
  
  const getLocationLabel = (entity: any) => {
    const content = entity.content || {};
    const name = content.name || 'Unnamed Location';
    const address = content.address;
    if (address?.street || address?.locality) {
      const parts = [address.street, address.locality].filter(Boolean);
      return `${name} - ${parts.join(', ')}`;
    }
    return name;
  };
  
  const getEntityId = (entity: any): string => {
    return entity.content?.identifier?.[0]?.combinedForm || entity.id || '';
  };
  
  const selectedLocation = value ? locationEntities.find(e => getEntityId(e) === value) : null;
  
  return (
    <div className="flex items-center gap-2">
      <Select value={value || ""} onValueChange={(val) => onChange(val || undefined)}>
        <SelectTrigger data-testid="select-location-reference" className="flex-1">
          <SelectValue placeholder="Select a location...">
            {selectedLocation ? (
              <div className="flex items-center gap-2">
                <MapPin className="h-3 w-3 text-red-500" />
                {getLocationLabel(selectedLocation)}
              </div>
            ) : (
              "Select a location..."
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {locationEntities.length === 0 ? (
            <div className="py-4 px-2 text-center text-sm text-muted-foreground">
              No Location entities found.<br/>Create a Location entity first.
            </div>
          ) : (
            <ScrollArea className="max-h-60">
              {locationEntities.map((entity) => (
                <SelectItem key={getEntityId(entity)} value={getEntityId(entity)}>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3 w-3 text-red-500" />
                    {getLocationLabel(entity)}
                  </div>
                </SelectItem>
              ))}
            </ScrollArea>
          )}
        </SelectContent>
      </Select>
      {value && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-9 w-9 shrink-0"
          onClick={() => onChange(undefined)}
          data-testid="clear-location-reference"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

// Wrapper to handle definition lookups
export function DynamicForm({ schema, value, onChange }: { schema: any, value: any, onChange: (val: any) => void }) {
  // Debug: Log what value the form receives
  if (value?.entityType === 'Participant') {
    console.log('[DynamicForm] Participant value:', JSON.stringify(value, null, 2));
    console.log('[DynamicForm] ParticipantSC:', value.ParticipantSC);
  }
  
  // Helper to dereference schemas (shallow)
  // We use a cache to prevent infinite recursion on circular refs
  const resolveRef = (node: any, visited = new Set<string>()): any => {
    if (!node) return node;
    
    // Handle AllOf (Merge)
    if (node.allOf) {
      let merged: any = {};
      node.allOf.forEach((sub: any) => {
        const resolved = resolveRef(sub, visited);
        merged = { ...merged, ...resolved, properties: { ...merged.properties, ...resolved.properties } };
      });
      return { ...merged, ...node }; // Keep node props like title
    }

    if (node.$ref) {
      if (visited.has(node.$ref)) {
         // Break recursion - return a placeholder or the raw ref
         return { type: 'object', title: node.$ref.split('/').pop(), description: 'Recursive Reference' };
      }
      
      const newVisited = new Set(visited);
      newVisited.add(node.$ref);

      const refPath = node.$ref.replace('#/', '').split('/');
      let current = schema;
      for (const p of refPath) {
        if (current) current = current[p];
      }
      
      return resolveRef(current, newVisited); // Recurse with history
    }
    
    // Handle OneOf/AnyOf - tricky for UI, just picking first for now or letting user switch (TODO)
    if (node.oneOf) {
       // Ideally we show a selector. For now, try to find a concrete type or merge
       // Often oneOf in OMC is [Reference, Entity], we prefer Entity for editing usually
       // For customData, prefer the array variant with items
       const arrayVariant = node.oneOf.find((n:any) => n.type === 'array' || n.items);
       if (arrayVariant) {
         return resolveRef(arrayVariant, visited);
       }
       // Prefer non-reference variants
       const preferred = node.oneOf.find((n:any) => !n.$ref?.includes('reference')) || node.oneOf[0];
       return resolveRef(preferred, visited);
    }

    if (node.properties && typeof node.properties === 'object') {
       const newProps: any = {};
       Object.keys(node.properties).forEach(k => {
         // Don't recurse into properties immediately to avoid stack blowup on deep trees
         // We only resolve refs when we actually render that field's schema
         // BUT for the form generator to work, we need some structure.
         // Let's shallow copy and let the SchemaField component resolve nested refs as it renders down
         newProps[k] = node.properties[k]; 
       });
       return { ...node, properties: newProps };
    }
    
    if (node.items) {
       // Similarly, shallow resolve items
       return { ...node, items: node.items };
    }

    return node;
  }

  // Determine the schema for the root object based on entityType
  // The provided schema is the FULL schema file
  const getRootSchema = () => {
    if (!value.entityType) return null;
    
    // OMC Schema structure: $defs[Type].properties[Type]
    const def = schema.$defs?.[value.entityType];
    
    // Special case: AssetSC is nested under Asset.properties.AssetSC
    if (value.entityType === 'AssetSC') {
      const assetSC = schema.$defs?.Asset?.properties?.AssetSC;
      if (assetSC) return resolveRef(assetSC);
    }
    
    // Fallback: Check if it's nested in MediaCreationContext or Utility
    if (!def) {
      // Try to find it in nested definitions
      const mediaContext = schema.$defs?.MediaCreationContext?.properties?.[value.entityType];
      if (mediaContext) return resolveRef(mediaContext);
      
      const utility = schema.$defs?.Utility?.properties?.[value.entityType];
      if (utility) return resolveRef(utility);
      
      // Try Participant
      const participant = schema.$defs?.Participant?.properties?.[value.entityType];
      if (participant) return resolveRef(participant);
      
      return null;
    }

    // Usually nested like Asset -> Asset
    const inner = def.properties?.[value.entityType];
    return resolveRef(inner || def);
  };

  const rootSchema = getRootSchema();

  if (!rootSchema) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <Info className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>Could not resolve schema for type: {value.entityType}</p>
        <p className="text-xs mt-2">Falling back to JSON Editor is recommended.</p>
      </div>
    );
  }

  // Filter fields based on entity type and selected options
  const getFilteredSchema = () => {
    if (!rootSchema.properties) {
      return rootSchema;
    }

    // For Task, hide fields that are handled by TaskHeader/TaskForm
    if (value.entityType === 'Task') {
      const hiddenTaskFields = ['entityType', 'TaskSC', 'taskFC', 'Context'];
      const filteredProperties: any = {};
      Object.entries(rootSchema.properties).forEach(([key, propSchema]) => {
        if (!hiddenTaskFields.includes(key)) {
          filteredProperties[key] = propSchema;
        }
      });
      return { ...rootSchema, properties: filteredProperties };
    }

    // For CreativeWork, filter fields based on creativeWorkType
    if (value.entityType === 'CreativeWork') {
      const creativeWorkType = value.creativeWorkType || 'creativeWork';
      let hiddenFields: string[] = [];

      if (creativeWorkType === 'creativeWork') {
        hiddenFields = EPISODIC_FIELDS;
      } else if (creativeWorkType === 'series') {
        hiddenFields = EPISODE_FIELDS.filter(f => f !== 'Season' && f !== 'Episode');
      } else if (creativeWorkType === 'season') {
        hiddenFields = ['episodeSequence'];
      }

      const filteredProperties: any = {};
      Object.entries(rootSchema.properties).forEach(([key, propSchema]) => {
        if (!hiddenFields.includes(key)) {
          filteredProperties[key] = propSchema;
        }
      });

      return { ...rootSchema, properties: filteredProperties };
    }

    // For Asset, filter both structural and functional properties based on selected types
    if (value.entityType === 'Asset') {
      const structuralType = value.AssetSC?.structuralType;
      const functionalType = value.assetFC?.functionalType;
      const relevantStructProps = getRelevantStructuralProperties(structuralType);
      const relevantFuncProps = getRelevantFunctionalProperties(functionalType);
      
      // Deep clone to avoid mutating the original schema
      const filteredProperties: any = JSON.parse(JSON.stringify(rootSchema.properties));
      
      // Filter AssetSC.structuralProperties only if we have a specific structural type with properties
      if (filteredProperties.AssetSC?.properties?.structuralProperties?.properties) {
        const structPropsSchema = filteredProperties.AssetSC.properties.structuralProperties;
        const existingDataKeys = Object.keys(value.AssetSC?.structuralProperties || {});
        const filteredStructProps: any = {};
        
        // Include properties that are relevant for the structural type
        Object.entries(structPropsSchema.properties || {}).forEach(([key, propSchema]) => {
          if (relevantStructProps.includes(key) || existingDataKeys.includes(key)) {
            filteredStructProps[key] = propSchema;
          }
        });
        
        // Only apply filter if we have relevant properties or existing data
        if (Object.keys(filteredStructProps).length > 0) {
          filteredProperties.AssetSC.properties.structuralProperties.properties = filteredStructProps;
        }
      }
      
      // Filter assetFC.functionalProperties based on functional type
      // If the functional type has no properties defined (empty array), hide the section entirely
      if (functionalType && filteredProperties.assetFC?.properties?.functionalProperties) {
        if (!hasFunctionalProperties(functionalType)) {
          // Remove functionalProperties from the schema for types with no defined properties
          delete filteredProperties.assetFC.properties.functionalProperties;
        } else if (relevantFuncProps.length > 0 && filteredProperties.assetFC.properties.functionalProperties?.properties) {
          const funcPropsSchema = filteredProperties.assetFC.properties.functionalProperties;
          const filteredFuncProps: any = {};
          
          Object.entries(funcPropsSchema.properties || {}).forEach(([key, propSchema]) => {
            if (relevantFuncProps.includes(key)) {
              filteredFuncProps[key] = propSchema;
            }
          });
          
          // Apply filter if we have relevant properties
          if (Object.keys(filteredFuncProps).length > 0) {
            filteredProperties.assetFC.properties.functionalProperties.properties = filteredFuncProps;
          }
        }
      }

      return { ...rootSchema, properties: filteredProperties };
    }

    // For Participant, build a synthetic merged ParticipantSC schema with all structural class properties
    if (value.entityType === 'Participant') {
      const structuralClass = value.ParticipantSC?.entityType;
      const relevantProps = getParticipantStructuralProperties(structuralClass);
      
      // Deep clone to avoid mutating the original schema
      const filteredProperties: any = JSON.parse(JSON.stringify(rootSchema.properties));
      
      // Build synthetic ParticipantSC schema with combined properties from all structural classes
      // This replaces the oneOf with a flat object schema
      const syntheticParticipantSC = {
        type: 'object',
        title: 'Participant Structural Characteristics',
        description: 'Describes the form of a Participant along with the attributes specific to that Participant\'s form.',
        properties: {
          entityType: {
            type: 'string',
            title: 'Participant Type',
            description: 'Select the type of participant: Person, Organization, Department, or Service'
          },
          schemaVersion: {
            type: 'string',
            title: 'Schema Version'
          },
          identifier: {
            type: 'array',
            title: 'Identifier',
            items: {
              type: 'object',
              properties: {
                identifierScope: { type: 'string', title: 'Identifier Scope' },
                identifierValue: { type: 'string', title: 'Identifier Value' },
                combinedForm: { type: 'string', title: 'Combined Form' }
              }
            }
          },
          structuralType: {
            type: 'string',
            title: 'Structural Type',
            description: 'The type of Participant: person, organization, department, or service.'
          },
          // Person properties
          personName: {
            type: 'object',
            title: "Person's Name",
            description: 'The canonical name or set of names and titles for the Person',
            properties: {
              fullName: { type: 'string', title: 'Full Name' },
              firstGivenName: { type: 'string', title: 'First Name' },
              secondGivenName: { type: 'string', title: 'Middle Name' },
              familyName: { type: 'string', title: 'Family Name' },
              suffix: { type: 'string', title: 'Suffix' },
              salutation: { type: 'string', title: 'Salutation' }
            }
          },
          jobTitle: {
            type: 'string',
            title: "Person's Job Title",
            description: 'A person\'s job title (as distinct from a specific role).'
          },
          gender: {
            type: 'object',
            title: "Person's Gender",
            properties: {
              genderCode: { type: 'string', title: 'Gender Code' },
              genderLabel: { type: 'string', title: 'Gender Label' }
            }
          },
          // Organization properties
          organizationName: {
            type: 'object',
            title: "Organization's Name",
            properties: {
              fullName: { type: 'string', title: 'Full Name' },
              altName: { type: 'string', title: 'Alternative Name' }
            }
          },
          // Department properties  
          departmentName: {
            type: 'object',
            title: "Department's Name",
            properties: {
              fullName: { type: 'string', title: 'Full Name' },
              altName: { type: 'string', title: 'Alternative Name' }
            }
          },
          // Service properties
          serviceName: {
            type: 'object',
            title: "Service's Name",
            properties: {
              fullName: { type: 'string', title: 'Full Name' },
              altName: { type: 'string', title: 'Alternative Name' }
            }
          },
          // Shared properties
          contact: {
            type: 'object',
            title: 'Contact',
            description: 'Contact information',
            properties: {
              email: { type: 'string', title: 'Email' },
              telephone: { type: 'string', title: 'Telephone' },
              website: { type: 'string', title: 'Website' }
            }
          },
          Location: {
            type: 'string',
            title: 'Based In',
            description: 'Reference to an existing Location entity',
            'x-entity-reference': 'Location'
          }
        }
      };
      
      // Filter to only show relevant properties for the selected structural class
      if (structuralClass && relevantProps.length > 0) {
        const baseFields = ['entityType', 'schemaVersion', 'identifier', 'structuralType'];
        const allowedFields = [...baseFields, ...relevantProps];
        
        const filteredSCProps: any = {};
        Object.entries(syntheticParticipantSC.properties).forEach(([key, propSchema]) => {
          if (allowedFields.includes(key)) {
            filteredSCProps[key] = propSchema;
          }
        });
        
        syntheticParticipantSC.properties = filteredSCProps;
      }
      
      filteredProperties.ParticipantSC = syntheticParticipantSC;
      
      return { ...rootSchema, properties: filteredProperties };
    }

    // For Context, build a synthetic merged ContextSC schema with all context type properties
    if (value.entityType === 'Context') {
      const structuralClass = value.ContextSC?.entityType;
      const relevantProps = getContextStructuralProperties(structuralClass);
      
      // Deep clone to avoid mutating the original schema
      const filteredProperties: any = JSON.parse(JSON.stringify(rootSchema.properties));
      
      // Build synthetic ContextSC schema
      const syntheticContextSC = {
        type: 'object',
        title: 'Context Structural Characteristics',
        description: 'Defines the type and structure of this Context.',
        properties: {
          entityType: {
            type: 'string',
            title: 'Context Type',
            description: 'Select the type of context: Narrative, Production, Shoot Day, Editorial, VFX, Color, or Audio'
          },
          schemaVersion: {
            type: 'string',
            title: 'Schema Version'
          },
          identifier: {
            type: 'array',
            title: 'Identifier',
            items: {
              type: 'object',
              properties: {
                identifierScope: { type: 'string', title: 'Identifier Scope' },
                identifierValue: { type: 'string', title: 'Identifier Value' },
                combinedForm: { type: 'string', title: 'Combined Form' }
              }
            }
          },
          structuralType: {
            type: 'string',
            title: 'Structural Type',
            description: 'The type of Context.'
          },
          // Narrative Context properties
          NarrativeScene: {
            type: 'array',
            title: 'Narrative Scenes',
            items: { type: 'object' }
          },
          NarrativeLocation: {
            type: 'array',
            title: 'Narrative Locations',
            items: { type: 'object' }
          },
          Character: {
            type: 'array',
            title: 'Characters',
            items: { type: 'object' }
          },
          NarrativeObject: {
            type: 'array',
            title: 'Narrative Objects',
            items: { type: 'object' }
          },
          NarrativeAction: {
            type: 'array',
            title: 'Narrative Actions',
            items: { type: 'object' }
          },
          NarrativeAudio: {
            type: 'array',
            title: 'Narrative Audio',
            items: { type: 'object' }
          },
          NarrativeStyling: {
            type: 'array',
            title: 'Narrative Styling',
            items: { type: 'object' }
          },
          NarrativeWardrobe: {
            type: 'array',
            title: 'Narrative Wardrobe',
            items: { type: 'object' }
          },
          // Production Context properties
          ProductionScene: {
            type: 'array',
            title: 'Production Scenes',
            items: { type: 'object' }
          },
          ProductionLocation: {
            type: 'array',
            title: 'Production Locations',
            items: { type: 'object' }
          },
          Participant: {
            type: 'array',
            title: 'Participants',
            items: { type: 'object' }
          },
          Task: {
            type: 'array',
            title: 'Tasks',
            items: { type: 'object' }
          },
          Infrastructure: {
            type: 'array',
            title: 'Infrastructure',
            items: { type: 'object' }
          },
          Asset: {
            type: 'array',
            title: 'Assets',
            items: { type: 'object' }
          },
          // Shoot Day Context properties
          shootDate: {
            type: 'string',
            title: 'Shoot Date',
            description: 'The date of the shoot'
          },
          callTime: {
            type: 'string',
            title: 'Call Time',
            description: 'The call time for crew and cast'
          },
          wrapTime: {
            type: 'string',
            title: 'Wrap Time',
            description: 'The expected or actual wrap time'
          },
          // Editorial/VFX/Color/Audio Context properties
          Sequence: {
            type: 'array',
            title: 'Sequences',
            items: { type: 'object' }
          }
        }
      };
      
      // Filter to only show relevant properties for the selected context type
      if (structuralClass && relevantProps.length > 0) {
        const baseFields = ['entityType', 'schemaVersion', 'identifier', 'structuralType'];
        const allowedFields = [...baseFields, ...relevantProps];
        
        const filteredSCProps: any = {};
        Object.entries(syntheticContextSC.properties).forEach(([key, propSchema]) => {
          if (allowedFields.includes(key)) {
            filteredSCProps[key] = propSchema;
          }
        });
        
        syntheticContextSC.properties = filteredSCProps;
      }
      
      filteredProperties.ContextSC = syntheticContextSC;
      
      return { ...rootSchema, properties: filteredProperties };
    }

    return rootSchema;
  };

  const filteredSchema = getFilteredSchema();

  const renderEntityHeader = () => {
    switch (value.entityType) {
      case 'CreativeWork':
        return <CreativeWorkHeader value={value} onChange={wrappedOnChange} />;
      case 'Asset':
        return <AssetHeader />;
      case 'Location':
        return <LocationHeader value={value} onChange={wrappedOnChange} />;
      case 'Infrastructure':
        return <InfrastructureHeader value={value} onChange={wrappedOnChange} />;
      case 'Task':
        return <TaskHeader value={value} onChange={wrappedOnChange} />;
      case 'Participant':
        return <ParticipantHeader value={value} onChange={wrappedOnChange} />;
      case 'Context':
        return <ContextHeader />;
      default:
        return null;
    }
  };

  // Wrap onChange to handle Participant and Context structural class changes
  const wrappedOnChange = (newValue: any) => {
    // Check if this is a Participant and ParticipantSC.entityType changed
    if (value.entityType === 'Participant' && newValue.ParticipantSC?.entityType !== value.ParticipantSC?.entityType) {
      const newStructuralClass = newValue.ParticipantSC?.entityType;
      const structuralDefaults = getParticipantStructuralDefaults(newStructuralClass);
      
      // Generate a new identifier for the structural class
      const newScId = uuidv4();
      
      // Build new ParticipantSC: start with structural defaults, then overlay preserved baseEntity fields
      // Always generate a fresh identifier when switching structural class
      const updatedParticipantSC = {
        ...structuralDefaults,
        entityType: newStructuralClass,
        schemaVersion: "https://movielabs.com/omc/json/schema/v2.8",
        identifier: [{
          identifierScope: "me-nexus",
          identifierValue: newScId,
          combinedForm: `me-nexus:${newScId}`
        }],
      };
      
      onChange({
        ...newValue,
        ParticipantSC: updatedParticipantSC
      });
      return;
    }
    
    // Check if this is a Context and ContextSC.entityType changed
    if (value.entityType === 'Context' && newValue.ContextSC?.entityType !== value.ContextSC?.entityType) {
      const newStructuralClass = newValue.ContextSC?.entityType;
      const structuralDefaults = getContextStructuralDefaults(newStructuralClass);
      
      // Generate a new identifier for the structural class
      const newScId = uuidv4();
      
      // Preserve existing ContextSC data but update the type-specific fields
      const existingContextSC = value.ContextSC || {};
      
      // Build new ContextSC: merge existing data with new defaults
      const updatedContextSC = {
        ...existingContextSC,
        ...structuralDefaults,
        entityType: newStructuralClass,
        schemaVersion: "https://movielabs.com/omc/json/schema/v2.8",
        identifier: [{
          identifierScope: "me-nexus",
          identifierValue: newScId,
          combinedForm: `me-nexus:${newScId}`
        }],
      };
      
      onChange({
        ...newValue,
        ContextSC: updatedContextSC
      });
      return;
    }
    
    onChange(newValue);
  };

  return (
    <div className="p-1">
      {renderEntityHeader()}
      <SchemaField 
        fieldKey="root" 
        schema={filteredSchema} 
        value={value} 
        onChange={wrappedOnChange} 
        rootSchema={schema} // Pass full schema for lookups
        entityType={value.entityType} // Pass entity type for field descriptions
        participantStructuralClass={value.entityType === 'Participant' ? value.ParticipantSC?.entityType : undefined}
      />
    </div>
  );
}
