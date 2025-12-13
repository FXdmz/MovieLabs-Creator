# Refactoring & Optimization Opportunities

**Based on:** CODEBASE_OVERVIEW.md analysis  
**Date:** December 13, 2024  
**Current State:** Milestone 1 Complete, Production Ready

-----

## 🎯 **HIGH IMPACT, LOW EFFORT**

### 1. Consolidate RDF Serializers ⭐⭐⭐

**Current Problem:**

- Two separate RDF serialization paths
- `lib/export/rdf/serializer.ts` (legacy, string building)
- `lib/rdf/serializer.ts` (modern, N3.js)
- Duplication of logic, potential inconsistencies

**Solution:**

```typescript
// Delete: client/src/lib/export/rdf/serializer.ts
// Keep: client/src/lib/rdf/serializer.ts (N3.js-based)

// Update all references:
import { entitiesToTurtle } from '@/lib/export/rdf/serializer';
// Change to:
import { entitiesToTurtleViaRdf } from '@/lib/rdf/serializer';
```

**Benefits:**

- ✅ Single source of truth
- ✅ Easier maintenance
- ✅ Better tested (N3.js is industry standard)
- ✅ Cleaner codebase

**Effort:** 2-3 hours  
**Impact:** High (reduces technical debt by ~500 lines)  
**Risk:** Low (tests will catch issues)

-----

### 2. Extract Magic Strings to Constants ⭐⭐

**Current Problem:**

```typescript
// Scattered throughout code:
if (entityType === 'Participant') { ... }
if (propertyType === 'person') { ... }
'https://movielabs.com/omc/rdf/schema/v2.8#'
```

**Solution:**

```typescript
// client/src/lib/constants.ts

export const OMC_SCHEMA_VERSION = '2.8';
export const OMC_NAMESPACE = `https://movielabs.com/omc/rdf/schema/v${OMC_SCHEMA_VERSION}#`;

export const ENTITY_TYPE_VALUES = {
  PARTICIPANT: 'Participant',
  LOCATION: 'Location',
  CREATIVE_WORK: 'CreativeWork',
  // ...
} as const;

export const STRUCTURAL_TYPES = {
  PERSON: 'person',
  ORGANIZATION: 'organization',
  // ...
} as const;
```

**Benefits:**

- ✅ Type safety
- ✅ Autocomplete in IDE
- ✅ Single place to update
- ✅ No typos

**Effort:** 1-2 hours  
**Impact:** Medium (prevents future bugs)  
**Risk:** Very Low

-----

### 3. Add JSDoc Comments to Complex Functions ⭐⭐

**Current Problem:**

```typescript
// No documentation
export function entitiesToJson(
  entities: Entity[], 
  options?: ExportOptions
): string {
  // 100+ lines of complex logic
}
```

**Solution:**

```typescript
/**
 * Converts OMC entities to JSON format compliant with MovieLabs v2.8 schema
 * 
 * @param entities - Array of OMC entities to export
 * @param options - Export configuration
 * @param options.pretty - Format JSON with indentation (default: true)
 * @param options.validate - Validate against JSON schema (default: false)
 * 
 * @returns JSON string ready for download or API consumption
 * 
 * @example
 * ```typescript
 * const json = entitiesToJson(
 *   [participant, location],
 *   { pretty: true, validate: true }
 * );
 * ```
 * 
 * @throws {ValidationError} If validation enabled and entities invalid
 */
export function entitiesToJson(
  entities: Entity[], 
  options?: ExportOptions
): string {
  // Implementation...
}
```

**Target Files:**

- `lib/export/index.ts`
- `lib/rdf/serializer.ts`
- `lib/rdf/adapters/*.ts`
- `lib/store.ts` (complex functions)

**Effort:** 2-3 hours  
**Impact:** High (developer onboarding)  
**Risk:** None

-----

## 🔧 **MEDIUM IMPACT, MEDIUM EFFORT**

### 4. Implement Comprehensive Error Handling ⭐⭐⭐

**Current Problem:**

```typescript
// Silent failures in some paths
export function exportEntities(entities: Entity[], options: ExportOptions) {
  // What if N3.js throws?
  // What if property mapping fails?
  // What if JSON.stringify fails on circular refs?
}
```

**Solution:**

```typescript
export class ExportError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ExportError';
  }
}

export function exportEntities(
  entities: Entity[], 
  options: ExportOptions
): Result<string, ExportError> {
  try {
    if (options.format === 'json') {
      return ok(entitiesToJson(entities, options));
    } else {
      return ok(entitiesToTurtle(entities, options));
    }
  } catch (error) {
    return err(new ExportError(
      'Export failed',
      'EXPORT_FAILED',
      { originalError: error, entities, options }
    ));
  }
}
```

**Benefits:**

- ✅ Better user feedback
- ✅ Easier debugging
- ✅ Error tracking
- ✅ Graceful degradation

**Effort:** 4-6 hours  
**Impact:** High (production reliability)  
**Risk:** Low

-----

### 5. Split Large Files ⭐⭐

**Current Problem:**

- `client/src/lib/store.ts` - **500+ lines**
- `client/src/lib/export/rdf/serializer.ts` - **300+ lines**
- Hard to navigate, test, maintain

**Solution:**

```
client/src/lib/store/
├── index.ts              # Main store export
├── actions.ts            # Add/update/delete actions
├── export-actions.ts     # Export-related actions
├── undo-redo.ts          # History management
├── selectors.ts          # Derived state
└── types.ts              # Store types
```

**Benefits:**

- ✅ Easier to navigate
- ✅ Faster file search
- ✅ Better separation of concerns
- ✅ Easier testing

**Effort:** 3-4 hours  
**Impact:** Medium (developer experience)  
**Risk:** Low (mechanical refactor)

-----

### 6. Add Integration Tests ⭐⭐⭐

**Current State:**

- 23 unit tests (excellent!)
- No integration tests

**Add:**

```typescript
// client/src/lib/__tests__/integration/export-roundtrip.spec.ts

describe('Export Round-trip Integration', () => {
  it('should preserve all data: DB → RDF → JSON → RDF', async () => {
    // Create entities
    const original = createTestEntities();
    
    // Export to RDF
    const rdf = exportEntities(original, { format: 'ttl' });
    
    // Parse RDF back
    const parsedFromRdf = await importTurtle(rdf);
    
    // Export to JSON
    const json = exportEntities(parsedFromRdf, { format: 'json' });
    
    // Parse JSON back
    const parsedFromJson = JSON.parse(json);
    
    // Should match original
    expect(parsedFromJson).toEqual(original);
  });
});
```

**Test Scenarios:**

1. Entity creation → Export → Import → Verify
1. Complex relationships → Export → Parse → Verify connections
1. Large datasets (100+ entities) → Performance
1. Invalid data → Error handling

**Effort:** 6-8 hours  
**Impact:** High (catch regressions)  
**Risk:** None

-----

## 🚀 **HIGH IMPACT, HIGH EFFORT**

### 7. Database Persistence for Entities ⭐⭐⭐

**Current State:**

- Entities stored in Zustand (client-side memory)
- Lost on page refresh
- Not multi-user friendly

**Solution:**

```typescript
// shared/schema.ts - Add entity tables

export const entities = pgTable("entities", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  type: varchar("type").notNull(), // 'Participant', 'Location', etc.
  data: jsonb("data").notNull(),   // Full entity JSON
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const entityRelationships = pgTable("entity_relationships", {
  id: varchar("id").primaryKey(),
  sourceId: varchar("source_id").references(() => entities.id),
  targetId: varchar("target_id").references(() => entities.id),
  relationshipType: varchar("type").notNull(), // 'hasLocation', etc.
});
```

**Benefits:**

- ✅ Persistent data
- ✅ Multi-user support
- ✅ Backup/restore
- ✅ Collaboration features possible
- ✅ Audit trail

**Effort:** 16-20 hours  
**Impact:** Very High (production feature)  
**Risk:** Medium (schema design crucial)

-----

### 8. Implement Change Detection & Dirty Tracking ⭐⭐

**Use Case:**
User edits entity → wants to export → should warn if unsaved changes

**Solution:**

```typescript
// client/src/lib/store.ts

interface OntologyStore {
  entities: Entity[];
  dirtyEntityIds: Set<string>;  // NEW
  lastSaved: Record<string, Entity>;  // NEW
  
  markDirty: (entityId: string) => void;
  markClean: (entityId: string) => void;
  isDirty: (entityId: string) => boolean;
  getUnsavedChanges: () => Entity[];
}

// Hook into update actions
updateEntity: (id: string, updates: Partial<Entity>) => {
  set(state => {
    const entity = state.entities.find(e => e.id === id);
    if (entity) {
      Object.assign(entity, updates);
      state.dirtyEntityIds.add(id);  // Mark dirty
    }
  });
}
```

**Benefits:**

- ✅ Prevent data loss
- ✅ User confidence
- ✅ Better UX
- ✅ Foundation for auto-save

**Effort:** 4-6 hours  
**Impact:** High (UX improvement)  
**Risk:** Low

-----

### 9. Optimize Bundle Size ⭐⭐

**Current Bundle Analysis Needed:**

```bash
npm install -D rollup-plugin-visualizer
npm run build
# Check dist/stats.html
```

**Likely Large Dependencies:**

- `monaco-editor` (code editor - ~4MB)
- `cytoscape` (graph viz - ~1MB)
- `n3` (RDF - ~500KB)

**Optimization Strategies:**

1. **Lazy load Monaco:**

```typescript
// Before:
import Editor from '@monaco-editor/react';

// After:
const Editor = lazy(() => import('@monaco-editor/react'));
```

1. **Lazy load Cytoscape:**

```typescript
const CytoscapeGraph = lazy(() => 
  import('./components/visualize-entity-dialog')
);
```

1. **Tree-shake N3:**

```typescript
// Only import what you need
import { Writer, Parser } from 'n3';
// Not:
import * as N3 from 'n3';
```

**Effort:** 4-6 hours  
**Impact:** Medium (faster loads)  
**Risk:** Low

-----

## 📊 **PERFORMANCE OPTIMIZATIONS**

### 10. Memoize Expensive Computations ⭐⭐

**Current:**

```typescript
// Recalculates on every render
function EntityList() {
  const entities = useOntologyStore(state => state.entities);
  const sorted = entities.sort((a, b) => 
    a.name.localeCompare(b.name)
  );  // EXPENSIVE on large datasets
  // ...
}
```

**Optimized:**

```typescript
// client/src/lib/store.ts
interface OntologyStore {
  entities: Entity[];
  
  // Memoized selectors
  getSortedEntities: () => Entity[];
  getEntitiesByType: (type: EntityType) => Entity[];
  getEntityGraph: () => Graph;
}

// Implementation with immer
getSortedEntities: () => {
  const { entities } = get();
  return [...entities].sort((a, b) => 
    a.name.localeCompare(b.name)
  );
}
```

**Use Zustand Selectors:**

```typescript
// Component
const sortedEntities = useOntologyStore(
  state => state.getSortedEntities(),
  shallow  // Only re-render if result changes
);
```

**Effort:** 2-3 hours  
**Impact:** Medium (faster UI)  
**Risk:** Low

-----

### 11. Virtualize Large Lists ⭐⭐

**For datasets with 100+ entities:**

```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

function EntityList() {
  const entities = useOntologyStore(state => state.entities);
  const parentRef = useRef<HTMLDivElement>(null);
  
  const virtualizer = useVirtualizer({
    count: entities.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
  });
  
  return (
    <div ref={parentRef} style={{ height: '400px', overflow: 'auto' }}>
      <div style={{ height: `${virtualizer.getTotalSize()}px` }}>
        {virtualizer.getVirtualItems().map(virtualItem => (
          <EntityRow
            key={entities[virtualItem.index].id}
            entity={entities[virtualItem.index]}
          />
        ))}
      </div>
    </div>
  );
}
```

**Effort:** 3-4 hours  
**Impact:** High (for large datasets)  
**Risk:** Low
