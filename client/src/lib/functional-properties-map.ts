/**
 * @fileoverview Functional Properties Mapping - Asset functional type to properties.
 * Maps OMC Asset functional types to their applicable property fields
 * (audio, timing, camera metadata, etc.) per OMC v2.8 specification.
 * 
 * @exports FUNCTIONAL_PROPERTIES_BY_TYPE - Type to property array mapping
 * @exports ALL_FUNCTIONAL_PROPERTIES - Complete list of functional properties
 * @exports getRelevantFunctionalProperties - Get properties for a type
 * @exports hasFunctionalProperties - Check if type has properties
 */
export const FUNCTIONAL_PROPERTIES_BY_TYPE: Record<string, string[]> = {
  "artwork": [],
  "artwork.animatedStoryboard": [],
  "artwork.conceptArt": [],
  "artwork.storyboard": [],
  "artwork.storyboard.frame": [],
  "audio": ["audioChannelName", "audioContent", "audioMixType", "audioProcessingAction", "audioTrackName", "soundfield", "timing"],
  "audio.channel": ["audioChannelName", "audioContent", "soundfield", "timing"],
  "audio.object": ["audioChannelName", "audioContent", "soundfield", "timing"],
  "audio.objectMetadata": ["audioContent", "timing"],
  "audio.onSetMix": ["audioChannelName", "audioContent", "audioMixType", "audioProcessingAction", "soundfield", "timing"],
  "audio.track": ["audioChannelName", "audioContent", "audioTrackName", "soundfield", "timing"],
  "cameraMetadata": ["cameraMetadata"],
  "capture": ["cameraMetadata", "lensMetadata", "recorderMetadata", "timing"],
  "capture.audio": ["recorderMetadata", "timing"],
  "capture.audio.wild": ["recorderMetadata", "timing"],
  "capture.calibration": ["cameraMetadata", "lensMetadata", "recorderMetadata", "timing"],
  "capture.cameraProxy": ["cameraMetadata", "lensMetadata", "recorderMetadata", "timing"],
  "capture.faceCamera": ["cameraMetadata", "lensMetadata", "recorderMetadata", "timing"],
  "capture.lidar": ["recorderMetadata", "timing"],
  "capture.motionCapture": ["recorderMetadata", "timing"],
  "capture.ocf": ["cameraMetadata", "lensMetadata", "recorderMetadata", "timing"],
  "capture.roll": ["cameraMetadata", "lensMetadata", "recorderMetadata", "timing"],
  "capture.witnessCamera": ["cameraMetadata", "lensMetadata", "recorderMetadata", "timing"],
  "cgModel": [],
  "cgPointCloud": [],
  "cgRig.biped": [],
  "cgRig.quadruped": [],
  "cgRig.polyped": [],
  "cgRig.avian": [],
  "cgRig.serpentine": [],
  "cgRig.appendage": [],
  "cgVolume": [],
  "color": [],
  "color.cdl": [],
  "color.colorSpace": [],
  "color.lut": [],
  "configuration": [],
  "configuration.colorSpace": [],
  "costume": [],
  "creativeReferenceMaterial": [],
  "lensMetadata": ["lensMetadata"],
  "map": ["mapFormat", "mapType"],
  "material": [],
  "material.shader": [],
  "productionCharacter": [],
  "productionProp": [],
  "productionProp.productionGreenery": [],
  "productionProp.productionVehicle": [],
  "productionSetDressing": [],
  "productionSetDressing.productionGreenery": [],
  "productionSetDressing.productionVehicle": [],
  "proxy": ["timing", "isSelfContained"],
  "proxy.daily": ["timing", "isSelfContained"],
  "proxy.editorial": ["timing", "isSelfContained"],
  "recorderMetadata": ["recorderMetadata"],
  "script": [],
  "sequenceChronologyDescriptor": ["scd", "timing"],
  "shot": ["timing", "isSelfContained"],
  "shot.animation": ["timing", "isSelfContained"],
  "shot.editorial": ["timing", "isSelfContained"],
  "shot.vfx": ["timing", "isSelfContained"],
  "technicalReferenceMaterial": [],
  "udimTile": []
};

export const ALL_FUNCTIONAL_PROPERTIES = [
  "audioChannelName",
  "audioContent",
  "audioMixType",
  "audioProcessingAction",
  "audioTrackName",
  "cameraMetadata",
  "isSelfContained",
  "lensMetadata",
  "mapFormat",
  "mapType",
  "recorderMetadata",
  "scd",
  "soundfield",
  "timing"
];

export function getRelevantFunctionalProperties(functionalType: string | null | undefined): string[] {
  if (!functionalType) {
    return ALL_FUNCTIONAL_PROPERTIES;
  }
  // Return the mapped properties (even if empty array) or fallback to all if type not found
  if (functionalType in FUNCTIONAL_PROPERTIES_BY_TYPE) {
    return FUNCTIONAL_PROPERTIES_BY_TYPE[functionalType];
  }
  return ALL_FUNCTIONAL_PROPERTIES;
}

export function hasFunctionalProperties(functionalType: string | null | undefined): boolean {
  if (!functionalType) return false;
  if (functionalType in FUNCTIONAL_PROPERTIES_BY_TYPE) {
    return FUNCTIONAL_PROPERTIES_BY_TYPE[functionalType].length > 0;
  }
  return true; // Unknown types get all properties
}
