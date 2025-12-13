/**
 * @fileoverview Asset Import Wizard Component
 * 
 * Multi-step wizard for importing files as OMC Asset entities.
 * Guides users through file upload, classification, grouping, and review.
 * 
 * @steps
 * 1. Upload Files: Drag-drop or select files, auto-detect structural types
 * 2. Classify: Set functional types, edit metadata properties
 * 3. Group: Optionally combine related assets (image sequences, sidecars)
 * 4. Review: Final review before creating Asset entities
 * 
 * @features
 * - Auto-detects structural type from MIME type
 * - Extracts metadata via server API (audio/video/PDF)
 * - Filters functional types based on selected structural type
 * - Supports ordered/unordered asset groups
 */

import { useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, Upload, Tag, Layers, CheckCircle } from "lucide-react";
import { StagedAsset, AssetGroup, WizardState } from "./types";
import { extractFileMetadata, ExtractedMetadata, formatDuration } from "@/lib/file-metadata";
import { Step1Upload } from "./step1-upload";
import { Step2Classify } from "./step2-classify";
import { Step3Group } from "./step3-group";
import { Step4Review } from "./step4-review";

interface AssetWizardProps {
  onComplete: (assets: any[], groups: any[]) => void;
  onCancel: () => void;
}

const STEPS = [
  { id: 1, title: "Upload Files", icon: Upload, description: "Add files and detect structural types" },
  { id: 2, title: "Classify", icon: Tag, description: "Set functional types and metadata" },
  { id: 3, title: "Group", icon: Layers, description: "Optionally group related assets" },
  { id: 4, title: "Review", icon: CheckCircle, description: "Review and create assets" }
];

export function AssetWizard({ onComplete, onCancel }: AssetWizardProps) {
  const [state, setState] = useState<WizardState>({
    step: 1,
    stagedAssets: [],
    groups: []
  });

  const updateStagedAssets = useCallback((assets: StagedAsset[]) => {
    setState(prev => ({ ...prev, stagedAssets: assets }));
  }, []);

  const updateGroups = useCallback((groups: AssetGroup[]) => {
    setState(prev => ({ ...prev, groups }));
  }, []);

  const addFiles = useCallback(async (files: File[]) => {
    const newAssets: StagedAsset[] = [];
    
    for (const file of files) {
      const metadata = await extractFileMetadata(file);
      const structuralType = metadata.structuralType || "digital";
      
      const structuralProps: any = {
        fileDetails: {
          fileName: metadata.fileName,
          fileExtension: metadata.fileExtension
        }
      };
      
      if (metadata.width && metadata.height) {
        structuralProps.dimensions = {
          width: `${metadata.width}px`,
          height: `${metadata.height}px`
        };
      }
      
      // Note: duration is not a valid top-level property in structuralProperties
      // according to OMC schema - it's only valid in Composition/Sequence contexts
      
      if (metadata.sampleRate) {
        structuralProps.audioSampleRate = metadata.sampleRate;
      }
      
      if (metadata.channels) {
        structuralProps.audioSampleSize = metadata.bitsPerSample || undefined;
      }
      
      if (metadata.bitRate) {
        structuralProps.audioBitRate = metadata.bitRate;
      }
      
      if (metadata.codec) {
        structuralProps.codec = metadata.codec;
      }
      
      if (metadata.pageCount) {
        structuralProps.pageCount = metadata.pageCount;
      }
      
      newAssets.push({
        id: uuidv4(),
        file,
        metadata,
        structuralType,
        functionalType: null,
        name: file.name.replace(/\.[^/.]+$/, ""),
        description: "",
        structuralProps,
        functionalProps: {},
        provenance: metadata.provenance
      });
    }
    
    setState(prev => ({
      ...prev,
      stagedAssets: [...prev.stagedAssets, ...newAssets]
    }));
  }, []);

  const removeAsset = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      stagedAssets: prev.stagedAssets.filter(a => a.id !== id),
      groups: prev.groups.map(g => ({
        ...g,
        assetIds: g.assetIds.filter(aid => aid !== id)
      })).filter(g => g.assetIds.length > 0)
    }));
  }, []);

  const updateAsset = useCallback((id: string, updates: Partial<StagedAsset>) => {
    setState(prev => ({
      ...prev,
      stagedAssets: prev.stagedAssets.map(a => 
        a.id === id ? { ...a, ...updates } : a
      )
    }));
  }, []);

  const nextStep = () => {
    if (state.step < 4) {
      setState(prev => ({ ...prev, step: prev.step + 1 }));
    }
  };

  const prevStep = () => {
    if (state.step > 1) {
      setState(prev => ({ ...prev, step: prev.step - 1 }));
    }
  };

  const canProceed = () => {
    switch (state.step) {
      case 1:
        return state.stagedAssets.length > 0;
      case 2:
        return state.stagedAssets.every(a => a.functionalType && a.name.trim());
      case 3:
        return true;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const handleComplete = () => {
    onComplete(state.stagedAssets, state.groups);
  };

  const progress = (state.step / 4) * 100;

  return (
    <div className="flex flex-col h-full">
      <div className="border-b bg-card/50 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-foreground">Asset Import Wizard</h2>
            <p className="text-sm text-muted-foreground">
              Step {state.step} of 4: {STEPS[state.step - 1].description}
            </p>
          </div>
          <Button variant="ghost" onClick={onCancel} data-testid="button-cancel-wizard">
            Cancel
          </Button>
        </div>
        
        <div className="flex items-center gap-2 mb-2">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div 
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-colors ${
                  state.step === step.id 
                    ? 'bg-primary text-primary-foreground' 
                    : state.step > step.id
                      ? 'bg-primary/20 text-primary'
                      : 'bg-muted text-muted-foreground'
                }`}
              >
                <step.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{step.title}</span>
              </div>
              {index < STEPS.length - 1 && (
                <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground" />
              )}
            </div>
          ))}
        </div>
        <Progress value={progress} className="h-1" />
      </div>

      <div className="flex-1 overflow-auto p-6">
        {state.step === 1 && (
          <Step1Upload
            stagedAssets={state.stagedAssets}
            onAddFiles={addFiles}
            onRemoveAsset={removeAsset}
            onUpdateAsset={updateAsset}
          />
        )}
        {state.step === 2 && (
          <Step2Classify
            stagedAssets={state.stagedAssets}
            onUpdateAsset={updateAsset}
          />
        )}
        {state.step === 3 && (
          <Step3Group
            stagedAssets={state.stagedAssets}
            groups={state.groups}
            onUpdateGroups={updateGroups}
          />
        )}
        {state.step === 4 && (
          <Step4Review
            stagedAssets={state.stagedAssets}
            groups={state.groups}
          />
        )}
      </div>

      <div className="border-t bg-card/50 px-6 py-4 flex items-center justify-between">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={state.step === 1}
          data-testid="button-prev-step"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        
        <div className="text-sm text-muted-foreground">
          {state.stagedAssets.length} asset{state.stagedAssets.length !== 1 ? 's' : ''} staged
        </div>

        {state.step < 4 ? (
          <Button
            onClick={nextStep}
            disabled={!canProceed()}
            data-testid="button-next-step"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        ) : (
          <Button
            onClick={handleComplete}
            disabled={!canProceed()}
            className="bg-green-600 hover:bg-green-700"
            data-testid="button-create-assets"
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Create {state.stagedAssets.length} Asset{state.stagedAssets.length !== 1 ? 's' : ''}
          </Button>
        )}
      </div>
    </div>
  );
}
