import { useMemo, useRef, useState, useCallback, useEffect } from "react";
import { Entity } from "@/lib/store";
import { Network, ZoomIn, ZoomOut, Maximize2, RefreshCw, Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import CytoscapeComponent from "react-cytoscapejs";
import type { Core, ElementDefinition } from "cytoscape";

interface SelectedElement {
  id: string;
  label: string;
  type: string;
  isRoot?: boolean;
  rawData?: any;
  isEdge?: boolean;
  source?: string;
  target?: string;
}

interface VisualizeEntityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entity?: Entity | null;
  entities?: Entity[];
  title?: string;
}

const ME_DMZ_COLORS = {
  darkBlue: "#232073",
  lightBlue: "#CEECF2",
  green: "#3AA608",
  orange: "#D97218",
  yellow: "#F2C53D",
  darkBlueDark: "#0E0D2E",
  defaultColor: "#95A5A6",
};

const ENTITY_TYPE_COLORS: Record<string, string> = {
  Asset: ME_DMZ_COLORS.orange,
  Task: ME_DMZ_COLORS.green,
  Participant: ME_DMZ_COLORS.darkBlue,
  Context: ME_DMZ_COLORS.yellow,
  Infrastructure: ME_DMZ_COLORS.lightBlue,
  CreativeWork: "#9B59B6",
  Location: "#E74C3C",
  AssetSC: ME_DMZ_COLORS.orange,
  TaskSC: ME_DMZ_COLORS.green,
  ParticipantSC: ME_DMZ_COLORS.darkBlue,
  Person: ME_DMZ_COLORS.darkBlue,
  Organization: "#34495E",
  Department: "#5D6D7E",
  Service: "#7F8C8D",
  default: "#95A5A6",
};

function getNodeColor(nodeType: string): string {
  return ENTITY_TYPE_COLORS[nodeType] || ENTITY_TYPE_COLORS.default;
}

function entityToGraphElements(entity: Entity): ElementDefinition[] {
  const elements: ElementDefinition[] = [];
  const content = entity.content || {};
  let nodeCounter = 0;

  const generateId = () => `node_${nodeCounter++}`;

  const rootId = entity.id;
  elements.push({
    data: {
      id: rootId,
      label: entity.name || entity.type,
      type: entity.type,
      isRoot: true,
      rawData: content,
    },
  });

  const processObject = (
    obj: any,
    parentId: string,
    parentKey: string,
    depth: number = 0
  ) => {
    if (depth > 4 || !obj) return;

    Object.entries(obj).forEach(([key, value]) => {
      if (
        key === "entityType" ||
        key === "schemaVersion" ||
        key === "combinedForm" ||
        value === null ||
        value === undefined ||
        value === ""
      ) {
        return;
      }

      if (Array.isArray(value)) {
        if (value.length === 0) return;

        const arrayNodeId = generateId();
        const isComplexArray = value.some(
          (item) => typeof item === "object" && item !== null
        );

        if (isComplexArray) {
          elements.push({
            data: {
              id: arrayNodeId,
              label: key,
              type: "array",
              parent: parentId,
            },
          });
          elements.push({
            data: {
              source: parentId,
              target: arrayNodeId,
              label: key,
            },
          });

          value.forEach((item, index) => {
            if (typeof item === "object" && item !== null) {
              const itemId = generateId();
              const itemType = (item as any).entityType || key;
              const itemLabel =
                (item as any).name ||
                (item as any).identifierValue ||
                (item as any).fullName ||
                (item as any).personNameValue ||
                `${key}[${index}]`;

              elements.push({
                data: {
                  id: itemId,
                  label: itemLabel,
                  type: itemType,
                  rawData: item,
                },
              });
              elements.push({
                data: {
                  source: arrayNodeId,
                  target: itemId,
                },
              });

              processObject(item, itemId, key, depth + 1);
            }
          });
        }
      } else if (typeof value === "object") {
        const nestedId = generateId();
        const nestedType = (value as any).entityType || key;
        const nestedLabel =
          (value as any).name ||
          (value as any).identifierValue ||
          (value as any).fullName ||
          (value as any).structuralType ||
          (value as any).functionalType ||
          key;

        elements.push({
          data: {
            id: nestedId,
            label: nestedLabel,
            type: nestedType,
            rawData: value,
          },
        });
        elements.push({
          data: {
            source: parentId,
            target: nestedId,
            label: key,
          },
        });

        processObject(value, nestedId, key, depth + 1);
      }
    });
  };

  processObject(content, rootId, entity.type, 0);

  return elements;
}

function entitiesToGraphElements(entities: Entity[]): ElementDefinition[] {
  const elements: ElementDefinition[] = [];
  const entityIdMap = new Map<string, string>();
  
  entities.forEach(entity => {
    const content = entity.content || {};
    const identifiers = content.identifier || [];
    identifiers.forEach((id: any) => {
      if (id.combinedForm) {
        entityIdMap.set(id.combinedForm, entity.id);
      }
      if (id.identifierValue) {
        entityIdMap.set(id.identifierValue, entity.id);
      }
    });
  });
  
  entities.forEach(entity => {
    elements.push({
      data: {
        id: entity.id,
        label: entity.name || entity.type,
        type: entity.type,
        isRoot: true,
        rawData: entity.content,
      },
    });
  });
  
  const addedEdges = new Set<string>();
  
  entities.forEach(entity => {
    const content = entity.content || {};
    
    const findReferences = (obj: any, parentType: string) => {
      if (!obj || typeof obj !== 'object') return;
      
      if (Array.isArray(obj)) {
        obj.forEach(item => {
          if (typeof item === 'string') {
            const targetId = entityIdMap.get(item);
            if (targetId && targetId !== entity.id) {
              const edgeKey = `${entity.id}-${targetId}`;
              if (!addedEdges.has(edgeKey)) {
                elements.push({
                  data: {
                    source: entity.id,
                    target: targetId,
                    label: parentType,
                  },
                });
                addedEdges.add(edgeKey);
              }
            }
          } else if (typeof item === 'object') {
            findReferences(item, parentType);
          }
        });
        return;
      }
      
      Object.entries(obj).forEach(([key, value]) => {
        if (typeof value === 'string') {
          const targetId = entityIdMap.get(value);
          if (targetId && targetId !== entity.id) {
            const edgeKey = `${entity.id}-${targetId}`;
            if (!addedEdges.has(edgeKey)) {
              elements.push({
                data: {
                  source: entity.id,
                  target: targetId,
                  label: key,
                },
              });
              addedEdges.add(edgeKey);
            }
          }
        } else if (typeof value === 'object' && value !== null) {
          findReferences(value, key);
        }
      });
    };
    
    findReferences(content, entity.type);
  });
  
  return elements;
}

const LAYOUTS = [
  { value: "cose", label: "Force-Directed (COSE)" },
  { value: "breadthfirst", label: "Hierarchical" },
  { value: "circle", label: "Circle" },
  { value: "grid", label: "Grid" },
  { value: "concentric", label: "Concentric" },
];

export function VisualizeEntityDialog({
  open,
  onOpenChange,
  entity,
  entities,
  title,
}: VisualizeEntityDialogProps) {
  const cyRef = useRef<Core | null>(null);
  const [layoutName, setLayoutName] = useState("circle");
  const [selectedElement, setSelectedElement] = useState<SelectedElement | null>(null);
  const [showLegend, setShowLegend] = useState(true);

  const isMultiMode = entities && entities.length > 0;
  
  const elements = useMemo(() => {
    if (isMultiMode) {
      return entitiesToGraphElements(entities);
    }
    if (!entity) return [];
    return entityToGraphElements(entity);
  }, [entity, entities, isMultiMode]);

  const stylesheet = useMemo(
    () => [
      {
        selector: "node",
        style: {
          label: "data(label)",
          "text-valign": "bottom",
          "text-halign": "center",
          "font-size": "10px",
          "font-family": "Inter, system-ui, sans-serif",
          color: "#333",
          "text-margin-y": 5,
          width: 40,
          height: 40,
          "background-color": ME_DMZ_COLORS.defaultColor,
          "border-width": 2,
          "border-color": "#fff",
          "text-wrap": "ellipsis",
          "text-max-width": "80px",
        },
      },
      {
        selector: "node[?isRoot]",
        style: {
          width: 60,
          height: 60,
          "font-size": "12px",
          "font-weight": "bold",
          "border-width": 3,
          "border-color": ME_DMZ_COLORS.darkBlue,
        },
      },
      ...Object.entries(ENTITY_TYPE_COLORS).map(([type, color]) => ({
        selector: `node[type="${type}"]`,
        style: {
          "background-color": color,
        },
      })),
      {
        selector: "node[type='array']",
        style: {
          shape: "diamond",
          width: 30,
          height: 30,
          "background-color": "#BDC3C7",
        },
      },
      {
        selector: "edge",
        style: {
          width: 2,
          "line-color": "#B0BEC5",
          "target-arrow-color": "#78909C",
          "target-arrow-shape": "triangle",
          "curve-style": "bezier",
          "arrow-scale": 0.8,
        },
      },
      {
        selector: "edge[label]",
        style: {
          label: "data(label)",
          "font-size": "8px",
          color: "#666",
          "text-rotation": "autorotate",
          "text-margin-y": -8,
        },
      },
      {
        selector: ":selected",
        style: {
          "background-color": ME_DMZ_COLORS.lightBlue,
          "border-color": ME_DMZ_COLORS.darkBlue,
          "border-width": 3,
          "line-color": ME_DMZ_COLORS.darkBlue,
          "target-arrow-color": ME_DMZ_COLORS.darkBlue,
        },
      },
    ],
    []
  );

  const [cyReady, setCyReady] = useState(false);

  const handleCy = useCallback((cy: Core) => {
    cyRef.current = cy;
    setCyReady(true);
    
    // Remove any existing listeners first to prevent duplicates
    cy.removeAllListeners();
    
    // Add click handler for node selection
    cy.on('tap', 'node', (evt) => {
      const node = evt.target;
      const nodeData = node.data();
      setSelectedElement({
        id: nodeData.id,
        label: nodeData.label,
        type: nodeData.type,
        isRoot: nodeData.isRoot,
        rawData: nodeData.rawData,
        isEdge: false,
      });
    });
    
    // Add click handler for edge selection
    cy.on('tap', 'edge', (evt) => {
      const edge = evt.target;
      const edgeData = edge.data();
      setSelectedElement({
        id: edgeData.id,
        label: edgeData.label || 'relationship',
        type: 'Edge',
        source: edgeData.source,
        target: edgeData.target,
        isEdge: true,
      });
    });
    
    // Clear selection when clicking background
    cy.on('tap', (evt) => {
      if (evt.target === cy) {
        setSelectedElement(null);
      }
    });
  }, []);

  const runLayoutWithName = useCallback((name: string) => {
    if (cyRef.current) {
      const layoutOptions: any = {
        name: name,
        animate: true,
        animationDuration: 500,
        fit: true,
        padding: 30,
      };

      if (name === "cose") {
        layoutOptions.nodeRepulsion = () => 20000;
        layoutOptions.idealEdgeLength = () => 150;
        layoutOptions.gravity = 0.1;
        layoutOptions.numIter = 500;
      } else if (name === "breadthfirst") {
        layoutOptions.directed = true;
        layoutOptions.spacingFactor = 2.0;
      } else if (name === "concentric") {
        layoutOptions.concentric = (node: any) => (node.data("isRoot") ? 10 : 1);
        layoutOptions.levelWidth = () => 2;
        layoutOptions.minNodeSpacing = 80;
      } else if (name === "circle") {
        layoutOptions.spacingFactor = 1.8;
      } else if (name === "grid") {
        layoutOptions.spacingFactor = 1.5;
      }

      cyRef.current.layout(layoutOptions).run();
    }
  }, []);

  const runLayout = useCallback(() => {
    runLayoutWithName(layoutName);
  }, [layoutName, runLayoutWithName]);

  // Run layout when dialog opens, cy is ready, or layout changes
  useEffect(() => {
    if (open && cyReady && cyRef.current) {
      const timer = setTimeout(() => {
        runLayoutWithName(layoutName);
        // Also fit to ensure nodes are visible
        cyRef.current?.fit(undefined, 30);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [layoutName, open, cyReady, runLayoutWithName]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setCyReady(false);
      setSelectedElement(null);
    }
  }, [open]);

  const handleZoomIn = () => {
    if (cyRef.current) {
      cyRef.current.zoom(cyRef.current.zoom() * 1.2);
      cyRef.current.center();
    }
  };

  const handleZoomOut = () => {
    if (cyRef.current) {
      cyRef.current.zoom(cyRef.current.zoom() * 0.8);
      cyRef.current.center();
    }
  };

  const handleFit = () => {
    if (cyRef.current) {
      cyRef.current.fit(undefined, 30);
    }
  };

  if (!entity && !isMultiMode) return null;

  const dialogTitle = title 
    ? title 
    : isMultiMode 
      ? `All Entities (${entities.length})`
      : entity 
        ? `${entity.type} — ${entity.name}`
        : "Visualize";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-5xl max-h-[85vh] flex flex-col"
        data-testid="dialog-visualize-entity"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Network className="h-5 w-5 text-primary" />
            <span>{dialogTitle}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex items-center justify-between gap-4 py-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Layout:</span>
            <Select
              value={layoutName}
              onValueChange={setLayoutName}
            >
              <SelectTrigger className="w-[180px]" data-testid="select-layout">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LAYOUTS.map((layout) => (
                  <SelectItem key={layout.value} value={layout.value}>
                    {layout.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={runLayout}
              className="gap-1"
              data-testid="button-refresh-layout"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant={showLegend ? "default" : "outline"}
              size="sm"
              onClick={() => setShowLegend(!showLegend)}
              className="gap-1"
              data-testid="button-toggle-legend"
            >
              <Info className="h-4 w-4" />
              Legend
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleZoomIn}
              data-testid="button-zoom-in"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleZoomOut}
              data-testid="button-zoom-out"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleFit}
              data-testid="button-fit"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex gap-3" style={{ height: "500px" }}>
          {/* Graph Container */}
          <div
            className="flex-1 rounded-lg border bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 relative"
            data-testid="graph-container"
          >
            <CytoscapeComponent
              elements={elements}
              stylesheet={stylesheet}
              layout={{ name: "preset" } as any}
              style={{ width: "100%", height: "100%" }}
              cy={handleCy}
              boxSelectionEnabled={true}
              autounselectify={false}
              userZoomingEnabled={true}
              userPanningEnabled={true}
            />
            
            {/* Legend Overlay */}
            {showLegend && (
              <div className="absolute bottom-3 left-3 bg-white/95 dark:bg-slate-900/95 border rounded-lg p-3 shadow-lg max-w-[200px]" data-testid="legend-panel">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-muted-foreground">Legend</span>
                  <button 
                    onClick={() => setShowLegend(false)}
                    className="text-muted-foreground hover:text-foreground"
                    data-testid="button-close-legend"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: ENTITY_TYPE_COLORS.Task }} />
                    <span>Task</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: ENTITY_TYPE_COLORS.Asset }} />
                    <span>Asset</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: ENTITY_TYPE_COLORS.Participant }} />
                    <span>Participant</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: ENTITY_TYPE_COLORS.Context }} />
                    <span>Context</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: ENTITY_TYPE_COLORS.Infrastructure }} />
                    <span>Infrastructure</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: ENTITY_TYPE_COLORS.CreativeWork }} />
                    <span>CreativeWork</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rotate-45" style={{ backgroundColor: "#BDC3C7" }} />
                    <span>Array/Collection</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Element Details Panel */}
          {selectedElement && (
            <div className="w-80 border rounded-lg bg-white dark:bg-slate-900 overflow-hidden flex flex-col" data-testid="element-details-panel">
              <div className="flex items-center justify-between p-3 border-b bg-muted/30">
                <div className="flex items-center gap-2">
                  {selectedElement.isEdge ? (
                    <div className="w-6 h-0.5 bg-slate-400" />
                  ) : (
                    <div 
                      className="w-4 h-4 rounded-full border-2 border-white shadow-sm" 
                      style={{ backgroundColor: getNodeColor(selectedElement.type) }}
                    />
                  )}
                  <span className="font-medium text-sm truncate">
                    {selectedElement.isEdge ? `Edge: ${selectedElement.label}` : selectedElement.label}
                  </span>
                </div>
                <button 
                  onClick={() => setSelectedElement(null)}
                  className="text-muted-foreground hover:text-foreground"
                  data-testid="button-close-details"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <ScrollArea className="flex-1 p-3">
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-xs text-muted-foreground block mb-1">Type</span>
                    <span className="font-medium">{selectedElement.type}</span>
                    {selectedElement.isRoot && (
                      <span className="ml-2 text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">Root</span>
                    )}
                  </div>
                  
                  {selectedElement.isEdge && (
                    <>
                      <div>
                        <span className="text-xs text-muted-foreground block mb-1">Relationship</span>
                        <span className="font-medium">{selectedElement.label}</span>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground block mb-1">Source</span>
                        <span className="font-mono text-xs break-all">{selectedElement.source}</span>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground block mb-1">Target</span>
                        <span className="font-mono text-xs break-all">{selectedElement.target}</span>
                      </div>
                    </>
                  )}
                  
                  {!selectedElement.isEdge && (
                    <div>
                      <span className="text-xs text-muted-foreground block mb-1">ID</span>
                      <span className="font-mono text-xs break-all">{selectedElement.id}</span>
                    </div>
                  )}
                  
                  {selectedElement.rawData && !selectedElement.isEdge && (
                    <div>
                      <span className="text-xs text-muted-foreground block mb-1">Attributes</span>
                      <div className="bg-muted/30 rounded p-2 text-xs space-y-1.5">
                        {Object.entries(selectedElement.rawData)
                          .filter(([key, value]) => 
                            key !== 'entityType' && 
                            key !== 'schemaVersion' && 
                            value !== null && 
                            value !== undefined &&
                            value !== '' &&
                            typeof value !== 'object'
                          )
                          .map(([key, value]) => (
                            <div key={key} className="flex flex-col">
                              <span className="text-muted-foreground text-xs">{key}:</span>
                              <span className="font-mono text-xs break-all pl-2">
                                {String(value)}
                              </span>
                            </div>
                          ))
                        }
                        {Object.entries(selectedElement.rawData)
                          .filter(([key, value]) => typeof value === 'object' && value !== null)
                          .map(([key, value]) => (
                            <div key={key} className="flex flex-col">
                              <span className="text-muted-foreground text-xs">{key}:</span>
                              <span className="font-mono text-xs break-all pl-2 italic">
                                {Array.isArray(value) ? `[${value.length} items]` : '[object]'}
                              </span>
                            </div>
                          ))
                        }
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
          <div>
            {elements.filter((e) => !e.data.source).length} nodes,{" "}
            {elements.filter((e) => e.data.source).length} edges
          </div>
          <div>Scroll to zoom • Drag to pan • Click nodes or edges to select</div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
