import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { ChevronDown, ChevronUp, FileVideo, FileAudio, FileImage, FileText, File, Settings, User, Clock } from "lucide-react";
import { StagedAsset, getFunctionalTypesForStructural, StructuralProperties, FunctionalProperties } from "./types";
import { ASSET_FUNCTIONAL_TYPES } from "@/lib/asset-types";
import { getStructuralPropertiesForType, getFunctionalPropertiesForType, PROVENANCE_PROPERTY_DEFINITIONS, PropertyDefinition } from "@/lib/property-definitions";
import { formatFileSize } from "@/lib/file-metadata";
import { ProvenanceInfo } from "@/lib/file-metadata";

interface Step2ClassifyProps {
  stagedAssets: StagedAsset[];
  onUpdateAsset: (id: string, updates: Partial<StagedAsset>) => void;
}

export function Step2Classify({ stagedAssets, onUpdateAsset }: Step2ClassifyProps) {
  const [expandedAssets, setExpandedAssets] = useState<Set<string>>(new Set(stagedAssets.map(a => a.id)));
  const [expandedSections, setExpandedSections] = useState<Record<string, Set<string>>>({});

  const toggleAsset = (id: string) => {
    setExpandedAssets(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSection = (assetId: string, section: string) => {
    setExpandedSections(prev => {
      const assetSections = prev[assetId] || new Set(['structural', 'provenance', 'functional']);
      const next = new Set(assetSections);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return { ...prev, [assetId]: next };
    });
  };

  const isSectionExpanded = (assetId: string, section: string) => {
    const assetSections = expandedSections[assetId];
    if (!assetSections) return true;
    return assetSections.has(section);
  };

  const getFileIcon = (mimeType: string, className: string = "h-6 w-6") => {
    if (mimeType.startsWith('video/')) return <FileVideo className={`${className} text-blue-500`} />;
    if (mimeType.startsWith('audio/')) return <FileAudio className={`${className} text-purple-500`} />;
    if (mimeType.startsWith('image/')) return <FileImage className={`${className} text-green-500`} />;
    if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.startsWith('text/')) {
      return <FileText className={`${className} text-orange-500`} />;
    }
    return <File className={`${className} text-gray-500`} />;
  };

  const updateStructuralProp = (assetId: string, key: string, value: any) => {
    const asset = stagedAssets.find(a => a.id === assetId);
    if (!asset) return;
    
    const keys = key.split('.');
    const newProps = { ...asset.structuralProps };
    
    if (keys.length === 2) {
      const [parent, child] = keys;
      newProps[parent] = { ...(newProps[parent] || {}), [child]: value };
    } else {
      newProps[key] = value;
    }
    
    onUpdateAsset(assetId, { structuralProps: newProps });
  };

  const updateFunctionalProp = (assetId: string, key: string, value: any) => {
    const asset = stagedAssets.find(a => a.id === assetId);
    if (!asset) return;
    
    onUpdateAsset(assetId, { 
      functionalProps: { ...asset.functionalProps, [key]: value }
    });
  };

  const updateProvenance = (assetId: string, key: string, value: any) => {
    const asset = stagedAssets.find(a => a.id === assetId);
    if (!asset) return;
    
    onUpdateAsset(assetId, { 
      provenance: { ...asset.provenance, [key]: value }
    });
  };

  const getStructuralValue = (asset: StagedAsset, key: string): any => {
    const keys = key.split('.');
    if (keys.length === 2) {
      const [parent, child] = keys;
      return asset.structuralProps?.[parent]?.[child] ?? '';
    }
    return asset.structuralProps?.[key] ?? '';
  };

  const renderPropertyInput = (
    asset: StagedAsset, 
    def: PropertyDefinition, 
    value: any, 
    onChange: (value: any) => void
  ) => {
    switch (def.type) {
      case 'select':
        return (
          <Select value={value || ''} onValueChange={onChange}>
            <SelectTrigger className="w-full" data-testid={`select-${def.key}-${asset.id}`}>
              <SelectValue placeholder={`Select ${def.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {def.options?.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case 'boolean':
        return (
          <Select value={value ? 'true' : 'false'} onValueChange={(v) => onChange(v === 'true')}>
            <SelectTrigger className="w-full" data-testid={`select-${def.key}-${asset.id}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Yes</SelectItem>
              <SelectItem value="false">No</SelectItem>
            </SelectContent>
          </Select>
        );
      case 'number':
        return (
          <div className="flex items-center gap-2">
            <Input 
              type="number" 
              value={value || ''} 
              onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
              className="flex-1"
              data-testid={`input-${def.key}-${asset.id}`}
            />
            {def.unit && <span className="text-sm text-muted-foreground">{def.unit}</span>}
          </div>
        );
      case 'textarea':
        return (
          <Textarea 
            value={value || ''} 
            onChange={(e) => onChange(e.target.value)}
            rows={3}
            data-testid={`textarea-${def.key}-${asset.id}`}
          />
        );
      case 'date':
        return (
          <Input 
            type="datetime-local" 
            value={value ? value.substring(0, 16) : ''} 
            onChange={(e) => onChange(e.target.value ? new Date(e.target.value).toISOString() : null)}
            data-testid={`input-${def.key}-${asset.id}`}
          />
        );
      default:
        return (
          <Input 
            type="text" 
            value={value || ''} 
            onChange={(e) => onChange(e.target.value)}
            data-testid={`input-${def.key}-${asset.id}`}
          />
        );
    }
  };

  const availableFunctionalTypes = ASSET_FUNCTIONAL_TYPES;

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Classify & Configure Assets</h3>
        <p className="text-sm text-muted-foreground">
          Set functional types, edit structural properties, and configure provenance for each asset.
        </p>
      </div>

      <ScrollArea className="h-[calc(100vh-350px)]">
        <div className="space-y-4 pr-4">
          {stagedAssets.map((asset, index) => {
            const functionalTypes = getFunctionalTypesForStructural(asset.structuralType);
            const structuralDefs = getStructuralPropertiesForType(asset.structuralType);
            const functionalDefs = asset.functionalType ? getFunctionalPropertiesForType(asset.functionalType) : [];
            const isExpanded = expandedAssets.has(asset.id);

            return (
              <Card key={asset.id} className="overflow-hidden">
                <Collapsible open={isExpanded} onOpenChange={() => toggleAsset(asset.id)}>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getFileIcon(asset.metadata.mimeType)}
                          <div>
                            <CardTitle className="text-base">{asset.name || asset.metadata.fileName}</CardTitle>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">{asset.structuralType}</Badge>
                              {asset.functionalType && (
                                <Badge variant="secondary" className="text-xs">{asset.functionalType}</Badge>
                              )}
                              <span className="text-xs text-muted-foreground">
                                {formatFileSize(asset.metadata.fileSize)}
                              </span>
                            </div>
                          </div>
                        </div>
                        {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <CardContent className="pt-0 space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`name-${asset.id}`}>Asset Name *</Label>
                          <Input
                            id={`name-${asset.id}`}
                            value={asset.name}
                            onChange={(e) => onUpdateAsset(asset.id, { name: e.target.value })}
                            placeholder="Enter asset name"
                            data-testid={`input-name-${asset.id}`}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`functionalType-${asset.id}`}>Functional Type *</Label>
                          <Select
                            value={asset.functionalType || ''}
                            onValueChange={(value) => onUpdateAsset(asset.id, { functionalType: value })}
                          >
                            <SelectTrigger data-testid={`select-functionalType-${asset.id}`}>
                              <SelectValue placeholder="Select functional type" />
                            </SelectTrigger>
                            <SelectContent>
                              {functionalTypes.map(type => {
                                const typeInfo = availableFunctionalTypes.find(t => t.value === type);
                                return (
                                  <SelectItem key={type} value={type}>
                                    {typeInfo?.label || type}
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`description-${asset.id}`}>Description</Label>
                        <Textarea
                          id={`description-${asset.id}`}
                          value={asset.description}
                          onChange={(e) => onUpdateAsset(asset.id, { description: e.target.value })}
                          placeholder="Optional description"
                          rows={2}
                          data-testid={`textarea-description-${asset.id}`}
                        />
                      </div>

                      <Separator />

                      <Collapsible 
                        open={isSectionExpanded(asset.id, 'structural')} 
                        onOpenChange={() => toggleSection(asset.id, 'structural')}
                      >
                        <CollapsibleTrigger className="flex items-center gap-2 w-full py-2 hover:bg-muted/50 rounded px-2 -mx-2">
                          <Settings className="h-4 w-4 text-primary" />
                          <span className="font-medium text-sm">Structural Properties</span>
                          <Badge variant="outline" className="ml-auto text-xs">{structuralDefs.length} properties</Badge>
                          {isSectionExpanded(asset.id, 'structural') ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </CollapsibleTrigger>
                        <CollapsibleContent className="pt-3">
                          <div className="grid grid-cols-2 gap-4">
                            {structuralDefs.map(def => (
                              <div key={def.key} className="space-y-1">
                                <Label className="text-sm">{def.label}</Label>
                                <p className="text-xs text-muted-foreground mb-1">{def.description}</p>
                                {renderPropertyInput(
                                  asset,
                                  def,
                                  getStructuralValue(asset, def.key),
                                  (value) => updateStructuralProp(asset.id, def.key, value)
                                )}
                              </div>
                            ))}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>

                      <Separator />

                      <Collapsible 
                        open={isSectionExpanded(asset.id, 'provenance')} 
                        onOpenChange={() => toggleSection(asset.id, 'provenance')}
                      >
                        <CollapsibleTrigger className="flex items-center gap-2 w-full py-2 hover:bg-muted/50 rounded px-2 -mx-2">
                          <Clock className="h-4 w-4 text-primary" />
                          <span className="font-medium text-sm">Provenance</span>
                          {isSectionExpanded(asset.id, 'provenance') ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </CollapsibleTrigger>
                        <CollapsibleContent className="pt-3">
                          <div className="grid grid-cols-2 gap-4">
                            {Object.values(PROVENANCE_PROPERTY_DEFINITIONS).map(def => (
                              <div key={def.key} className="space-y-1">
                                <Label className="text-sm">{def.label}</Label>
                                <p className="text-xs text-muted-foreground mb-1">{def.description}</p>
                                {renderPropertyInput(
                                  asset,
                                  def,
                                  asset.provenance?.[def.key as keyof ProvenanceInfo] ?? '',
                                  (value) => updateProvenance(asset.id, def.key, value)
                                )}
                              </div>
                            ))}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>

                      {functionalDefs.length > 0 && (
                        <>
                          <Separator />
                          <Collapsible 
                            open={isSectionExpanded(asset.id, 'functional')} 
                            onOpenChange={() => toggleSection(asset.id, 'functional')}
                          >
                            <CollapsibleTrigger className="flex items-center gap-2 w-full py-2 hover:bg-muted/50 rounded px-2 -mx-2">
                              <User className="h-4 w-4 text-primary" />
                              <span className="font-medium text-sm">Functional Properties</span>
                              <Badge variant="outline" className="ml-auto text-xs">{functionalDefs.length} properties</Badge>
                              {isSectionExpanded(asset.id, 'functional') ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </CollapsibleTrigger>
                            <CollapsibleContent className="pt-3">
                              <div className="grid grid-cols-2 gap-4">
                                {functionalDefs.map(def => (
                                  <div key={def.key} className="space-y-1">
                                    <Label className="text-sm">{def.label}</Label>
                                    <p className="text-xs text-muted-foreground mb-1">{def.description}</p>
                                    {renderPropertyInput(
                                      asset,
                                      def,
                                      asset.functionalProps?.[def.key] ?? '',
                                      (value) => updateFunctionalProp(asset.id, def.key, value)
                                    )}
                                  </div>
                                ))}
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        </>
                      )}
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
