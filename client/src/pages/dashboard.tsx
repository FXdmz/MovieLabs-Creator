/**
 * @fileoverview Main Dashboard Page - Ontology Builder Interface
 * 
 * The primary application interface for creating, editing, and managing
 * OMC (Ontology for Media Creation) entities. This page provides:
 * 
 * @features
 * - Entity sidebar with search, filtering, and type counts
 * - Dynamic form editing with real-time OMC schema validation
 * - MovieLabs API validation with local fallback
 * - Dual export (JSON/RDF TTL) with graph screenshot packaging
 * - Multi-entity project import from JSON or TTL files
 * - Asset import wizard for file-based asset creation
 * - Graph visualization of entity relationships
 * - Undo/redo with keyboard shortcuts (Ctrl+Z, Ctrl+Shift+Z)
 * 
 * @layout
 * - Header: Logo, navigation, export controls, help
 * - Sidebar: Entity list with filters and action buttons
 * - Main content: Dynamic form or welcome message
 * 
 * @state
 * - Uses Zustand store (useOntologyStore) for entity management
 * - Local state for UI dialogs, validation, and filtering
 */

import { useState, useEffect, useMemo, useRef } from "react";
import { useLocation, Link } from "wouter";
import { useOntologyStore } from "@/lib/store";
import { DynamicForm } from "@/components/dynamic-form";
import { Logo } from "@/components/logo";
import { HelpDialog } from "@/components/help-dialog";
import { ThemeToggle } from "@/components/theme-toggle";
import { ENTITY_TYPES, EntityType } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import { 
  Plus, 
  FileJson, 
  FileText,
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
  Upload,
  HelpCircle,
  Home,
  ChevronDown,
  Eye,
  Loader2,
  Network,
  X,
  Filter,
  Undo2,
  Redo2,
  Package
} from "lucide-react";

import { FileDropZone } from "@/components/file-drop-zone";
import { AssetWizard, StagedAsset, AssetGroup } from "@/components/asset-wizard";
import { ImportEntityDialog } from "@/components/import-entity-dialog";
import { ImportMultiDialog } from "@/components/import-multi-dialog";
import { ImportedEntity } from "@/lib/import";
import { ExtractedMetadata, formatDuration } from "@/lib/file-metadata";
import { ImportResult } from "@/lib/import";
import { entityToTurtle } from "@/lib/export";

function cleanContextForValidation(context: any): any {
  if (!context) return context;
  const { 
    scheduling, 
    hasInputAssets, 
    hasOutputAssets, 
    informs, 
    isInformedBy,
    ...rest 
  } = context;
  return rest;
}

function prepareContentForValidation(content: any): any {
  if (!content) return content;
  
  const { 
    meNexusService, 
    taskClassification,
    state,
    stateDetails,
    workUnit,
    taskGroup,
    customData,
    ...rest 
  } = content;
  
  if (rest.Context && Array.isArray(rest.Context)) {
    rest.Context = rest.Context.map(cleanContextForValidation).filter(Boolean);
    if (rest.Context.length === 0) {
      delete rest.Context;
    }
  }
  
  return rest;
}
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
import { ViewEntityDialog } from "@/components/view-entity-dialog";
import { ViewAllOmcDialog } from "@/components/view-all-omc-dialog";
import { VisualizeEntityDialog } from "@/components/visualize-entity-dialog";

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

const CreativeWorkIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 46.35 45.5" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path 
      fill="currentColor" 
      stroke="currentColor"
      strokeWidth="0.5"
      d="M36,22.17a33.27,33.27,0,0,1-9.67-3.41,12.62,12.62,0,0,0,.07-4.63Q24.49,3.3,24.49,3.29A33,33,0,0,1,14,7.17a32.91,32.91,0,0,1-11.18,0S3.46,10.73,4.73,18c1.62,9.19,13.61,13.84,13.61,13.84a30.66,30.66,0,0,0,6.2-8c-.26,1.48-.57,3.25-.94,5.33C22,38.32,31.66,46.79,31.66,46.79s12-4.65,13.61-13.84q1.9-10.83,1.91-10.83A32.91,32.91,0,0,1,36,22.17Z" 
      transform="translate(-1.82 -2.3)"
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
  if (entityType === 'CreativeWork') {
    return <CreativeWorkIcon className="h-3.5 w-3.5" />;
  }
  return <Database className="h-3.5 w-3.5" />;
};

export default function Dashboard() {
  const { entities, addEntity, addEntityFromContent, selectedEntityId, selectEntity, updateEntity, removeEntity, exportJson, undo, redo, canUndo, canRedo } = useOntologyStore();
  const [location, setLocation] = useLocation();
  const [schema, setSchema] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [validationErrors, setValidationErrors] = useState<any[] | null>(null);
  const [validationSource, setValidationSource] = useState<'movielabs' | 'local' | null>(null);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isValidatingAll, setIsValidatingAll] = useState(false);
  const [showValidationDialog, setShowValidationDialog] = useState(false);
  const [showFileDropZone, setShowFileDropZone] = useState(false);
  const [showAssetWizard, setShowAssetWizard] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showVisualizeDialog, setShowVisualizeDialog] = useState(false);
  const [showVisualizeAllDialog, setShowVisualizeAllDialog] = useState(false);
  const [showViewAllOmcDialog, setShowViewAllOmcDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showImportMultiDialog, setShowImportMultiDialog] = useState(false);
  const [showExportNameDialog, setShowExportNameDialog] = useState(false);
  const [exportFileName, setExportFileName] = useState("omc-ontology");
  const [exportFormat, setExportFormat] = useState<"json" | "ttl">("json");
  const [showExportPackageDialog, setShowExportPackageDialog] = useState(false);
  const [exportPackageName, setExportPackageName] = useState("omc-project");
  const [autoScreenshotFilename, setAutoScreenshotFilename] = useState<string | undefined>(undefined);
  const hasHandledCreate = useRef(false);
  const { toast } = useToast();

  const handleImportSuccess = (result: ImportResult) => {
    if (result.success && result.entityType && result.entityId && result.content) {
      addEntityFromContent(result.entityType, result.entityId, result.content);
      toast({
        title: "Entity Imported",
        description: `Successfully imported ${result.entityType}: ${result.content.name || result.entityId}`,
      });
    }
  };

  const handleImportMultiSuccess = (importedEntities: ImportedEntity[]) => {
    let addedCount = 0;
    let updatedCount = 0;
    const existingIds = new Set(entities.map(e => e.id));
    
    for (const entity of importedEntities) {
      if (existingIds.has(entity.entityId)) {
        updateEntity(entity.entityId, entity.content);
        updatedCount++;
      } else {
        addEntityFromContent(entity.entityType, entity.entityId, entity.content);
        addedCount++;
      }
    }
    
    const parts = [];
    if (addedCount > 0) parts.push(`${addedCount} added`);
    if (updatedCount > 0) parts.push(`${updatedCount} updated`);
    
    toast({
      title: "Project Imported",
      description: `Successfully imported: ${parts.join(', ')}`,
    });
  };

  const handleFileAssetCreated = (asset: any, metadata: ExtractedMetadata) => {
    const id = asset.identifier[0].identifierValue;
    addEntityFromContent('Asset', id, asset);
    setShowFileDropZone(false);
    toast({
      title: "Asset Created",
      description: `Created Asset from "${metadata.fileName}" with detected structural type: ${metadata.structuralType || 'unknown'}`,
    });
  };

  const handleWizardComplete = (stagedAssets: StagedAsset[], groups: AssetGroup[]) => {
    let createdCount = 0;
    
    for (const staged of stagedAssets) {
      const structuralProperties = staged.structuralProps && Object.keys(staged.structuralProps).length > 0 
        ? staged.structuralProps 
        : undefined;
      
      const functionalProperties = staged.functionalProps && Object.keys(staged.functionalProps).filter(k => staged.functionalProps[k]).length > 0
        ? Object.fromEntries(Object.entries(staged.functionalProps).filter(([_, v]) => v !== null && v !== undefined && v !== ''))
        : undefined;
      
      const asset: any = {
        entityType: 'Asset',
        name: staged.name,
        schemaVersion: 'https://movielabs.com/omc/json/schema/v2.8',
        identifier: [{
          identifierScope: 'me-nexus',
          identifierValue: staged.id,
          combinedForm: `me-nexus:${staged.id}`
        }],
        assetFC: {
          functionalType: staged.functionalType,
          ...(functionalProperties ? { functionalProperties } : {})
        },
        AssetSC: {
          entityType: 'AssetSC',
          schemaVersion: 'https://movielabs.com/omc/json/schema/v2.8',
          identifier: [{
            identifierScope: 'me-nexus',
            identifierValue: `${staged.id}-sc`,
            combinedForm: `me-nexus:${staged.id}-sc`
          }],
          structuralType: staged.structuralType,
          structuralProperties
        }
      };
      
      if (staged.description) {
        asset.description = staged.description;
      }
      
      if (staged.provenance) {
        // Only include valid OMC provenance properties (createdOn - lowercase 'on')
        const prov = staged.provenance as any;
        const omcProvenance: Record<string, any> = {};
        
        // Map CreatedOn to createdOn (schema uses lowercase 'on')
        if (prov.CreatedOn) {
          omcProvenance.createdOn = prov.CreatedOn;
        }
        
        if (Object.keys(omcProvenance).length > 0) {
          asset.provenance = omcProvenance;
        }
      }
      
      addEntityFromContent('Asset', staged.id, asset);
      createdCount++;
    }
    
    for (const group of groups) {
      const groupAsset: any = {
        entityType: 'Asset',
        name: group.name,
        schemaVersion: 'https://movielabs.com/omc/json/schema/v2.8',
        identifier: [{
          identifierScope: 'me-nexus',
          identifierValue: group.id,
          combinedForm: `me-nexus:${group.id}`
        }],
        assetFC: {
          functionalType: group.isOrdered ? 'shot' : 'creativeReferenceMaterial'
        },
        AssetSC: {
          entityType: 'AssetSC',
          schemaVersion: 'https://movielabs.com/omc/json/schema/v2.8',
          identifier: [{
            identifierScope: 'me-nexus',
            identifierValue: `${group.id}-sc`,
            combinedForm: `me-nexus:${group.id}-sc`
          }],
          structuralType: 'assetGroup',
          structuralProperties: {
            assetGroup: {
              isOrdered: group.isOrdered
            }
          },
          Asset: group.assetIds.map(id => ({
            identifier: [{
              identifierScope: 'me-nexus',
              identifierValue: id,
              combinedForm: `me-nexus:${id}`
            }]
          }))
        }
      };
      
      addEntityFromContent('Asset', group.id, groupAsset);
      createdCount++;
    }
    
    setShowAssetWizard(false);
    // Don't automatically open the form - just show the list
    selectEntity(null);
    toast({
      title: "Assets Created",
      description: `Successfully created ${stagedAssets.length} asset${stagedAssets.length !== 1 ? 's' : ''}${groups.length > 0 ? ` and ${groups.length} group${groups.length !== 1 ? 's' : ''}` : ''}.`,
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

  // Keyboard shortcuts for undo/redo (skip when in editable fields)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isEditable = target.tagName === 'INPUT' || 
                         target.tagName === 'TEXTAREA' || 
                         target.isContentEditable ||
                         target.closest('.monaco-editor');
      
      if (isEditable) return;
      
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  const selectedEntity = entities.find((e) => e.id === selectedEntityId);

  const filteredEntities = entities.filter(e => {
    const matchesSearch = searchTerm === "" || 
      e.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      e.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || e.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const entityTypeCounts = useMemo(() => {
    const counts: Record<string, number> = { all: entities.length };
    for (const entity of entities) {
      counts[entity.type] = (counts[entity.type] || 0) + 1;
    }
    return counts;
  }, [entities]);

  const clearFilters = () => {
    setSearchTerm("");
    setTypeFilter("all");
  };

  const hasActiveFilters = searchTerm !== "" || typeFilter !== "all";

  const handleValidate = async () => {
    if (!schema || !selectedEntity) return;

    setIsValidating(true);
    setValidationErrors(null);
    setValidationResult(null);
    setValidationSource(null);

    try {
      // Try MovieLabs official validator first
      const contentForValidation = prepareContentForValidation(selectedEntity.content);
      const response = await fetch('/api/validate/movielabs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contentForValidation)
      });
      
      const data = await response.json();
      
      if (data.success && data.source === 'movielabs') {
        setValidationSource('movielabs');
        setValidationResult(data.result);
        
        // MovieLabs validator returns { summary: { ruleId: "passed"|"failed" }, details: { issues: {...} } }
        const mlResult = data.result;
        const summary = mlResult?.summary || {};
        const details = mlResult?.details || {};
        
        // Check if all rules passed (no "failed" status in summary)
        const failedRules = Object.entries(summary).filter(([_, status]) => status === 'failed');
        const isValid = failedRules.length === 0;
        
        if (isValid) {
          toast({
            title: "MovieLabs Validation Passed",
            description: "Your entity is valid! Click 'View Details' to see the full report.",
            variant: "default",
            className: "bg-green-600 text-white border-none",
            action: (
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => {
                  setValidationErrors([]);
                  setShowValidationDialog(true);
                }}
                className="bg-white/20 hover:bg-white/30 text-white border-none"
              >
                View Details
              </Button>
            )
          });
          setValidationErrors([]);
        } else {
          // Extract issues from the details object
          const issues = details?.issues || {};
          const allErrors: any[] = [];
          
          // Flatten issues from all failed rules
          for (const [ruleId, ruleIssues] of Object.entries(issues)) {
            if (Array.isArray(ruleIssues)) {
              ruleIssues.forEach((issue: any) => {
                allErrors.push({
                  ruleId,
                  issue: issue.issue,
                  exception: issue.exception,
                  context: issue.context,
                  specifics: issue.specifics
                });
              });
            }
          }
          
          setValidationErrors(allErrors.length > 0 ? allErrors : [{ summary, details }]);
          setShowValidationDialog(true);
        }
      } else if (data.fallbackToLocal) {
        // Fallback to local validation
        runLocalValidation();
      } else {
        // API returned but with unexpected format
        console.warn("MovieLabs API response:", data);
        runLocalValidation();
      }
    } catch (e: any) {
      console.error("MovieLabs validator error:", e);
      // Fallback to local validation
      runLocalValidation();
    } finally {
      setIsValidating(false);
    }
  };

  const runLocalValidation = () => {
    if (!schema || !selectedEntity) return;
    
    setValidationSource('local');
    
    try {
      let entitySchema = schema.$defs?.[selectedEntity.type]?.properties?.[selectedEntity.type];
      if (!entitySchema) entitySchema = schema.$defs?.[selectedEntity.type];
      if (!entitySchema) entitySchema = schema.$defs?.MediaCreationContext?.properties?.[selectedEntity.type];
      if (!entitySchema) entitySchema = schema.$defs?.Utility?.properties?.[selectedEntity.type];
      if (!entitySchema) entitySchema = schema.$defs?.Participant?.properties?.[selectedEntity.type];
      
      const schemaToValidate = entitySchema ? {
        ...entitySchema,
        $defs: schema.$defs
      } : schema;

      const validate = ajv.compile(schemaToValidate);
      const contentForValidation = prepareContentForValidation(selectedEntity.content);
      const jsonValid = validate(contentForValidation);

      // Validate RDF generation
      let rdfValid = false;
      let rdfError = "";
      try {
        const ttlOutput = entityToTurtle(selectedEntity);
        rdfValid = ttlOutput.includes("@prefix omc:") && 
                   ttlOutput.includes("rdf:type") &&
                   ttlOutput.length > 100;
        if (!rdfValid) rdfError = "RDF output appears incomplete or malformed";
      } catch (e: any) {
        rdfError = e.message || "RDF generation failed";
      }

      if (jsonValid && rdfValid) {
        toast({
          title: "Local Validation Passed",
          description: "JSON: Valid (OMC v2.8 Schema) | RDF: Valid (Turtle format) - Note: Using local validation (MovieLabs API unavailable)",
          variant: "default",
          className: "bg-green-600 text-white border-none"
        });
        setValidationErrors(null);
      } else if (jsonValid && !rdfValid) {
        toast({
          title: "Partial Validation (Local)",
          description: `JSON: Valid | RDF: ${rdfError || "Invalid"} - Using local validation`,
          variant: "default",
          className: "bg-yellow-600 text-white border-none"
        });
        setValidationErrors(null);
      } else {
        console.error("Validation errors:", validate.errors);
        setValidationErrors(validate.errors || []);
        setShowValidationDialog(true);
      }
    } catch (e: any) {
      console.error("Local validation exception:", e);
      toast({
        title: "Validation Error",
        description: e.message || "An error occurred during validation.",
        variant: "destructive",
      });
    }
  };

  const handleValidateAll = async () => {
    if (entities.length === 0) {
      toast({
        title: "No entities to validate",
        description: "Add some entities first before validating.",
        variant: "destructive"
      });
      return;
    }

    setIsValidatingAll(true);
    setValidationErrors(null);
    setValidationResult(null);
    setValidationSource(null);

    try {
      // Prepare all entities for validation
      const allEntitiesForValidation = entities.map(e => prepareContentForValidation(e.content));
      
      const response = await fetch('/api/validate/movielabs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(allEntitiesForValidation)
      });
      
      const data = await response.json();
      
      if (data.success && data.source === 'movielabs') {
        setValidationSource('movielabs');
        setValidationResult(data.result);
        
        const mlResult = data.result;
        const summary = mlResult?.summary || {};
        const details = mlResult?.details || {};
        
        const failedRules = Object.entries(summary).filter(([_, status]) => status === 'failed');
        const isValid = failedRules.length === 0;
        
        if (isValid) {
          toast({
            title: "All Entities Valid",
            description: `All ${entities.length} entities passed MovieLabs validation!`,
            variant: "default",
            className: "bg-green-600 text-white border-none",
            action: (
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => {
                  setValidationErrors([]);
                  setShowValidationDialog(true);
                }}
                className="bg-white/20 hover:bg-white/30 text-white border-none"
              >
                View Details
              </Button>
            )
          });
          setValidationErrors([]);
        } else {
          const issues = details?.issues || {};
          const allErrors: any[] = [];
          
          for (const [ruleId, ruleIssues] of Object.entries(issues)) {
            if (Array.isArray(ruleIssues)) {
              ruleIssues.forEach((issue: any) => {
                allErrors.push({
                  ruleId,
                  issue: issue.issue,
                  exception: issue.exception,
                  context: issue.context,
                  specifics: issue.specifics
                });
              });
            }
          }
          
          setValidationErrors(allErrors.length > 0 ? allErrors : [{ summary, details }]);
          setShowValidationDialog(true);
        }
      } else {
        // Fallback message for local validation not supporting multi-entity
        toast({
          title: "Validation Unavailable",
          description: "MovieLabs API is unavailable. Please validate entities individually.",
          variant: "destructive"
        });
      }
    } catch (e: any) {
      console.error("Validate all error:", e);
      toast({
        title: "Validation Error",
        description: "Could not reach MovieLabs validator. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsValidatingAll(false);
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

  const handleExportCurrentJson = () => {
    const { downloadCurrentAs } = useOntologyStore.getState();
    if (!selectedEntity) {
      toast({ title: "No entity selected", variant: "destructive" });
      return;
    }
    const fileName = `${selectedEntity.name.replace(/[^a-zA-Z0-9-_]/g, '_')}.json`;
    downloadCurrentAs("json", fileName);
    toast({
      title: "Exported as JSON",
      description: `Downloaded ${fileName}`
    });
  };

  const handleExportCurrentTtl = () => {
    const { downloadCurrentAs } = useOntologyStore.getState();
    if (!selectedEntity) {
      toast({ title: "No entity selected", variant: "destructive" });
      return;
    }
    const fileName = `${selectedEntity.name.replace(/[^a-zA-Z0-9-_]/g, '_')}.ttl`;
    downloadCurrentAs("ttl", fileName);
    toast({
      title: "Exported as TTL (RDF)",
      description: `Downloaded ${fileName}`
    });
  };

  const handleExportAllJson = () => {
    setExportFormat("json");
    setExportFileName("omc-ontology");
    setShowExportNameDialog(true);
  };

  const handleExportAllTtl = () => {
    setExportFormat("ttl");
    setExportFileName("omc-ontology");
    setShowExportNameDialog(true);
  };

  const executeExportAll = () => {
    const { downloadAs } = useOntologyStore.getState();
    const sanitizedName = exportFileName.replace(/[^a-zA-Z0-9-_]/g, '_') || "omc-ontology";
    const ext = exportFormat === "json" ? ".json" : ".ttl";
    const fileName = `${sanitizedName}${ext}`;
    
    downloadAs(exportFormat, fileName);
    toast({
      title: `Exported as ${exportFormat.toUpperCase()}`,
      description: `Downloaded ${fileName} (${entities.length} entities)`
    });
    
    setShowExportNameDialog(false);
  };

  const handleExportPackage = () => {
    setExportPackageName("omc-project");
    setShowExportPackageDialog(true);
  };

  const executeExportPackage = () => {
    const { downloadAs } = useOntologyStore.getState();
    const sanitizedName = exportPackageName.replace(/[^a-zA-Z0-9-_]/g, '_') || "omc-project";
    
    downloadAs("json", `${sanitizedName}.json`);
    downloadAs("ttl", `${sanitizedName}.ttl`);
    
    setAutoScreenshotFilename(sanitizedName);
    setShowExportPackageDialog(false);
    setShowVisualizeAllDialog(true);
    
    toast({
      title: "Exporting Package",
      description: `Downloading ${sanitizedName}.json, ${sanitizedName}.ttl, and ${sanitizedName}.jpg`
    });
  };

  const handleAutoScreenshotComplete = () => {
    setAutoScreenshotFilename(undefined);
    setShowVisualizeAllDialog(false);
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-80 border-r border-sidebar-border bg-sidebar flex flex-col">
        <div className="p-4 border-b border-sidebar-border">
          <div className="mb-4 flex items-center justify-between">
            <a href="https://www.me-dmz.com" target="_blank" rel="noopener noreferrer">
              <Logo />
            </a>
            <ThemeToggle className="text-sidebar-foreground hover:bg-sidebar-accent" />
          </div>
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-sidebar-primary/50" />
              <Input
                placeholder="Search by name..."
                className="pl-9 pr-8 bg-sidebar-accent/50 border-sidebar-border text-sidebar-foreground placeholder:text-sidebar-foreground/40 focus-visible:ring-sidebar-ring"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                data-testid="input-search-entities"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2.5 top-2.5 text-sidebar-foreground/50 hover:text-sidebar-foreground"
                  data-testid="button-clear-search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 justify-between bg-sidebar-accent/50 border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent"
                    data-testid="button-type-filter"
                  >
                    <span className="flex items-center gap-2">
                      <Filter className="h-3 w-3" />
                      {typeFilter === "all" ? "All Types" : typeFilter}
                    </span>
                    <ChevronDown className="h-3 w-3 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuItem onClick={() => setTypeFilter("all")}>
                    <span className="flex-1">All Types</span>
                    <Badge variant="secondary" className="ml-2 text-xs">{entityTypeCounts.all || 0}</Badge>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {Object.entries(entityTypeCounts)
                    .filter(([type]) => type !== 'all')
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([type, count]) => (
                      <DropdownMenuItem key={type} onClick={() => setTypeFilter(type)}>
                        <span className="flex items-center gap-2 flex-1">
                          {getEntityIcon(type)}
                          {type === 'CreativeWork' ? 'Creative Work' : type}
                        </span>
                        <Badge variant="secondary" className="ml-2 text-xs">{count}</Badge>
                      </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
              </DropdownMenu>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent px-2"
                  data-testid="button-clear-filters"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
            {hasActiveFilters && (
              <div className="text-xs text-sidebar-foreground/60 px-1">
                Showing {filteredEntities.length} of {entities.length} entities
              </div>
            )}
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

        <div className="p-4 border-t border-sidebar-border bg-sidebar-accent/10 space-y-2">
          {entities.length > 0 && (
            <>
              <Button 
                variant="outline" 
                className="w-full gap-2 border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent"
                onClick={() => setShowViewAllOmcDialog(true)}
                data-testid="button-view-all-omc"
              >
                <Eye className="h-4 w-4" /> View All OMC
              </Button>
              <Button 
                variant="outline" 
                className="w-full gap-2 border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent"
                onClick={() => setShowVisualizeAllDialog(true)}
                data-testid="button-visualize-all"
              >
                <Network className="h-4 w-4" /> Visualize All
              </Button>
              <Button 
                variant="outline" 
                className="w-full gap-2 border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent"
                onClick={handleValidateAll}
                disabled={isValidatingAll}
                data-testid="button-validate-all"
              >
                {isValidatingAll ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Validating...</>
                ) : (
                  <><CheckCircle className="h-4 w-4" /> Validate All</>
                )}
              </Button>
            </>
          )}
          <Link href="/">
            <Button variant="outline" className="w-full gap-2 border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent" data-testid="button-home">
              <Home className="h-4 w-4" /> Home
            </Button>
          </Link>
          <HelpDialog 
            trigger={
              <Button variant="outline" className="w-full gap-2 border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent" data-testid="button-help-builder">
                <HelpCircle className="h-4 w-4" /> Help
              </Button>
            }
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="w-full gap-2 bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 shadow-md border-0" size="lg">
                <Plus className="h-4 w-4" /> Add Entity
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64 max-h-96 overflow-y-auto">
              <DropdownMenuItem onClick={() => { selectEntity(null); setShowAssetWizard(true); }} className="text-primary font-medium">
                <Upload className="h-4 w-4 mr-2" /> Import Assets (Wizard)
              </DropdownMenuItem>
              <Separator className="my-1" />
              {(['CreativeWork', 'Task', 'Location', 'Participant', 'Asset', 'Infrastructure'] as const).map((type) => (
                <DropdownMenuItem key={type} onClick={() => addEntity(type)}>
                  {getEntityIcon(type)} {type === 'CreativeWork' ? 'Creative Work' : type}
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
                  <div className="flex items-center border rounded-md">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={undo} 
                          disabled={!canUndo()}
                          className="h-8 w-8 rounded-r-none"
                          data-testid="button-undo"
                        >
                          <Undo2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Undo (Ctrl+Z)</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={redo} 
                          disabled={!canRedo()}
                          className="h-8 w-8 rounded-l-none border-l"
                          data-testid="button-redo"
                        >
                          <Redo2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Redo (Ctrl+Shift+Z)</TooltipContent>
                    </Tooltip>
                  </div>
                </TooltipProvider>
                 
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

                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleValidate} 
                  disabled={isValidating}
                  className="gap-2 border-green-600/20 text-green-600 hover:bg-green-600/10"
                >
                  {isValidating ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Validating...</>
                  ) : (
                    <><CheckCircle className="h-4 w-4" /> Validate</>
                  )}
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowViewDialog(true)}
                  disabled={!selectedEntity}
                  className="gap-2 border-primary/20 text-primary hover:bg-primary/5"
                  data-testid="button-view-entity"
                >
                  <Eye className="h-4 w-4" /> View
                </Button>

                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowVisualizeDialog(true)}
                  disabled={!selectedEntity}
                  className="gap-2 border-primary/20 text-primary hover:bg-primary/5"
                  data-testid="button-visualize-entity"
                >
                  <Network className="h-4 w-4" /> Visualize
                </Button>

                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowImportMultiDialog(true)}
                  className="gap-2 border-primary/20 text-primary hover:bg-primary/5"
                  data-testid="button-import-entity"
                >
                  <Upload className="h-4 w-4" /> Import OMC
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2 border-primary/20 text-primary hover:bg-primary/5">
                      <Download className="h-4 w-4" /> Export OMC <ChevronDown className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel className="text-xs text-muted-foreground">Current Entity</DropdownMenuLabel>
                    <DropdownMenuItem onClick={handleExportCurrentJson} className="gap-2" disabled={!selectedEntity}>
                      <FileJson className="h-4 w-4" /> Export as JSON
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleExportCurrentTtl} className="gap-2" disabled={!selectedEntity}>
                      <FileText className="h-4 w-4" /> Export as TTL (RDF)
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel className="text-xs text-muted-foreground">All Entities ({entities.length})</DropdownMenuLabel>
                    <DropdownMenuItem onClick={handleExportAllJson} className="gap-2" disabled={entities.length === 0}>
                      <FileJson className="h-4 w-4" /> Export All as JSON
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleExportAllTtl} className="gap-2" disabled={entities.length === 0}>
                      <FileText className="h-4 w-4" /> Export All as TTL (RDF)
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleExportPackage} className="gap-2" disabled={entities.length === 0}>
                      <Package className="h-4 w-4" /> Export Package (JSON + TTL + Graph)
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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
        ) : showAssetWizard ? (
          <div className="flex-1 flex flex-col bg-muted/5">
            <AssetWizard 
              onComplete={handleWizardComplete}
              onCancel={() => setShowAssetWizard(false)}
            />
          </div>
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
            <a href="https://www.me-dmz.com" target="_blank" rel="noopener noreferrer" className="w-32 h-32 rounded-full bg-primary/5 flex items-center justify-center mb-6 ring-1 ring-primary/20 hover:ring-primary/40 transition-all">
              <Logo className="h-16 w-auto dark:hidden" variant="light" />
              <Logo className="h-16 w-auto hidden dark:block" variant="dark" />
            </a>
            <h2 className="text-2xl font-bold mb-3 text-foreground">Welcome to OMC Builder</h2>
            <p className="max-w-md text-center text-muted-foreground mb-8 text-base">
              Select an entity from the sidebar or create a new one to start building your media creation ontology.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button onClick={() => addEntity("CreativeWork")} variant="outline" size="lg" className="gap-2 hover:bg-[#CEECF2] hover:border-[#232073] hover:text-[#232073] hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md">
                <CreativeWorkIcon className="h-4 w-4" /> Create Creative Work
              </Button>
              <Button onClick={() => addEntity("Task")} variant="outline" size="lg" className="gap-2 hover:bg-[#CEECF2] hover:border-[#232073] hover:text-[#232073] hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md">
                <TaskIcon className="h-4 w-4" /> Create Task
              </Button>
              <Button onClick={() => addEntity("Participant")} variant="outline" size="lg" className="gap-2 hover:bg-[#CEECF2] hover:border-[#232073] hover:text-[#232073] hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md">
                <ParticipantIcon className="h-4 w-4" /> Create Participant
              </Button>
              <Button onClick={() => addEntity("Asset")} variant="outline" size="lg" className="gap-2 hover:bg-[#CEECF2] hover:border-[#232073] hover:text-[#232073] hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md">
                <AssetIcon className="h-4 w-4" /> Create Asset
              </Button>
              <Button onClick={() => addEntity("Infrastructure")} variant="outline" size="lg" className="gap-2 hover:bg-[#CEECF2] hover:border-[#232073] hover:text-[#232073] hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md">
                <InfrastructureIcon className="h-4 w-4" /> Create Infrastructure
              </Button>
              <Button onClick={() => addEntity("Location")} variant="outline" size="lg" className="gap-2 hover:bg-[#CEECF2] hover:border-[#232073] hover:text-[#232073] hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md">
                <LocationIcon className="h-4 w-4" /> Create Location
              </Button>
            </div>
            <div className="mt-6">
              <Button 
                onClick={() => setShowImportMultiDialog(true)} 
                variant="outline" 
                size="lg" 
                className="gap-2 border-[#D97218] text-[#D97218] hover:bg-[#D97218]/10 hover:border-[#D97218] hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md"
                data-testid="button-import-entity-welcome"
              >
                <Upload className="h-4 w-4" /> Import OMC File
              </Button>
            </div>
          </div>
        )}
      </main>

      <Dialog open={showValidationDialog} onOpenChange={setShowValidationDialog}>
        <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className={`flex items-center gap-2 ${validationErrors && validationErrors.length > 0 ? 'text-destructive' : 'text-green-600'}`}>
              {validationErrors && validationErrors.length > 0 ? (
                <AlertTriangle className="h-5 w-5" />
              ) : (
                <CheckCircle className="h-5 w-5" />
              )}
              {validationErrors && validationErrors.length > 0 ? 'Validation Issues Found' : 'Validation Passed'}
            </DialogTitle>
            <DialogDescription>
              {validationSource === 'movielabs' 
                ? "Results from the official MovieLabs OMC validator."
                : "Results from local schema validation (MovieLabs API unavailable)."}
            </DialogDescription>
          </DialogHeader>
          
          <div className="mb-3 flex items-center gap-2">
            <Badge variant={validationSource === 'movielabs' ? 'default' : 'secondary'}>
              {validationSource === 'movielabs' ? 'MovieLabs Official Validator' : 'Local Validation'}
            </Badge>
            {validationResult?.summary && (
              <Badge variant="outline" className="text-xs">
                v2.8 Schema
              </Badge>
            )}
          </div>

          {validationSource === 'movielabs' && validationResult?.summary && (
            <div className="mb-3 p-3 bg-muted/30 rounded-lg border">
              <h4 className="text-sm font-medium mb-2">Rule Summary</h4>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(validationResult.summary).map(([ruleId, status]) => (
                  <Badge 
                    key={ruleId}
                    variant={status === 'passed' ? 'outline' : status === 'failed' ? 'destructive' : 'secondary'}
                    className={`text-[10px] ${status === 'passed' ? 'border-green-500 text-green-600' : ''}`}
                  >
                    {ruleId}: {String(status)}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex-1 overflow-auto">
            {validationErrors && validationErrors.length > 0 ? (
              <div className="space-y-3">
                {validationErrors.map((error: any, idx: number) => (
                  <div key={idx} className="p-3 border rounded-lg bg-card hover:bg-muted/20 transition-colors">
                    {validationSource === 'movielabs' && error.ruleId ? (
                      <>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="destructive" className="text-xs">{error.ruleId}</Badge>
                          {error.context?.type && (
                            <Badge variant="outline" className="text-xs">{error.context.type}</Badge>
                          )}
                        </div>
                        <p className="text-sm font-medium text-foreground mb-1">{error.issue}</p>
                        {error.exception && (
                          <p className="text-xs text-muted-foreground mb-2">{error.exception}</p>
                        )}
                        {error.context?.jsonPointers && error.context.jsonPointers.length > 0 && (
                          <div className="mt-2 p-2 bg-muted/50 rounded text-xs font-mono">
                            <span className="text-muted-foreground">Location: </span>
                            {error.context.jsonPointers.join(', ')}
                          </div>
                        )}
                        {error.specifics && (
                          <div className="mt-2 p-2 bg-yellow-500/10 rounded text-xs">
                            <span className="text-yellow-600 font-medium">Details: </span>
                            {error.specifics}
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="destructive" className="text-xs">
                            {error.keyword || 'Error'}
                          </Badge>
                          {error.instancePath && (
                            <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{error.instancePath}</code>
                          )}
                        </div>
                        <p className="text-sm text-foreground">{error.message}</p>
                        {error.schemaPath && (
                          <p className="text-xs text-muted-foreground mt-1 font-mono">Schema: {error.schemaPath}</p>
                        )}
                        {error.params && Object.keys(error.params).length > 0 && (
                          <div className="mt-2 p-2 bg-muted/50 rounded text-xs font-mono">
                            {Object.entries(error.params).map(([key, val]) => (
                              <div key={key}><span className="text-muted-foreground">{key}:</span> {String(val)}</div>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-muted-foreground">
                No detailed error information available.
              </div>
            )}
          </div>

          <DialogFooter className="sm:justify-between gap-2 pt-3 border-t">
            <div className="text-xs text-muted-foreground self-center">
              {validationErrors?.length || 0} issue(s) found
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowValidationDialog(false)}>
                Close
              </Button>
              <Button onClick={copyErrorsToClipboard} className="gap-2">
                <Copy className="h-4 w-4" /> Copy Details
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ViewEntityDialog 
        open={showViewDialog} 
        onOpenChange={setShowViewDialog} 
        entity={selectedEntity ?? null} 
      />

      <VisualizeEntityDialog 
        open={showVisualizeDialog} 
        onOpenChange={setShowVisualizeDialog} 
        entity={selectedEntity ?? null} 
      />

      <VisualizeEntityDialog
        open={showVisualizeAllDialog}
        onOpenChange={setShowVisualizeAllDialog}
        entities={entities}
        title="Project Entity Graph"
        autoScreenshotFilename={autoScreenshotFilename}
        onAutoScreenshotComplete={handleAutoScreenshotComplete}
      />

      <ImportEntityDialog
        open={showImportDialog}
        onOpenChange={setShowImportDialog}
        onImportSuccess={handleImportSuccess}
      />

      <ImportMultiDialog
        open={showImportMultiDialog}
        onOpenChange={setShowImportMultiDialog}
        onImportSuccess={handleImportMultiSuccess}
      />

      <ViewAllOmcDialog
        open={showViewAllOmcDialog}
        onOpenChange={setShowViewAllOmcDialog}
        entities={entities}
      />

      <Dialog open={showExportPackageDialog} onOpenChange={(open) => {
        if (!open) {
          setShowExportPackageDialog(false);
          setExportPackageName("omc-project");
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              <Package className="h-5 w-5 inline mr-2" />Export Package
            </DialogTitle>
            <DialogDescription>
              Export all {entities.length} entities as JSON, RDF/TTL, and a graph image.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center gap-2">
              <Input
                value={exportPackageName}
                onChange={(e) => setExportPackageName(e.target.value)}
                placeholder="omc-project"
                className="flex-1"
                data-testid="input-export-package-name"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && exportPackageName.trim()) {
                    executeExportPackage();
                  }
                }}
              />
              <span className="text-muted-foreground font-mono text-sm">.*</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Downloads: {exportPackageName || "omc-project"}.json, {exportPackageName || "omc-project"}.ttl, {exportPackageName || "omc-project"}.jpg
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowExportPackageDialog(false);
              setExportPackageName("omc-project");
            }}>
              Cancel
            </Button>
            <Button 
              onClick={executeExportPackage} 
              data-testid="button-confirm-export-package"
              disabled={!exportPackageName.trim()}
            >
              <Download className="h-4 w-4 mr-2" /> Export All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showExportNameDialog} onOpenChange={(open) => {
        if (!open) {
          setShowExportNameDialog(false);
          setExportFileName("omc-ontology");
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {exportFormat === "json" ? (
                <><FileJson className="h-5 w-5 inline mr-2" />Export All as JSON</>
              ) : (
                <><FileText className="h-5 w-5 inline mr-2" />Export All as TTL (RDF)</>
              )}
            </DialogTitle>
            <DialogDescription>
              Enter a name for your {exportFormat.toUpperCase()} file containing {entities.length} entities.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center gap-2">
              <Input
                value={exportFileName}
                onChange={(e) => setExportFileName(e.target.value)}
                placeholder="omc-ontology"
                className="flex-1"
                data-testid="input-export-filename"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && exportFileName.trim()) {
                    executeExportAll();
                  }
                }}
              />
              <span className="text-muted-foreground font-mono">.{exportFormat}</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowExportNameDialog(false);
              setExportFileName("omc-ontology");
            }}>
              Cancel
            </Button>
            <Button 
              onClick={executeExportAll} 
              data-testid="button-confirm-export"
              disabled={!exportFileName.trim()}
            >
              <Download className="h-4 w-4 mr-2" /> Export
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
