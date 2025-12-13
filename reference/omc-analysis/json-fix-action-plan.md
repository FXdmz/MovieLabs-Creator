# JSON Export Fix - Action Plan

## Current Status: **DOES NOT PASS** 

Your JSON transformation layer did NOT fix the RDF issues. Critical problems remain.

---

## 🔴 **THE BIG 3 BLOCKING ISSUES**

### 1. Location Reference is STILL a String

**Current (BROKEN):**
```json
"ParticipantSC": {
  "Location": "me-nexus:d1864144-8dd0-4be5-917e-7831e7f1b18a"  // STRING!
}
```

**Required:**
```json
"ParticipantSC": {
  "Location": {
    "@id": "me-nexus:d1864144-8dd0-4be5-917e-7831e7f1b18a"
  }
}
```

**Why this matters:** Can't establish relationships between entities with strings.

---

### 2. Empty Blank Nodes Export as Garbage

**Current (BROKEN):**
```json
"InfrastructureSC": {
  "structuralProperties": "b0_structuralProperties_8"  // Blank node ID as string!
}
```

**This is literally exporting the internal RDF blank node ID.**

**Root cause:** Your RDF TTL has these lines:
```turtle
_:structuralProperties_8
    # EMPTY - no actual properties!
```

The JSON serializer finds nothing to export, so it just dumps the blank node ID.

**Required:** Either populate the RDF blank nodes OR omit empty structures in JSON.

---

### 3. Property Names Don't Match Official Schema

**Most Critical Mismatches:**
- `streetNumberAndName` → must be `street`
- `city` → must be `locality`  
- `firstName` → must be `givenName`
- `lastName` → must be `familyName`
- `geo` → must be `coordinates`
- `creativeWorkTitle` → must be `title`
- `titleName` → must be `titleText`
- `titleLanguage` → must be `language`

---

## 🛠️ **FIX STRATEGY**

### Two-Part Approach:

**PART 1: Fix the RDF Source**
1. Fix location string literal bug (lines 65, 92 in TTL)
2. Either populate or remove empty blank nodes for Infrastructure

**PART 2: Fix the JSON Serializer**
1. Implement property name mapping
2. Handle object references properly (Location)
3. Remove unnecessary metadata from nested objects
4. Fix identifier structure
5. Don't export blank node IDs

---

## 📝 **STEP-BY-STEP FIX GUIDE**

### Step 1: Fix RDF (Priority 1)

**File: Avatar-unit.ttl**

**Change 1 - Lines 65 & 92:**
```turtle
# BEFORE:
omc:hasLocation "me-nexus:d1864144-8dd0-4be5-917e-7831e7f1b18a" .

# AFTER:
omc:hasLocation me:d1864144-8dd0-4be5-917e-7831e7f1b18a .
```

**Change 2 - Lines 116, 131:**
```turtle
# BEFORE (empty blank nodes):
_:structuralProperties_8

_:structuralProperties_9

# AFTER (populate with data):
_:structuralProperties_8
    rdf:type omc:StructuralPropertiesForTool ;
    omc:hasSoftwareType "3D Animation Software" ;
    omc:hasVendor "Autodesk" ;
    omc:hasProductName "Maya" ;
    omc:hasVersionNumber "2024" .

_:structuralProperties_9
    rdf:type omc:StructuralPropertiesForTool ;
    omc:hasSoftwareType "Screenwriting Software" ;
    omc:hasVendor "Final Draft, Inc." ;
    omc:hasProductName "Final Draft" ;
    omc:hasVersionNumber "13" .
```

### Step 2: Build Property Mapping (Priority 1)

**In your JSON serializer code:**

```javascript
// Property name mapping from RDF to official OMC JSON
const PROPERTY_MAP = {
  // Address properties
  'streetNumberAndName': 'street',
  'city': 'locality',
  
  // Person name properties
  'firstName': 'givenName',
  'lastName': 'familyName',
  
  // Location properties  
  'geo': 'coordinates',
  
  // CreativeWork properties
  'creativeWorkTitle': 'title',
  'titleName': 'titleText',
  'titleLanguage': 'language',
};

function mapPropertyName(prop) {
  return PROPERTY_MAP[prop] || prop;
}

// Apply to every property during serialization
for (let [key, value] of Object.entries(entity)) {
  const mappedKey = mapPropertyName(key);
  output[mappedKey] = value;
}
```

### Step 3: Fix Object References (Priority 1)

```javascript
function handleReference(property, value, context) {
  // Properties that should be object references
  const referenceProperties = ['Location', 'CreativeWork', 'Participant'];
  
  if (referenceProperties.includes(property)) {
    if (typeof value === 'string') {
      // Convert string reference to object
      return { '@id': value };
    }
  }
  
  return value;
}
```

### Step 4: Clean Nested Objects (Priority 2)

```javascript
function cleanNestedObject(obj, isRoot = true) {
  if (!isRoot) {
    // Remove metadata from nested utility objects
    delete obj.entityType;
    delete obj.schemaVersion;
  }
  
  // Recursively clean nested objects
  for (let [key, value] of Object.entries(obj)) {
    if (typeof value === 'object' && value !== null) {
      obj[key] = cleanNestedObject(value, false);
    }
  }
  
  return obj;
}
```

### Step 5: Fix Identifier Structure (Priority 2)

```javascript
function fixIdentifiers(obj) {
  if (Array.isArray(obj.identifier)) {
    // Remove double nesting
    if (obj.identifier[0]?.identifier) {
      obj.identifier = obj.identifier[0].identifier;
    }
    
    // Remove non-standard fields
    obj.identifier.forEach(id => {
      delete id.combinedForm;
    });
  }
  
  return obj;
}
```

### Step 6: Handle Blank Nodes (Priority 2)

```javascript
function shouldExport(value) {
  // Don't export blank node string IDs
  if (typeof value === 'string' && value.startsWith('b0_')) {
    return false;
  }
  
  // Don't export empty objects
  if (typeof value === 'object' && Object.keys(value).length === 0) {
    return false;
  }
  
  return true;
}
```

---

## ✅ **VALIDATION CHECKLIST**

After implementing fixes, verify:

```bash
# Run this checklist on your new JSON output:

□ Location references are objects with @id, not strings
□ No "b0_" blank node ID strings anywhere
□ Property names match official schema (street, locality, givenName, etc.)
□ No entityType/schemaVersion in nested objects (address, coordinates, personName)
□ Identifier arrays are single-level, not double-nested
□ No "combinedForm" field in identifiers
□ Infrastructure has actual structuralProperties objects, not string IDs
□ All coordinates are numbers, not strings
```

---

## 🧪 **TEST CASES**

### Test 1: Location Reference
```json
// ✅ PASS: Object reference
"Location": {
  "@id": "me-nexus:d1864144-8dd0-4be5-917e-7831e7f1b18a"
}

// ❌ FAIL: String reference
"Location": "me-nexus:d1864144-8dd0-4be5-917e-7831e7f1b18a"
```

### Test 2: Address Properties
```json
// ✅ PASS: Official schema names
"address": {
  "street": "2231 Rue Que Frenchman",
  "locality": "Carlos",
  "postalCode": "56308",
  "country": "US"
}

// ❌ FAIL: Custom names
"address": {
  "streetNumberAndName": "...",
  "city": "Carlos"
}
```

### Test 3: Person Name
```json
// ✅ PASS: Official schema names
"personName": {
  "fullName": "James Cameron",
  "givenName": "James",
  "familyName": "Cameron"
}

// ❌ FAIL: Custom names  
"personName": {
  "fullName": "James Cameron",
  "firstName": "James",
  "lastName": "Cameron"
}
```

### Test 4: No Blank Node Strings
```json
// ✅ PASS: Actual object
"structuralProperties": {
  "softwareType": "3D Animation Software",
  "vendor": "Autodesk"
}

// ❌ FAIL: Blank node ID
"structuralProperties": "b0_structuralProperties_8"
```
