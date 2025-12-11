import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { CheckCircle, Layers, FileVideo, FileAudio, FileImage, FileText, File, ChevronDown, ChevronUp, Settings, Clock, User } from "lucide-react";
import { StagedAsset, AssetGroup } from "./types";
import { formatFileSize } from "@/lib/file-metadata";
import { ASSET_STRUCTURAL_TYPES, ASSET_FUNCTIONAL_TYPES } from "@/lib/asset-types";
import { useState } from "react";

interface Step4ReviewProps {
  stagedAssets: StagedAsset[];
  groups: AssetGroup[];
}

export function Step4Review({ stagedAssets, groups }: Step4ReviewProps) {
  const [expandedAssets, setExpandedAssets] = useState<Set<string>>(new Set());

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

  const getFileIcon = (mimeType: string, className: string = "h-5 w-5") => {
    if (mimeType.startsWith('video/')) return <FileVideo className={`${className} text-blue-500`} />;
    if (mimeType.startsWith('audio/')) return <FileAudio className={`${className} text-purple-500`} />;
    if (mimeType.startsWith('image/')) return <FileImage className={`${className} text-green-500`} />;
    if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.startsWith('text/')) {
      return <FileText className={`${className} text-orange-500`} />;
    }
    return <File className={`${className} text-gray-500`} />;
  };

  const getStructuralLabel = (value: string) => {
    const type = ASSET_STRUCTURAL_TYPES.find(t => t.value === value);
    return type?.label || value;
  };

  const getFunctionalLabel = (value: string) => {
    const type = ASSET_FUNCTIONAL_TYPES.find(t => t.value === value);
    return type?.label || value;
  };

  const formatPropertyValue = (value: any): string => {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'object') {
      return Object.entries(value)
        .filter(([_, v]) => v !== null && v !== undefined)
        .map(([k, v]) => `${k}: ${v}`)
        .join(', ');
    }
    return String(value);
  };

  const groupedAssetIds = new Set(groups.flatMap(g => g.assetIds));

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          Review Your Assets
        </h3>
        <p className="text-sm text-muted-foreground">
          Review all properties below. Click on an asset to see details. Click "Create Assets" to add them to your ontology.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-primary">{stagedAssets.length}</div>
            <div className="text-sm text-muted-foreground">Total Assets</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-primary">{groups.length}</div>
            <div className="text-sm text-muted-foreground">Asset Groups</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-primary">
              {formatFileSize(stagedAssets.reduce((acc, a) => acc + a.metadata.fileSize, 0))}
            </div>
            <div className="text-sm text-muted-foreground">Total Size</div>
          </CardContent>
        </Card>
      </div>

      {groups.length > 0 && (
        <>
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Layers className="h-4 w-4" />
              Asset Groups ({groups.length})
            </h4>
            <div className="space-y-3">
              {groups.map((group) => (
                <Card key={group.id}>
                  <CardHeader className="py-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{group.name}</CardTitle>
                      <div className="flex gap-2">
                        {group.isOrdered && (
                          <Badge variant="secondary">Ordered</Badge>
                        )}
                        <Badge variant="outline">{group.assetIds.length} assets</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="py-3 pt-0">
                    <div className="flex flex-wrap gap-2">
                      {group.assetIds.map((id, index) => {
                        const asset = stagedAssets.find(a => a.id === id);
                        if (!asset) return null;
                        return (
                          <Badge key={id} variant="secondary" className="text-xs">
                            {group.isOrdered && `${index + 1}. `}{asset.name}
                          </Badge>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          <Separator />
        </>
      )}

      <div>
        <h4 className="font-medium mb-3">All Assets ({stagedAssets.length})</h4>
        <ScrollArea className="h-[400px]">
          <div className="space-y-3 pr-4">
            {stagedAssets.map((asset) => {
              const isExpanded = expandedAssets.has(asset.id);
              const structuralPropsCount = Object.keys(asset.structuralProps || {}).length;
              const functionalPropsCount = Object.keys(asset.functionalProps || {}).length;
              const hasProvenance = asset.provenance && Object.values(asset.provenance).some(v => v);

              return (
                <Card key={asset.id} className="overflow-hidden">
                  <Collapsible open={isExpanded} onOpenChange={() => toggleAsset(asset.id)}>
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getFileIcon(asset.metadata.mimeType)}
                            <div>
                              <CardTitle className="text-base">{asset.name}</CardTitle>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {getStructuralLabel(asset.structuralType)}
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  {getFunctionalLabel(asset.functionalType || '')}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {formatFileSize(asset.metadata.fileSize)}
                                </span>
                                {groupedAssetIds.has(asset.id) && (
                                  <Badge variant="default" className="text-xs bg-blue-500">
                                    <Layers className="h-3 w-3 mr-1" />
                                    Grouped
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              {structuralPropsCount + functionalPropsCount + (hasProvenance ? 1 : 0)} property sections
                            </span>
                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </div>
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <CardContent className="pt-0 space-y-4">
                        {asset.description && (
                          <p className="text-sm text-muted-foreground">{asset.description}</p>
                        )}

                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm font-medium">
                            <Settings className="h-4 w-4 text-primary" />
                            Structural Properties
                          </div>
                          <div className="grid grid-cols-3 gap-3 text-sm">
                            {Object.entries(asset.structuralProps || {}).map(([key, value]) => (
                              <div key={key} className="bg-muted/50 rounded p-2">
                                <div className="text-xs text-muted-foreground capitalize">{key}</div>
                                <div className="font-medium truncate" title={formatPropertyValue(value)}>
                                  {formatPropertyValue(value)}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {hasProvenance && (
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm font-medium">
                              <Clock className="h-4 w-4 text-primary" />
                              Provenance
                            </div>
                            <div className="grid grid-cols-3 gap-3 text-sm">
                              {Object.entries(asset.provenance || {}).filter(([_, v]) => v).map(([key, value]) => (
                                <div key={key} className="bg-muted/50 rounded p-2">
                                  <div className="text-xs text-muted-foreground capitalize">{key}</div>
                                  <div className="font-medium truncate" title={String(value)}>
                                    {String(value)}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {functionalPropsCount > 0 && (
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm font-medium">
                              <User className="h-4 w-4 text-primary" />
                              Functional Properties
                            </div>
                            <div className="grid grid-cols-3 gap-3 text-sm">
                              {Object.entries(asset.functionalProps || {}).filter(([_, v]) => v).map(([key, value]) => (
                                <div key={key} className="bg-muted/50 rounded p-2">
                                  <div className="text-xs text-muted-foreground capitalize">{key}</div>
                                  <div className="font-medium truncate" title={formatPropertyValue(value)}>
                                    {formatPropertyValue(value)}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
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
    </div>
  );
}
