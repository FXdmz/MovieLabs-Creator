import { useState, useEffect, useMemo, useRef } from "react";
import { useLocation } from "wouter";
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

const TaskIcon = ({ className }: { className?: string }) => (
  <svg viewBox="1.899 2.2 199.771 141.894" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M 10.465 7.129 L 60.101 12.194 C 67.426 12.944 74.756 13.631 82.092 14.257 L 132.806 18.567 C 140.149 19.189 147.477 19.966 154.788 20.896 L 181.355 24.285 C 187.614 25.086 192.305 30.408 192.314 36.717 L 192.36 108.639 C 192.366 114.919 187.62 120.185 181.374 120.832 L 19.167 137.749 C 13.34 138.339 8.303 133.714 8.393 127.858 L 8.743 107.755 L 10.465 7.129 Z" strokeWidth="4" fill="currentColor" stroke="currentColor"/>
  </svg>
);

const ParticipantIcon = ({ className }: { className?: string }) => (
  <svg viewBox="1620.35 1648.8 159.848 148.03" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M 1627.367 1731.241 C 1624.541 1726.171 1624.541 1720 1627.367 1714.93 L 1656.794 1662.124 C 1659.602 1657.091 1664.914 1653.972 1670.677 1653.974 L 1729.057 1653.974 C 1734.822 1653.974 1740.135 1657.097 1742.94 1662.134 L 1772.368 1714.93 C 1775.19 1719.997 1775.19 1726.164 1772.368 1731.231 L 1742.94 1784.018 C 1740.135 1789.055 1734.822 1792.178 1729.057 1792.178 L 1670.668 1792.178 C 1664.906 1792.175 1659.597 1789.052 1656.794 1784.018 L 1627.367 1731.241 Z" stroke="currentColor" strokeWidth="4" fill="currentColor" />
  </svg>
);

const ContextIcon = ({ className }: { className?: string }) => (
  <svg viewBox="1375.27 1509.47 150 150" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path 
      d="M 1517.343 1583.172 C 1517.343 1621.099 1486.602 1651.831 1448.684 1651.831 C 1410.767 1651.831 1380.026 1621.099 1380.026 1583.172 C 1380.026 1545.255 1410.767 1514.514 1448.684 1514.514 C 1486.602 1514.514 1517.343 1545.255 1517.343 1583.172 Z" 
      strokeWidth="4" 
      stroke="currentColor"
      fill="currentColor"
    />
  </svg>
);

const AssetIcon = ({ className }: { className?: string }) => (
  <svg viewBox="1545.36 1648.8 149.92 149.93" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path 
      d="M 1550.154 1666.405 C 1550.154 1660.29 1555.112 1655.332 1561.228 1655.332 L 1677.428 1655.332 C 1683.543 1655.332 1688.501 1660.29 1688.501 1666.405 L 1688.501 1782.614 C 1688.501 1788.73 1683.543 1793.688 1677.428 1793.688 L 1561.228 1793.688 C 1555.112 1793.688 1550.154 1788.73 1550.154 1782.614 L 1550.154 1666.405 Z" 
      stroke="currentColor" 
      strokeWidth="4" 
      fill="currentColor"
    />
  </svg>
);

const getEntityIcon = (entityType: string) => {
  if (entityType === 'Location' || entityType === 'ProductionLocation' || entityType === 'NarrativeLocation') {
    return <LocationIcon className="h-3.5 w-3.5" />;
  }
  if (entityType === 'Infrastructure') {
    return <InfrastructureIcon className="h-3.5 w-3.5" />;
  }
  if (entityType === 'Task') {
    return <TaskIcon className="h-3.5 w-3.5" />;
  }
  if (entityType === 'Participant') {
    return <ParticipantIcon className="h-3.5 w-3.5" />;
  }
  if (entityType === 'Context') {
    return <ContextIcon className="h-3.5 w-3.5" />;
  }
  if (entityType === 'Asset') {
    return <AssetIcon className="h-3.5 w-3.5" />;
  }
  return <Database className="h-3.5 w-3.5" />;
};

export default function Dashboard() {
  const { entities, addEntity, addEntityFromContent, selectedEntityId, selectEntity, updateEntity, removeEntity, exportJson } = useOntologyStore();
  const [location, setLocation] = useLocation();
  const [schema, setSchema] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [validationErrors, setValidationErrors] = useState<any[] | null>(null);
  const [showValidationDialog, setShowValidationDialog] = useState(false);
  const [showFileDropZone, setShowFileDropZone] = useState(false);
  const hasHandledCreate = useRef(false);
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

  // Handle ?create= URL parameter from intro page
  useEffect(() => {
    if (hasHandledCreate.current) return;
    
    const params = new URLSearchParams(window.location.search);
    const createType = params.get('create');
    
    if (createType && ENTITY_TYPES.includes(createType as EntityType)) {
      hasHandledCreate.current = true;
      addEntity(createType as EntityType);
      // Clean up URL
      setLocation('/builder', { replace: true });
    }
  }, [addEntity, setLocation]);

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
              <Logo className="h-16 w-auto" />
            </div>
            <h2 className="text-2xl font-bold mb-3 text-foreground">Welcome to OMC Builder</h2>
            <p className="max-w-md text-center text-muted-foreground mb-8 text-base">
              Select an entity from the sidebar or create a new one to start building your media creation ontology.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button onClick={() => addEntity("Task")} variant="outline" size="lg" className="gap-2">
                <TaskIcon className="h-4 w-4" /> Create Task
              </Button>
              <Button onClick={() => addEntity("Participant")} variant="outline" size="lg" className="gap-2">
                <ParticipantIcon className="h-4 w-4" /> Create Participant
              </Button>
              <Button onClick={() => addEntity("Asset")} variant="outline" size="lg" className="gap-2">
                <AssetIcon className="h-4 w-4" /> Create Asset
              </Button>
              <Button onClick={() => addEntity("Infrastructure")} variant="outline" size="lg" className="gap-2">
                <InfrastructureIcon className="h-4 w-4" /> Create Infrastructure
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
