# Avatar-unit.json Analysis: Actual Output vs. Official OMC Schema

**Assessment: 4/10** - Structure partially correct but critical issues remain

---

## 🔴 **CRITICAL ISSUES (BLOCKING)**

### Issue #1: Location Reference STILL a String (UNFIXED)

**Lines in Participant JSON:**
```json
"ParticipantSC": {
  "Location": "me-nexus:d1864144-8dd0-4be5-917e-7831e7f1b18a"  // ❌ STILL STRING!
}
```

**Expected per Official Schema:**
```json
"ParticipantSC": {
  "Location": {
    "@id": "me-nexus:d1864144-8dd0-4be5-917e-7831e7f1b18a"
  }
}
```

**Or if using pure JSON references:**
```json
"ParticipantSC": {
  "Location": {
    "identifier": [{
      "identifierScope": "me-nexus",
      "identifierValue": "d1864144-8dd0-4be5-917e-7831e7f1b18a"
    }]
  }
}
```

**Impact:** The Participant→Person→Location connection is STILL BROKEN in JSON, just like in RDF.

---

### Issue #2: Broken Infrastructure Structural Properties

**Maya and Final Draft:**
```json
"InfrastructureSC": {
  "structuralProperties": "b0_structuralProperties_8"  // ❌ String reference to blank node!
}
```

**Problem:** This is a string containing the blank node ID from RDF. It should be the actual object with software details.

**Expected:**
```json
"InfrastructureSC": {
  "structuralProperties": {
    "softwareType": "3D Animation Software",
    "vendor": "Autodesk",
    "productName": "Maya",
    "versionNumber": "2024"
  }
}
```

**Root Cause:** Your RDF had empty blank nodes, and the JSON serializer couldn't resolve them, so it just exported the blank node IDs as strings.

---

### Issue #3: Double-Nested Identifier Structure

**Your Output:**
```json
"identifier": [
  {
    "identifier": [  // ❌ Double nesting!
      {
        "identifierScope": "me-nexus",
        "identifierValue": "60fc8713-2e05-48ef-9b97-e409c5ace862",
        "combinedForm": "me-nexus:60fc8713-2e05-48ef-9b97-e409c5ace862"
      }
    ]
  }
]
```

**Expected:**
```json
"identifier": [
  {
    "identifierScope": "me-nexus",
    "identifierValue": "60fc8713-2e05-48ef-9b97-e409c5ace862"
  }
]
```

**Problem:** The identifier array shouldn't contain another identifier array. This is malformed.

---

## ⚠️ **PROPERTY NAMING MISMATCHES**

### Location Properties

| Your JSON | Official Schema | Status |
|-----------|-----------------|--------|
| `streetNumberAndName` | `street` | ❌ Wrong |
| `city` | `locality` | ❌ Wrong |
| `postalCode` | `postalCode` | ✅ Correct |
| `country` | `country` | ✅ Correct |
| `geo` | `coordinates` | ❌ Wrong property name |

### Person Properties

| Your JSON | Official Schema | Status |
|-----------|-----------------|--------|
| `firstName` | `givenName` | ❌ Wrong |
| `lastName` | `familyName` | ❌ Wrong |
| `fullName` | `fullName` | ✅ Correct |

### CreativeWork Properties

| Your JSON | Official Schema | Status |
|-----------|-----------------|--------|
| `creativeWorkTitle` | `title` | ❌ Wrong |
| `titleName` | `titleText` | ❌ Wrong |
| `titleLanguage` | `language` | ❌ Wrong |

---

## 🔧 **EXTRA/UNNECESSARY FIELDS**

### Problem: Entity Metadata in Nested Objects

**Your Output:**
```json
"address": {
  "entityType": "Address",  // ❌ Not needed in nested object
  "schemaVersion": "https://movielabs.com/omc/json/schema/v2.8",  // ❌ Not needed
  "streetNumberAndName": "2231 Rue Que Frenchman",
  ...
}
```

**Expected:**
```json
"address": {
  "street": "2231 Rue Que Frenchman",
  "locality": "Carlos",
  "postalCode": "56308",
  "country": "US"
}
```

**Rule:** `entityType` and `schemaVersion` should ONLY appear on root entities, not nested utility objects.

### Problem: combinedForm in Identifiers

**Your Output:**
```json
"identifier": [
  {
    "identifierScope": "me-nexus",
    "identifierValue": "8b63933a-c11f-4c14-940b-842c566dd82e",
    "combinedForm": "me-nexus:8b63933a-c11f-4c14-940b-842c566dd82e"  // ❌ Not in spec
  }
]
```

**Expected:**
```json
"identifier": [
  {
    "identifierScope": "me-nexus",
    "identifierValue": "8b63933a-c11f-4c14-940b-842c566dd82e"
  }
]
```

The official OMC schema doesn't have a `combinedForm` field.

---

## ✅ **WHAT'S WORKING**

### Good Structure:
1. ✅ Top-level array of entities
2. ✅ `entityType` on each root entity
3. ✅ `schemaVersion` on each root entity
4. ✅ `ParticipantSC` and `participantFC` naming (matches official schema)
5. ✅ `assetFC` and `AssetSC` naming (matches official schema)
6. ✅ Basic identifier structure on root entities (despite the nesting issue)

### Good Data:
1. ✅ Coordinate values as numbers (not strings)
2. ✅ ISO 8601 duration format
3. ✅ Proper entity type values

---

## 📊 **COMPARISON: Your JSON vs. Official Schema**

### CreativeWork
```diff
{
  "name": "Avatar",
  "description": "2009 film directed by James Cameron",  ✅
  "creativeWorkType": "creativeWork",  ✅
  "creativeWorkCategory": "movie",  ✅
  "approximateLength": "PT2H42M",  ✅
  "identifier": [...],  ⚠️ Has combinedForm extra field
- "creativeWorkTitle": [  ❌ Should be "title"
+ "title": [
    {
-     "titleName": "Avatar",  ❌ Should be "titleText"
+     "titleText": "Avatar",
      "titleType": "release",  ✅
-     "titleLanguage": "en"  ❌ Should be "language"
+     "language": "en"
    }
  ],
  "entityType": "CreativeWork",  ✅
  "schemaVersion": "..."  ✅
}
```

### Location
```diff
{
  "name": "minessotta",  ⚠️ Typo remains
  "address": {
-   "entityType": "Address",  ❌ Remove
-   "schemaVersion": "...",  ❌ Remove
-   "streetNumberAndName": "2231 Rue Que Frenchman",  ❌ Should be "street"
+   "street": "2231 Rue Que Frenchman",
-   "city": "Carlos",  ❌ Should be "locality"
+   "locality": "Carlos",
    "postalCode": "56308",  ✅
    "country": "US"  ✅
  },
- "geo": {  ❌ Should be "coordinates"
+ "coordinates": {
-   "entityType": "LatLon",  ❌ Remove
-   "schemaVersion": "...",  ❌ Remove
    "latitude": 45.93623278,  ✅
    "longitude": -95.329697362  ✅
  },
  "identifier": [...],  ✅ (except combinedForm)
  "entityType": "Location",  ✅
  "schemaVersion": "..."  ✅
}
```

### Participant/Person
```diff
{
  "name": "James Cameron",  ✅
  "ParticipantSC": {  ✅ Name correct
    "entityType": "Person",  ✅
-   "schemaVersion": "...",  ❌ Remove from nested object
-   "identifierScope": "me-nexus",  ❌ Should be in identifier array
-   "identifierValue": "...",  ❌ Should be in identifier array
    "structuralType": "person",  ✅
    "personName": {
      "fullName": "James Cameron",  ✅
-     "firstName": "James",  ❌ Should be "givenName"
+     "givenName": "James",
-     "lastName": "Cameron"  ❌ Should be "familyName"
+     "familyName": "Cameron"
    },
-   "Location": "me-nexus:d1864144...",  ❌❌ CRITICAL: Should be object reference
+   "Location": {
+     "@id": "me-nexus:d1864144-8dd0-4be5-917e-7831e7f1b18a"
+   },
    "identifier": [...]  ⚠️ Double-nested, wrong structure
  },
  "participantFC": {  ✅ Name correct
    "functionalType": "crew",  ✅
    "jobTitle": "director"  ✅
  },
  "identifier": [...],  ✅ (except combinedForm)
  "entityType": "Participant",  ✅
  "schemaVersion": "..."  ✅
}
```

---

## 🎯 **ROOT CAUSES**

### 1. JSON Serializer Not Handling RDF Properly

Your JSON export is doing a **naive RDF→JSON conversion** that:
- Doesn't resolve blank node references (hence `"b0_structuralProperties_8"` strings)
- Doesn't convert property names to official schema
- Doesn't handle object references properly (Location still a string)
- Creates double-nested structures

### 2. Missing Property Mapping Layer

You need an explicit mapping table between RDF and JSON property names:

```javascript
const RDF_TO_JSON_PROPERTY_MAP = {
  // RDF Property → JSON Property
  'omc:hasStreetNumberAndName': 'street',
  'omc:hasCity': 'locality',
  'omc:hasFirstName': 'givenName',
  'omc:hasLastName': 'familyName',
  'omc:hasCoords': 'coordinates',
  'omc:creativeWorkTitle': 'title',
  'omc:hasTitleName': 'titleText',
  'omc:titleLanguage': 'language',
  // etc...
};
```

### 3. Blank Node Resolution Failure

Your RDF has blank nodes like `_:structuralProperties_8` that are empty. The JSON serializer:
1. Tries to export them
2. Finds they have no content
3. Just exports the blank node ID as a string

**Fix:** Either populate blank nodes in RDF OR handle them specially in JSON export.

---

## 📋 **IMMEDIATE FIXES NEEDED**

### Fix #1: Location Reference Object (CRITICAL)
```javascript
// In your JSON serializer:
if (property === 'Location' && typeof value === 'string') {
  // Convert string reference to object reference
  return {
    '@id': value  // Or use identifier structure
  };
}
```

### Fix #2: Property Name Mapping
```javascript
function mapProperty(rdfProperty) {
  const map = {
    'streetNumberAndName': 'street',
    'city': 'locality',
    'firstName': 'givenName',
    'lastName': 'familyName',
    'geo': 'coordinates',
    'creativeWorkTitle': 'title',
    'titleName': 'titleText',
    'titleLanguage': 'language'
  };
  return map[rdfProperty] || rdfProperty;
}
```

### Fix #3: Remove Extra Metadata from Nested Objects
```javascript
function cleanNestedObject(obj) {
  if (obj.entityType && !isRootEntity(obj)) {
    delete obj.entityType;
    delete obj.schemaVersion;
  }
  return obj;
}
```

### Fix #4: Fix Identifier Structure
```javascript
// Flatten double-nested identifiers
if (Array.isArray(obj.identifier) && obj.identifier[0]?.identifier) {
  obj.identifier = obj.identifier[0].identifier;
}

// Remove combinedForm
obj.identifier.forEach(id => delete id.combinedForm);
```

### Fix #5: Resolve Blank Nodes
```javascript
// Don't export blank node string IDs
if (typeof value === 'string' && value.startsWith('b0_')) {
  // Either resolve to actual object or omit
  return undefined;
}
```

---

## 🔬 **VALIDATION TEST**

Here's what valid Milestone 1 JSON should look like:

```json
[
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
  },
  {
    "entityType": "Participant",
    "identifier": [
      {
        "identifierScope": "me-nexus",
        "identifierValue": "66e00c2e-ca9f-4be7-8249-cfbb1fb37933"
      }
    ],
    "ParticipantSC": {
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
        "@id": "me-nexus:d1864144-8dd0-4be5-917e-7831e7f1b18a"
      }
    },
    "participantFC": {
      "functionalType": "crew",
      "jobTitle": "director"
    }
  }
]
```

---

## 💡 **BOTTOM LINE**

**Your JSON transformation layer has NOT fixed the RDF issues.**

The problems from RDF have been carried over to JSON:
1. ❌ Location reference is still a string (CRITICAL)
2. ❌ Property names don't match official schema
3. ❌ Empty blank nodes exported as string IDs
4. ❌ Extra unnecessary fields in nested objects
5. ❌ Double-nested identifier structures

**You need to:**
1. Fix the RDF first (location reference bug, empty blank nodes)
2. Build a proper property mapping layer
3. Handle object references correctly
4. Clean up the JSON serialization logic

**Current Score: 4/10** - Structure exists but critical compatibility issues remain.
