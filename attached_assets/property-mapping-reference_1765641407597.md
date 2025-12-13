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

// Usage:
const rdfJson = { /* your current JSON */ };
const omcCompliantJson = transformPropertyNames(rdfJson);
```

### Python

```python
"""
Complete property name mapping from RDF/internal to OMC JSON Schema
"""

RDF_TO_JSON_PROPERTY_MAP = {
    # Address
    'streetNumberAndName': 'street',
    'city': 'locality',
    
    # Coordinates (parent object)
    'geo': 'coordinates',
    
    # Person names
    'firstName': 'givenName',
    'lastName': 'familyName',
    'middleName': 'additionalName',
    
    # CreativeWork titles (parent array)
    'creativeWorkTitle': 'title',
    'titleName': 'titleText',
    'titleLanguage': 'language',
    
    # Structural characteristics
    'hasParticipantStructuralCharacteristic': 'ParticipantSC',
    'hasParticipantFunctionalCharacteristic': 'participantFC',
    'hasAssetStructuralCharacteristic': 'AssetSC',
    'hasAssetFunctionalCharacteristic': 'assetFC',
    'hasInfrastructureStructuralCharacteristic': 'InfrastructureSC',
}

def map_property_name(rdf_property: str) -> str:
    """
    Map property name from RDF to JSON
    
    Args:
        rdf_property: Property name from RDF
        
    Returns:
        Official OMC JSON property name
    """
    return RDF_TO_JSON_PROPERTY_MAP.get(rdf_property, rdf_property)

def transform_property_names(obj):
    """
    Transform entire object's property names recursively
    
    Args:
        obj: Object to transform (dict, list, or primitive)
        
    Returns:
        Object with mapped property names
    """
    if isinstance(obj, list):
        return [transform_property_names(item) for item in obj]
    
    if not isinstance(obj, dict):
        return obj
    
    transformed = {}
    for key, value in obj.items():
        mapped_key = map_property_name(key)
        transformed[mapped_key] = transform_property_names(value)
    
    return transformed

# Usage:
rdf_json = { }  # your current JSON
omc_compliant_json = transform_property_names(rdf_json)
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

**Code:**
```javascript
function handleReference(key, value) {
  const referenceProps = ['Location', 'CreativeWork', 'Participant', 'Asset'];
  
  if (referenceProps.includes(key) && typeof value === 'string') {
    return { '@id': value };
  }
  
  return value;
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

**Code:**
```javascript
function cleanNestedMetadata(obj, path = []) {
  const rootEntityTypes = [
    'CreativeWork', 'Participant', 'Person', 'Location', 
    'Asset', 'Infrastructure', 'AssetSC', 'InfrastructureSC'
  ];
  
  if (obj.entityType && !rootEntityTypes.includes(obj.entityType)) {
    delete obj.entityType;
    delete obj.schemaVersion;
  }
  
  // Recurse
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'object' && value !== null) {
      obj[key] = cleanNestedMetadata(value, [...path, key]);
    }
  }
  
  return obj;
}
```

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

**Code:**
```javascript
function fixIdentifiers(obj) {
  if (!Array.isArray(obj.identifier)) {
    return obj;
  }
  
  // Flatten double nesting
  if (obj.identifier[0]?.identifier) {
    obj.identifier = obj.identifier[0].identifier;
  }
  
  // Remove non-standard fields
  obj.identifier.forEach(id => {
    delete id.combinedForm;
  });
  
  return obj;
}
```

---

## ✅ **VALIDATION CHECKLIST**

After applying all mappings, verify:

```javascript
function validateOMCCompliance(json) {
  const issues = [];
  
  // Check 1: No wrong property names
  const wrongProps = [
    'streetNumberAndName', 'city', 'firstName', 'lastName',
    'geo', 'creativeWorkTitle', 'titleName', 'titleLanguage'
  ];
  
  JSON.stringify(json, (key, value) => {
    if (wrongProps.includes(key)) {
      issues.push(`Found unmapped property: ${key}`);
    }
    return value;
  });
  
  // Check 2: No string references for objects
  json.forEach(entity => {
    if (entity.ParticipantSC?.Location && typeof entity.ParticipantSC.Location === 'string') {
      issues.push('Location reference is string, should be object');
    }
  });
  
  // Check 3: No blank node IDs
  JSON.stringify(json, (key, value) => {
    if (typeof value === 'string' && value.startsWith('b0_')) {
      issues.push(`Found blank node ID: ${value}`);
    }
    return value;
  });
  
  // Check 4: No double-nested identifiers
  json.forEach(entity => {
    if (entity.identifier?.[0]?.identifier) {
      issues.push('Double-nested identifier found');
    }
  });
  
  return {
    valid: issues.length === 0,
    issues: issues
  };
}
```

---

## 📚 **QUICK LOOKUP BY ENTITY TYPE**

### Location Entity
```
address.streetNumberAndName → address.street
address.city → address.locality
geo → coordinates
```

### Person Entity (in ParticipantSC)
```
personName.firstName → personName.givenName
personName.lastName → personName.familyName
Location (string) → Location (object with @id)
```

### CreativeWork Entity
```
creativeWorkTitle → title
title[].titleName → title[].titleText
title[].titleLanguage → title[].language
```

### All Entities
```
identifier (remove combinedForm field)
identifier (flatten if double-nested)
```

---

## 🔧 **COMPLETE TRANSFORMATION PIPELINE**

```javascript
function transformToOMCCompliantJSON(rdfJson) {
  // Step 1: Map property names
  let transformed = transformPropertyNames(rdfJson);
  
  // Step 2: Handle object references
  transformed = transformed.map(entity => {
    if (entity.ParticipantSC?.Location) {
      entity.ParticipantSC.Location = handleReference('Location', entity.ParticipantSC.Location);
    }
    return entity;
  });
  
  // Step 3: Clean nested object metadata
  transformed = transformed.map(entity => cleanNestedMetadata(entity));
  
  // Step 4: Fix identifier structures
  transformed = transformed.map(entity => {
    entity = fixIdentifiers(entity);
    if (entity.ParticipantSC) {
      entity.ParticipantSC = fixIdentifiers(entity.ParticipantSC);
    }
    if (entity.AssetSC) {
      entity.AssetSC = fixIdentifiers(entity.AssetSC);
    }
    return entity;
  });
  
  // Step 5: Remove blank node references
  transformed = transformed.map(entity => {
    Object.keys(entity).forEach(key => {
      if (typeof entity[key] === 'string' && entity[key].startsWith('b0_')) {
        delete entity[key];
      }
    });
    return entity;
  });
  
  return transformed;
}
```

---

## 📖 **USAGE EXAMPLE**

```javascript
// Your current JSON export
const currentJson = [
  {
    "name": "minessotta",
    "address": {
      "streetNumberAndName": "2231 Rue Que Frenchman",
      "city": "Carlos",
      // ...
    },
    "geo": {
      "latitude": 45.93623278,
      // ...
    }
  }
];

// Transform to OMC-compliant JSON
const omcJson = transformToOMCCompliantJSON(currentJson);

// Result:
// [
//   {
//     "name": "minessotta",
//     "address": {
//       "street": "2231 Rue Que Frenchman",
//       "locality": "Carlos",
//       // ...
//     },
//     "coordinates": {
//       "latitude": 45.93623278,
//       // ...
//     }
//   }
// ]

// Validate
const validation = validateOMCCompliance(omcJson);
console.log(validation);
```

---

## 🎯 **IMPLEMENTATION PRIORITY**

1. **Highest:** Property name mapping (all the mappings in this doc)
2. **High:** Location object reference handling
3. **High:** Remove blank node ID strings
4. **Medium:** Fix identifier nesting
5. **Medium:** Clean nested metadata
6. **Low:** Remove combinedForm field

---

This mapping table is your complete reference for converting between your current RDF/JSON format and the official OMC JSON schema. Implement these transformations in your serialization layer.
