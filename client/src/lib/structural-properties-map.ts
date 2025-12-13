/**
 * @fileoverview Structural Properties Mapping - Asset structural type to properties.
 * Maps OMC Asset structural types (digital, physical, geometry) to their
 * applicable property fields per OMC v2.8 specification.
 * 
 * @exports STRUCTURAL_PROPERTIES_BY_TYPE - Type to property array mapping
 * @exports ALL_STRUCTURAL_PROPERTIES - Complete list of structural properties
 * @exports getRelevantStructuralProperties - Get properties for a type
 */
export const STRUCTURAL_PROPERTIES_BY_TYPE: Record<string, string[]> = {
  "assetGroup": ["assetGroup"],
  "digital": ["fileDetails", "codec"],
  "digital.audio": ["audioBitRate", "audioSampleRate", "audioSampleSize", "fileDetails", "codec"],
  "digital.audio.object": ["audioBitRate", "audioSampleRate", "audioSampleSize", "fileDetails", "codec"],
  "digital.audioVisual": ["dimensions", "length", "audioBitRate", "audioSampleRate", "audioSampleSize", "fileDetails", "codec"],
  "digital.data": ["fileDetails"],
  "digital.document": ["fileDetails"],
  "digital.image": ["dimensions", "fileDetails", "codec"],
  "digital.imageSequence": ["dimensions", "fileDetails", "codec"],
  "digital.movingImage": ["dimensions", "fileDetails", "codec"],
  "digital.procedural": ["fileDetails", "software"],
  "digital.pointCloud": ["numberPoints", "boundingBox", "coordinateOrientation", "fileDetails"],
  "digital.volume": ["boundingBox", "axisAligned", "cgVolumePurpose", "coordinateOrientation", "fileDetails"],
  "digital.structuredDocument": ["fileDetails", "linkset"],
  "geometry": ["geometryType", "boundingBox", "coordinateOrientation", "levelOfDetail", "scale"],
  "physical": ["dimensions"],
  "physical.audioVisual": ["dimensions"],
  "physical.document": ["dimensions"],
  "physical.image": ["dimensions"],
  "physical.imageSequence": ["dimensions"],
  "physical.movingImage": ["dimensions"],
  "physical.structuredDocument": ["dimensions"]
};

export const ALL_STRUCTURAL_PROPERTIES = [
  "assetGroup",
  "audioBitRate",
  "audioSampleRate", 
  "audioSampleSize",
  "axisAligned",
  "boundingBox",
  "cgVolumePurpose",
  "codec",
  "coordinateOrientation",
  "dimensions",
  "fileDetails",
  "geometryType",
  "length",
  "levelOfDetail",
  "linkset",
  "numberPoints",
  "purpose",
  "resolution",
  "scale"
];

export function getRelevantStructuralProperties(structuralType: string | null | undefined): string[] {
  if (!structuralType) {
    return ALL_STRUCTURAL_PROPERTIES;
  }
  return STRUCTURAL_PROPERTIES_BY_TYPE[structuralType] || ALL_STRUCTURAL_PROPERTIES;
}
