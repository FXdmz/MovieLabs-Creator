/**
 * @fileoverview File Metadata Extraction - Asset creation from uploaded files.
 * Extracts technical metadata from media files (images, audio, video, PDFs)
 * and maps to OMC Asset entities with proper structural/functional types.
 * 
 * @features
 * - Client-side extraction for images (dimensions)
 * - Client-side extraction for audio/video (duration, dimensions)
 * - Server-side extraction for deeper metadata (codec, sample rate)
 * - MIME type to OMC structural type mapping
 * - Auto-generation of Asset entities from file metadata
 * 
 * @exports ExtractedMetadata - Extracted file metadata interface
 * @exports extractFileMetadata - Main extraction function
 * @exports mapMetadataToAsset - Convert metadata to OMC Asset
 * @exports getStructuralTypeFromMime - Map MIME to structural type
 * @exports getFunctionalTypeFromMime - Map MIME/name to functional type
 */
import { ASSET_STRUCTURAL_TYPES } from "./asset-types";

export interface ProvenanceInfo {
  CreatedOn: string | null;
  ModifiedOn: string | null;
  creatorName: string | null;
  source: string | null;
  software: string | null;
}

export interface ExtractedMetadata {
  fileName: string;
  fileSize: number;
  mimeType: string;
  fileExtension: string;
  structuralType: string | null;
  width: number | null;
  height: number | null;
  duration: number | null;
  bitRate: number | null;
  sampleRate: number | null;
  channels: number | null;
  bitsPerSample: number | null;
  codec: string | null;
  container: string | null;
  pageCount: number | null;
  isLikelyScript: boolean;
  provenance: ProvenanceInfo;
}

export function getStructuralTypeFromMime(mimeType: string): string | null {
  if (mimeType.startsWith('image/')) return 'digital.image';
  if (mimeType.startsWith('video/')) return 'digital.audioVisual';
  if (mimeType.startsWith('audio/')) return 'digital.audio';
  if (mimeType.startsWith('application/pdf')) return 'digital.document';
  if (mimeType.startsWith('text/')) return 'digital.document';
  if (mimeType.includes('document') || mimeType.includes('word') || mimeType.includes('excel') || mimeType.includes('spreadsheet')) {
    return 'digital.document';
  }
  if (mimeType.includes('json') || mimeType.includes('xml')) return 'digital.data';
  return null;
}

export function getFunctionalTypeFromMime(mimeType: string, fileName: string): string | null {
  const lowerName = fileName.toLowerCase();
  
  if (mimeType.startsWith('video/')) {
    if (lowerName.includes('proxy') || lowerName.includes('daily')) return 'proxy.daily';
    if (lowerName.includes('edit')) return 'shot.editorial';
    if (lowerName.includes('vfx')) return 'shot.vfx';
    return 'capture.ocf';
  }
  
  if (mimeType.startsWith('audio/')) {
    if (lowerName.includes('music') || lowerName.includes('score')) return 'audio.track';
    if (lowerName.includes('mix')) return 'audio.onSetMix';
    return 'capture.audio';
  }
  
  if (mimeType.startsWith('image/')) {
    if (lowerName.includes('storyboard')) return 'artwork.storyboard.frame';
    if (lowerName.includes('concept')) return 'artwork.conceptArt';
    if (lowerName.includes('reference')) return 'creativeReferenceMaterial';
    if (lowerName.includes('texture') || lowerName.includes('map')) return 'map';
    return 'capture.cameraProxy';
  }
  
  if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.startsWith('text/')) {
    if (lowerName.includes('script')) return 'script';
    return 'script';
  }
  
  return null;
}

export function formatDimension(value: number, unit: string = 'px'): string {
  return `${value}${unit}`;
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  let duration = 'PT';
  if (hours > 0) duration += `${hours}H`;
  if (minutes > 0) duration += `${minutes}M`;
  if (secs > 0 || duration === 'PT') duration += `${secs}S`;
  
  return duration;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export async function extractImageMetadata(file: File): Promise<Partial<ExtractedMetadata>> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight
      });
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({});
    };
    
    img.src = url;
  });
}

export async function extractMediaMetadata(file: File): Promise<Partial<ExtractedMetadata>> {
  return new Promise((resolve) => {
    const isVideo = file.type.startsWith('video/');
    const element = isVideo ? document.createElement('video') : document.createElement('audio');
    const url = URL.createObjectURL(file);
    
    element.onloadedmetadata = () => {
      const result: Partial<ExtractedMetadata> = {
        duration: element.duration
      };
      
      if (isVideo && element instanceof HTMLVideoElement) {
        result.width = element.videoWidth;
        result.height = element.videoHeight;
      }
      
      URL.revokeObjectURL(url);
      resolve(result);
    };
    
    element.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({});
    };
    
    element.src = url;
  });
}

export async function extractServerMetadata(file: File): Promise<Partial<ExtractedMetadata>> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('/api/assets/metadata', {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      console.warn('Server metadata extraction failed');
      return {};
    }
    
    const data = await response.json();
    const result: Partial<ExtractedMetadata> = {
      duration: data.duration ?? null,
      sampleRate: data.sampleRate ?? null,
      bitRate: data.bitRate ?? null,
      channels: data.channels ?? null,
      bitsPerSample: data.bitsPerSample ?? null,
      codec: data.codec ?? null,
      container: data.container ?? null,
      pageCount: data.pageCount ?? null,
      isLikelyScript: data.isLikelyScript ?? false
    };
    
    if (data.provenance) {
      result.provenance = data.provenance;
    }
    
    return result;
  } catch (error) {
    console.warn('Server metadata extraction error:', error);
    return {};
  }
}

export async function extractFileMetadata(file: File): Promise<ExtractedMetadata> {
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  const structuralType = getStructuralTypeFromMime(file.type);
  
  const baseMetadata: ExtractedMetadata = {
    fileName: file.name,
    fileSize: file.size,
    mimeType: file.type,
    fileExtension: extension,
    structuralType,
    width: null,
    height: null,
    duration: null,
    bitRate: null,
    sampleRate: null,
    channels: null,
    bitsPerSample: null,
    codec: null,
    container: null,
    pageCount: null,
    isLikelyScript: false,
    provenance: {
      CreatedOn: null,
      ModifiedOn: file.lastModified ? new Date(file.lastModified).toISOString() : null,
      creatorName: null,
      source: null,
      software: null
    }
  };
  
  // Client-side extraction for images
  if (file.type.startsWith('image/')) {
    const imageData = await extractImageMetadata(file);
    return { ...baseMetadata, ...imageData };
  }
  
  // Client-side extraction for video/audio (basic)
  if (file.type.startsWith('video/') || file.type.startsWith('audio/')) {
    const mediaData = await extractMediaMetadata(file);
    // Also try server extraction for deeper metadata
    const serverData = await extractServerMetadata(file);
    return { ...baseMetadata, ...mediaData, ...serverData };
  }
  
  // Server-side extraction for PDFs
  if (file.type === 'application/pdf') {
    const serverData = await extractServerMetadata(file);
    return { ...baseMetadata, ...serverData };
  }
  
  return baseMetadata;
}

export function mapMetadataToAsset(metadata: ExtractedMetadata, id: string): any {
  const functionalType = getFunctionalTypeFromMime(metadata.mimeType, metadata.fileName);
  
  const asset: any = {
    entityType: 'Asset',
    name: metadata.fileName,
    schemaVersion: 'https://movielabs.com/omc/json/schema/v2.8',
    identifier: [{
      identifierScope: 'me-nexus',
      identifierValue: id,
      combinedForm: `me-nexus:${id}`
    }],
    assetFC: {
      functionalType: functionalType
    },
    AssetSC: {
      structuralType: metadata.structuralType,
      structuralProperties: {}
    }
  };
  
  const structProps = asset.AssetSC.structuralProperties;
  
  if (metadata.structuralType?.startsWith('digital.')) {
    structProps.fileDetails = {
      fileName: metadata.fileName,
      fileExtension: metadata.fileExtension,
      fileSize: metadata.fileSize
    };
    
    if (metadata.width && metadata.height) {
      structProps.dimensions = {
        width: formatDimension(metadata.width),
        height: formatDimension(metadata.height)
      };
    }
    
    if (metadata.duration) {
      structProps.length = formatDuration(metadata.duration);
    }
    
    if (metadata.structuralType === 'digital.audio') {
      if (metadata.sampleRate) {
        structProps.audioSampleRate = metadata.sampleRate;
      }
      if (metadata.channels) {
        structProps.audioChannelCount = metadata.channels;
      }
    }
    
    if (metadata.structuralType === 'digital.audioVisual' || metadata.structuralType === 'digital.image') {
      if (metadata.width && metadata.height) {
        structProps.resolution = `${metadata.width}x${metadata.height}`;
      }
    }
  }
  
  return asset;
}
