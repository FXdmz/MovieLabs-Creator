import { useState } from "react";
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
import { ChevronRight, ChevronDown, Calendar, Users, Package, Settings, Info, X, Plus } from "lucide-react";
import { TaskClassifier } from "./task-classifier";
import { v4 as uuidv4 } from "uuid";

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

function ReferenceList({
  label,
  placeholder,
  items,
  onAdd,
  onRemove,
  testId
}: {
  label: string;
  placeholder: string;
  items: string[];
  onAdd: (item: string) => void;
  onRemove: (index: number) => void;
  testId: string;
}) {
  const [inputValue, setInputValue] = useState("");

  const handleAdd = () => {
    if (inputValue.trim()) {
      onAdd(inputValue.trim());
      setInputValue("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          data-testid={`${testId}-input`}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAdd}
          data-testid={`${testId}-add`}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      {items.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {items.map((item, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="flex items-center gap-1 pr-1"
            >
              <span className="truncate max-w-[200px]">{item}</span>
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
  const [schedulingOpen, setSchedulingOpen] = useState(false);
  const [assetsOpen, setAssetsOpen] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);

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
      }]
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

  const scheduling = value.Context?.[0]?.scheduling || {};
  const inputAssets = value.Context?.[0]?.hasInputAssets || [];
  const outputAssets = value.Context?.[0]?.hasOutputAssets || [];
  const informs = value.Context?.[0]?.informs || [];
  const isInformedBy = value.Context?.[0]?.isInformedBy || [];

  const assetCount = inputAssets.length + outputAssets.length;
  const relationCount = informs.length + isInformedBy.length;

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
          badge={value?.workUnit?.participantRef ? "1 assigned" : undefined}
        />
        <CollapsibleContent className="pt-4 px-4 pb-4 border border-t-0 rounded-b-lg">
          <div>
            <Label htmlFor="participant-ref" className="text-sm font-medium mb-2 block">
              Assigned To (Participant Reference)
            </Label>
            <Input
              id="participant-ref"
              value={value?.workUnit?.participantRef || ''}
              onChange={(e) => {
                if (e.target.value) {
                  const workUnitId = value?.workUnit?.identifier?.[0]?.identifierValue || uuidv4();
                  updateField('workUnit', {
                    entityType: "WorkUnit",
                    schemaVersion: "https://movielabs.com/omc/json/schema/v2.8",
                    identifier: [{
                      identifierScope: "me-nexus",
                      identifierValue: workUnitId,
                      combinedForm: `me-nexus:${workUnitId}`
                    }],
                    participantRef: e.target.value
                  });
                } else {
                  updateField('workUnit', null);
                }
              }}
              placeholder="e.g., me-nexus:participant-uuid"
              data-testid="input-participant-ref"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Reference to a Participant entity (use identifier combinedForm)
            </p>
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
            assetCount + relationCount > 0
              ? `${assetCount} asset${assetCount !== 1 ? 's' : ''}, ${relationCount} link${relationCount !== 1 ? 's' : ''}`
              : undefined
          }
        />
        <CollapsibleContent className="pt-4 px-4 pb-4 border border-t-0 rounded-b-lg space-y-4">
          <ReferenceList
            label="Input Assets (what this task needs)"
            placeholder="me-nexus:asset-uuid"
            items={inputAssets}
            onAdd={(item) => addToContextArray('hasInputAssets', item)}
            onRemove={(index) => removeFromContextArray('hasInputAssets', index)}
            testId="input-assets"
          />
          
          <ReferenceList
            label="Output Assets (what this task produces)"
            placeholder="me-nexus:asset-uuid"
            items={outputAssets}
            onAdd={(item) => addToContextArray('hasOutputAssets', item)}
            onRemove={(index) => removeFromContextArray('hasOutputAssets', index)}
            testId="output-assets"
          />
          
          <div className="border-t pt-4">
            <ReferenceList
              label="This task informs (sends info to)"
              placeholder="me-nexus:task-uuid"
              items={informs}
              onAdd={(item) => addToContextArray('informs', item)}
              onRemove={(index) => removeFromContextArray('informs', index)}
              testId="informs"
            />
          </div>
          
          <ReferenceList
            label="This task is informed by (receives info from)"
            placeholder="me-nexus:task-uuid"
            items={isInformedBy}
            onAdd={(item) => addToContextArray('isInformedBy', item)}
            onRemove={(index) => removeFromContextArray('isInformedBy', index)}
            testId="is-informed-by"
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
