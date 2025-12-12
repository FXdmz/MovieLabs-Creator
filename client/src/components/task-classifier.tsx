import { useState, useMemo, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { ChevronDown, Info } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import servicesData from "@/lib/me-nexus-services.json";

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

export interface TaskClassification {
  l1Category: string | null;
  serviceId: string | null;
  serviceName: string | null;
  fullPath: string | null;
  l1: string | null;
  l2: string | null;
  l3: string | null;
  description: string | null;
}

interface TaskClassifierProps {
  value?: TaskClassification | null;
  onChange?: (classification: TaskClassification | null) => void;
}

function sanitizeForUri(name: string): string {
  return name.replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-');
}

function mapToOMC(service: MeNexusService): string {
  const l1 = service.hierarchy.l1;
  const l2 = service.hierarchy.l2;
  
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

export function TaskClassifier({ value, onChange }: TaskClassifierProps) {
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

  const availableServices = useMemo(() => {
    if (!value?.l1Category) return [];
    
    const category = l1Categories.find(c => c.name === value.l1Category);
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
  }, [value?.l1Category, l1Categories]);

  const selectedService = useMemo(() => {
    if (!value?.serviceId) return null;
    return services.find(s => s.serviceId === value.serviceId) || null;
  }, [value?.serviceId, services]);

  const handleL1Change = (l1Name: string) => {
    onChange?.({
      l1Category: l1Name,
      serviceId: null,
      serviceName: null,
      fullPath: null,
      l1: l1Name,
      l2: null,
      l3: null,
      description: null
    });
  };

  const handleServiceChange = (serviceId: string) => {
    const service = services.find(s => s.serviceId === serviceId);
    if (!service) return;
    
    const { l1, l2, l3 } = service.hierarchy;
    let fullPath = l1 || '';
    if (l2) fullPath += ` > ${l2}`;
    if (l3) fullPath += ` > ${l3}`;
    
    onChange?.({
      l1Category: value?.l1Category || l1,
      serviceId: service.serviceId,
      serviceName: service.serviceName,
      fullPath,
      l1,
      l2,
      l3,
      description: service.description
    });
  };

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
            value={value?.l1Category || ""}
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
            Task structural category
          </p>
        </div>
        
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Service (Functional)
          </Label>
          <Select
            value={value?.serviceId || ""}
            onValueChange={handleServiceChange}
            disabled={!value?.l1Category}
          >
            <SelectTrigger data-testid="select-task-service">
              <SelectValue placeholder={value?.l1Category ? "Select service..." : "Select category first"} />
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
            Specific service type
          </p>
        </div>
      </div>
      
      {selectedService && (
        <div className="mt-3 p-3 bg-primary/5 rounded-md border border-primary/10">
          <div className="text-sm font-medium text-foreground mb-1">
            {selectedService.serviceName}
          </div>
          <div className="text-xs text-muted-foreground mb-2">
            {value?.fullPath}
          </div>
          <div className="text-xs text-muted-foreground">
            {selectedService.description}
          </div>
          <div className="text-xs text-primary/70 mt-2">
            OMC Equivalent: {mapToOMC(selectedService)}
          </div>
        </div>
      )}
    </div>
  );
}

export { mapToOMC };
