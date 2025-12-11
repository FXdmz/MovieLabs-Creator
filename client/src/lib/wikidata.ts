export interface WikidataPerson {
  id: string;
  name: string;
  description?: string;
  birthDate?: string;
  birthPlace?: string;
  occupation?: string[];
  nationality?: string;
  image?: string;
  wikidataUrl: string;
}

interface WikidataSearchResult {
  search: Array<{
    id: string;
    label: string;
    description?: string;
  }>;
}

interface WikidataEntity {
  entities: Record<string, {
    id: string;
    labels?: Record<string, { value: string }>;
    descriptions?: Record<string, { value: string }>;
    claims?: Record<string, Array<{
      mainsnak?: {
        datavalue?: {
          value: any;
          type: string;
        };
      };
    }>>;
  }>;
}

const WIKIDATA_API = "https://www.wikidata.org/w/api.php";

// Property IDs for person data
const PROPS = {
  instanceOf: "P31",
  occupation: "P106",
  dateOfBirth: "P569",
  placeOfBirth: "P19",
  nationality: "P27",
  image: "P18",
  gender: "P21"
};

// Q-IDs for filtering humans
const HUMAN_QID = "Q5";

export async function searchPeople(query: string): Promise<WikidataPerson[]> {
  if (!query || query.length < 2) return [];

  try {
    // Search for entities matching the query
    const searchUrl = new URL(WIKIDATA_API);
    searchUrl.searchParams.set("action", "wbsearchentities");
    searchUrl.searchParams.set("search", query);
    searchUrl.searchParams.set("language", "en");
    searchUrl.searchParams.set("limit", "10");
    searchUrl.searchParams.set("format", "json");
    searchUrl.searchParams.set("origin", "*");

    const searchResponse = await fetch(searchUrl.toString());
    const searchData: WikidataSearchResult = await searchResponse.json();

    if (!searchData.search || searchData.search.length === 0) {
      return [];
    }

    // Get entity IDs
    const entityIds = searchData.search.map(r => r.id);
    
    // Fetch detailed entity data
    const entityUrl = new URL(WIKIDATA_API);
    entityUrl.searchParams.set("action", "wbgetentities");
    entityUrl.searchParams.set("ids", entityIds.join("|"));
    entityUrl.searchParams.set("languages", "en");
    entityUrl.searchParams.set("props", "labels|descriptions|claims");
    entityUrl.searchParams.set("format", "json");
    entityUrl.searchParams.set("origin", "*");

    const entityResponse = await fetch(entityUrl.toString());
    const entityData: WikidataEntity = await entityResponse.json();

    const results: WikidataPerson[] = [];

    for (const id of entityIds) {
      const entity = entityData.entities[id];
      if (!entity) continue;

      // Check if this is a human (instance of Q5)
      const instanceOf = entity.claims?.[PROPS.instanceOf];
      const isHuman = instanceOf?.some(claim => 
        claim.mainsnak?.datavalue?.value?.id === HUMAN_QID
      );

      if (!isHuman) continue;

      const name = entity.labels?.en?.value || "";
      const description = entity.descriptions?.en?.value;

      // Extract birth date
      let birthDate: string | undefined;
      const birthClaim = entity.claims?.[PROPS.dateOfBirth]?.[0];
      if (birthClaim?.mainsnak?.datavalue?.value?.time) {
        const timeValue = birthClaim.mainsnak.datavalue.value.time;
        // Format: +1990-01-15T00:00:00Z -> 1990-01-15
        birthDate = timeValue.replace(/^\+/, "").split("T")[0];
      }

      // Extract occupations
      const occupations: string[] = [];
      const occupationClaims = entity.claims?.[PROPS.occupation] || [];
      for (const claim of occupationClaims.slice(0, 3)) {
        const occId = claim.mainsnak?.datavalue?.value?.id;
        if (occId) {
          // We'd need another API call to get occupation labels, so we'll skip for now
          // and just note that occupations exist
          occupations.push(occId);
        }
      }

      // Get image URL if available
      let image: string | undefined;
      const imageClaim = entity.claims?.[PROPS.image]?.[0];
      if (imageClaim?.mainsnak?.datavalue?.value) {
        const filename = imageClaim.mainsnak.datavalue.value;
        // Wikimedia Commons image URL format
        const encodedFilename = encodeURIComponent(filename.replace(/ /g, "_"));
        image = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodedFilename}?width=200`;
      }

      results.push({
        id,
        name,
        description,
        birthDate,
        occupation: occupations.length > 0 ? occupations : undefined,
        image,
        wikidataUrl: `https://www.wikidata.org/wiki/${id}`
      });
    }

    return results;
  } catch (error) {
    console.error("Wikidata search error:", error);
    return [];
  }
}

export interface WikidataParticipantData {
  personName: {
    fullName: string;
    firstGivenName: string;
    familyName: string;
  };
  dateOfBirth?: string;
  customData: {
    wikidataId: string;
    wikidataUrl: string;
    wikidataDescription?: string;
    imageUrl?: string;
  };
}

export function extractWikidataPersonData(person: WikidataPerson): WikidataParticipantData {
  const nameParts = person.name.split(" ");
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";

  return {
    personName: {
      fullName: person.name,
      firstGivenName: firstName,
      familyName: lastName
    },
    ...(person.birthDate && { dateOfBirth: person.birthDate }),
    customData: {
      wikidataId: person.id,
      wikidataUrl: person.wikidataUrl,
      ...(person.description && { wikidataDescription: person.description }),
      ...(person.image && { imageUrl: person.image })
    }
  };
}

// Media (Movies/TV Shows) search types
export interface WikidataMedia {
  id: string;
  title: string;
  description?: string;
  releaseDate?: string;
  director?: string;
  genre?: string[];
  duration?: string;
  image?: string;
  mediaType: "film" | "tvSeries" | "tvEpisode" | "other";
  wikidataUrl: string;
}

// Q-IDs for media types
const FILM_QID = "Q11424";
const TV_SERIES_QID = "Q5398426";
const TV_EPISODE_QID = "Q21191270";
const MINISERIES_QID = "Q1366112";

// Property IDs for media data
const MEDIA_PROPS = {
  instanceOf: "P31",
  publicationDate: "P577",
  director: "P57",
  genre: "P136",
  duration: "P2047",
  image: "P18",
  imdbId: "P345"
};

export async function searchMedia(query: string): Promise<WikidataMedia[]> {
  if (!query || query.length < 2) return [];

  try {
    // Search for entities matching the query
    const searchUrl = new URL(WIKIDATA_API);
    searchUrl.searchParams.set("action", "wbsearchentities");
    searchUrl.searchParams.set("search", query);
    searchUrl.searchParams.set("language", "en");
    searchUrl.searchParams.set("limit", "15");
    searchUrl.searchParams.set("format", "json");
    searchUrl.searchParams.set("origin", "*");

    const searchResponse = await fetch(searchUrl.toString());
    const searchData: WikidataSearchResult = await searchResponse.json();

    if (!searchData.search || searchData.search.length === 0) {
      return [];
    }

    // Get entity IDs
    const entityIds = searchData.search.map(r => r.id);
    
    // Fetch detailed entity data
    const entityUrl = new URL(WIKIDATA_API);
    entityUrl.searchParams.set("action", "wbgetentities");
    entityUrl.searchParams.set("ids", entityIds.join("|"));
    entityUrl.searchParams.set("languages", "en");
    entityUrl.searchParams.set("props", "labels|descriptions|claims");
    entityUrl.searchParams.set("format", "json");
    entityUrl.searchParams.set("origin", "*");

    const entityResponse = await fetch(entityUrl.toString());
    const entityData: WikidataEntity = await entityResponse.json();

    const results: WikidataMedia[] = [];

    for (const id of entityIds) {
      const entity = entityData.entities[id];
      if (!entity) continue;

      // Check if this is a film, TV series, or TV episode
      const instanceOf = entity.claims?.[MEDIA_PROPS.instanceOf];
      let mediaType: WikidataMedia["mediaType"] = "other";
      
      const isFilm = instanceOf?.some(claim => 
        claim.mainsnak?.datavalue?.value?.id === FILM_QID
      );
      const isTvSeries = instanceOf?.some(claim => 
        [TV_SERIES_QID, MINISERIES_QID].includes(claim.mainsnak?.datavalue?.value?.id)
      );
      const isTvEpisode = instanceOf?.some(claim => 
        claim.mainsnak?.datavalue?.value?.id === TV_EPISODE_QID
      );

      if (isFilm) mediaType = "film";
      else if (isTvSeries) mediaType = "tvSeries";
      else if (isTvEpisode) mediaType = "tvEpisode";
      else continue; // Skip non-media entities

      const title = entity.labels?.en?.value || "";
      const description = entity.descriptions?.en?.value;

      // Extract release date
      let releaseDate: string | undefined;
      const dateClaim = entity.claims?.[MEDIA_PROPS.publicationDate]?.[0];
      if (dateClaim?.mainsnak?.datavalue?.value?.time) {
        const timeValue = dateClaim.mainsnak.datavalue.value.time;
        releaseDate = timeValue.replace(/^\+/, "").split("T")[0];
      }

      // Get image URL if available
      let image: string | undefined;
      const imageClaim = entity.claims?.[MEDIA_PROPS.image]?.[0];
      if (imageClaim?.mainsnak?.datavalue?.value) {
        const filename = imageClaim.mainsnak.datavalue.value;
        const encodedFilename = encodeURIComponent(filename.replace(/ /g, "_"));
        image = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodedFilename}?width=200`;
      }

      // Extract duration (in minutes from Wikidata)
      let duration: string | undefined;
      const durationClaim = entity.claims?.[MEDIA_PROPS.duration]?.[0];
      if (durationClaim?.mainsnak?.datavalue?.value?.amount) {
        const minutes = parseInt(durationClaim.mainsnak.datavalue.value.amount.replace('+', ''), 10);
        if (!isNaN(minutes) && minutes > 0) {
          // Convert to ISO 8601 duration format
          const hours = Math.floor(minutes / 60);
          const mins = minutes % 60;
          if (hours > 0 && mins > 0) {
            duration = `PT${hours}H${mins}M`;
          } else if (hours > 0) {
            duration = `PT${hours}H`;
          } else {
            duration = `PT${mins}M`;
          }
        }
      }

      results.push({
        id,
        title,
        description,
        releaseDate,
        duration,
        mediaType,
        image,
        wikidataUrl: `https://www.wikidata.org/wiki/${id}`
      });
    }

    return results;
  } catch (error) {
    console.error("Wikidata media search error:", error);
    return [];
  }
}

export interface WikidataCreativeWorkData {
  name: string;
  description?: string;
  releaseDate?: string;
  mediaType: "film" | "tvSeries" | "tvEpisode" | "other";
  wikidataId: string;
  wikidataUrl: string;
  imageUrl?: string;
}

export function extractWikidataMediaData(media: WikidataMedia): WikidataCreativeWorkData {
  return {
    name: media.title,
    description: media.description,
    releaseDate: media.releaseDate,
    mediaType: media.mediaType,
    wikidataId: media.id,
    wikidataUrl: media.wikidataUrl,
    imageUrl: media.image
  };
}
