/**
 * @fileoverview Comprehensive Task entity form component.
 * Provides full editing capabilities for OMC Task entities including:
 * 
 * @features
 * - Basic info: name, description
 * - ME-NEXUS classification via TaskClassifier
 * - Task state and status tracking
 * - Participant assignment via entity lookup
 * - Creative Work linking with auto-Context creation
 * - Scheduling (start/end dates, scheduled vs actual)
 * - Input/output Asset relationships
 * - Task dependencies (informs/isInformedBy)
 * - Infrastructure references via Context
 * 
 * @exports TaskForm - Full Task entity editing form
 */

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronRight, ChevronDown, Calendar, Users, Package, Settings, Info, X, Plus, Check, ChevronsUpDown, Search, FileBox, ListTodo, Film, Server } from "lucide-react";
import { TaskClassifier } from "./task-classifier";
import { useOntologyStore } from "@/lib/store";
import { v4 as uuidv4 } from "uuid";
import { cn } from "@/lib/utils";

/** Props for TaskForm component */
interface TaskFormProps {
  value: any;
  onChange: (newValue: any) => void;
}

const TASK_STATES = [
  { value: "assigned", label: "Assigned" },
  { value: "in_process", label: "In Process" },
  { value: "waiting", label: "Waiting" },
  { value: "complete", label: "Complete" },
];

function SectionHeader({ 
  title, 
  icon: Icon, 
  isOpen, 
  onToggle, 
  badge 
}: { 
  title: string; 
  icon: React.ElementType; 
  isOpen: boolean; 
  onToggle: () => void;
  badge?: string;
}) {
  return (
    <CollapsibleTrigger asChild onClick={onToggle}>
      <button className="w-full flex items-center gap-2 p-3 bg-muted/50 hover:bg-muted rounded-lg transition-colors text-left">
        {isOpen ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
        <Icon className="h-4 w-4 text-primary" />
        <span className="font-medium text-sm">{title}</span>
        {badge && (
          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
            {badge}
          </span>
        )}
        <span className="text-xs text-muted-foreground ml-auto">(Optional)</span>
      </button>
    </CollapsibleTrigger>
  );
}

function EntityLookupList({
  label,
  entityType,
  icon: Icon,
  items,
  onAdd,
  onRemove,
  entities,
  testId,
  currentEntityId
}: {
  label: string;
  entityType: "Asset" | "Task" | "Infrastructure";
  icon: React.ElementType;
  items: string[];
  onAdd: (combinedForm: string) => void;
  onRemove: (index: number) => void;
  entities: any[];
  testId: string;
  currentEntityId?: string;
}) {
  const [open, setOpen] = useState(false);

  const availableEntities = useMemo(() => {
    return entities
      .filter((e) => e.type === entityType)
      .filter((e) => {
        const combinedForm = e.content?.identifier?.[0]?.combinedForm;
        if (currentEntityId && e.id === currentEntityId) return false;
        return combinedForm && !items.includes(combinedForm);
      });
  }, [entities, entityType, items, currentEntityId]);

  const getEntityName = (combinedForm: string) => {
    const entity = entities.find(
      (e) => e.content?.identifier?.[0]?.combinedForm === combinedForm
    );
    return entity?.name || combinedForm.slice(0, 30) + "...";
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between font-normal"
            data-testid={`${testId}-trigger`}
          >
            <span className="text-muted-foreground flex items-center gap-2">
              <Search className="h-4 w-4" />
              Search {entityType.toLowerCase()}s to add...
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start">
          <Command>
            <CommandInput placeholder={`Search ${entityType.toLowerCase()}s by name...`} />
            <CommandList>
              <CommandEmpty>
                <div className="py-6 text-center text-sm">
                  <Icon className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">No {entityType.toLowerCase()}s available.</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {availableEntities.length === 0 && entities.filter(e => e.type === entityType).length > 0
                      ? "All have been added already."
                      : `Create a ${entityType} entity first.`}
                  </p>
                </div>
              </CommandEmpty>
              <CommandGroup heading={`${entityType}s`}>
                {availableEntities.map((entity) => (
                  <CommandItem
                    key={entity.id}
                    value={entity.name}
                    onSelect={() => {
                      const combinedForm = entity.content?.identifier?.[0]?.combinedForm;
                      if (combinedForm) {
                        onAdd(combinedForm);
                      }
                      setOpen(false);
                    }}
                    data-testid={`${testId}-option-${entity.id}`}
                  >
                    <Icon className="mr-2 h-4 w-4 text-muted-foreground" />
                    <div className="flex flex-col">
                      <span className="font-medium">{entity.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {entity.content?.identifier?.[0]?.combinedForm?.slice(0, 40)}...
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {items.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {items.map((item, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="flex items-center gap-1 pr-1 py-1"
            >
              <Icon className="h-3 w-3 mr-1" />
              <span className="truncate max-w-[180px]">{getEntityName(item)}</span>
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="ml-1 hover:bg-destructive/20 rounded p-0.5"
                data-testid={`${testId}-remove-${index}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

export function TaskForm({ value, onChange }: TaskFormProps) {
  const [assignmentOpen, setAssignmentOpen] = useState(false);
  const [creativeWorkOpen, setCreativeWorkOpen] = useState(false);
  const [schedulingOpen, setSchedulingOpen] = useState(false);
  const [assetsOpen, setAssetsOpen] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [participantSearchOpen, setParticipantSearchOpen] = useState(false);
  const [creativeWorkSearchOpen, setCreativeWorkSearchOpen] = useState(false);

  const entities = useOntologyStore((state) => state.entities);
  
  const participants = useMemo(() => {
    return entities.filter((e) => e.type === "Participant");
  }, [entities]);

  const creativeWorks = useMemo(() => {
    return entities.filter((e) => e.type === "CreativeWork");
  }, [entities]);

  const selectedCreativeWork = useMemo(() => {
    const cwRefs = value?.Context?.[0]?.contributesTo?.CreativeWork;
    if (!cwRefs || cwRefs.length === 0) return null;
    const cwRef = cwRefs[0];
    return creativeWorks.find(
      (cw) => cw.content?.identifier?.[0]?.combinedForm === cwRef
    );
  }, [creativeWorks, value?.Context?.[0]?.contributesTo?.CreativeWork]);

  const selectedParticipant = useMemo(() => {
    const participantRef = value?.workUnit?.participantRef;
    if (!participantRef) return null;
    return participants.find(
      (p) => p.content?.identifier?.[0]?.combinedForm === participantRef
    );
  }, [participants, value?.workUnit?.participantRef]);

  const updateField = (field: string, fieldValue: any) => {
    onChange({ ...value, [field]: fieldValue });
  };

  const getOrCreateContextId = () => {
    if (value.Context?.[0]?.identifier?.[0]?.identifierValue) {
      return value.Context[0].identifier[0].identifierValue;
    }
    return uuidv4();
  };

  const updateContext = (updates: any) => {
    const contextId = getOrCreateContextId();
    const existingContext = value.Context?.[0] || {
      entityType: "Context",
      schemaVersion: "https://movielabs.com/omc/json/schema/v2.8",
      identifier: [{
        identifierScope: "me-nexus",
        identifierValue: contextId,
        combinedForm: `me-nexus:${contextId}`
      }],
      contextType: "production"
    };
    
    onChange({
      ...value,
      Context: [{
        ...existingContext,
        ...updates
      }]
    });
  };

  const updateScheduling = (field: string, fieldValue: string | null) => {
    const existingContext = value.Context?.[0] || {};
    const existingScheduling = existingContext.scheduling || {};
    
    updateContext({
      scheduling: {
        ...existingScheduling,
        [field]: fieldValue || null
      }
    });
  };

  const addToContextArray = (arrayName: string, item: string) => {
    const existingArray = value.Context?.[0]?.[arrayName] || [];
    if (!existingArray.includes(item)) {
      updateContext({ [arrayName]: [...existingArray, item] });
    }
  };

  const removeFromContextArray = (arrayName: string, index: number) => {
    const existingArray = value.Context?.[0]?.[arrayName] || [];
    const newArray = existingArray.filter((_: any, i: number) => i !== index);
    updateContext({ [arrayName]: newArray.length ? newArray : undefined });
  };

  const updateContributesTo = (creativeWorkRef: string | null) => {
    if (creativeWorkRef) {
      updateContext({
        contributesTo: {
          CreativeWork: [creativeWorkRef]
        }
      });
    } else {
      const existingContext = value.Context?.[0] || {};
      const { contributesTo, ...restContext } = existingContext;
      onChange({
        ...value,
        Context: [restContext]
      });
    }
  };

  const addToUsesInfrastructure = (infraRef: string) => {
    const existingUses = value.Context?.[0]?.uses || {};
    const existingInfra = existingUses.Infrastructure || [];
    if (!existingInfra.includes(infraRef)) {
      updateContext({
        uses: {
          ...existingUses,
          Infrastructure: [...existingInfra, infraRef]
        }
      });
    }
  };

  const removeFromUsesInfrastructure = (index: number) => {
    const existingUses = value.Context?.[0]?.uses || {};
    const existingInfra = existingUses.Infrastructure || [];
    const newInfra = existingInfra.filter((_: any, i: number) => i !== index);
    
    if (newInfra.length === 0) {
      const { Infrastructure, ...restUses } = existingUses;
      if (Object.keys(restUses).length === 0) {
        const existingContext = value.Context?.[0] || {};
        const { uses, ...restContext } = existingContext;
        onChange({
          ...value,
          Context: [restContext]
        });
      } else {
        updateContext({ uses: restUses });
      }
    } else {
      updateContext({
        uses: {
          ...existingUses,
          Infrastructure: newInfra
        }
      });
    }
  };

  const scheduling = value.Context?.[0]?.scheduling || {};
  const inputAssets = value.Context?.[0]?.hasInputAssets || [];
  const outputAssets = value.Context?.[0]?.hasOutputAssets || [];
  const informs = value.Context?.[0]?.informs || [];
  const isInformedBy = value.Context?.[0]?.isInformedBy || [];
  const usesInfrastructure = value.Context?.[0]?.uses?.Infrastructure || [];

  const assetCount = inputAssets.length + outputAssets.length;
  const relationCount = informs.length + isInformedBy.length;
  const infraCount = usesInfrastructure.length;

  return (
    <div className="space-y-6">
      <div className="p-4 bg-muted/30 rounded-lg border">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4">
          <Info className="h-4 w-4" />
          Basic Information
        </div>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="task-name" className="text-sm font-medium mb-2 block">
              Task Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="task-name"
              value={value?.name || ''}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder="e.g., Archive Movie, Color Grade Scene 5"
              data-testid="input-task-name"
            />
          </div>
          
          <div>
            <Label htmlFor="task-description" className="text-sm font-medium mb-2 block">
              Description
            </Label>
            <Textarea
              id="task-description"
              value={value?.description || ''}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="Describe what this task involves..."
              rows={3}
              data-testid="input-task-description"
            />
          </div>
        </div>
      </div>

      <TaskClassifier
        entityContent={value}
        onChange={onChange}
      />

      <div className="p-4 bg-muted/30 rounded-lg border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground uppercase tracking-wide">
            <Info className="h-4 w-4" />
            Status
          </div>
          <span className="text-xs text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 rounded">
            Internal use only
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium mb-2 block">
              State <span className="text-red-500">*</span>
            </Label>
            <Select
              value={value?.state || "assigned"}
              onValueChange={(val) => updateField('state', val)}
            >
              <SelectTrigger data-testid="select-task-state">
                <SelectValue placeholder="Select state..." />
              </SelectTrigger>
              <SelectContent>
                {TASK_STATES.map((state) => (
                  <SelectItem key={state.value} value={state.value}>
                    {state.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="state-details" className="text-sm font-medium mb-2 block">
              State Details
            </Label>
            <Input
              id="state-details"
              value={value?.stateDetails || ''}
              onChange={(e) => updateField('stateDetails', e.target.value)}
              placeholder="e.g., Waiting for approval"
              data-testid="input-state-details"
            />
          </div>
        </div>
      </div>

      <Collapsible open={assignmentOpen} onOpenChange={setAssignmentOpen}>
        <SectionHeader
          title="Assignment"
          icon={Users}
          isOpen={assignmentOpen}
          onToggle={() => setAssignmentOpen(!assignmentOpen)}
          badge={selectedParticipant ? "1 assigned" : undefined}
        />
        <CollapsibleContent className="pt-4 px-4 pb-4 border border-t-0 rounded-b-lg">
          <div>
            <Label className="text-sm font-medium mb-2 block">
              Assigned To
            </Label>
            <Popover open={participantSearchOpen} onOpenChange={setParticipantSearchOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={participantSearchOpen}
                  className="w-full justify-between font-normal"
                  data-testid="select-participant"
                >
                  {selectedParticipant ? (
                    <span className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      {selectedParticipant.name}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Search participants...</span>
                  )}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search by name..." />
                  <CommandList>
                    <CommandEmpty>
                      <div className="py-6 text-center text-sm">
                        <Users className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-50" />
                        <p className="text-muted-foreground">No participants found.</p>
                        <p className="text-xs text-muted-foreground mt-1">Create a Participant entity first.</p>
                      </div>
                    </CommandEmpty>
                    <CommandGroup heading="Participants">
                      {participants.map((participant) => (
                        <CommandItem
                          key={participant.id}
                          value={participant.name}
                          onSelect={() => {
                            const combinedForm = participant.content?.identifier?.[0]?.combinedForm;
                            if (combinedForm) {
                              const workUnitId = value?.workUnit?.identifier?.[0]?.identifierValue || uuidv4();
                              updateField('workUnit', {
                                entityType: "WorkUnit",
                                schemaVersion: "https://movielabs.com/omc/json/schema/v2.8",
                                identifier: [{
                                  identifierScope: "me-nexus",
                                  identifierValue: workUnitId,
                                  combinedForm: `me-nexus:${workUnitId}`
                                }],
                                participantRef: combinedForm
                              });
                            }
                            setParticipantSearchOpen(false);
                          }}
                          data-testid={`participant-option-${participant.id}`}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              value?.workUnit?.participantRef === participant.content?.identifier?.[0]?.combinedForm
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          <div className="flex flex-col">
                            <span className="font-medium">{participant.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {participant.content?.ParticipantSC?.structuralType || 'Participant'} • {participant.content?.identifier?.[0]?.combinedForm?.slice(0, 30)}...
                            </span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {selectedParticipant && (
              <div className="mt-2 flex items-center justify-between p-2 bg-muted/50 rounded-md">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-sm font-medium">{selectedParticipant.name}</p>
                    <p className="text-xs text-muted-foreground">{value?.workUnit?.participantRef}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => updateField('workUnit', null)}
                  data-testid="clear-participant"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            {!selectedParticipant && participants.length === 0 && (
              <p className="text-xs text-muted-foreground mt-2">
                No Participant entities exist yet. Create one first to assign to this task.
              </p>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Collapsible open={creativeWorkOpen} onOpenChange={setCreativeWorkOpen}>
        <SectionHeader
          title="Creative Work"
          icon={Film}
          isOpen={creativeWorkOpen}
          onToggle={() => setCreativeWorkOpen(!creativeWorkOpen)}
          badge={selectedCreativeWork ? "Linked" : undefined}
        />
        <CollapsibleContent className="pt-4 px-4 pb-4 border border-t-0 rounded-b-lg space-y-4">
          <div>
            <Label className="text-sm font-medium mb-2 block">
              Project / Production
            </Label>
            <p className="text-xs text-muted-foreground mb-3">
              The film or project this task contributes to.
            </p>
            <Popover open={creativeWorkSearchOpen} onOpenChange={setCreativeWorkSearchOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={creativeWorkSearchOpen}
                  className="w-full justify-between"
                  data-testid="select-creative-work"
                >
                  {selectedCreativeWork ? selectedCreativeWork.name : "Select a Creative Work..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search creative works..." />
                  <CommandList>
                    <CommandEmpty>No creative works found.</CommandEmpty>
                    <CommandGroup>
                      {creativeWorks.map((cw) => (
                        <CommandItem
                          key={cw.id}
                          value={cw.name}
                          onSelect={() => {
                            const combinedForm = cw.content?.identifier?.[0]?.combinedForm;
                            if (combinedForm) {
                              updateContributesTo(combinedForm);
                            }
                            setCreativeWorkSearchOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              value?.Context?.[0]?.contributesTo?.CreativeWork?.[0] === cw.content?.identifier?.[0]?.combinedForm
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          <div className="flex flex-col">
                            <span className="font-medium">{cw.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {cw.content?.creativeWorkCategory || 'CreativeWork'} • {cw.content?.identifier?.[0]?.combinedForm?.slice(0, 30)}...
                            </span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {selectedCreativeWork && (
              <div className="mt-2 flex items-center justify-between p-2 bg-muted/50 rounded-md">
                <div className="flex items-center gap-2">
                  <Film className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-sm font-medium">{selectedCreativeWork.name}</p>
                    <p className="text-xs text-muted-foreground">{value?.Context?.[0]?.contributesTo?.CreativeWork?.[0]}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => updateContributesTo(null)}
                  data-testid="clear-creative-work"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            {!selectedCreativeWork && creativeWorks.length === 0 && (
              <p className="text-xs text-muted-foreground mt-2">
                No Creative Work entities exist yet. Create one first to link to this task.
              </p>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Collapsible open={schedulingOpen} onOpenChange={setSchedulingOpen}>
        <SectionHeader
          title="Scheduling"
          icon={Calendar}
          isOpen={schedulingOpen}
          onToggle={() => setSchedulingOpen(!schedulingOpen)}
          badge={scheduling.scheduledStart || scheduling.scheduledEnd ? "Dates set" : undefined}
        />
        <CollapsibleContent className="pt-4 px-4 pb-4 border border-t-0 rounded-b-lg space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="scheduled-start" className="text-sm font-medium mb-2 block">
                Scheduled Start
              </Label>
              <Input
                id="scheduled-start"
                type="datetime-local"
                value={scheduling.scheduledStart?.slice(0, 16) || ''}
                onChange={(e) => {
                  const val = e.target.value ? new Date(e.target.value).toISOString() : null;
                  updateScheduling('scheduledStart', val);
                }}
                data-testid="input-scheduled-start"
              />
            </div>
            
            <div>
              <Label htmlFor="scheduled-end" className="text-sm font-medium mb-2 block">
                Scheduled End
              </Label>
              <Input
                id="scheduled-end"
                type="datetime-local"
                value={scheduling.scheduledEnd?.slice(0, 16) || ''}
                onChange={(e) => {
                  const val = e.target.value ? new Date(e.target.value).toISOString() : null;
                  updateScheduling('scheduledEnd', val);
                }}
                data-testid="input-scheduled-end"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="actual-start" className="text-sm font-medium mb-2 block">
                Actual Start
              </Label>
              <Input
                id="actual-start"
                type="datetime-local"
                value={scheduling.actualStart?.slice(0, 16) || ''}
                onChange={(e) => {
                  const val = e.target.value ? new Date(e.target.value).toISOString() : null;
                  updateScheduling('actualStart', val);
                }}
                data-testid="input-actual-start"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Filled when task starts
              </p>
            </div>
            
            <div>
              <Label htmlFor="actual-end" className="text-sm font-medium mb-2 block">
                Actual End
              </Label>
              <Input
                id="actual-end"
                type="datetime-local"
                value={scheduling.actualEnd?.slice(0, 16) || ''}
                onChange={(e) => {
                  const val = e.target.value ? new Date(e.target.value).toISOString() : null;
                  updateScheduling('actualEnd', val);
                }}
                data-testid="input-actual-end"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Filled when task completes
              </p>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Collapsible open={assetsOpen} onOpenChange={setAssetsOpen}>
        <SectionHeader
          title="Assets & Relationships"
          icon={Package}
          isOpen={assetsOpen}
          onToggle={() => setAssetsOpen(!assetsOpen)}
          badge={
            assetCount + relationCount + infraCount > 0
              ? `${assetCount} asset${assetCount !== 1 ? 's' : ''}, ${relationCount} link${relationCount !== 1 ? 's' : ''}${infraCount > 0 ? `, ${infraCount} infra` : ''}`
              : undefined
          }
        />
        <CollapsibleContent className="pt-4 px-4 pb-4 border border-t-0 rounded-b-lg space-y-4">
          <EntityLookupList
            label="Input Assets (what this task needs)"
            entityType="Asset"
            icon={FileBox}
            items={inputAssets}
            onAdd={(item) => addToContextArray('hasInputAssets', item)}
            onRemove={(index) => removeFromContextArray('hasInputAssets', index)}
            entities={entities}
            testId="input-assets"
          />
          
          <EntityLookupList
            label="Output Assets (what this task produces)"
            entityType="Asset"
            icon={FileBox}
            items={outputAssets}
            onAdd={(item) => addToContextArray('hasOutputAssets', item)}
            onRemove={(index) => removeFromContextArray('hasOutputAssets', index)}
            entities={entities}
            testId="output-assets"
          />

          <div className="border-t pt-4">
            <EntityLookupList
              label="Infrastructure (systems/services this task uses)"
              entityType="Infrastructure"
              icon={Server}
              items={usesInfrastructure}
              onAdd={addToUsesInfrastructure}
              onRemove={removeFromUsesInfrastructure}
              entities={entities}
              testId="uses-infrastructure"
            />
          </div>
          
          <div className="border-t pt-4">
            <EntityLookupList
              label="This task informs (sends info to)"
              entityType="Task"
              icon={ListTodo}
              items={informs}
              onAdd={(item) => addToContextArray('informs', item)}
              onRemove={(index) => removeFromContextArray('informs', index)}
              entities={entities}
              testId="informs"
              currentEntityId={value?.identifier?.[0]?.identifierValue}
            />
          </div>
          
          <EntityLookupList
            label="This task is informed by (receives info from)"
            entityType="Task"
            icon={ListTodo}
            items={isInformedBy}
            onAdd={(item) => addToContextArray('isInformedBy', item)}
            onRemove={(index) => removeFromContextArray('isInformedBy', index)}
            entities={entities}
            testId="is-informed-by"
            currentEntityId={value?.identifier?.[0]?.identifierValue}
          />
        </CollapsibleContent>
      </Collapsible>

      <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
        <SectionHeader
          title="Advanced"
          icon={Settings}
          isOpen={advancedOpen}
          onToggle={() => setAdvancedOpen(!advancedOpen)}
          badge={value?.taskGroup?.name || value?.customData ? "Configured" : undefined}
        />
        <CollapsibleContent className="pt-4 px-4 pb-4 border border-t-0 rounded-b-lg space-y-4">
          <div>
            <Label htmlFor="task-group-name" className="text-sm font-medium mb-2 block">
              Task Group Name
            </Label>
            <Input
              id="task-group-name"
              value={value?.taskGroup?.name || ''}
              onChange={(e) => {
                if (e.target.value) {
                  const taskGroupId = value?.taskGroup?.identifier?.[0]?.identifierValue || uuidv4();
                  updateField('taskGroup', {
                    entityType: "TaskGroup",
                    schemaVersion: "https://movielabs.com/omc/json/schema/v2.8",
                    identifier: [{
                      identifierScope: "me-nexus",
                      identifierValue: taskGroupId,
                      combinedForm: `me-nexus:${taskGroupId}`
                    }],
                    name: e.target.value,
                    taskComponents: value?.taskGroup?.taskComponents || []
                  });
                } else {
                  updateField('taskGroup', null);
                }
              }}
              placeholder="e.g., Post-Production Package"
              data-testid="input-task-group-name"
            />
            <p className="text-xs text-muted-foreground mt-1">
              If this task belongs to a larger task group
            </p>
          </div>
          
          <div>
            <Label htmlFor="custom-data" className="text-sm font-medium mb-2 block">
              Custom Data (JSON)
            </Label>
            <Textarea
              id="custom-data"
              value={value?.customData ? JSON.stringify(value.customData, null, 2) : ''}
              onChange={(e) => {
                try {
                  const parsed = e.target.value ? JSON.parse(e.target.value) : null;
                  updateField('customData', parsed);
                } catch {
                }
              }}
              placeholder={`{\n  "priority": "high",\n  "estimatedHours": 8\n}`}
              rows={6}
              className="font-mono text-sm"
              data-testid="input-custom-data"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Valid JSON only. Used for system-specific data.
            </p>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
