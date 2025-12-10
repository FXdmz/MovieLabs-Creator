import { useState, useEffect, useMemo } from "react";
import { useOntologyStore } from "@/lib/store";
import { JsonEditor } from "@/components/json-editor";
import { DynamicForm } from "@/components/dynamic-form";
import { Logo } from "@/components/logo";
import { ENTITY_TYPES, EntityType } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import { 
  Plus, 
  FileJson, 
  Trash2, 
  Settings, 
  Search, 
  Code, 
  Layout, 
  Database,
  ChevronRight,
  Save,
  Download,
  FormInput,
  Braces,
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Copy } from "lucide-react";

export default function Dashboard() {
  const { entities, addEntity, selectedEntityId, selectEntity, updateEntity, removeEntity, exportJson } = useOntologyStore();
  const [schema, setSchema] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"form" | "json">("form");
  const [validationErrors, setValidationErrors] = useState<any[] | null>(null);
  const [showValidationDialog, setShowValidationDialog] = useState(false);
  const { toast } = useToast();

  const ajv = useMemo(() => {
    const ajvInstance = new Ajv({ strict: false, allErrors: true });
    addFormats(ajvInstance);
    return ajvInstance;
  }, []);

  useEffect(() => {
    fetch("/schema.json")
      .then((res) => res.json())
      .then((data) => setSchema(data));
  }, []);

  const selectedEntity = entities.find((e) => e.id === selectedEntityId);

  const filteredEntities = entities.filter(e => 
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    e.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleValidate = () => {
    if (!schema || !selectedEntity) return;

    try {
      const validate = ajv.compile(schema);
      const valid = validate(selectedEntity.content);

      if (valid) {
        toast({
          title: "Validation Successful",
          description: "This entity conforms to the OMC v2.6 Schema.",
          variant: "default",
          className: "bg-green-600 text-white border-none"
        });
        setValidationErrors(null);
      } else {
        console.error("Validation errors:", validate.errors);
        setValidationErrors(validate.errors);
        setShowValidationDialog(true);
      }
    } catch (e) {
      console.error("Validation exception:", e);
      toast({
        title: "Validation Error",
        description: "An error occurred during validation.",
        variant: "destructive",
      });
    }
  };

  const copyErrorsToClipboard = () => {
    if (!validationErrors) return;
    const text = JSON.stringify(validationErrors, null, 2);
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Error messages copied to clipboard.",
    });
  };

  const handleExport = () => {
    const json = exportJson();
    const blob = new Blob([JSON.stringify(json, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "omc-ontology.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-80 border-r border-sidebar-border bg-sidebar flex flex-col">
        <div className="p-4 border-b border-sidebar-border">
          <div className="mb-6">
            <Logo />
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-sidebar-primary/50" />
            <Input
              placeholder="Search entities..."
              className="pl-9 bg-sidebar-accent/50 border-sidebar-border text-sidebar-foreground placeholder:text-sidebar-foreground/40 focus-visible:ring-sidebar-ring"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <ScrollArea className="flex-1 px-2 py-2">
          <div className="space-y-1">
            {filteredEntities.map((entity) => (
              <button
                key={entity.id}
                onClick={() => selectEntity(entity.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                  selectedEntityId === entity.id
                    ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium shadow-sm"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                }`}
              >
                <div className={`p-1.5 rounded-sm ${selectedEntityId === entity.id ? 'bg-sidebar-primary-foreground/10' : 'bg-sidebar-accent/50'}`}>
                  <Database className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 text-left truncate">
                  <div className="truncate">{entity.name}</div>
                  <div className="text-[10px] uppercase tracking-wider opacity-70">{entity.type}</div>
                </div>
                {selectedEntityId === entity.id && (
                  <ChevronRight className="h-3 w-3 opacity-50" />
                )}
              </button>
            ))}
            {filteredEntities.length === 0 && entities.length > 0 && (
              <div className="px-4 py-8 text-center text-sidebar-foreground/50 text-sm">
                No entities found
              </div>
            )}
            {entities.length === 0 && (
              <div className="px-4 py-12 text-center text-sidebar-foreground/50 text-sm">
                <div className="w-12 h-12 rounded-full bg-sidebar-accent/50 flex items-center justify-center mx-auto mb-3">
                   <Database className="h-6 w-6 opacity-50" />
                </div>
                <p className="mb-2 font-medium">No entities yet</p>
                <p className="text-xs opacity-70">Create your first entity to get started</p>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-sidebar-border bg-sidebar-accent/10">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="w-full gap-2 bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 shadow-md border-0" size="lg">
                <Plus className="h-4 w-4" /> Add Entity
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64 max-h-96 overflow-y-auto">
              {ENTITY_TYPES.map((type) => (
                <DropdownMenuItem key={type} onClick={() => addEntity(type)}>
                  {type}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-background">
        {selectedEntity ? (
          <>
            {/* Toolbar */}
            <div className="h-16 border-b border-border flex items-center justify-between px-6 bg-card/50 backdrop-blur-sm">
              <div className="flex items-center gap-4">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-widest mb-0.5">
                    {selectedEntity.type}
                  </span>
                  <div className="flex items-center gap-3">
                    <Input 
                      value={selectedEntity.name} 
                      onChange={(e) => updateEntity(selectedEntity.id, { ...selectedEntity.content, name: e.target.value })}
                      className="h-8 text-lg font-bold border-transparent hover:border-border focus:border-input px-0 bg-transparent w-[300px]"
                    />
                    <Badge variant="outline" className="font-mono text-[10px] h-5 bg-muted/50">
                      {selectedEntity.content.identifier}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                 <ToggleGroup type="single" value={viewMode} onValueChange={(v) => v && setViewMode(v as any)} className="border border-border rounded-md p-0.5 bg-card">
                   <ToggleGroupItem value="form" size="sm" className="h-7 px-3 text-xs gap-1.5 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                     <FormInput className="h-3.5 w-3.5" /> Form
                   </ToggleGroupItem>
                   <ToggleGroupItem value="json" size="sm" className="h-7 px-3 text-xs gap-1.5 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                     <Braces className="h-3.5 w-3.5" /> JSON
                   </ToggleGroupItem>
                 </ToggleGroup>

                <Separator orientation="vertical" className="h-6" />

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={() => removeEntity(selectedEntity.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Delete Entity</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <Button variant="outline" size="sm" onClick={handleValidate} className="gap-2 border-green-600/20 text-green-600 hover:bg-green-600/10">
                  <CheckCircle className="h-4 w-4" /> Validate
                </Button>
                
                <Button variant="outline" size="sm" onClick={handleExport} className="gap-2 border-primary/20 text-primary hover:bg-primary/5">
                  <Download className="h-4 w-4" /> Export
                </Button>
              </div>
            </div>

            {/* Editor Area */}
            <div className="flex-1 overflow-hidden flex flex-col bg-muted/10">
              {viewMode === 'form' ? (
                <ScrollArea className="flex-1 p-6">
                  <div className="max-w-4xl mx-auto pb-20">
                    <div className="bg-card border border-border rounded-xl shadow-sm p-6">
                      {schema ? (
                         <DynamicForm 
                           schema={schema}
                           value={selectedEntity.content}
                           onChange={(val) => updateEntity(selectedEntity.id, val)}
                         />
                      ) : (
                        <div className="flex items-center justify-center p-12">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                      )}
                    </div>
                  </div>
                </ScrollArea>
              ) : (
                <div className="flex-1 p-0 relative">
                  {schema ? (
                    <JsonEditor
                      value={selectedEntity.content}
                      onChange={(val) => updateEntity(selectedEntity.id, val)}
                      schema={schema}
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                      Loading Schema...
                    </div>
                  )}
                </div>
              )}
              
              <div className="h-8 border-t border-border bg-card flex items-center justify-between px-4 text-[10px] text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                  <span>OMC v2.6 Schema Active</span>
                </div>
                <div className="font-mono opacity-50">ID: {selectedEntity.id}</div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 bg-muted/5">
            <div className="w-32 h-32 rounded-full bg-primary/5 flex items-center justify-center mb-6 ring-1 ring-primary/20">
              <Logo variant="mark" className="scale-150" />
            </div>
            <h2 className="text-2xl font-bold mb-3 text-foreground">Welcome to ME-DMZ</h2>
            <p className="max-w-md text-center text-muted-foreground mb-8 text-base">
              Select an entity from the sidebar or create a new one to start building your media creation ontology.
            </p>
            <Button onClick={() => addEntity("Asset")} size="lg" className="gap-2 shadow-lg shadow-primary/20">
              <Plus className="h-5 w-5" /> Create First Asset
            </Button>
          </div>
        )}
      </main>

      <Dialog open={showValidationDialog} onOpenChange={setShowValidationDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Validation Failed
            </DialogTitle>
            <DialogDescription>
              The following errors were found in your entity data against the OMC v2.6 schema.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-auto border rounded-md bg-muted/50 p-4 font-mono text-xs">
            <pre className="whitespace-pre-wrap break-all">
              {validationErrors ? JSON.stringify(validationErrors, null, 2) : "No details available."}
            </pre>
          </div>

          <DialogFooter className="sm:justify-between gap-2">
            <div className="text-xs text-muted-foreground self-center">
              {validationErrors?.length} error(s) found
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowValidationDialog(false)}>
                Close
              </Button>
              <Button onClick={copyErrorsToClipboard} className="gap-2">
                <Copy className="h-4 w-4" /> Copy Errors
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
