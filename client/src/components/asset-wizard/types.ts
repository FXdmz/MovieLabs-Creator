/**
 * @fileoverview Asset Wizard Type Definitions
 * 
 * Type definitions and constants for the multi-step asset import wizard.
 * Includes interfaces for staged assets, asset groups, and the mapping
 * between OMC structural types and valid functional types.
 * 
 * @exports
 * - StructuralProperties: Properties based on asset physical/digital format
 * - FunctionalProperties: Properties based on asset purpose/use
 * - StagedAsset: File being processed through the wizard
 * - AssetGroup: Collection of related assets (e.g., image sequences)
 * - WizardState: Multi-step wizard state
 * - STRUCTURAL_TO_FUNCTIONAL_MAP: Valid functional types per structural type
 * - getFunctionalTypesForStructural: Lookup function for type filtering
 */

import { ExtractedMetadata, ProvenanceInfo } from "@/lib/file-metadata";

/** Properties derived from asset's physical/digital structure (format, dimensions, codec) */
export interface StructuralProperties {
  fileDetails?: {
    fileName?: string;
    fileExtension?: string;
    fileSize?: number;
  };
  dimensions?: {
    width?: string;
    height?: string;
  };
  length?: string;
  audioBitRate?: number;
  audioSampleRate?: number;
  audioSampleSize?: number;
  codec?: string;
  resolution?: string;
  numberPoints?: number;
  boundingBox?: string;
  coordinateOrientation?: string;
  geometryType?: string;
  levelOfDetail?: string;
  scale?: string;
  software?: string;
  pageCount?: number;
  [key: string]: any;
}

/** Properties derived from asset's purpose/function in production (audio mix type, camera metadata) */
export interface FunctionalProperties {
  audioChannelName?: string[];
  audioContent?: string;
  audioMixType?: string;
  audioProcessingAction?: string;
  audioTrackName?: string;
  cameraMetadata?: any;
  lensMetadata?: any;
  recorderMetadata?: any;
  timing?: any;
  isSelfContained?: boolean;
  soundfield?: string;
  mapFormat?: string;
  mapType?: string;
  scd?: any;
  [key: string]: any;
}

/** A file being processed through the wizard with extracted/user-specified metadata */
export interface StagedAsset {
  id: string;
  file: File;
  metadata: ExtractedMetadata;
  structuralType: string;
  functionalType: string | null;
  name: string;
  description: string;
  structuralProps: StructuralProperties;
  functionalProps: FunctionalProperties;
  provenance: ProvenanceInfo;
}

/** A collection of related assets (e.g., image sequence, video with sidecar) */
export interface AssetGroup {
  id: string;
  name: string;
  assetIds: string[];
  isOrdered: boolean;
}

/** Multi-step wizard state: current step, staged assets, and groups */
export interface WizardState {
  step: number;
  stagedAssets: StagedAsset[];
  groups: AssetGroup[];
}

/**
 * Mapping from OMC structural types to valid functional types.
 * Based on MovieLabs OMC specification - constrains which functional
 * types make sense for each structural type.
 */
export const STRUCTURAL_TO_FUNCTIONAL_MAP: Record<string, string[]> = {
  "assetGroup": [
    "artwork.storyboard",
    "capture.roll",
    "shot",
    "proxy"
  ],
  "digital": [
    "creativeReferenceMaterial",
    "technicalReferenceMaterial",
    "configuration"
  ],
  "digital.image": [
    "artwork.conceptArt",
    "artwork.storyboard.frame",
    "creativeReferenceMaterial",
    "technicalReferenceMaterial",
    "map",
    "capture.cameraProxy",
    "udimTile"
  ],
  "digital.movingImage": [
    "capture.ocf",
    "capture.cameraProxy",
    "capture.witnessCamera",
    "capture.faceCamera",
    "shot",
    "shot.editorial",
    "shot.vfx",
    "shot.animation",
    "proxy.daily",
    "proxy.editorial",
    "artwork.animatedStoryboard"
  ],
  "digital.audioVisual": [
    "capture.ocf",
    "capture.cameraProxy",
    "capture.witnessCamera",
    "shot",
    "shot.editorial",
    "shot.vfx",
    "shot.animation",
    "proxy.daily",
    "proxy.editorial"
  ],
  "digital.audio": [
    "capture.audio",
    "capture.audio.wild",
    "audio",
    "audio.track",
    "audio.channel",
    "audio.object",
    "audio.onSetMix"
  ],
  "digital.audio.object": [
    "audio.object",
    "audio.objectMetadata"
  ],
  "digital.document": [
    "script",
    "creativeReferenceMaterial",
    "technicalReferenceMaterial"
  ],
  "digital.structuredDocument": [
    "script",
    "cameraMetadata",
    "lensMetadata",
    "recorderMetadata",
    "sequenceChronologyDescriptor",
    "color.cdl",
    "audio.objectMetadata"
  ],
  "digital.data": [
    "cameraMetadata",
    "lensMetadata",
    "recorderMetadata",
    "configuration",
    "configuration.colorSpace",
    "color",
    "color.cdl",
    "color.lut",
    "color.colorSpace"
  ],
  "digital.imageSequence": [
    "artwork.storyboard",
    "shot",
    "shot.vfx",
    "shot.animation",
    "capture.ocf"
  ],
  "geometry": [
    "cgModel",
    "cgRig.biped",
    "cgRig.quadruped",
    "cgRig.polyped",
    "cgRig.avian",
    "cgRig.serpentine",
    "cgRig.appendage",
    "material",
    "material.shader"
  ],
  "digital.pointCloud": [
    "cgPointCloud",
    "capture.lidar"
  ],
  "digital.volume": [
    "cgVolume"
  ],
  "digital.procedural": [
    "material.shader",
    "configuration"
  ],
  "physical": [
    "productionProp",
    "productionProp.productionGreenery",
    "productionProp.productionVehicle",
    "productionCharacter",
    "costume",
    "productionSetDressing",
    "productionSetDressing.productionGreenery",
    "productionSetDressing.productionVehicle"
  ],
  "physical.document": [
    "script",
    "creativeReferenceMaterial",
    "technicalReferenceMaterial"
  ],
  "physical.image": [
    "artwork.storyboard.frame",
    "artwork.conceptArt",
    "creativeReferenceMaterial"
  ],
  "physical.imageSequence": [
    "artwork.storyboard",
    "creativeReferenceMaterial"
  ],
  "physical.movingImage": [
    "creativeReferenceMaterial",
    "technicalReferenceMaterial"
  ],
  "physical.audioVisual": [
    "creativeReferenceMaterial",
    "technicalReferenceMaterial"
  ],
  "physical.structuredDocument": [
    "script",
    "creativeReferenceMaterial"
  ]
};

/**
 * Gets valid functional types for a given structural type.
 * Falls back to parent types if no exact match found.
 * 
 * @param structuralType - The asset's structural type (e.g., "digital.audio")
 * @returns Array of valid functional types for this structural type
 */
export function getFunctionalTypesForStructural(structuralType: string): string[] {
  if (STRUCTURAL_TO_FUNCTIONAL_MAP[structuralType]) {
    return STRUCTURAL_TO_FUNCTIONAL_MAP[structuralType];
  }
  
  const baseType = structuralType.split('.').slice(0, 2).join('.');
  if (STRUCTURAL_TO_FUNCTIONAL_MAP[baseType]) {
    return STRUCTURAL_TO_FUNCTIONAL_MAP[baseType];
  }
  
  const topLevel = structuralType.split('.')[0];
  if (topLevel === 'digital') {
    return ["creativeReferenceMaterial", "technicalReferenceMaterial"];
  }
  if (topLevel === 'physical') {
    return ["productionProp", "creativeReferenceMaterial"];
  }
  
  return [];
}
