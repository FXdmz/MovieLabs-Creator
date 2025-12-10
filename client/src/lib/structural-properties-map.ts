export const STRUCTURAL_PROPERTIES_BY_TYPE: Record<string, string[]> = {
  "assetGroup": ["assetGroup"],
  "digital": ["fileDetails", "codec"],
  "digital.audio": ["audioBitRate", "audioSampleRate", "audioSampleSize", "fileDetails", "codec"],
  "digital.audio.object": ["audioBitRate", "audioSampleRate", "audioSampleSize", "fileDetails", "codec"],
  "digital.audioVisual": ["audioBitRate", "audioSampleRate", "audioSampleSize", "fileDetails", "codec"],
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
  "levelOfDetail",
  "linkset",
  "numberPoints",
  "purpose",
  "scale"
];

export function getRelevantStructuralProperties(structuralType: string | null | undefined): string[] {
  if (!structuralType) {
    return ALL_STRUCTURAL_PROPERTIES;
  }
  return STRUCTURAL_PROPERTIES_BY_TYPE[structuralType] || ALL_STRUCTURAL_PROPERTIES;
}
