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

export function mapWikidataToParticipant(person: WikidataPerson): Record<string, any> {
  // Parse name into first/last if possible
  const nameParts = person.name.split(" ");
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";

  return {
    entityType: "Participant",
    schemaVersion: "https://movielabs.com/omc/json/schema/v2.8",
    ParticipantSC: {
      entityType: "Person",
      schemaVersion: "https://movielabs.com/omc/json/schema/v2.8",
      structuralType: "Person",
      personName: {
        fullName: person.name,
        firstGivenName: firstName,
        familyName: lastName
      },
      ...(person.birthDate && { dateOfBirth: person.birthDate })
    },
    customData: {
      wikidataId: person.id,
      wikidataUrl: person.wikidataUrl,
      ...(person.description && { wikidataDescription: person.description }),
      ...(person.image && { imageUrl: person.image })
    }
  };
}
