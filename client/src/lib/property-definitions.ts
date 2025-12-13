/**
 * @fileoverview Property Definitions - OMC entity property metadata.
 * Defines form field configurations for Asset structural, functional, and
 * provenance properties with labels, descriptions, types, and validation options.
 * 
 * @exports PropertyDefinition - Interface for property metadata
 * @exports STRUCTURAL_PROPERTY_DEFINITIONS - File, dimensions, audio, 3D properties
 * @exports FUNCTIONAL_PROPERTY_DEFINITIONS - Audio content, texture, timing properties
 * @exports PROVENANCE_PROPERTY_DEFINITIONS - Creation date, modification, creator info
 * @exports getStructuralPropertiesForType - Get properties by structural type
 * @exports getFunctionalPropertiesForType - Get properties by functional type
 */
export interface PropertyDefinition {
  key: string;
  label: string;
  description: string;
  type: 'text' | 'number' | 'select' | 'boolean' | 'textarea' | 'date' | 'object';
  options?: { value: string; label: string }[];
  unit?: string;
  group?: string;
}

export const STRUCTURAL_PROPERTY_DEFINITIONS: Record<string, PropertyDefinition> = {
  "fileDetails.fileName": {
    key: "fileDetails.fileName",
    label: "File Name",
    description: "The name of the file",
    type: "text",
    group: "File Details"
  },
  "fileDetails.fileExtension": {
    key: "fileDetails.fileExtension",
    label: "File Extension",
    description: "The file extension (e.g., mp4, wav, jpg)",
    type: "text",
    group: "File Details"
  },
    "dimensions.width": {
    key: "dimensions.width",
    label: "Width",
    description: "Width in pixels",
    type: "text",
    group: "Dimensions"
  },
  "dimensions.height": {
    key: "dimensions.height",
    label: "Height",
    description: "Height in pixels",
    type: "text",
    group: "Dimensions"
  },
  "length": {
    key: "length",
    label: "Duration",
    description: "Duration in ISO 8601 format (e.g., PT1H30M)",
    type: "text",
    group: "Timing"
  },
  "audioBitRate": {
    key: "audioBitRate",
    label: "Audio Bit Rate",
    description: "Audio bit rate in bits per second",
    type: "number",
    unit: "bps",
    group: "Audio"
  },
  "audioSampleRate": {
    key: "audioSampleRate",
    label: "Sample Rate",
    description: "Audio sample rate in Hz",
    type: "number",
    unit: "Hz",
    group: "Audio"
  },
  "audioSampleSize": {
    key: "audioSampleSize",
    label: "Bit Depth",
    description: "Audio sample size in bits",
    type: "number",
    unit: "bits",
    group: "Audio"
  },
  "codec": {
    key: "codec",
    label: "Codec",
    description: "The codec used to encode the asset",
    type: "text",
    group: "Encoding"
  },
  "resolution": {
    key: "resolution",
    label: "Resolution",
    description: "Image/video resolution (e.g., 1920x1080)",
    type: "text",
    group: "Dimensions"
  },
  "pageCount": {
    key: "pageCount",
    label: "Page Count",
    description: "Number of pages in the document",
    type: "number",
    group: "Document"
  },
  "numberPoints": {
    key: "numberPoints",
    label: "Number of Points",
    description: "Number of points in a point cloud",
    type: "number",
    group: "3D Geometry"
  },
  "boundingBox": {
    key: "boundingBox",
    label: "Bounding Box",
    description: "Bounding box dimensions",
    type: "text",
    group: "3D Geometry"
  },
  "coordinateOrientation": {
    key: "coordinateOrientation",
    label: "Coordinate Orientation",
    description: "The coordinate system orientation",
    type: "select",
    options: [
      { value: "rightHandedYUp", label: "Right-Handed Y-Up" },
      { value: "rightHandedZUp", label: "Right-Handed Z-Up" },
      { value: "leftHandedYUp", label: "Left-Handed Y-Up" },
      { value: "leftHandedZUp", label: "Left-Handed Z-Up" }
    ],
    group: "3D Geometry"
  },
  "geometryType": {
    key: "geometryType",
    label: "Geometry Type",
    description: "Type of geometry representation",
    type: "select",
    options: [
      { value: "mesh", label: "Mesh" },
      { value: "nurbs", label: "NURBS" },
      { value: "subdivision", label: "Subdivision Surface" },
      { value: "curves", label: "Curves" }
    ],
    group: "3D Geometry"
  },
  "levelOfDetail": {
    key: "levelOfDetail",
    label: "Level of Detail",
    description: "LOD level for the geometry",
    type: "text",
    group: "3D Geometry"
  },
  "scale": {
    key: "scale",
    label: "Scale",
    description: "Scale factor of the geometry",
    type: "text",
    group: "3D Geometry"
  },
  "software": {
    key: "software",
    label: "Software",
    description: "Software used to create the asset",
    type: "text",
    group: "Creation"
  }
};

export const FUNCTIONAL_PROPERTY_DEFINITIONS: Record<string, PropertyDefinition> = {
  "audioChannelName": {
    key: "audioChannelName",
    label: "Audio Channel Name",
    description: "Name of the loudspeaker the audio channel is intended to drive",
    type: "text",
    group: "Audio"
  },
  "audioContent": {
    key: "audioContent",
    label: "Audio Content",
    description: "Identification of the content type in this audio asset",
    type: "select",
    options: [
      { value: "dialog", label: "Dialog" },
      { value: "music", label: "Music" },
      { value: "effects", label: "Sound Effects" },
      { value: "ambience", label: "Ambience" },
      { value: "foley", label: "Foley" },
      { value: "narration", label: "Narration" }
    ],
    group: "Audio"
  },
  "audioMixType": {
    key: "audioMixType",
    label: "Audio Mix Type",
    description: "Type or use for this audio mix",
    type: "select",
    options: [
      { value: "stem", label: "Stem" },
      { value: "finalMix", label: "Final Mix" },
      { value: "submix", label: "Submix" },
      { value: "preMix", label: "Pre-Mix" }
    ],
    group: "Audio"
  },
  "audioProcessingAction": {
    key: "audioProcessingAction",
    label: "Audio Processing Action",
    description: "What was done to the audio in an audio session",
    type: "text",
    group: "Audio"
  },
  "audioTrackName": {
    key: "audioTrackName",
    label: "Audio Track Name",
    description: "Name of this audio track",
    type: "text",
    group: "Audio"
  },
  "soundfield": {
    key: "soundfield",
    label: "Sound Field",
    description: "Spatial audio format",
    type: "select",
    options: [
      { value: "mono", label: "Mono" },
      { value: "stereo", label: "Stereo" },
      { value: "5.1", label: "5.1 Surround" },
      { value: "7.1", label: "7.1 Surround" },
      { value: "atmos", label: "Dolby Atmos" },
      { value: "ambisonics", label: "Ambisonics" }
    ],
    group: "Audio"
  },
  "timing": {
    key: "timing",
    label: "Timing",
    description: "Temporal information (timecode, duration, etc.)",
    type: "text",
    group: "Timing"
  },
  "isSelfContained": {
    key: "isSelfContained",
    label: "Self-Contained",
    description: "Whether the asset is self-contained or references other assets",
    type: "boolean",
    group: "Structure"
  },
  "mapFormat": {
    key: "mapFormat",
    label: "Map Format",
    description: "Format of the texture map",
    type: "select",
    options: [
      { value: "exr", label: "OpenEXR" },
      { value: "tiff", label: "TIFF" },
      { value: "png", label: "PNG" },
      { value: "jpg", label: "JPEG" }
    ],
    group: "Texture"
  },
  "mapType": {
    key: "mapType",
    label: "Map Type",
    description: "Type of texture map",
    type: "select",
    options: [
      { value: "diffuse", label: "Diffuse/Albedo" },
      { value: "normal", label: "Normal" },
      { value: "displacement", label: "Displacement" },
      { value: "roughness", label: "Roughness" },
      { value: "metallic", label: "Metallic" },
      { value: "ambient", label: "Ambient Occlusion" },
      { value: "emissive", label: "Emissive" }
    ],
    group: "Texture"
  }
};

export const PROVENANCE_PROPERTY_DEFINITIONS: Record<string, PropertyDefinition> = {
  "CreatedOn": {
    key: "CreatedOn",
    label: "Created On",
    description: "When the asset was originally created (ISO 8601 datetime)",
    type: "date",
    group: "Provenance"
  },
  "ModifiedOn": {
    key: "ModifiedOn",
    label: "Modified On",
    description: "When the asset was last modified (ISO 8601 datetime)",
    type: "date",
    group: "Provenance"
  },
  "creatorName": {
    key: "creatorName",
    label: "Creator Name",
    description: "Name of the person or entity that created the asset (informational only)",
    type: "text",
    group: "Provenance"
  }
};

export function getStructuralPropertiesForType(structuralType: string): PropertyDefinition[] {
  const propertyKeys = STRUCTURAL_PROPERTIES_BY_TYPE[structuralType] || [];
  const definitions: PropertyDefinition[] = [];
  
  for (const key of propertyKeys) {
    if (key === 'fileDetails') {
      definitions.push(STRUCTURAL_PROPERTY_DEFINITIONS['fileDetails.fileName']);
      definitions.push(STRUCTURAL_PROPERTY_DEFINITIONS['fileDetails.fileExtension']);
    } else if (key === 'dimensions') {
      definitions.push(STRUCTURAL_PROPERTY_DEFINITIONS['dimensions.width']);
      definitions.push(STRUCTURAL_PROPERTY_DEFINITIONS['dimensions.height']);
    } else if (STRUCTURAL_PROPERTY_DEFINITIONS[key]) {
      definitions.push(STRUCTURAL_PROPERTY_DEFINITIONS[key]);
    }
  }
  
  return definitions;
}

export function getFunctionalPropertiesForType(functionalType: string): PropertyDefinition[] {
  const propertyKeys = FUNCTIONAL_PROPERTIES_BY_TYPE[functionalType] || [];
  return propertyKeys
    .filter(key => FUNCTIONAL_PROPERTY_DEFINITIONS[key])
    .map(key => FUNCTIONAL_PROPERTY_DEFINITIONS[key]);
}

import { STRUCTURAL_PROPERTIES_BY_TYPE } from "./structural-properties-map";
import { FUNCTIONAL_PROPERTIES_BY_TYPE } from "./functional-properties-map";
