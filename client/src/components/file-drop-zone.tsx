import { useState, useCallback } from "react";
import { Upload, FileVideo, FileAudio, FileImage, FileText, File, X, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { extractFileMetadata, mapMetadataToAsset, formatFileSize, ExtractedMetadata } from "@/lib/file-metadata";
import { v4 as uuidv4 } from "uuid";

interface FileDropZoneProps {
  onAssetCreated: (asset: any, metadata: ExtractedMetadata) => void;
  onCancel: () => void;
}

export function FileDropZone({ onAssetCreated, onCancel }: FileDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<{ metadata: ExtractedMetadata; asset: any } | null>(null);

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('video/')) return <FileVideo className="h-12 w-12 text-blue-500" />;
    if (mimeType.startsWith('audio/')) return <FileAudio className="h-12 w-12 text-purple-500" />;
    if (mimeType.startsWith('image/')) return <FileImage className="h-12 w-12 text-green-500" />;
    if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.startsWith('text/')) {
      return <FileText className="h-12 w-12 text-orange-500" />;
    }
    return <File className="h-12 w-12 text-gray-500" />;
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const processFile = async (file: File) => {
    setIsProcessing(true);
    try {
      const metadata = await extractFileMetadata(file);
      const id = uuidv4();
      const asset = mapMetadataToAsset(metadata, id);
      setExtractedData({ metadata, asset });
    } catch (error) {
      console.error('Error processing file:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleConfirm = () => {
    if (extractedData) {
      onAssetCreated(extractedData.asset, extractedData.metadata);
    }
  };

  const handleReset = () => {
    setExtractedData(null);
  };

  if (extractedData) {
    const { metadata, asset } = extractedData;
    return (
      <Card className="border-2 border-primary/30 bg-primary/5">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            {getFileIcon(metadata.mimeType)}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate" data-testid="text-extracted-filename">
                {metadata.fileName}
              </h3>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="secondary" data-testid="badge-file-size">
                  {formatFileSize(metadata.fileSize)}
                </Badge>
                <Badge variant="secondary" data-testid="badge-file-type">
                  {metadata.mimeType || 'Unknown type'}
                </Badge>
                {metadata.structuralType && (
                  <Badge variant="default" data-testid="badge-structural-type">
                    {metadata.structuralType}
                  </Badge>
                )}
              </div>
              
              <div className="mt-4 space-y-2 text-sm">
                <h4 className="font-medium text-muted-foreground">Extracted Properties:</h4>
                <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                  {metadata.width && metadata.height && (
                    <div data-testid="text-dimensions">
                      <span className="font-medium">Dimensions:</span> {metadata.width} x {metadata.height} px
                    </div>
                  )}
                  {metadata.duration && (
                    <div data-testid="text-duration">
                      <span className="font-medium">Duration:</span> {Math.floor(metadata.duration / 60)}:{String(Math.floor(metadata.duration % 60)).padStart(2, '0')}
                    </div>
                  )}
                  {asset.assetFC?.functionalType && (
                    <div data-testid="text-functional-type">
                      <span className="font-medium">Functional Type:</span> {asset.assetFC.functionalType}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2 mt-6 justify-end">
            <Button variant="outline" onClick={handleReset} data-testid="button-reset-file">
              <X className="h-4 w-4 mr-1" /> Choose Different File
            </Button>
            <Button onClick={handleConfirm} data-testid="button-confirm-asset">
              <Check className="h-4 w-4 mr-1" /> Create Asset
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
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
              <p className="text-lg font-medium">Analyzing file...</p>
              <p className="text-sm text-muted-foreground mt-1">Extracting metadata</p>
            </>
          ) : (
            <>
              <Upload className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">Drop a media file here</p>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                or click to browse. Supports video, audio, images, and documents.
              </p>
              <div className="flex gap-2">
                <Button variant="outline" asChild data-testid="button-browse-files">
                  <label className="cursor-pointer">
                    Browse Files
                    <input 
                      type="file" 
                      className="hidden" 
                      onChange={handleFileSelect}
                      accept="video/*,audio/*,image/*,application/pdf,.doc,.docx,.txt"
                    />
                  </label>
                </Button>
                <Button variant="ghost" onClick={onCancel} data-testid="button-cancel-upload">
                  Cancel
                </Button>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
