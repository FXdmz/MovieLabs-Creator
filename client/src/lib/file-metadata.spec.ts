/**
 * @fileoverview File Metadata Test Suite
 * 
 * Vitest tests for file metadata extraction utilities including
 * MIME type mapping, formatters, and Asset mapping.
 */
import { describe, it, expect } from 'vitest';
import {
  getStructuralTypeFromMime,
  getFunctionalTypeFromMime,
  formatDimension,
  formatDuration,
  formatFileSize,
  mapMetadataToAsset,
  ExtractedMetadata
} from './file-metadata';

describe('File Metadata', () => {
  describe('getStructuralTypeFromMime', () => {
    it('should return digital.image for image MIME types', () => {
      expect(getStructuralTypeFromMime('image/jpeg')).toBe('digital.image');
      expect(getStructuralTypeFromMime('image/png')).toBe('digital.image');
      expect(getStructuralTypeFromMime('image/gif')).toBe('digital.image');
      expect(getStructuralTypeFromMime('image/webp')).toBe('digital.image');
      expect(getStructuralTypeFromMime('image/tiff')).toBe('digital.image');
    });

    it('should return digital.audioVisual for video MIME types', () => {
      expect(getStructuralTypeFromMime('video/mp4')).toBe('digital.audioVisual');
      expect(getStructuralTypeFromMime('video/quicktime')).toBe('digital.audioVisual');
      expect(getStructuralTypeFromMime('video/webm')).toBe('digital.audioVisual');
      expect(getStructuralTypeFromMime('video/x-msvideo')).toBe('digital.audioVisual');
    });

    it('should return digital.audio for audio MIME types', () => {
      expect(getStructuralTypeFromMime('audio/mpeg')).toBe('digital.audio');
      expect(getStructuralTypeFromMime('audio/wav')).toBe('digital.audio');
      expect(getStructuralTypeFromMime('audio/ogg')).toBe('digital.audio');
      expect(getStructuralTypeFromMime('audio/flac')).toBe('digital.audio');
    });

    it('should return digital.document for PDF', () => {
      expect(getStructuralTypeFromMime('application/pdf')).toBe('digital.document');
    });

    it('should return digital.document for text types', () => {
      expect(getStructuralTypeFromMime('text/plain')).toBe('digital.document');
      expect(getStructuralTypeFromMime('text/html')).toBe('digital.document');
      expect(getStructuralTypeFromMime('text/csv')).toBe('digital.document');
    });

    it('should return digital.document for office documents', () => {
      expect(getStructuralTypeFromMime('application/msword')).toBe('digital.document');
      expect(getStructuralTypeFromMime('application/vnd.openxmlformats-officedocument.wordprocessingml.document')).toBe('digital.document');
      expect(getStructuralTypeFromMime('application/vnd.ms-excel')).toBe('digital.document');
      expect(getStructuralTypeFromMime('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')).toBe('digital.document');
    });

    it('should return digital.data for JSON and XML', () => {
      expect(getStructuralTypeFromMime('application/json')).toBe('digital.data');
      expect(getStructuralTypeFromMime('application/xml')).toBe('digital.data');
      expect(getStructuralTypeFromMime('text/xml')).toBe('digital.document');
    });

    it('should return null for unknown MIME types', () => {
      expect(getStructuralTypeFromMime('application/octet-stream')).toBeNull();
      expect(getStructuralTypeFromMime('unknown/type')).toBeNull();
    });
  });

  describe('getFunctionalTypeFromMime', () => {
    describe('video files', () => {
      it('should return capture.ocf for generic video', () => {
        expect(getFunctionalTypeFromMime('video/mp4', 'clip.mp4')).toBe('capture.ocf');
      });

      it('should return proxy.daily for proxy/daily video', () => {
        expect(getFunctionalTypeFromMime('video/mp4', 'scene1_proxy.mp4')).toBe('proxy.daily');
        expect(getFunctionalTypeFromMime('video/mp4', 'daily_review.mov')).toBe('proxy.daily');
      });

      it('should return shot.editorial for edit video', () => {
        expect(getFunctionalTypeFromMime('video/mp4', 'scene1_edit.mp4')).toBe('shot.editorial');
      });

      it('should return shot.vfx for VFX video', () => {
        expect(getFunctionalTypeFromMime('video/mp4', 'scene1_vfx.mp4')).toBe('shot.vfx');
      });
    });

    describe('audio files', () => {
      it('should return capture.audio for generic audio', () => {
        expect(getFunctionalTypeFromMime('audio/wav', 'recording.wav')).toBe('capture.audio');
      });

      it('should return audio.track for music/score', () => {
        expect(getFunctionalTypeFromMime('audio/wav', 'main_music.wav')).toBe('audio.track');
        expect(getFunctionalTypeFromMime('audio/mp3', 'score_v2.mp3')).toBe('audio.track');
      });

      it('should return audio.onSetMix for mix files', () => {
        expect(getFunctionalTypeFromMime('audio/wav', 'final_mix.wav')).toBe('audio.onSetMix');
      });
    });

    describe('image files', () => {
      it('should return capture.cameraProxy for generic images', () => {
        expect(getFunctionalTypeFromMime('image/jpeg', 'photo.jpg')).toBe('capture.cameraProxy');
      });

      it('should return artwork.storyboard.frame for storyboard images', () => {
        expect(getFunctionalTypeFromMime('image/png', 'storyboard_001.png')).toBe('artwork.storyboard.frame');
      });

      it('should return artwork.conceptArt for concept images', () => {
        expect(getFunctionalTypeFromMime('image/jpeg', 'concept_character.jpg')).toBe('artwork.conceptArt');
      });

      it('should return creativeReferenceMaterial for reference images', () => {
        expect(getFunctionalTypeFromMime('image/jpeg', 'reference_photo.jpg')).toBe('creativeReferenceMaterial');
      });

      it('should return map for texture images', () => {
        expect(getFunctionalTypeFromMime('image/png', 'diffuse_texture.png')).toBe('map');
        expect(getFunctionalTypeFromMime('image/png', 'normal_map.png')).toBe('map');
      });
    });

    describe('document files', () => {
      it('should return script for PDF documents', () => {
        expect(getFunctionalTypeFromMime('application/pdf', 'screenplay.pdf')).toBe('script');
      });

      it('should return script for script-named documents', () => {
        expect(getFunctionalTypeFromMime('text/plain', 'script_v2.txt')).toBe('script');
      });
    });

    it('should return null for unknown types', () => {
      expect(getFunctionalTypeFromMime('application/octet-stream', 'file.bin')).toBeNull();
    });
  });

  describe('formatDimension', () => {
    it('should format with default px unit', () => {
      expect(formatDimension(1920)).toBe('1920px');
      expect(formatDimension(1080)).toBe('1080px');
    });

    it('should format with custom unit', () => {
      expect(formatDimension(100, 'em')).toBe('100em');
      expect(formatDimension(50, '%')).toBe('50%');
    });

    it('should handle zero', () => {
      expect(formatDimension(0)).toBe('0px');
    });
  });

  describe('formatDuration', () => {
    it('should format seconds only', () => {
      expect(formatDuration(30)).toBe('PT30S');
      expect(formatDuration(1)).toBe('PT1S');
    });

    it('should format minutes and seconds', () => {
      expect(formatDuration(90)).toBe('PT1M30S');
      expect(formatDuration(125)).toBe('PT2M5S');
    });

    it('should format hours, minutes, and seconds', () => {
      expect(formatDuration(3661)).toBe('PT1H1M1S');
      expect(formatDuration(7200)).toBe('PT2H');
    });

    it('should handle zero seconds', () => {
      expect(formatDuration(0)).toBe('PT0S');
    });

    it('should handle exact minutes', () => {
      expect(formatDuration(60)).toBe('PT1M');
      expect(formatDuration(120)).toBe('PT2M');
    });

    it('should handle exact hours', () => {
      expect(formatDuration(3600)).toBe('PT1H');
    });
  });

  describe('formatFileSize', () => {
    it('should format bytes', () => {
      expect(formatFileSize(500)).toBe('500 B');
      expect(formatFileSize(1023)).toBe('1023 B');
    });

    it('should format kilobytes', () => {
      expect(formatFileSize(1024)).toBe('1.0 KB');
      expect(formatFileSize(1536)).toBe('1.5 KB');
    });

    it('should format megabytes', () => {
      expect(formatFileSize(1048576)).toBe('1.0 MB');
      expect(formatFileSize(5242880)).toBe('5.0 MB');
    });

    it('should format gigabytes', () => {
      expect(formatFileSize(1073741824)).toBe('1.00 GB');
      expect(formatFileSize(2147483648)).toBe('2.00 GB');
    });
  });

  describe('mapMetadataToAsset', () => {
    const baseMetadata: ExtractedMetadata = {
      fileName: 'test_video.mp4',
      fileSize: 1048576,
      mimeType: 'video/mp4',
      fileExtension: 'mp4',
      structuralType: 'digital.audioVisual',
      width: 1920,
      height: 1080,
      duration: 120,
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
        ModifiedOn: null,
        creatorName: null,
        source: null,
        software: null
      }
    };

    it('should create valid Asset entity', () => {
      const asset = mapMetadataToAsset(baseMetadata, 'asset-001');
      
      expect(asset.entityType).toBe('Asset');
      expect(asset.name).toBe('test_video.mp4');
      expect(asset.schemaVersion).toContain('movielabs.com/omc');
    });

    it('should set identifier correctly', () => {
      const asset = mapMetadataToAsset(baseMetadata, 'asset-001');
      
      expect(asset.identifier).toBeDefined();
      expect(asset.identifier[0].identifierScope).toBe('me-nexus');
      expect(asset.identifier[0].identifierValue).toBe('asset-001');
    });

    it('should set structural type', () => {
      const asset = mapMetadataToAsset(baseMetadata, 'asset-001');
      
      expect(asset.AssetSC.structuralType).toBe('digital.audioVisual');
    });

    it('should set functional type based on MIME', () => {
      const asset = mapMetadataToAsset(baseMetadata, 'asset-001');
      
      expect(asset.assetFC.functionalType).toBe('capture.ocf');
    });

    it('should include file details in structural properties', () => {
      const asset = mapMetadataToAsset(baseMetadata, 'asset-001');
      
      const props = asset.AssetSC.structuralProperties;
      expect(props.fileDetails).toBeDefined();
      expect(props.fileDetails.fileName).toBe('test_video.mp4');
      expect(props.fileDetails.fileExtension).toBe('mp4');
      expect(props.fileDetails.fileSize).toBe(1048576);
    });

    it('should include dimensions when available', () => {
      const asset = mapMetadataToAsset(baseMetadata, 'asset-001');
      
      const props = asset.AssetSC.structuralProperties;
      expect(props.dimensions).toBeDefined();
      expect(props.dimensions.width).toBe('1920px');
      expect(props.dimensions.height).toBe('1080px');
    });

    it('should include duration when available', () => {
      const asset = mapMetadataToAsset(baseMetadata, 'asset-001');
      
      const props = asset.AssetSC.structuralProperties;
      expect(props.length).toBe('PT2M');
    });

    it('should include resolution for video/image', () => {
      const asset = mapMetadataToAsset(baseMetadata, 'asset-001');
      
      const props = asset.AssetSC.structuralProperties;
      expect(props.resolution).toBe('1920x1080');
    });

    it('should include audio properties for audio files', () => {
      const audioMetadata: ExtractedMetadata = {
        ...baseMetadata,
        mimeType: 'audio/wav',
        structuralType: 'digital.audio',
        width: null,
        height: null,
        sampleRate: 48000,
        channels: 2
      };
      
      const asset = mapMetadataToAsset(audioMetadata, 'audio-001');
      
      const props = asset.AssetSC.structuralProperties;
      expect(props.audioSampleRate).toBe(48000);
      expect(props.audioChannelCount).toBe(2);
    });

    it('should handle metadata without dimensions', () => {
      const docMetadata: ExtractedMetadata = {
        ...baseMetadata,
        mimeType: 'application/pdf',
        structuralType: 'digital.document',
        width: null,
        height: null,
        duration: null
      };
      
      const asset = mapMetadataToAsset(docMetadata, 'doc-001');
      
      expect(asset.AssetSC.structuralProperties.dimensions).toBeUndefined();
      expect(asset.AssetSC.structuralProperties.length).toBeUndefined();
    });
  });

  describe('Edge Cases - Defensive Input Handling', () => {
    it('should throw on undefined MIME type', () => {
      expect(() => getStructuralTypeFromMime(undefined as any)).toThrow();
    });

    it('should handle empty string MIME type', () => {
      expect(getStructuralTypeFromMime('')).toBeNull();
    });

    it('should handle getFunctionalTypeFromMime with empty filename', () => {
      const result = getFunctionalTypeFromMime('video/mp4', '');
      expect(result).toBe('capture.ocf');
    });

    it('should throw on undefined filename', () => {
      expect(() => getFunctionalTypeFromMime('video/mp4', undefined as any)).toThrow();
    });

    it('should handle formatDimension with negative value', () => {
      expect(formatDimension(-100)).toBe('-100px');
    });

    it('should handle formatDuration with negative value', () => {
      const result = formatDuration(-30);
      expect(typeof result).toBe('string');
    });

    it('should handle formatFileSize with zero', () => {
      expect(formatFileSize(0)).toBe('0 B');
    });

    it('should handle formatFileSize with negative value', () => {
      const result = formatFileSize(-100);
      expect(typeof result).toBe('string');
    });

    it('should handle metadata with all null optional fields', () => {
      const minimalMetadata: ExtractedMetadata = {
        fileName: 'unknown.bin',
        fileSize: 100,
        mimeType: 'application/octet-stream',
        fileExtension: 'bin',
        structuralType: null,
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
          ModifiedOn: null,
          creatorName: null,
          source: null,
          software: null
        }
      };
      
      const asset = mapMetadataToAsset(minimalMetadata, 'unknown-001');
      
      expect(asset.entityType).toBe('Asset');
      expect(asset.name).toBe('unknown.bin');
    });

    it('should handle filename with special characters for functional type inference', () => {
      expect(getFunctionalTypeFromMime('image/png', 'file@#$%.png')).toBe('capture.cameraProxy');
    });

    it('should handle very long filename', () => {
      const longName = 'a'.repeat(300) + '.mp4';
      expect(getFunctionalTypeFromMime('video/mp4', longName)).toBe('capture.ocf');
    });

    it('should handle filename with multiple extensions', () => {
      expect(getFunctionalTypeFromMime('video/mp4', 'file.proxy.backup.mp4')).toBe('proxy.daily');
    });

    it('should handle case-insensitive filename patterns', () => {
      expect(getFunctionalTypeFromMime('image/png', 'STORYBOARD_001.PNG')).toBe('artwork.storyboard.frame');
      expect(getFunctionalTypeFromMime('video/mp4', 'Scene_PROXY.MP4')).toBe('proxy.daily');
    });
  });
});
