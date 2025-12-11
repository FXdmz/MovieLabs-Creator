import { useCallback, useState } from "react";
import { Upload, FileVideo, FileAudio, FileImage, FileText, File, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { StagedAsset } from "./types";
import { formatFileSize } from "@/lib/file-metadata";
import { ASSET_STRUCTURAL_TYPES } from "@/lib/asset-types";

interface Step1UploadProps {
  stagedAssets: StagedAsset[];
  onAddFiles: (files: File[]) => Promise<void>;
  onRemoveAsset: (id: string) => void;
  onUpdateAsset: (id: string, updates: Partial<StagedAsset>) => void;
}

export function Step1Upload({ stagedAssets, onAddFiles, onRemoveAsset, onUpdateAsset }: Step1UploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const getFileIcon = (mimeType: string, className: string = "h-5 w-5") => {
    if (mimeType.startsWith('video/')) return <FileVideo className={`${className} text-blue-500`} />;
    if (mimeType.startsWith('audio/')) return <FileAudio className={`${className} text-purple-500`} />;
    if (mimeType.startsWith('image/')) return <FileImage className={`${className} text-green-500`} />;
    if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.startsWith('text/')) {
      return <FileText className={`${className} text-orange-500`} />;
    }
    return <File className={`${className} text-gray-500`} />;
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      setIsProcessing(true);
      await onAddFiles(files);
      setIsProcessing(false);
    }
  }, [onAddFiles]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length > 0) {
      setIsProcessing(true);
      await onAddFiles(files);
      setIsProcessing(false);
    }
    e.target.value = '';
  };

  return (
    <div className="space-y-6">
      <Card 
        className={`border-2 border-dashed transition-colors ${
          isDragging ? 'border-primary bg-primary/10' : 'border-muted-foreground/25 hover:border-primary/50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center text-center">
            {isProcessing ? (
              <>
                <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                <p className="text-lg font-medium">Processing files...</p>
                <p className="text-sm text-muted-foreground mt-1">Extracting metadata</p>
              </>
            ) : (
              <>
                <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">Drop media files here</p>
                <p className="text-sm text-muted-foreground mt-1 mb-4">
                  or click to browse. Supports video, audio, images, documents, and 3D files.
                </p>
                <Button variant="outline" asChild data-testid="button-browse-files">
                  <label className="cursor-pointer">
                    Browse Files
                    <input 
                      type="file" 
                      className="hidden" 
                      onChange={handleFileSelect}
                      accept="video/*,audio/*,image/*,application/pdf,.doc,.docx,.txt,.obj,.fbx,.usd,.json,.xml"
                      multiple
                    />
                  </label>
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {stagedAssets.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>File Name</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead className="w-[250px]">Detected Structural Type</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stagedAssets.map((asset) => (
                    <TableRow key={asset.id}>
                      <TableCell>
                        {getFileIcon(asset.metadata.mimeType)}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium truncate max-w-[300px]" title={asset.metadata.fileName}>
                          {asset.metadata.fileName}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {asset.metadata.mimeType || 'Unknown type'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {formatFileSize(asset.metadata.fileSize)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={asset.structuralType}
                          onValueChange={(value) => onUpdateAsset(asset.id, { structuralType: value })}
                        >
                          <SelectTrigger className="w-full" data-testid={`select-structural-${asset.id}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ASSET_STRUCTURAL_TYPES.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onRemoveAsset(asset.id)}
                          className="text-destructive hover:text-destructive"
                          data-testid={`button-remove-${asset.id}`}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {stagedAssets.length === 0 && (
        <div className="text-center text-muted-foreground py-8">
          <p>No files uploaded yet. Drop files above or click Browse to add files.</p>
        </div>
      )}
    </div>
  );
}
