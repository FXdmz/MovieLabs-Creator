/**
 * @fileoverview Wikidata Integration Test Suite
 * 
 * Vitest tests for Wikidata data extraction functions.
 * Note: Actual API calls are not tested to avoid network dependencies.
 * These tests focus on the data transformation functions.
 */
import { describe, it, expect } from 'vitest';
import {
  extractWikidataPersonData,
  extractWikidataMediaData,
  WikidataPerson,
  WikidataMedia
} from './wikidata';

describe('Wikidata Integration', () => {
  describe('extractWikidataPersonData', () => {
    it('should extract full name correctly', () => {
      const person: WikidataPerson = {
        id: 'Q12345',
        name: 'John Smith',
        wikidataUrl: 'https://www.wikidata.org/wiki/Q12345'
      };
      
      const data = extractWikidataPersonData(person);
      
      expect(data.personName.fullName).toBe('John Smith');
    });

    it('should split name into first and last', () => {
      const person: WikidataPerson = {
        id: 'Q12345',
        name: 'John Smith',
        wikidataUrl: 'https://www.wikidata.org/wiki/Q12345'
      };
      
      const data = extractWikidataPersonData(person);
      
      expect(data.personName.firstGivenName).toBe('John');
      expect(data.personName.familyName).toBe('Smith');
    });

    it('should handle multi-part last names', () => {
      const person: WikidataPerson = {
        id: 'Q12345',
        name: 'Juan Carlos García López',
        wikidataUrl: 'https://www.wikidata.org/wiki/Q12345'
      };
      
      const data = extractWikidataPersonData(person);
      
      expect(data.personName.firstGivenName).toBe('Juan');
      expect(data.personName.familyName).toBe('Carlos García López');
    });

    it('should handle single name', () => {
      const person: WikidataPerson = {
        id: 'Q12345',
        name: 'Prince',
        wikidataUrl: 'https://www.wikidata.org/wiki/Q12345'
      };
      
      const data = extractWikidataPersonData(person);
      
      expect(data.personName.firstGivenName).toBe('Prince');
      expect(data.personName.familyName).toBe('');
    });

    it('should include birth date when present', () => {
      const person: WikidataPerson = {
        id: 'Q12345',
        name: 'John Smith',
        birthDate: '1980-05-15',
        wikidataUrl: 'https://www.wikidata.org/wiki/Q12345'
      };
      
      const data = extractWikidataPersonData(person);
      
      expect(data.dateOfBirth).toBe('1980-05-15');
    });

    it('should not include birth date when absent', () => {
      const person: WikidataPerson = {
        id: 'Q12345',
        name: 'John Smith',
        wikidataUrl: 'https://www.wikidata.org/wiki/Q12345'
      };
      
      const data = extractWikidataPersonData(person);
      
      expect(data.dateOfBirth).toBeUndefined();
    });

    it('should include Wikidata ID in custom data', () => {
      const person: WikidataPerson = {
        id: 'Q12345',
        name: 'John Smith',
        wikidataUrl: 'https://www.wikidata.org/wiki/Q12345'
      };
      
      const data = extractWikidataPersonData(person);
      
      expect(data.customData.wikidataId).toBe('Q12345');
      expect(data.customData.wikidataUrl).toBe('https://www.wikidata.org/wiki/Q12345');
    });

    it('should include description when present', () => {
      const person: WikidataPerson = {
        id: 'Q12345',
        name: 'John Smith',
        description: 'American actor',
        wikidataUrl: 'https://www.wikidata.org/wiki/Q12345'
      };
      
      const data = extractWikidataPersonData(person);
      
      expect(data.customData.wikidataDescription).toBe('American actor');
    });

    it('should include image URL when present', () => {
      const person: WikidataPerson = {
        id: 'Q12345',
        name: 'John Smith',
        image: 'https://commons.wikimedia.org/wiki/Special:FilePath/John_Smith.jpg?width=200',
        wikidataUrl: 'https://www.wikidata.org/wiki/Q12345'
      };
      
      const data = extractWikidataPersonData(person);
      
      expect(data.customData.imageUrl).toBe('https://commons.wikimedia.org/wiki/Special:FilePath/John_Smith.jpg?width=200');
    });
  });

  describe('extractWikidataMediaData', () => {
    it('should extract title correctly', () => {
      const media: WikidataMedia = {
        id: 'Q12345',
        title: 'The Matrix',
        mediaType: 'film',
        wikidataUrl: 'https://www.wikidata.org/wiki/Q12345'
      };
      
      const data = extractWikidataMediaData(media);
      
      expect(data.name).toBe('The Matrix');
    });

    it('should include description when present', () => {
      const media: WikidataMedia = {
        id: 'Q12345',
        title: 'The Matrix',
        description: '1999 science fiction action film',
        mediaType: 'film',
        wikidataUrl: 'https://www.wikidata.org/wiki/Q12345'
      };
      
      const data = extractWikidataMediaData(media);
      
      expect(data.description).toBe('1999 science fiction action film');
    });

    it('should include release date when present', () => {
      const media: WikidataMedia = {
        id: 'Q12345',
        title: 'The Matrix',
        releaseDate: '1999-03-31',
        mediaType: 'film',
        wikidataUrl: 'https://www.wikidata.org/wiki/Q12345'
      };
      
      const data = extractWikidataMediaData(media);
      
      expect(data.releaseDate).toBe('1999-03-31');
    });

    it('should preserve media type', () => {
      const film: WikidataMedia = {
        id: 'Q1',
        title: 'Film',
        mediaType: 'film',
        wikidataUrl: 'https://www.wikidata.org/wiki/Q1'
      };
      
      const tvSeries: WikidataMedia = {
        id: 'Q2',
        title: 'TV Series',
        mediaType: 'tvSeries',
        wikidataUrl: 'https://www.wikidata.org/wiki/Q2'
      };
      
      const tvEpisode: WikidataMedia = {
        id: 'Q3',
        title: 'TV Episode',
        mediaType: 'tvEpisode',
        wikidataUrl: 'https://www.wikidata.org/wiki/Q3'
      };
      
      expect(extractWikidataMediaData(film).mediaType).toBe('film');
      expect(extractWikidataMediaData(tvSeries).mediaType).toBe('tvSeries');
      expect(extractWikidataMediaData(tvEpisode).mediaType).toBe('tvEpisode');
    });

    it('should include Wikidata identifiers', () => {
      const media: WikidataMedia = {
        id: 'Q12345',
        title: 'The Matrix',
        mediaType: 'film',
        wikidataUrl: 'https://www.wikidata.org/wiki/Q12345'
      };
      
      const data = extractWikidataMediaData(media);
      
      expect(data.wikidataId).toBe('Q12345');
      expect(data.wikidataUrl).toBe('https://www.wikidata.org/wiki/Q12345');
    });

    it('should include image URL when present', () => {
      const media: WikidataMedia = {
        id: 'Q12345',
        title: 'The Matrix',
        image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Matrix_Poster.jpg?width=200',
        mediaType: 'film',
        wikidataUrl: 'https://www.wikidata.org/wiki/Q12345'
      };
      
      const data = extractWikidataMediaData(media);
      
      expect(data.imageUrl).toBe('https://commons.wikimedia.org/wiki/Special:FilePath/Matrix_Poster.jpg?width=200');
    });

    it('should handle media without optional fields', () => {
      const media: WikidataMedia = {
        id: 'Q12345',
        title: 'Unknown Film',
        mediaType: 'other',
        wikidataUrl: 'https://www.wikidata.org/wiki/Q12345'
      };
      
      const data = extractWikidataMediaData(media);
      
      expect(data.name).toBe('Unknown Film');
      expect(data.description).toBeUndefined();
      expect(data.releaseDate).toBeUndefined();
      expect(data.imageUrl).toBeUndefined();
    });
  });
});
