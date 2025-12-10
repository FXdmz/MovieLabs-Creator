import { useState, useEffect } from "react";
import { useOntologyStore } from "@/lib/store";
import { JsonEditor } from "@/components/json-editor";
import { ENTITY_TYPES, EntityType } from "@/lib/constants";
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
  Download
} from "lucide-react";
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

export default function Dashboard() {
  const { entities, addEntity, selectedEntityId, selectEntity, updateEntity, removeEntity, exportJson } = useOntologyStore();
  const [schema, setSchema] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

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
      <aside className="w-80 border-r border-border bg-sidebar flex flex-col">
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold">
              OMC
            </div>
            <h1 className="font-bold text-lg tracking-tight">Ontology Builder</h1>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search entities..."
              className="pl-9 bg-sidebar-accent/50 border-sidebar-border focus-visible:ring-sidebar-ring"
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
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
                }`}
              >
                <Database className="h-4 w-4 shrink-0 opacity-70" />
                <div className="flex-1 text-left truncate">
                  <div className="truncate">{entity.name}</div>
                  <div className="text-xs opacity-60 font-mono">{entity.type}</div>
                </div>
                {selectedEntityId === entity.id && (
                  <ChevronRight className="h-3 w-3 opacity-50" />
                )}
              </button>
            ))}
            {filteredEntities.length === 0 && entities.length > 0 && (
              <div className="px-4 py-8 text-center text-muted-foreground text-sm">
                No entities found
              </div>
            )}
            {entities.length === 0 && (
              <div className="px-4 py-12 text-center text-muted-foreground text-sm">
                <p className="mb-2">No entities yet</p>
                <p className="text-xs opacity-70">Create your first entity to get started</p>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-sidebar-border">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="w-full gap-2" size="lg">
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
                  <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                    {selectedEntity.type}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-lg">{selectedEntity.name}</span>
                    <Badge variant="outline" className="font-mono text-[10px] h-5">
                      {selectedEntity.content.identifier}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
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
                <Separator orientation="vertical" className="h-6" />
                <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
                  <Download className="h-4 w-4" /> Export JSON
                </Button>
              </div>
            </div>

            {/* Editor Area */}
            <div className="flex-1 p-6 overflow-hidden flex flex-col gap-4">
              <div className="flex-1 rounded-xl overflow-hidden border border-border shadow-sm">
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
              <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span>Schema Validated</span>
                </div>
                <div className="font-mono">OMC Schema v2.6</div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8">
            <div className="w-24 h-24 rounded-full bg-muted/50 flex items-center justify-center mb-6">
              <Layout className="h-10 w-10 opacity-50" />
            </div>
            <h2 className="text-xl font-semibold mb-2 text-foreground">Select an entity to edit</h2>
            <p className="max-w-md text-center text-sm mb-8 opacity-80">
              Select an entity from the sidebar or create a new one to start building your ontology.
            </p>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Plus className="h-4 w-4" /> Create New Entity
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-64 max-h-96 overflow-y-auto">
                {ENTITY_TYPES.map((type) => (
                  <DropdownMenuItem key={type} onClick={() => addEntity(type)}>
                    {type}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </main>
    </div>
  );
}
