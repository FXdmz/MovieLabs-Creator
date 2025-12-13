/**
 * @fileoverview ME-NEXUS service type selector component.
 * Provides searchable dropdown for selecting ME-NEXUS service classifications.
 * 
 * @features
 * - Full-text search across service names and descriptions
 * - Category filter buttons for L1 classification levels
 * - Displays service count and filtered results
 * - Clear selection button
 * 
 * @exports ServiceSelector - ME-NEXUS service type picker
 */

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, ChevronDown, X } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import servicesData from "@/lib/me-nexus-services.json";
import {
  MeNexusService,
  MeNexusServiceData,
  getServiceDisplayName,
  serviceMatchesSearch,
} from "@/lib/omc-service-mapping";

/** Props for ServiceSelector component */
interface ServiceSelectorProps {
  value?: MeNexusServiceData | null;
  onChange?: (service: MeNexusServiceData | null) => void;
}

export function ServiceSelector({ value, onChange }: ServiceSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  const services = servicesData.services as MeNexusService[];

  const categories = useMemo(() => {
    const cats = new Set<string>();
    services.forEach((s) => {
      if (s.hierarchy.l1) cats.add(s.hierarchy.l1);
    });
    return Array.from(cats).sort();
  }, [services]);

  const filteredServices = useMemo(() => {
    let result = services;

    if (categoryFilter) {
      result = result.filter((s) => s.hierarchy.l1 === categoryFilter);
    }

    if (searchTerm) {
      result = result.filter((s) => serviceMatchesSearch(s, searchTerm));
    }

    return result;
  }, [services, searchTerm, categoryFilter]);

  const selectedService = useMemo(() => {
    if (!value?.serviceId) return null;
    return services.find((s) => s.serviceId === value.serviceId) || null;
  }, [value, services]);

  const handleSelect = (service: MeNexusService) => {
    onChange?.({
      serviceId: service.serviceId,
      serviceName: service.serviceName,
      l1: service.hierarchy.l1,
      l2: service.hierarchy.l2,
      l3: service.hierarchy.l3,
    });
    setOpen(false);
    setSearchTerm("");
  };

  const handleClear = () => {
    onChange?.(null);
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">Service Type (ME-NEXUS)</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-auto min-h-10 py-2"
            data-testid="button-service-selector"
          >
            <div className="flex items-center gap-2 flex-1 text-left">
              <Search className="h-4 w-4 text-muted-foreground shrink-0" />
              {selectedService ? (
                <div className="flex flex-col">
                  <span className="font-medium">{selectedService.serviceName}</span>
                  <span className="text-xs text-muted-foreground">
                    {getServiceDisplayName(selectedService)}
                  </span>
                </div>
              ) : (
                <span className="text-muted-foreground">Select a service type...</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {selectedService && (
                <X
                  className="h-4 w-4 text-muted-foreground hover:text-foreground cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClear();
                  }}
                  data-testid="button-clear-service"
                />
              )}
              <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start">
          <div className="p-3 border-b">
            <Input
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mb-2"
              data-testid="input-service-search"
            />
            <div className="flex flex-wrap gap-1">
              <Button
                variant={categoryFilter === null ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setCategoryFilter(null)}
                className="h-7 text-xs"
              >
                All
              </Button>
              {categories.slice(0, 5).map((cat) => (
                <Button
                  key={cat}
                  variant={categoryFilter === cat ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setCategoryFilter(categoryFilter === cat ? null : cat)}
                  className="h-7 text-xs"
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>
          <div className="px-3 py-2 text-xs text-muted-foreground border-b">
            {filteredServices.length} services found
          </div>
          <ScrollArea className="h-[300px]">
            <div className="p-2">
              {filteredServices.map((service) => (
                <div
                  key={service.serviceId}
                  className={`p-3 rounded-md cursor-pointer hover:bg-accent transition-colors ${
                    selectedService?.serviceId === service.serviceId
                      ? "bg-accent"
                      : ""
                  }`}
                  onClick={() => handleSelect(service)}
                  data-testid={`service-option-${service.serviceId}`}
                >
                  <div className="font-medium text-sm">{service.serviceName}</div>
                  <div className="text-xs text-muted-foreground">
                    {getServiceDisplayName(service)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {service.description}
                  </div>
                </div>
              ))}
              {filteredServices.length === 0 && (
                <div className="p-4 text-center text-muted-foreground text-sm">
                  No services found
                </div>
              )}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>
      <p className="text-xs text-muted-foreground">
        Optional: Link this task to a ME-NEXUS service type for enhanced workflow tracking
      </p>
    </div>
  );
}
