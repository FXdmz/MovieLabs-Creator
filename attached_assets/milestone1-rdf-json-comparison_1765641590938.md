# Milestone 1: RDF Export vs Official OMC JSON Schema Comparison

## Scope: Participants, Locations, Creative Work, Asset, Participant↔Location Connection

---

## Executive Summary

**Overall Assessment: 7.5/10** - Strong structural compliance with critical naming and reference issues

### What's Working ✅
- All Milestone 1 entity types present
- Proper RDF graph structure with triples
- Rich metadata (coordinates, addresses, names)
- Participant-Location connection established

### Critical Issues 🔴
1. **Location reference uses string literal instead of URI** (Lines 65, 92)
2. **Property naming mismatch** between RDF and JSON schemas
3. **Identifier structure** doesn't match official pattern

---

## Entity-by-Entity Comparison

### 1. CreativeWork (Avatar)

#### Your RDF Structure:
```turtle
me:8b63933a-c11f-4c14-940b-842c566dd82e
    rdf:type omc:CreativeWork ;
    rdfs:label "Avatar" ;
    omc:hasIdentifier me:8b63933a-c11f-4c14-940b-842c566dd82e ;
    omc:hasIdentifierScope "me-nexus" ;
    omc:hasIdentifierValue "8b63933a-c11f-4c14-940b-842c566dd82e" ;
    omc:hasTitle _:creativeWorkTitle0_1 ;
    skos:definition "2009 film directed by James Cameron" ;
    omc:creativeWorkType "creativeWork" ;
    omc:creativeWorkCategory "movie" ;
    omc:approximateLength "PT2H42M" .
```

#### Expected JSON Structure:
```json
{
  "entityType": "CreativeWork",
  "identifier": [
    {
      "identifierScope": "me-nexus",
      "identifierValue": "8b63933a-c11f-4c14-940b-842c566dd82e"
    }
  ],
  "title": [
    {
      "titleText": "Avatar",
      "titleType": "release",
      "language": "en"
    }
  ],
  "description": "2009 film directed by James Cameron",
  "creativeWorkType": "creativeWork",
  "creativeWorkCategory": "movie",
  "approximateLength": "PT2H42M"
}
```

#### Comparison:

| Property | Your RDF | Expected JSON | Status |
|----------|----------|---------------|--------|
| Entity Type | ✅ `rdf:type omc:CreativeWork` | `entityType: "CreativeWork"` | ✅ Correct |
| Identifier | ⚠️ `hasIdentifier` + scope/value | `identifier: [{scope, value}]` | ⚠️ Structure mismatch |
| Title | ✅ `hasTitle` with nested object | `title: [{}]` array | ✅ Correct concept |
| Description | ⚠️ `skos:definition` | `description` | ⚠️ Property name differs |
| Type | ✅ `creativeWorkType` | `creativeWorkType` | ✅ Match |
| Category | ✅ `creativeWorkCategory` | `creativeWorkCategory` | ✅ Match |
| Length | ✅ `approximateLength: "PT2H42M"` | `approximateLength: "PT2H42M"` | ✅ Match |

**Issues:**
- RDF uses `skos:definition`, JSON expects `description`
- Identifier pattern is circular in RDF (entity points to itself)

**Score: 8/10** - Good structure, minor naming issues

---

### 2. Location (Minnesota)

#### Your RDF Structure:
```turtle
me:d1864144-8dd0-4be5-917e-7831e7f1b18a
    rdf:type omc:Location ;
    rdfs:label "minessotta" ;
    omc:hasIdentifier me:d1864144-8dd0-4be5-917e-7831e7f1b18a ;
    omc:hasIdentifierScope "me-nexus" ;
    omc:hasIdentifierValue "d1864144-8dd0-4be5-917e-7831e7f1b18a" ;
    omc:hasAddress _:address_2 ;
    omc:hasCoords _:coordinates_3 .

_:address_2
    rdf:type omc:Address ;
    omc:hasStreetNumberAndName "2231 Rue Que Frenchman" ;
    omc:hasCity "Carlos" ;
    omc:hasPostalCode "56308" ;
    omc:hasCountry "US" .

_:coordinates_3
    rdf:type omc:LatLon ;
    omc:hasLatitude "45.93623278"^^xsd:decimal ;
    omc:hasLongitude "-95.329697362"^^xsd:decimal .
```

#### Expected JSON Structure:
```json
{
  "entityType": "Location",
  "identifier": [
    {
      "identifierScope": "me-nexus",
      "identifierValue": "d1864144-8dd0-4be5-917e-7831e7f1b18a"
    }
  ],
  "address": {
    "street": "2231 Rue Que Frenchman",
    "locality": "Carlos",
    "postalCode": "56308",
    "country": "US"
  },
  "coordinates": {
    "latitude": 45.93623278,
    "longitude": -95.329697362
  }
}
```

#### Property Name Mapping:

| Your RDF Property | Expected JSON Property | Match? |
|-------------------|------------------------|--------|
| `omc:hasAddress` | `address` | ⚠️ Prefix difference |
| `omc:hasStreetNumberAndName` | `street` | ❌ Different name |
| `omc:hasCity` | `locality` | ❌ Different name |
| `omc:hasPostalCode` | `postalCode` | ✅ Match (camelCase) |
| `omc:hasCountry` | `country` | ✅ Match |
| `omc:hasCoords` | `coordinates` | ⚠️ Abbreviation vs full |
| `omc:hasLatitude` | `latitude` | ✅ Match (camelCase) |
| `omc:hasLongitude` | `longitude` | ✅ Match (camelCase) |

**Issues:**
- RDF uses `hasStreetNumberAndName`, JSON expects `street`
- RDF uses `hasCity`, JSON expects `locality`
- RDF uses `hasCoords`, JSON expects `coordinates`
- Data types: RDF uses `xsd:decimal`, JSON uses plain `number`
- **Typo:** "minessotta" should be "Minnesota"

**Score: 6/10** - Structure correct but property names don't align with JSON schema

---

### 3. Participant (James Cameron)

#### Your RDF Structure:
```turtle
me:66e00c2e-ca9f-4be7-8249-cfbb1fb37933
    rdf:type omc:Participant ;
    rdfs:label "James Cameron" ;
    omc:hasIdentifier me:66e00c2e-ca9f-4be7-8249-cfbb1fb37933 ;
    omc:hasIdentifierScope "me-nexus" ;
    omc:hasIdentifierValue "66e00c2e-ca9f-4be7-8249-cfbb1fb37933" ;
    omc:hasParticipantStructuralCharacteristic me:60fc8713-2e05-48ef-9b97-e409c5ace862 ;
    omc:hasParticipantFunctionalCharacteristic _:participantFC_5 .

_:participantFC_5
    omc:hasFunctionalType "crew" ;
    omc:hasJobTitle "director" .
```

#### Expected JSON Structure:
```json
{
  "entityType": "Participant",
  "identifier": [
    {
      "identifierScope": "me-nexus",
      "identifierValue": "66e00c2e-ca9f-4be7-8249-cfbb1fb37933"
    }
  ],
  "ParticipantSC": {
    "@id": "me:60fc8713-2e05-48ef-9b97-e409c5ace862"
  },
  "participantFC": {
    "functionalType": "crew",
    "jobTitle": "director"
  }
}
```

#### Property Mapping:

| Your RDF Property | Expected JSON Property | Match? |
|-------------------|------------------------|--------|
| `hasParticipantStructuralCharacteristic` | `ParticipantSC` | ❌ Name mismatch |
| `hasParticipantFunctionalCharacteristic` | `participantFC` | ⚠️ Case differs |
| `hasFunctionalType` | `functionalType` | ✅ Match (camelCase) |
| `hasJobTitle` | `jobTitle` | ✅ Match (camelCase) |

**Issues:**
- RDF uses long form `hasParticipantStructuralCharacteristic`
- JSON expects abbreviated `ParticipantSC`
- **Critical:** Need to understand if JSON-LD framing will handle this

**Score: 7/10** - Concept correct, naming conventions differ

---

### 4. Person (Structural Characteristic)

#### Your RDF Structure:
```turtle
me:60fc8713-2e05-48ef-9b97-e409c5ace862
    rdf:type omc:Person ;
    omc:hasStructuralType "person" ;
    omc:hasPersonName _:personName_4 ;
    omc:hasIdentifier me:60fc8713-2e05-48ef-9b97-e409c5ace862 ;
    omc:hasIdentifierScope "me-nexus" ;
    omc:hasIdentifierValue "60fc8713-2e05-48ef-9b97-e409c5ace862" ;
    omc:hasLocation "me-nexus:d1864144-8dd0-4be5-917e-7831e7f1b18a" .  ⚠️ STRING!

_:personName_4
    omc:hasFullName "James Cameron" ;
    omc:hasFirstName "James" ;
    omc:hasLastName "Cameron" .
```

#### Expected JSON Structure:
```json
{
  "entityType": "Person",
  "identifier": [
    {
      "identifierScope": "me-nexus",
      "identifierValue": "60fc8713-2e05-48ef-9b97-e409c5ace862"
    }
  ],
  "structuralType": "person",
  "personName": {
    "fullName": "James Cameron",
    "givenName": "James",
    "familyName": "Cameron"
  },
  "Location": {
    "@id": "me:d1864144-8dd0-4be5-917e-7831e7f1b18a"
  }
}
```

#### Property Mapping:

| Your RDF Property | Expected JSON Property | Match? |
|-------------------|------------------------|--------|
| `hasStructuralType` | `structuralType` | ✅ Match (camelCase) |
| `hasPersonName` | `personName` | ✅ Match (camelCase) |
| `hasFullName` | `fullName` | ✅ Match (camelCase) |
| `hasFirstName` | `givenName` | ❌ Different term |
| `hasLastName` | `familyName` | ❌ Different term |
| `hasLocation` | `Location` | ⚠️ Case + **CRITICAL BUG** |

**CRITICAL ISSUE:**
```turtle
❌ omc:hasLocation "me-nexus:d1864144..."  # STRING LITERAL!
✅ omc:hasLocation me:d1864144-8dd0-4be5-917e-7831e7f1b18a  # URI REFERENCE
```

This breaks the graph relationship and will fail JSON-LD conversion.

**Issues:**
- `hasFirstName` should map to `givenName` in JSON
- `hasLastName` should map to `familyName` in JSON
- **Location reference is a string instead of URI** ← BLOCKING

**Score: 4/10** - Structure correct but critical reference bug

---

### 5. Asset (Script)

#### Your RDF Structure:
```turtle
me:12ac2d53-d58d-4f77-967a-2c6623f5af83
    rdf:type omc:Asset ;
    rdfs:label "Europa_1.27.24" ;
    omc:hasIdentifier me:12ac2d53-d58d-4f77-967a-2c6623f5af83 ;
    omc:hasIdentifierScope "me-nexus" ;
    omc:hasIdentifierValue "12ac2d53-d58d-4f77-967a-2c6623f5af83" ;
    omc:hasAssetFunctionalCharacteristic _:assetFC_10 ;
    omc:hasAssetStructuralCharacteristic me:12ac2d53-d58d-4f77-967a-2c6623f5af83-sc .

_:assetFC_10
    omc:hasFunctionalType "script" .

me:12ac2d53-d58d-4f77-967a-2c6623f5af83-sc
    rdf:type omc:AssetAsStructure ;
    omc:hasIdentifier me:12ac2d53-d58d-4f77-967a-2c6623f5af83-sc ;
    omc:hasIdentifierScope "me-nexus" ;
    omc:hasIdentifierValue "12ac2d53-d58d-4f77-967a-2c6623f5af83-sc" ;
    omc:hasStructuralType "digital.document" ;
    omc:hasStructuralProperties _:structuralProperties_11 .

_:structuralProperties_11
    omc:hasFileDetails _:fileDetails_12 .

_:fileDetails_12
    omc:hasFileName "Europa_1.27.24.pdf" ;
    omc:hasFileExtension "pdf" .
```

#### Expected JSON Structure:
```json
{
  "entityType": "Asset",
  "identifier": [
    {
      "identifierScope": "me-nexus",
      "identifierValue": "12ac2d53-d58d-4f77-967a-2c6623f5af83"
    }
  ],
  "assetFC": {
    "functionalType": "script"
  },
  "AssetSC": {
    "entityType": "AssetAsStructure",
    "identifier": [
      {
        "identifierScope": "me-nexus",
        "identifierValue": "12ac2d53-d58d-4f77-967a-2c6623f5af83-sc"
      }
    ],
    "structuralType": "digital.document",
    "structuralProperties": {
      "fileDetails": {
        "fileName": "Europa_1.27.24.pdf",
        "fileExtension": "pdf"
      }
    }
  }
}
```

#### Property Mapping:

| Your RDF Property | Expected JSON Property | Match? |
|-------------------|------------------------|--------|
| `hasAssetFunctionalCharacteristic` | `assetFC` | ❌ Name mismatch |
| `hasAssetStructuralCharacteristic` | `AssetSC` | ❌ Name mismatch |
| `hasFunctionalType` | `functionalType` | ✅ Match (camelCase) |
| `hasStructuralType` | `structuralType` | ✅ Match (camelCase) |
| `hasStructuralProperties` | `structuralProperties` | ✅ Match (camelCase) |
| `hasFileDetails` | `fileDetails` | ✅ Match (camelCase) |
| `hasFileName` | `fileName` | ✅ Match (camelCase) |
| `hasFileExtension` | `fileExtension` | ✅ Match (camelCase) |

**Issues:**
- RDF uses verbose `hasAssetFunctionalCharacteristic`, JSON expects `assetFC`
- RDF uses verbose `hasAssetStructuralCharacteristic`, JSON expects `AssetSC`
- Label "Europa_1.27.24" seems unrelated to Avatar (data consistency issue)

**Score: 7/10** - Good structure, naming convention differences

---

## Critical Findings Summary

### 🔴 **BLOCKING ISSUES**

1. **Location Reference Bug (Priority 1)**
   - **Lines 65, 92:** `omc:hasLocation "me-nexus:d1864144..."` 
   - **Fix:** Remove quotes: `omc:hasLocation me:d1864144-8dd0-4be5-917e-7831e7f1b18a`
   - **Impact:** Breaks graph traversal, JSON-LD conversion will fail

2. **Identifier Pattern (Priority 2)**
   - **Current:** Entity points to itself as identifier
   - **Expected:** Array of identifier objects
   - **Impact:** JSON conversion needs special handling

### ⚠️ **PROPERTY NAMING INCONSISTENCIES**

#### High Impact:
- `hasStreetNumberAndName` vs `street`
- `hasCity` vs `locality`
- `hasFirstName` vs `givenName`
- `hasLastName` vs `familyName`
- `hasParticipantStructuralCharacteristic` vs `ParticipantSC`
- `hasAssetFunctionalCharacteristic` vs `assetFC`

#### Medium Impact:
- `hasCoords` vs `coordinates`
- `hasPersonName` vs `personName` (matches in concept)
- `skos:definition` vs `description`

### ✅ **WHAT'S WORKING**

1. **Entity Types:** All correct (`CreativeWork`, `Participant`, `Person`, `Location`, `Asset`)
2. **Graph Structure:** Proper use of blank nodes and named nodes
3. **Data Types:** Correct use of xsd:decimal for coordinates, ISO 8601 for duration
4. **Relationships:** Participant→Person connection correct
5. **Milestone 1 Scope:** All required entities present

---

## RDF→JSON Conversion Strategy

### Option 1: Property Mapping in Serializer

Create a mapping layer when converting RDF to JSON:

```python
RDF_TO_JSON_PROPERTIES = {
    "omc:hasStreetNumberAndName": "street",
    "omc:hasCity": "locality",
    "omc:hasFirstName": "givenName",
    "omc:hasLastName": "familyName",
    "omc:hasCoords": "coordinates",
    "omc:hasParticipantStructuralCharacteristic": "ParticipantSC",
    "omc:hasParticipantFunctionalCharacteristic": "participantFC",
    # ... etc
}
```

**Pros:**
- Keeps RDF verbose and self-documenting
- Clean separation of concerns
- Easy to maintain both formats

**Cons:**
- Need to maintain mapping table
- Two sources of truth

### Option 2: Align RDF Properties to JSON

Change your RDF export to match JSON property names:

```turtle
# Instead of:
omc:hasCity "Carlos" ;

# Use:
omc:locality "Carlos" ;
```

**Pros:**
- Direct 1:1 mapping
- Single source of truth
- Simpler conversion

**Cons:**
- RDF becomes less readable
- May not follow RDF best practices
- Harder to understand triples

### **Recommendation:** Option 1 (Property Mapping)

RDF should remain verbose and semantic. Use a mapping layer for JSON conversion.

---

## Immediate Action Items

### Must Fix (Milestone 1 Completion):

1. ✅ **Fix location reference** (Lines 65, 92)
   ```turtle
   # Change from:
   omc:hasLocation "me-nexus:d1864144..." .
   # To:
   omc:hasLocation me:d1864144-8dd0-4be5-917e-7831e7f1b18a .
   ```

2. ✅ **Fix identifier pattern**
   ```turtle
   # Change from:
   me:uuid
       omc:hasIdentifier me:uuid ;
       omc:hasIdentifierScope "me-nexus" ;
       omc:hasIdentifierValue "uuid" .
   
   # To:
   me:uuid
       omc:hasIdentifier [
           omc:hasIdentifierScope "me-nexus" ;
           omc:hasIdentifierValue "uuid"
       ] .
   ```

3. ✅ **Fix spelling:** "minessotta" → "Minnesota"

### Should Do (Quality):

4. ⬜ **Build property mapping table** for RDF→JSON conversion
5. ⬜ **Document naming conventions** for team
6. ⬜ **Add validation** to catch string literal references

### Nice to Have:

7. ⬜ **Fix data consistency:** Asset label should be Avatar-related
8. ⬜ **Add more file details:** fileSize, mimeType
9. ⬜ **Add description** to entities for better context

---

## Milestone 1 Score Card

| Category | Score | Notes |
|----------|-------|-------|
| **Entity Coverage** | 10/10 | All M1 entities present |
| **Graph Structure** | 8/10 | Good, minus reference bug |
| **Property Naming** | 6/10 | Semantic but doesn't match JSON |
| **Data Quality** | 7/10 | Good metadata, minor typo |
| **JSON Compatibility** | 5/10 | Needs mapping layer |
| **Participant-Location Link** | 2/10 | ⚠️ **BROKEN** (string literal) |
| **Overall** | **7/10** | Strong foundation, fixable issues |

---

## Next Steps for Milestone 2

Once M1 issues are fixed:

1. ✅ Add Task entities (connect Participant + Asset + Infrastructure)
2. ✅ Add Context entities (temporal scope)
3. ✅ Add Infrastructure entities (tools used)
4. ✅ Implement property mapping layer
5. ✅ Create round-trip tests (RDF ↔ JSON ↔ RDF)

---

## Conclusion

Your Milestone 1 RDF export demonstrates solid understanding of OMC structure and RDF principles. The main issues are:

1. **Critical:** Location reference using string instead of URI (easy fix)
2. **Strategic:** Property naming doesn't align with JSON schema (needs mapping layer)
3. **Quality:** Minor typo and data consistency issues

**After fixing the location reference bug, your RDF export will be production-ready for Milestone 1.**

The property naming misalignment is a design decision - I recommend keeping verbose RDF and building a mapping layer rather than compromising RDF readability.
