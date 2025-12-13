# Complete RDF ↔ JSON Property Mapping Table

## Quick Reference for Implementation

---

## 🗺️ **PROPERTY NAME MAPPINGS**

### Address Properties

| Your RDF/Current JSON | Official OMC JSON | Required? |
|----------------------|-------------------|-----------|
| `streetNumberAndName` | `street` | No |
| `city` | `locality` | No |
| `region` | `region` | ✅ Same |
| `postalCode` | `postalCode` | ✅ Same |
| `country` | `country` | ✅ Same |

### Coordinates Properties

| Your RDF/Current JSON | Official OMC JSON | Required? |
|----------------------|-------------------|-----------|
| `geo` | `coordinates` | Yes - parent object name |
| `latitude` | `latitude` | ✅ Same |
| `longitude` | `longitude` | ✅ Same |

### Person Name Properties

| Your RDF/Current JSON | Official OMC JSON | Required? |
|----------------------|-------------------|-----------|
| `firstName` | `givenName` | Yes |
| `lastName` | `familyName` | Yes |
| `fullName` | `fullName` | ✅ Same |
| `middleName` | `additionalName` | Yes |

### CreativeWork Title Properties

| Your RDF/Current JSON | Official OMC JSON | Required? |
|----------------------|-------------------|-----------|
| `creativeWorkTitle` | `title` | Yes - parent array name |
| `titleName` | `titleText` | Yes |
| `titleType` | `titleType` | ✅ Same |
| `titleLanguage` | `language` | Yes |

### Structural Characteristic Names

| Your RDF Property | Official OMC JSON | Notes |
|------------------|-------------------|-------|
| `hasParticipantStructuralCharacteristic` | `ParticipantSC` | ✅ You already have this correct |
| `hasParticipantFunctionalCharacteristic` | `participantFC` | ✅ You already have this correct |
| `hasAssetStructuralCharacteristic` | `AssetSC` | ✅ You already have this correct |
| `hasAssetFunctionalCharacteristic` | `assetFC` | ✅ You already have this correct |
| `hasInfrastructureStructuralCharacteristic` | `InfrastructureSC` | ✅ You already have this correct |

---

## 💻 **IMPLEMENTATION CODE**

### JavaScript/TypeScript

```javascript
/**
 * Complete property name mapping from RDF/internal to OMC JSON Schema
 */
const RDF_TO_JSON_PROPERTY_MAP = {
  // Address
  'streetNumberAndName': 'street',
  'city': 'locality',
  
  // Coordinates (parent object)
  'geo': 'coordinates',
  
  // Person names
  'firstName': 'givenName',
  'lastName': 'familyName',
  'middleName': 'additionalName',
  
  // CreativeWork titles (parent array)
  'creativeWorkTitle': 'title',
  'titleName': 'titleText',
  'titleLanguage': 'language',
  
  // Structural characteristics (already correct, but included for completeness)
  'hasParticipantStructuralCharacteristic': 'ParticipantSC',
  'hasParticipantFunctionalCharacteristic': 'participantFC',
  'hasAssetStructuralCharacteristic': 'AssetSC',
  'hasAssetFunctionalCharacteristic': 'assetFC',
  'hasInfrastructureStructuralCharacteristic': 'InfrastructureSC',
};

/**
 * Map property name from RDF to JSON
 * @param {string} rdfProperty - Property name from RDF
 * @returns {string} - Official OMC JSON property name
 */
function mapPropertyName(rdfProperty) {
  return RDF_TO_JSON_PROPERTY_MAP[rdfProperty] || rdfProperty;
}

/**
 * Transform entire object's property names
 * @param {object} obj - Object to transform
 * @returns {object} - Object with mapped property names
 */
function transformPropertyNames(obj) {
  if (Array.isArray(obj)) {
    return obj.map(item => transformPropertyNames(item));
  }
  
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }
  
  const transformed = {};
  for (const [key, value] of Object.entries(obj)) {
    const mappedKey = mapPropertyName(key);
    transformed[mappedKey] = transformPropertyNames(value);
  }
  
  return transformed;
}
```

---

## 🎯 **SPECIAL CASES**

### 1. Object References (Location, etc.)

**Current (Wrong):**
```json
"Location": "me-nexus:d1864144-8dd0-4be5-917e-7831e7f1b18a"
```

**Required (Correct):**
```json
"Location": {
  "@id": "me-nexus:d1864144-8dd0-4be5-917e-7831e7f1b18a"
}
```

### 2. Nested Object Metadata

**Rule:** Only root entities should have `entityType` and `schemaVersion`.

**Remove from:**
- `address` object
- `coordinates` object  
- `personName` object
- `fileDetails` object
- Any other nested utility objects

**Keep on:**
- CreativeWork (root)
- Participant (root)
- Person (as ParticipantSC - this is a root-level structural characteristic)
- Location (root)
- Asset (root)
- Infrastructure (root)

### 3. Identifier Structure

**Current (Wrong - Double Nested):**
```json
"identifier": [
  {
    "identifier": [
      {
        "identifierScope": "me-nexus",
        "identifierValue": "uuid"
      }
    ]
  }
]
```

**Required (Correct):**
```json
"identifier": [
  {
    "identifierScope": "me-nexus",
    "identifierValue": "uuid"
  }
]
```

---

## ✅ **VALIDATION CHECKLIST**

After applying all mappings, verify:

1. No wrong property names (streetNumberAndName, city, firstName, lastName, geo, creativeWorkTitle, titleName, titleLanguage)
2. No string references for Location objects
3. No blank node IDs (b0_...)
4. No double-nested identifiers
