# MovieLabs Creator - Quick Navigation Guide

**Purpose:** Find any functionality in the codebase in under 30 seconds

-----

## 🎯 **I NEED TO…**

### Export / Serialization

**"Fix how TTL/RDF is generated"**
→ `client/src/lib/export/rdf/serializer.ts` (legacy path)
→ `client/src/lib/rdf/serializer.ts` (N3.js path - recommended)

**"Fix how JSON is exported"**
→ `client/src/lib/export/property-mapping.ts` (property name transforms)
→ `client/src/lib/export/index.ts` (orchestration)

**"Add a new property mapping"**
→ `client/src/lib/export/property-mapping.ts` line 14-30

```typescript
const RDF_TO_JSON_PROPERTY_MAP = {
  'yourRdfProperty': 'jsonProperty',  // Add here
};
```

**"Change how entities are converted to RDF"**
→ `client/src/lib/rdf/adapters/` (per-entity type)

- `asset.ts` - Asset entities
- `participant.ts` - Participant entities
- `location.ts` - Location entities
- `creative-work.ts` - CreativeWork entities
- etc.

-----

### Entity Management

**"Add a new entity type"**

1. `shared/schema.ts` - Add to database schema
1. `client/src/lib/constants.ts` - Add to ENTITY_TYPES
1. `client/src/lib/rdf/adapters/` - Create new adapter file
1. `client/src/lib/rdf/adapters/index.ts` - Export new adapter
1. `client/src/lib/rdf/registry.ts` - Register property mappings

**"Change entity form fields"**
→ `client/src/components/dynamic-form.tsx` (form renderer)
→ `client/src/lib/property-definitions.ts` (field metadata)

**"Modify entity state management"**
→ `client/src/lib/store.ts` (Zustand store - 500+ lines)

-----

### Validation & Testing

**"Add new validation tests"**
→ `client/src/lib/rdf/rdf-roundtrip.spec.ts`

**"Add test fixtures"**
→ `client/src/lib/rdf/__fixtures__/entities.ts`

**"Run tests"**

```bash
npx vitest run
npx vitest run --watch
npx vitest run --coverage
```

-----

### UI Components

**"Modify the main dashboard"**
→ `client/src/pages/dashboard.tsx`

**"Change entity dialog/preview"**
→ `client/src/components/view-entity-dialog.tsx` (single entity)
→ `client/src/components/view-all-omc-dialog.tsx` (all entities)

**"Fix graph visualization"**
→ `client/src/components/visualize-entity-dialog.tsx` (Cytoscape.js)

**"Update import wizard"**
→ `client/src/components/asset-wizard/` (multi-step wizard)

**"Add UI component"**
→ `client/src/components/ui/` (shadcn/ui components)

-----

### API / Backend

**"Add new API endpoint"**
→ `server/routes.ts` (Express routes)

**"Modify database schema"**
→ `shared/schema.ts` (Drizzle schema)
→ Run: `npm run db:push`

**"Change server configuration"**
→ `server/index.ts` (entry point)

-----

### Configuration

**"Change build settings"**
→ `vite.config.ts` (Vite configuration)
→ `tsconfig.json` (TypeScript config)

**"Update dependencies"**
→ `package.json`

**"Modify Tailwind CSS"**
→ `client/src/index.css` (Tailwind imports)

-----

## 📁 **CRITICAL FILE LOCATIONS**

### The Big 5 (Most Modified)

1. **client/src/lib/export/rdf/serializer.ts**
- RDF/TTL string generation
- Entity reference handling
- Line 565-574: Location reference fix
1. **client/src/lib/export/property-mapping.ts**
- JSON property name transforms
- RDF ↔ JSON mapping table
- Line 19: givenName/familyName mapping
1. **client/src/lib/rdf/adapters/rdf-to-json.ts**
- RDF Store → JSON conversion
- Entity type inference
- Lines 268-278: Type inference
- Lines 288-289: Property mappings
1. **client/src/lib/store.ts**
- Global entity state
- Undo/redo logic
- Export orchestration
- 500+ lines - be careful!
1. **client/src/lib/rdf/serializer.ts**
- N3.js RDF Store wrapper
- Recommended for new RDF work
- Cleaner than legacy serializer

-----

## 🗺️ **DATA FLOW MAPS**

### Export Flow (Database → File)

```
User clicks "Download TTL"
  ↓
client/src/components/view-all-omc-dialog.tsx
  ↓
useOntologyStore().exportAs('ttl')
  ↓
client/src/lib/store.ts → exportAs()
  ↓
client/src/lib/export/index.ts → exportEntities()
  ↓
[FORK: useRdfStore?]
  ↓ YES                           ↓ NO
  ↓                                ↓
lib/rdf/serializer.ts         lib/export/rdf/serializer.ts
(N3.js - recommended)         (legacy string builder)
  ↓                                ↓
[MERGE]
  ↓
Download .ttl file
```

### Property Mapping Flow (RDF → JSON)

```
RDF Property Name (e.g., "firstName")
  ↓
lib/export/property-mapping.ts
  → RDF_TO_JSON_PROPERTY_MAP lookup
  ↓
JSON Property Name (e.g., "givenName")
  ↓
lib/export/index.ts
  → entitiesToJson()
  ↓
Final JSON output
```

### Entity Adapter Flow (Entity → RDF)

```
Entity Object (e.g., Participant)
  ↓
lib/rdf/adapters/participant.ts
  → toRdf() method
  ↓
lib/rdf/store.ts (OmcRdfStore)
  → addQuad() calls
  ↓
N3.js Store (in-memory triples)
  ↓
lib/rdf/serializer.ts
  → writeQuads()
  ↓
TTL string output
```

-----

## 🔍 **SEARCH PATTERNS**

### Find Where Property Names Are Defined

```bash
grep -r "firstName" client/src/lib/
grep -r "givenName" client/src/lib/
```

### Find Where Entity Types Are Registered

```bash
grep -r "ENTITY_TYPES" client/src/lib/
```

### Find All RDF Namespace Definitions

```bash
grep -r "omc:" client/src/lib/rdf/
cat client/src/lib/rdf/namespaces.ts
```

### Find Test Files

```bash
find client/src -name "*.spec.ts"
find client/src -name "*.test.ts"
```

-----

## 🎨 **COMMON PATTERNS**

### Adding a New Entity Type

**Files to Touch (in order):**

1. `shared/schema.ts` - Database table (if persisting)
1. `client/src/lib/constants.ts` - Add to ENTITY_TYPES enum
1. `client/src/lib/rdf/adapters/my-entity.ts` - Create adapter
1. `client/src/lib/rdf/adapters/index.ts` - Export adapter
1. `client/src/lib/rdf/registry.ts` - Register properties
1. `client/src/lib/property-definitions.ts` - Define form fields
1. `client/src/lib/rdf/__fixtures__/entities.ts` - Add test fixture
1. `client/src/lib/rdf/rdf-roundtrip.spec.ts` - Add tests

**Template:**

```typescript
// my-entity.ts
import { OmcRdfStore } from '../store';
import { omc } from '../namespaces';

export class MyEntityAdapter {
  static toRdf(entity: MyEntity, store: OmcRdfStore) {
    const uri = store.createUri(entity.id);
    store.addQuad(uri, 'rdf:type', 'omc:MyEntity');
    // Add properties...
  }
  
  static fromRdf(subject: string, store: OmcRdfStore): MyEntity {
    // Extract properties...
    return entity;
  }
}
```

-----

### Adding a Property Mapping

**File:** `client/src/lib/export/property-mapping.ts`

```typescript
// Line ~19
const RDF_TO_JSON_PROPERTY_MAP = {
  // Existing mappings...
  'myRdfProperty': 'myJsonProperty',  // Add here
};
```

**Also update reverse map if needed:**

```typescript
const JSON_TO_RDF_PROPERTY_MAP = Object.entries(RDF_TO_JSON_PROPERTY_MAP)
  .reduce((acc, [k, v]) => ({ ...acc, [v]: k }), {});
```

-----

### Modifying RDF Serialization

**Legacy Path** (string building):
→ `client/src/lib/export/rdf/serializer.ts`

**Modern Path** (N3.js - recommended):
→ `client/src/lib/rdf/serializer.ts`

**When to use which:**

- New features → Use N3.js path
- Bug fixes → Fix in both (for now)
- Long term → Migrate everything to N3.js

-----

## 🚨 **DANGER ZONES** (Modify With Care)

### 1. client/src/lib/store.ts

- **500+ lines**
- **Global state management**
- **Many dependent components**
- **Test thoroughly after changes**

### 2. client/src/lib/export/rdf/serializer.ts

- **Legacy code path**
- **Complex string building**
- **Prefer N3.js path for new work**

### 3. shared/schema.ts

- **Database schema**
- **Migration required after changes**
- **Run `npm run db:push`**

### 4. client/src/lib/rdf/namespaces.ts

- **Core RDF definitions**
- **Breaking changes affect everything**

-----

## ⚡ **QUICK WINS** (Easy Improvements)

### 1. Remove Legacy Serializer

**Effort:** Medium  
**Impact:** High (code cleanup)  
**Files:** `client/src/lib/export/rdf/serializer.ts` (delete)  
**Benefit:** Single source of truth for RDF generation

### 2. Extract Constants

**Effort:** Low  
**Impact:** Medium (maintainability)  
**Pattern:** Move magic strings to `constants.ts`

### 3. Add More Tests

**Effort:** Low  
**Impact:** High (reliability)  
**File:** `client/src/lib/rdf/rdf-roundtrip.spec.ts`

### 4. Document Complex Functions

**Effort:** Low  
**Impact:** Medium (onboarding)  
**Target:** Functions >50 lines

-----

## 📚 **REFERENCE DOCUMENTATION**

### OMC Schema

- **Location:** `client/public/schema.json`
- **Version:** 2.8
- **Official:** https://movielabs.com/omc/json/schema/v2.8

### RDF Prefixes

- **Location:** `client/src/lib/export/rdf/prefixes.ts`
- **Namespaces:** `client/src/lib/rdf/namespaces.ts`

### Entity Type Definitions

- **Location:** `client/src/lib/constants.ts`
- **Line:** ~5-20

-----

## 🔧 **DEBUGGING CHECKLIST**

### "My exports are wrong"

1. Check property mapping: `property-mapping.ts`
1. Check adapter: `lib/rdf/adapters/[entity-type].ts`
1. Check serializer: `lib/rdf/serializer.ts`
1. Check registry: `lib/rdf/registry.ts`
1. Run tests: `npx vitest run`

### "Graph traversal broken"

1. Check string literals: Search for `"me-nexus:` in serializer
1. Should be: `me:uuid` (no quotes)
1. Check line: `serializer.ts:565-574`

### "JSON validation fails"

1. Check property names in `property-mapping.ts`
1. Verify against: `client/public/schema.json`
1. Run AJV validation in tests

-----

## 💡 **PRO TIPS**

1. **Always use TypeScript** - Type safety catches 80% of bugs
1. **Test fixtures exist** - Use `__fixtures__/entities.ts` for testing
1. **Two RDF paths** - Prefer N3.js (`lib/rdf/`) over legacy (`lib/export/rdf/`)
1. **Property mappings are bidirectional** - RDF↔JSON both directions
1. **State is in Zustand** - Not database (except users table)

-----

**This guide is your map. Save it. Reference it. Update it when the codebase changes.**
