import { ASSET_STRUCTURAL_TYPES } from "./asset-types";

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
}

export function getStructuralTypeFromMime(mimeType: string): string | null {
  if (mimeType.startsWith('image/')) return 'digital.image';
  if (mimeType.startsWith('video/')) return 'digital.video';
  if (mimeType.startsWith('audio/')) return 'digital.audio';
  if (mimeType.startsWith('application/pdf')) return 'digital.document';
  if (mimeType.startsWith('text/')) return 'digital.document';
  if (mimeType.includes('document') || mimeType.includes('word') || mimeType.includes('excel') || mimeType.includes('spreadsheet')) {
    return 'digital.document';
  }
  if (mimeType.includes('json') || mimeType.includes('xml')) return 'digital.data';
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
    channels: null
  };
  
  if (file.type.startsWith('image/')) {
    const imageData = await extractImageMetadata(file);
    return { ...baseMetadata, ...imageData };
  }
  
  if (file.type.startsWith('video/') || file.type.startsWith('audio/')) {
    const mediaData = await extractMediaMetadata(file);
    return { ...baseMetadata, ...mediaData };
  }
  
  return baseMetadata;
}

export function mapMetadataToAsset(metadata: ExtractedMetadata, id: string): any {
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
      functionalType: null
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
  }
  
  return asset;
}
