import { useState, useEffect, useMemo } from "react";
import { useOntologyStore } from "@/lib/store";
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
  CheckCircle,
  AlertTriangle,
  Upload
} from "lucide-react";

import { FileDropZone } from "@/components/file-drop-zone";
import { ExtractedMetadata } from "@/lib/file-metadata";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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

const LocationIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 46" className={className} fill="currentColor">
    <g>
      <path d="M25,10a6,6,0,1,0,6,6A6,6,0,0,0,25,10Zm0,10a4,4,0,1,1,4-4A4,4,0,0,1,25,20Z" transform="translate(-11 -2)"/>
      <path d="M25,2A14,14,0,0,0,11,16c0,9,14,32,14,32S39,25,39,16A14,14,0,0,0,25,2ZM13,16a12,12,0,0,1,24,0c0,6-7.55,20.37-12,28.07C20.55,36.37,13,22,13,16Z" transform="translate(-11 -2)"/>
    </g>
  </svg>
);

const InfrastructureIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 264.57 149.92" xmlns="http://www.w3.org/2000/svg" className={className} fill="currentColor">
    <path d="M 207.698 5.208 C 234.978 5.208 257.087 36.529 257.087 75.167 C 257.087 113.805 234.968 145.126 207.698 145.126 L 59.538 145.126 C 32.286 145.126 10.167 113.805 10.167 75.167 C 10.167 36.529 32.286 5.208 59.538 5.208 L 207.698 5.208 Z" strokeWidth="4" stroke="currentColor"/>
  </svg>
);

const getEntityIcon = (entityType: string) => {
  if (entityType === 'Location' || entityType === 'ProductionLocation' || entityType === 'NarrativeLocation') {
    return <LocationIcon className="h-3.5 w-3.5" />;
  }
  if (entityType === 'Infrastructure') {
    return <InfrastructureIcon className="h-3.5 w-3.5" />;
  }
  return <Database className="h-3.5 w-3.5" />;
};

export default function Dashboard() {
  const { entities, addEntity, addEntityFromContent, selectedEntityId, selectEntity, updateEntity, removeEntity, exportJson } = useOntologyStore();
  const [schema, setSchema] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [validationErrors, setValidationErrors] = useState<any[] | null>(null);
  const [showValidationDialog, setShowValidationDialog] = useState(false);
  const [showFileDropZone, setShowFileDropZone] = useState(false);
  const { toast } = useToast();

  const handleFileAssetCreated = (asset: any, metadata: ExtractedMetadata) => {
    const id = asset.identifier[0].identifierValue;
    addEntityFromContent('Asset', id, asset);
    setShowFileDropZone(false);
    toast({
      title: "Asset Created",
      description: `Created Asset from "${metadata.fileName}" with detected structural type: ${metadata.structuralType || 'unknown'}`,
    });
  };

  const ajv = useMemo(() => {
    const ajvInstance = new Ajv({ strict: false, allErrors: true });
    addFormats(ajvInstance);
    return ajvInstance;
  }, []);

  useEffect(() => {
    fetch("/schema.json?v=2.8&t=" + Date.now())
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
      // Improved validation logic:
      // OMC Schema structure: $defs[Type].properties[Type] contains the actual entity schema
      // First try the nested path: $defs.Asset.properties.Asset
      let entitySchema = schema.$defs?.[selectedEntity.type]?.properties?.[selectedEntity.type];
      
      // Fallback: try direct definition (for simpler schemas)
      if (!entitySchema) {
         entitySchema = schema.$defs?.[selectedEntity.type];
      }
      
      // Fallback searches for nested definitions in MediaCreationContext, Utility, Participant
      if (!entitySchema) {
         entitySchema = schema.$defs?.MediaCreationContext?.properties?.[selectedEntity.type];
      }
      if (!entitySchema) {
         entitySchema = schema.$defs?.Utility?.properties?.[selectedEntity.type];
      }
      if (!entitySchema) {
         entitySchema = schema.$defs?.Participant?.properties?.[selectedEntity.type];
      }
      
      // If we found a specific schema, wrap it in a standalone schema object for AJV
      // We need to keep the $defs from the root so references work
      const schemaToValidate = entitySchema ? {
        ...entitySchema,
        $defs: schema.$defs
      } : schema; // Fallback to full schema if specific one not found

      console.log("Validating against schema for:", selectedEntity.type);

      const validate = ajv.compile(schemaToValidate);
      const valid = validate(selectedEntity.content);

      if (valid) {
        toast({
          title: "Validation Successful",
          description: "This entity conforms to the OMC v2.8 Schema.",
          variant: "default",
          className: "bg-green-600 text-white border-none"
        });
        setValidationErrors(null);
      } else {
        console.error("Validation errors:", validate.errors);
        setValidationErrors(validate.errors || []);
        setShowValidationDialog(true);
      }
    } catch (e: any) {
      console.error("Validation exception:", e);
      toast({
        title: "Validation Error",
        description: e.message || "An error occurred during validation.",
        variant: "destructive",
      });
    }
  };

  const copyErrorsToClipboard = () => {
    if (!validationErrors) return;
    const text = JSON.stringify(validationErrors, null, 2);
    
    const fallbackCopy = (text: string) => {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        toast({
          title: "Copied",
          description: "Error messages copied to clipboard.",
        });
      } catch (err) {
        console.error('Fallback copy failed', err);
        toast({
          title: "Copy Failed",
          description: "Could not copy text. Please select and copy manually.",
          variant: "destructive"
        });
      }
      document.body.removeChild(textArea);
    };

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text)
        .then(() => {
          toast({
            title: "Copied",
            description: "Error messages copied to clipboard.",
          });
        })
        .catch(() => fallbackCopy(text));
    } else {
      fallbackCopy(text);
    }
  };

  const handleExport = () => {
    const json = exportJson();
    const blob = new Blob([JSON.stringify(json, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const fileName = selectedEntity 
      ? `${selectedEntity.name.replace(/[^a-zA-Z0-9-_]/g, '_')}.json`
      : "omc-ontology.json";
    a.download = fileName;
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
                  {getEntityIcon(entity.type)}
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
              <DropdownMenuItem onClick={() => { selectEntity(null); setShowFileDropZone(true); }} className="text-primary font-medium">
                <Upload className="h-4 w-4 mr-2" /> Import Asset from File
              </DropdownMenuItem>
              <Separator className="my-1" />
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
                      {Array.isArray(selectedEntity.content.identifier) 
                        ? selectedEntity.content.identifier[0]?.combinedForm || selectedEntity.content.identifier[0]?.identifierValue || 'No ID'
                        : selectedEntity.content.identifier || 'No ID'}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                 
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
              
              <div className="h-8 border-t border-border bg-card flex items-center justify-between px-4 text-[10px] text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                  <span>OMC v2.8 Schema Active</span>
                </div>
                <div className="font-mono opacity-50">ID: {selectedEntity.id}</div>
              </div>
            </div>
          </>
        ) : showFileDropZone ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 bg-muted/5">
            <div className="w-full max-w-xl">
              <h2 className="text-2xl font-bold mb-2 text-foreground text-center">Import Asset from File</h2>
              <p className="text-center text-muted-foreground mb-6">
                Drop a media file to automatically detect its structural type and properties.
              </p>
              <FileDropZone 
                onAssetCreated={handleFileAssetCreated}
                onCancel={() => setShowFileDropZone(false)}
              />
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 bg-muted/5">
            <div className="w-32 h-32 rounded-full bg-primary/5 flex items-center justify-center mb-6 ring-1 ring-primary/20">
              <Logo variant="mark" className="scale-150" />
            </div>
            <h2 className="text-2xl font-bold mb-3 text-foreground">Welcome to ME-DMZ</h2>
            <p className="max-w-md text-center text-muted-foreground mb-8 text-base">
              Select an entity from the sidebar or create a new one to start building your media creation ontology.
            </p>
            <div className="flex gap-4">
              <Button onClick={() => setShowFileDropZone(true)} variant="outline" size="lg" className="gap-2">
                <Upload className="h-5 w-5" /> Import from File
              </Button>
              <Button onClick={() => addEntity("Asset")} size="lg" className="gap-2 shadow-lg shadow-primary/20">
                <Plus className="h-5 w-5" /> Create Asset
              </Button>
            </div>
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
              The following errors were found in your entity data against the OMC v2.8 schema.
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
