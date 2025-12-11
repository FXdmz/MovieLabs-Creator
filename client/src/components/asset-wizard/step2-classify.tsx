import { FileVideo, FileAudio, FileImage, FileText, File } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { StagedAsset, getFunctionalTypesForStructural } from "./types";
import { useEffect } from "react";
import { ASSET_FUNCTIONAL_TYPES } from "@/lib/asset-types";

interface Step2ClassifyProps {
  stagedAssets: StagedAsset[];
  onUpdateAsset: (id: string, updates: Partial<StagedAsset>) => void;
}

export function Step2Classify({ stagedAssets, onUpdateAsset }: Step2ClassifyProps) {
  // Auto-suggest functional types based on metadata
  useEffect(() => {
    for (const asset of stagedAssets) {
      if (!asset.functionalType) {
        // Auto-suggest script for PDFs with script keywords
        if (asset.metadata.isLikelyScript && asset.structuralType.includes('document')) {
          onUpdateAsset(asset.id, { functionalType: 'script' });
        }
      }
    }
  }, [stagedAssets.map(a => `${a.id}-${a.metadata.isLikelyScript}`).join(',')]); // React to metadata changes

  const getFileIcon = (mimeType: string, className: string = "h-8 w-8") => {
    if (mimeType.startsWith('video/')) return <FileVideo className={`${className} text-blue-500`} />;
    if (mimeType.startsWith('audio/')) return <FileAudio className={`${className} text-purple-500`} />;
    if (mimeType.startsWith('image/')) return <FileImage className={`${className} text-green-500`} />;
    if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.startsWith('text/')) {
      return <FileText className={`${className} text-orange-500`} />;
    }
    return <File className={`${className} text-gray-500`} />;
  };

  const getFilteredFunctionalTypes = (structuralType: string) => {
    const suggestedTypes = getFunctionalTypesForStructural(structuralType);
    
    if (suggestedTypes.length === 0) {
      return ASSET_FUNCTIONAL_TYPES;
    }
    
    const suggested = ASSET_FUNCTIONAL_TYPES.filter(t => suggestedTypes.includes(t.value));
    const others = ASSET_FUNCTIONAL_TYPES.filter(t => !suggestedTypes.includes(t.value));
    
    return { suggested, others };
  };

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Classify Your Assets</h3>
        <p className="text-sm text-muted-foreground">
          Set the functional type, name, and description for each asset. Functional types are filtered based on structural type.
        </p>
      </div>

      <ScrollArea className="h-[500px] pr-4">
        <div className="space-y-4">
          {stagedAssets.map((asset, index) => {
            const functionalOptions = getFilteredFunctionalTypes(asset.structuralType);
            const hasSuggestions = 'suggested' in functionalOptions;

            return (
              <Card key={asset.id} className={!asset.functionalType || !asset.name.trim() ? 'border-destructive/50' : ''}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    {getFileIcon(asset.metadata.mimeType)}
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base truncate">
                        {asset.metadata.fileName}
                      </CardTitle>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {asset.structuralType}
                        </Badge>
                      </div>
                    </div>
                    <Badge variant="secondary" className="shrink-0">
                      #{index + 1}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`name-${asset.id}`}>
                        Asset Name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id={`name-${asset.id}`}
                        value={asset.name}
                        onChange={(e) => onUpdateAsset(asset.id, { name: e.target.value })}
                        placeholder="Enter asset name"
                        data-testid={`input-name-${asset.id}`}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`functional-${asset.id}`}>
                        Functional Type <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={asset.functionalType || ""}
                        onValueChange={(value) => onUpdateAsset(asset.id, { functionalType: value })}
                      >
                        <SelectTrigger data-testid={`select-functional-${asset.id}`}>
                          <SelectValue placeholder="Select functional type" />
                        </SelectTrigger>
                        <SelectContent>
                          {hasSuggestions ? (
                            <>
                              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                                Suggested for {asset.structuralType}
                              </div>
                              {functionalOptions.suggested.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground border-t mt-1 pt-2">
                                Other Types
                              </div>
                              {functionalOptions.others.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </>
                          ) : (
                            ASSET_FUNCTIONAL_TYPES.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`desc-${asset.id}`}>Description</Label>
                    <Textarea
                      id={`desc-${asset.id}`}
                      value={asset.description}
                      onChange={(e) => onUpdateAsset(asset.id, { description: e.target.value })}
                      placeholder="Optional description"
                      rows={2}
                      data-testid={`input-desc-${asset.id}`}
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
