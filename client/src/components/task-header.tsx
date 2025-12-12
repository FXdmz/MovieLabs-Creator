import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ServiceSelector } from "./service-selector";

interface TaskHeaderProps {
  value?: any;
  onChange?: (newValue: any) => void;
}

export function TaskHeader({ value, onChange }: TaskHeaderProps) {
  return (
    <div className="mb-8 p-6 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl border border-primary/20">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-primary/10 rounded-lg">
          <svg 
            viewBox="1.899 2.2 199.771 141.894" 
            xmlns="http://www.w3.org/2000/svg"
            width="48" 
            height="34" 
            className="text-primary"
          >
            <path 
              d="M 10.465 7.129 L 60.101 12.194 C 67.426 12.944 74.756 13.631 82.092 14.257 L 132.806 18.567 C 140.149 19.189 147.477 19.966 154.788 20.896 L 181.355 24.285 C 187.614 25.086 192.305 30.408 192.314 36.717 L 192.36 108.639 C 192.366 114.919 187.62 120.185 181.374 120.832 L 19.167 137.749 C 13.34 138.339 8.303 133.714 8.393 127.858 L 8.743 107.755 L 10.465 7.129 Z" 
              strokeWidth="4" 
              fill="currentColor" 
              stroke="currentColor"
            />
          </svg>
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2">
            <svg 
              viewBox="1.899 2.2 199.771 141.894" 
              xmlns="http://www.w3.org/2000/svg"
              width="24" 
              height="17" 
              className="text-primary"
            >
              <path 
                d="M 10.465 7.129 L 60.101 12.194 C 67.426 12.944 74.756 13.631 82.092 14.257 L 132.806 18.567 C 140.149 19.189 147.477 19.966 154.788 20.896 L 181.355 24.285 C 187.614 25.086 192.305 30.408 192.314 36.717 L 192.36 108.639 C 192.366 114.919 187.62 120.185 181.374 120.832 L 19.167 137.749 C 13.34 138.339 8.303 133.714 8.393 127.858 L 8.743 107.755 L 10.465 7.129 Z" 
                strokeWidth="4" 
                fill="currentColor" 
                stroke="currentColor"
              />
            </svg>
            Task
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            <strong>A piece of work to be done and completed as a step in the production process.</strong> Tasks 
            are carried out by Participants; can take Assets as input and produce them as output; most 
            Tasks require Context to be carried out properly; and some Tasks require particular 
            pieces of Infrastructure. Tasks can be composed of other Tasks for appropriate granularity.
          </p>
          
          {onChange && (
            <div className="grid grid-cols-1 gap-4 mb-4">
              <div>
                <Label htmlFor="task-name" className="text-sm font-medium mb-2 block">
                  Task Name
                </Label>
                <Input
                  id="task-name"
                  value={value?.name || ''}
                  onChange={(e) => onChange({ ...value, name: e.target.value })}
                  placeholder="e.g., Color Grading, VFX Compositing"
                  data-testid="input-task-name"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  A friendly name for this task
                </p>
              </div>
              
              <div>
                <Label htmlFor="task-description" className="text-sm font-medium mb-2 block">
                  Description
                </Label>
                <Textarea
                  id="task-description"
                  value={value?.description || ''}
                  onChange={(e) => onChange({ ...value, description: e.target.value })}
                  placeholder="Describe what this task involves..."
                  rows={3}
                  data-testid="input-task-description"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Additional details about this task
                </p>
              </div>
              
              <ServiceSelector
                value={value?.meNexusService}
                onChange={(service) => onChange({ ...value, meNexusService: service })}
              />
            </div>
          )}
          
          <div className="flex flex-wrap gap-2">
            <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">OMC v2.8</span>
            <span className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded-full">MovieLabs Ontology</span>
          </div>
        </div>
      </div>
    </div>
  );
}
