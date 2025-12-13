/**
 * @fileoverview Multi-entity project import dialog for JSON/TTL files.
 * Allows importing multiple OMC entities from a single file with preview.
 * 
 * @features
 * - Two-step import: upload → preview → confirm
 * - Entity type badges with counts
 * - Scrollable entity list preview
 * - Warning display for non-fatal issues
 * - Supports JSON and TTL (RDF/Turtle) formats
 */

import { useState, useCallback } from 'react';
import { Upload, FileJson, FileText, AlertCircle, CheckCircle, Package, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { parseOmcFileMulti, MultiImportResult, ImportedEntity } from '@/lib/import';
import { EntityType } from '@/lib/constants';

interface ImportMultiDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportSuccess: (entities: ImportedEntity[]) => void;
}

const entityTypeColors: Record<string, string> = {
  Task: 'bg-[#3AA608] text-white',
  Asset: 'bg-[#D97218] text-white',
  Participant: 'bg-[#232073] text-white',
  Context: 'bg-[#F2C53D] text-black',
  Infrastructure: 'bg-[#CEECF2] text-black',
  CreativeWork: 'bg-purple-500 text-white',
  Location: 'bg-red-500 text-white',
  Character: 'bg-pink-500 text-white',
  Sequence: 'bg-indigo-500 text-white',
  Slate: 'bg-gray-500 text-white',
  ProductionScene: 'bg-teal-500 text-white',
  NarrativeScene: 'bg-cyan-500 text-white',
};

type Step = 'upload' | 'preview' | 'complete';

export function ImportMultiDialog({ open, onOpenChange, onImportSuccess }: ImportMultiDialogProps) {
  const [step, setStep] = useState<Step>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<MultiImportResult | null>(null);

  const resetState = useCallback(() => {
    setStep('upload');
    setError(null);
    setSelectedFile(null);
    setIsProcessing(false);
    setImportResult(null);
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
      const result = await parseOmcFileMulti(text, file.name);

      if (result.success && result.entities.length > 0) {
        setImportResult(result);
        setStep('preview');
      } else {
        setError(result.error || 'No valid entities found in file');
      }
    } catch (e: any) {
      setError(`Failed to read file: ${e.message}`);
    } finally {
      setIsProcessing(false);
    }
  }, []);

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

  const handleImport = useCallback(() => {
    if (importResult?.entities) {
      onImportSuccess(importResult.entities);
      handleClose();
    }
  }, [importResult, onImportSuccess, handleClose]);

  const entityTypeCounts = importResult?.entities.reduce((acc, entity) => {
    acc[entity.entityType] = (acc[entity.entityType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-[#232073] dark:text-primary" />
            Import OMC Project
          </DialogTitle>
          <DialogDescription>
            {step === 'upload' && 'Import multiple OMC entities from a JSON or TTL file.'}
            {step === 'preview' && `Found ${importResult?.entities.length} entities in ${selectedFile?.name}`}
          </DialogDescription>
        </DialogHeader>

        {step === 'upload' && (
          <>
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
              data-testid="import-multi-drop-zone"
            >
              <input
                type="file"
                accept=".json,.ttl,.turtle,.rdf"
                onChange={handleFileSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                data-testid="input-import-multi-file"
              />
              
              <div className="flex flex-col items-center justify-center text-center">
                {isProcessing ? (
                  <>
                    <Loader2 className="h-10 w-10 text-[#232073] dark:text-primary mb-3 animate-spin" />
                    <p className="text-sm text-muted-foreground">Processing {selectedFile?.name}...</p>
                  </>
                ) : error ? (
                  <>
                    <AlertCircle className="h-10 w-10 text-destructive mb-3" />
                    <p className="text-sm font-medium text-destructive mb-1">Import Failed</p>
                    <p className="text-xs text-muted-foreground max-w-[300px]">{error}</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-3"
                      onClick={(e) => {
                        e.stopPropagation();
                        resetState();
                      }}
                      data-testid="button-try-again-multi"
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
                    <p className="text-sm font-medium mb-1">Drop your OMC project file here</p>
                    <p className="text-xs text-muted-foreground">or click to browse</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Supports .json and .ttl files with multiple entities
                    </p>
                  </>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose} data-testid="button-cancel-import-multi">
                Cancel
              </Button>
            </DialogFooter>
          </>
        )}

        {step === 'preview' && importResult && (
          <>
            <div className="flex flex-wrap gap-2 mb-3">
              {Object.entries(entityTypeCounts).map(([type, count]) => (
                <Badge
                  key={type}
                  className={entityTypeColors[type] || 'bg-gray-400 text-white'}
                >
                  {count} {type}{count > 1 ? 's' : ''}
                </Badge>
              ))}
            </div>

            <ScrollArea className="flex-1 max-h-[300px] border rounded-md">
              <div className="p-2 space-y-1">
                {importResult.entities.map((entity, index) => (
                  <div
                    key={entity.entityId}
                    className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors"
                    data-testid={`import-preview-entity-${index}`}
                  >
                    <Badge 
                      variant="outline" 
                      className={`text-xs shrink-0 ${entityTypeColors[entity.entityType] || 'bg-gray-400 text-white'}`}
                    >
                      {entity.entityType}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{entity.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {entity.entityId}
                      </p>
                    </div>
                    <CheckCircle className="h-4 w-4 text-[#3AA608] shrink-0" />
                  </div>
                ))}
              </div>
            </ScrollArea>

            {importResult.warnings && importResult.warnings.length > 0 && (
              <div className="flex items-start gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-md p-3">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium mb-1">Warnings:</p>
                  <ul className="list-disc list-inside space-y-0.5">
                    {importResult.warnings.slice(0, 3).map((warning, i) => (
                      <li key={i}>{warning}</li>
                    ))}
                    {importResult.warnings.length > 3 && (
                      <li>...and {importResult.warnings.length - 3} more</li>
                    )}
                  </ul>
                </div>
              </div>
            )}

            <DialogFooter className="flex gap-2 sm:gap-2">
              <Button variant="outline" onClick={resetState} data-testid="button-back-import">
                Back
              </Button>
              <Button 
                onClick={handleImport}
                className="bg-[#232073] hover:bg-[#232073]/90 dark:bg-primary dark:hover:bg-primary/90"
                data-testid="button-confirm-import"
              >
                <Upload className="h-4 w-4 mr-2" />
                Import {importResult.entities.length} Entities
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
