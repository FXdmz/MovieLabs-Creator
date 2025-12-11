import { FileVideo, FileAudio, FileImage, FileText, File, Layers, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { StagedAsset, AssetGroup } from "./types";
import { formatFileSize } from "@/lib/file-metadata";
import { ASSET_STRUCTURAL_TYPES, ASSET_FUNCTIONAL_TYPES } from "@/lib/asset-types";

interface Step4ReviewProps {
  stagedAssets: StagedAsset[];
  groups: AssetGroup[];
}

export function Step4Review({ stagedAssets, groups }: Step4ReviewProps) {
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
    return ASSET_STRUCTURAL_TYPES.find(t => t.value === value)?.label || value;
  };

  const getFunctionalLabel = (value: string | null) => {
    if (!value) return "Not set";
    return ASSET_FUNCTIONAL_TYPES.find(t => t.value === value)?.label || value;
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
          Review the assets below. Click "Create Assets" to add them to your ontology.
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
        <Card>
          <CardContent className="p-0">
            <ScrollArea className="h-[300px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Structural Type</TableHead>
                    <TableHead>Functional Type</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stagedAssets.map((asset) => (
                    <TableRow key={asset.id}>
                      <TableCell>
                        {getFileIcon(asset.metadata.mimeType)}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{asset.name}</div>
                        {asset.description && (
                          <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {asset.description}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {getStructuralLabel(asset.structuralType)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {getFunctionalLabel(asset.functionalType)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatFileSize(asset.metadata.fileSize)}
                      </TableCell>
                      <TableCell>
                        {groupedAssetIds.has(asset.id) ? (
                          <Badge variant="default" className="text-xs bg-blue-500">
                            <Layers className="h-3 w-3 mr-1" />
                            Grouped
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            Individual
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
