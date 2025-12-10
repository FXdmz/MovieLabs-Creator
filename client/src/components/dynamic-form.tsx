import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, ChevronDown, ChevronRight, Info } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getFieldDescription } from "@/lib/field-descriptions";
import { IETF_LANGUAGE_CODES } from "@/lib/language-codes";
import { CreativeWorkHeader } from "./creative-work-header";
import { DurationInput } from "./duration-input";

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

export function SchemaField({ fieldKey, schema, value, onChange, path = "", level = 0, rootSchema, entityType }: SchemaFieldProps & { rootSchema?: any }) {
  const [isOpen, setIsOpen] = useState(level < 1); // Open top level by default
  
  // Get field description from our descriptions file (for enhanced UX)
  const fieldMeta = entityType ? getFieldDescription(entityType, fieldKey) : undefined;
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

  // Check if this is a duration field (ISO 8601 duration pattern)
  const isDurationField = fieldKey.toLowerCase().includes('length') ||
                          fieldKey.toLowerCase().includes('duration') ||
                          schema.pattern?.includes('P(?=.)') ||
                          schema.description?.toLowerCase().includes('iso 8601');

  return (
    <div className="space-y-1.5">
      <FieldLabel label={schema.title || fieldKey} required={isRequired} description={enhancedDescription} />
      
      {schema.enum ? (
        <Select value={value || undefined} onValueChange={onChange}>
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
        <Select value={value || undefined} onValueChange={onChange}>
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
      ) : schemaType === 'boolean' ? (
        <div className="flex items-center space-x-2 h-10">
          <Switch checked={value} onCheckedChange={onChange} />
          <span className="text-sm text-muted-foreground">{value ? 'Yes' : 'No'}</span>
        </div>
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

// Wrapper to handle definition lookups
export function DynamicForm({ schema, value, onChange }: { schema: any, value: any, onChange: (val: any) => void }) {
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
       // Often oneOf in OMC is [Reference, Entity], we prefer Entity for editing usually, or Reference for linking
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
    
    // Fallback: Check if it's nested in MediaCreationContext or Utility
    if (!def) {
      // Try to find it in nested definitions
      const mediaContext = schema.$defs?.MediaCreationContext?.properties?.[value.entityType];
      if (mediaContext) return resolveRef(mediaContext);
      
      const utility = schema.$defs?.Utility?.properties?.[value.entityType];
      if (utility) return resolveRef(utility);
      
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

  // For CreativeWork, filter fields based on creativeWorkType
  const getFilteredSchema = () => {
    if (value.entityType !== 'CreativeWork' || !rootSchema.properties) {
      return rootSchema;
    }

    const creativeWorkType = value.creativeWorkType || 'creativeWork';
    let hiddenFields: string[] = [];

    // Determine which fields to hide based on creativeWorkType
    if (creativeWorkType === 'creativeWork') {
      hiddenFields = EPISODIC_FIELDS;
    } else if (creativeWorkType === 'series') {
      hiddenFields = EPISODE_FIELDS.filter(f => f !== 'Season' && f !== 'Episode');
    } else if (creativeWorkType === 'season') {
      hiddenFields = ['episodeSequence'];
    }
    // episode shows all fields

    // Filter out hidden fields
    const filteredProperties: any = {};
    Object.entries(rootSchema.properties).forEach(([key, propSchema]) => {
      if (!hiddenFields.includes(key)) {
        filteredProperties[key] = propSchema;
      }
    });

    return { ...rootSchema, properties: filteredProperties };
  };

  const filteredSchema = getFilteredSchema();

  return (
    <div className="p-1">
      {value.entityType === 'CreativeWork' && <CreativeWorkHeader />}
      <SchemaField 
        fieldKey="root" 
        schema={filteredSchema} 
        value={value} 
        onChange={onChange} 
        rootSchema={schema} // Pass full schema for lookups
        entityType={value.entityType} // Pass entity type for field descriptions
      />
    </div>
  );
}
