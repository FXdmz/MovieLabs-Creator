import { useState, useCallback } from 'react';
import { Upload, FileJson, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { parseOmcFile, ImportResult } from '@/lib/import';

interface ImportEntityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportSuccess: (result: ImportResult) => void;
}

export function ImportEntityDialog({ open, onOpenChange, onImportSuccess }: ImportEntityDialogProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const resetState = useCallback(() => {
    setError(null);
    setSelectedFile(null);
    setIsProcessing(false);
  }, []);

  const handleClose = useCallback(() => {
    resetState();
    onOpenChange(false);
  }, [onOpenChange, resetState]);

  const processFile = useCallback(async (file: File) => {
    setError(null);
    setSelectedFile(file);
    setIsProcessing(true);

    try {
      const text = await file.text();
      const result = await parseOmcFile(text, file.name);

      if (result.success) {
        onImportSuccess(result);
        handleClose();
      } else {
        setError(result.error || 'Unknown error occurred');
      }
    } catch (e: any) {
      setError(`Failed to read file: ${e.message}`);
    } finally {
      setIsProcessing(false);
    }
  }, [onImportSuccess, handleClose]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  }, [processFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  }, [processFile]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-[#232073] dark:text-primary" />
            Import OMC Entity
          </DialogTitle>
          <DialogDescription>
            Import a single OMC entity from a JSON or TTL (RDF/Turtle) file.
          </DialogDescription>
        </DialogHeader>

        <div
          className={`
            relative border-2 border-dashed rounded-lg p-8 transition-colors
            ${isDragging 
              ? 'border-[#232073] bg-[#CEECF2]/20 dark:border-primary dark:bg-primary/10' 
              : 'border-muted-foreground/25 hover:border-muted-foreground/50'
            }
            ${error ? 'border-destructive' : ''}
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          data-testid="import-drop-zone"
        >
          <input
            type="file"
            accept=".json,.ttl,.turtle,.rdf"
            onChange={handleFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            data-testid="input-import-file"
          />
          
          <div className="flex flex-col items-center justify-center text-center">
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#232073] dark:border-primary mb-3" />
                <p className="text-sm text-muted-foreground">Processing {selectedFile?.name}...</p>
              </>
            ) : error ? (
              <>
                <AlertCircle className="h-10 w-10 text-destructive mb-3" />
                <p className="text-sm font-medium text-destructive mb-1">Import Failed</p>
                <p className="text-xs text-muted-foreground max-w-[250px]">{error}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-3"
                  onClick={(e) => {
                    e.stopPropagation();
                    resetState();
                  }}
                  data-testid="button-try-again"
                >
                  Try Again
                </Button>
              </>
            ) : (
              <>
                <div className="flex gap-2 mb-3">
                  <FileJson className="h-8 w-8 text-[#3AA608]" />
                  <FileText className="h-8 w-8 text-[#D97218]" />
                </div>
                <p className="text-sm font-medium mb-1">Drop your OMC file here</p>
                <p className="text-xs text-muted-foreground">or click to browse</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Supports .json and .ttl files
                </p>
              </>
            )}
          </div>
        </div>

        <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 rounded-md p-3">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <p>
            Only single-entity OMC files are supported. The entity must have a valid 
            <code className="mx-1 px-1 py-0.5 bg-muted rounded">entityType</code> 
            and 
            <code className="mx-1 px-1 py-0.5 bg-muted rounded">schemaVersion</code>.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} data-testid="button-cancel-import">
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
