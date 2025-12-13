/**
 * @fileoverview Hierarchical Task classification component using ME-NEXUS taxonomy.
 * Provides two-level classification: structural (L1 category) and functional (service).
 * 
 * @features
 * - L1 category selector for structural classification (TaskSC)
 * - L2/L3 service selector for functional classification (taskFC)
 * - Hierarchical tree view with indented child services
 * - OMC equivalent mapping display
 * - Service description preview
 * 
 * @exports TaskClassifier - ME-NEXUS hierarchical classifier
 * @exports getOMCEquivalent - Maps ME-NEXUS categories to OMC task types
 */

import { useState, useMemo } from "react";
import { Label } from "@/components/ui/label";
import { Info } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { v4 as uuidv4 } from "uuid";
import servicesData from "@/lib/me-nexus-services.json";

/** Service hierarchy levels from ME-NEXUS taxonomy */
interface ServiceHierarchy {
  l1: string | null;
  l2: string | null;
  l3: string | null;
}

interface MeNexusService {
  serviceId: string;
  serviceName: string;
  description: string;
  hierarchy: ServiceHierarchy;
}

interface L1Category {
  name: string;
  count: number;
  services: MeNexusService[];
}

interface ServiceTreeNode {
  label: string;
  value: string | null;
  service?: MeNexusService;
  children?: ServiceTreeNode[];
  isGroup?: boolean;
}

interface TaskClassifierProps {
  entityContent: any;
  onChange: (updates: any) => void;
}

function sanitizeForUri(name: string): string {
  return name.replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

function getOMCEquivalent(l1: string | null, l2: string | null): string {
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
      if (l2 === 'Pre-Production Services') return 'omc:DevelopCreativeStyle';
      if (l2 === 'Principal Photography') return 'omc:Shoot';
      if (l2 === 'Post-Production Services') return 'omc:ConformFinish';
      return 'omc:Task';
    
    case 'Editorial':
      return 'omc:Edit';
    
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

export function TaskClassifier({ entityContent, onChange }: TaskClassifierProps) {
  const services = servicesData.services as MeNexusService[];
  
  const l1Categories = useMemo(() => {
    const l1Map = new Map<string, L1Category>();
    
    services.forEach(service => {
      const l1 = service.hierarchy.l1;
      if (!l1) return;
      
      if (!l1Map.has(l1)) {
        l1Map.set(l1, { name: l1, count: 0, services: [] });
      }
      
      const category = l1Map.get(l1)!;
      category.services.push(service);
      category.count++;
    });
    
    return Array.from(l1Map.values()).sort((a, b) => b.count - a.count);
  }, [services]);

  const currentL1 = useMemo(() => {
    const structuralType = entityContent?.TaskSC?.structuralType;
    if (!structuralType || typeof structuralType !== 'string') return null;
    if (structuralType.startsWith('menexus:')) {
      const l1Name = structuralType.replace('menexus:', '').replace(/-/g, ' ');
      const category = l1Categories.find(c => 
        sanitizeForUri(c.name) === structuralType.replace('menexus:', '')
      );
      return category?.name || null;
    }
    return null;
  }, [entityContent?.TaskSC?.structuralType, l1Categories]);

  const currentServiceId = useMemo(() => {
    return entityContent?.taskFC?.functionalProperties?.serviceId || null;
  }, [entityContent?.taskFC?.functionalProperties?.serviceId]);

  const availableServices = useMemo(() => {
    if (!currentL1) return [];
    
    const category = l1Categories.find(c => c.name === currentL1);
    if (!category) return [];
    
    const l2Groups = new Map<string, MeNexusService[]>();
    
    category.services.forEach(service => {
      const l2 = service.hierarchy.l2 || service.serviceName;
      
      if (!l2Groups.has(l2)) {
        l2Groups.set(l2, []);
      }
      
      l2Groups.get(l2)!.push(service);
    });
    
    const tree: ServiceTreeNode[] = [];
    
    l2Groups.forEach((serviceList, l2Name) => {
      const hasL3 = serviceList.some(s => s.hierarchy.l3);
      
      if (hasL3) {
        const l2Parent = serviceList.find(s => !s.hierarchy.l3);
        const l3Children = serviceList.filter(s => s.hierarchy.l3);
        
        if (l2Parent) {
          tree.push({
            label: l2Name,
            value: l2Parent.serviceId,
            service: l2Parent,
            isGroup: true,
            children: l3Children.map(s => ({
              label: s.hierarchy.l3!,
              value: s.serviceId,
              service: s
            }))
          });
        } else {
          tree.push({
            label: l2Name,
            value: null,
            isGroup: true,
            children: l3Children.map(s => ({
              label: s.hierarchy.l3!,
              value: s.serviceId,
              service: s
            }))
          });
        }
      } else {
        const service = serviceList[0];
        tree.push({
          label: l2Name,
          value: service.serviceId,
          service: service
        });
      }
    });
    
    return tree;
  }, [currentL1, l1Categories]);

  const selectedService = useMemo(() => {
    if (!currentServiceId) return null;
    return services.find(s => s.serviceId === currentServiceId) || null;
  }, [currentServiceId, services]);

  const flattenedServices = useMemo(() => {
    const items: { value: string; label: string; indent: boolean; service: MeNexusService }[] = [];
    
    availableServices.forEach(node => {
      if (node.value && node.service) {
        items.push({
          value: node.value,
          label: node.label,
          indent: false,
          service: node.service
        });
      }
      
      if (node.children) {
        node.children.forEach(child => {
          if (child.value && child.service) {
            items.push({
              value: child.value,
              label: `  └ ${child.label}`,
              indent: true,
              service: child.service
            });
          }
        });
      }
    });
    
    return items;
  }, [availableServices]);

  const handleL1Change = (l1Name: string) => {
    const category = l1Categories.find(c => c.name === l1Name);
    if (!category) return;
    
    const existingTaskSC = entityContent?.TaskSC || {};
    const taskScId = existingTaskSC.identifier?.[0]?.identifierValue || uuidv4();
    
    const updatedTaskSC = {
      entityType: "TaskSC",
      schemaVersion: "https://movielabs.com/omc/json/schema/v2.8",
      identifier: existingTaskSC.identifier || [{
        identifierScope: "me-nexus",
        identifierValue: taskScId,
        combinedForm: `me-nexus:${taskScId}`
      }],
      structuralType: `menexus:${sanitizeForUri(l1Name)}`,
      structuralProperties: {
        l1: l1Name,
        serviceCount: category.count
      }
    };
    
    onChange({
      ...entityContent,
      TaskSC: updatedTaskSC,
      taskFC: null
    });
  };

  const handleServiceChange = (serviceId: string) => {
    const service = services.find(s => s.serviceId === serviceId);
    if (!service) return;
    
    const { l1, l2, l3 } = service.hierarchy;
    let fullPath = l1 || '';
    if (l2) fullPath += ` > ${l2}`;
    if (l3) fullPath += ` > ${l3}`;
    
    const functionalTypeName = l3 || l2 || service.serviceName;
    const omcEquivalent = getOMCEquivalent(l1, l2);
    
    const existingTaskFC = entityContent?.taskFC || {};
    const taskFcId = existingTaskFC.identifier?.[0]?.identifierValue || uuidv4();
    
    const updatedTaskFC = {
      entityType: "TaskFC",
      schemaVersion: "https://movielabs.com/omc/json/schema/v2.8",
      identifier: existingTaskFC.identifier || [{
        identifierScope: "me-nexus",
        identifierValue: taskFcId,
        combinedForm: `me-nexus:${taskFcId}`
      }],
      functionalType: `menexus:${sanitizeForUri(functionalTypeName)}`,
      functionalProperties: {
        serviceId: service.serviceId,
        serviceName: service.serviceName,
        fullPath,
        l1,
        l2,
        l3,
        description: service.description,
        omcEquivalent
      }
    };
    
    onChange({
      ...entityContent,
      taskFC: updatedTaskFC
    });
  };

  return (
    <div className="space-y-4 p-4 bg-muted/30 rounded-lg border">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground uppercase tracking-wide">
        <Info className="h-4 w-4" />
        Classification (ME-NEXUS)
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Category (Structural)
          </Label>
          <Select
            value={currentL1 || ""}
            onValueChange={handleL1Change}
          >
            <SelectTrigger data-testid="select-task-l1-category">
              <SelectValue placeholder="Select category..." />
            </SelectTrigger>
            <SelectContent>
              <ScrollArea className="h-[300px]">
                {l1Categories.map((category) => (
                  <SelectItem 
                    key={category.name} 
                    value={category.name}
                    data-testid={`l1-option-${sanitizeForUri(category.name)}`}
                  >
                    <div className="flex items-center justify-between w-full gap-4">
                      <span>{category.name}</span>
                      <span className="text-xs text-muted-foreground">({category.count})</span>
                    </div>
                  </SelectItem>
                ))}
              </ScrollArea>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Task structural category → TaskSC.structuralType
          </p>
        </div>
        
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Service (Functional)
          </Label>
          <Select
            value={currentServiceId || ""}
            onValueChange={handleServiceChange}
            disabled={!currentL1}
          >
            <SelectTrigger data-testid="select-task-service">
              <SelectValue placeholder={currentL1 ? "Select service..." : "Select category first"} />
            </SelectTrigger>
            <SelectContent>
              <ScrollArea className="h-[300px]">
                {flattenedServices.map((item) => (
                  <SelectItem 
                    key={item.value} 
                    value={item.value}
                    data-testid={`service-option-${item.value}`}
                  >
                    <span className={item.indent ? "text-muted-foreground" : ""}>
                      {item.label}
                    </span>
                  </SelectItem>
                ))}
              </ScrollArea>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Specific service → taskFC.functionalType
          </p>
        </div>
      </div>
      
      {selectedService && (
        <div className="mt-3 p-3 bg-primary/5 rounded-md border border-primary/10">
          <div className="text-sm font-medium text-foreground mb-1">
            {selectedService.serviceName}
          </div>
          <div className="text-xs text-muted-foreground mb-2">
            {entityContent?.taskFC?.functionalProperties?.fullPath}
          </div>
          <div className="text-xs text-muted-foreground">
            {selectedService.description}
          </div>
          <div className="text-xs text-primary/70 mt-2">
            OMC Equivalent: {getOMCEquivalent(selectedService.hierarchy.l1, selectedService.hierarchy.l2)}
          </div>
        </div>
      )}
    </div>
  );
}

export { getOMCEquivalent };
