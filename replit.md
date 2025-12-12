# ME-DMZ Ontology Builder

## Milestones

### MovieLabs Visual Language Graph Icons (December 12, 2025)
- Graph visualization now uses custom SVG shapes matching MovieLabs visual language
- Task: Circle (green), Asset: Rounded rectangle (orange), Participant: Square (dark blue)
- Context: Hexagon (yellow), Infrastructure: Octagon (light blue), CreativeWork: Star (purple)
- Location: Triangle (red), Array/Collection: Diamond (gray)
- SVG shapes rendered via Cytoscape background-image with data URIs
- Legend updated with matching SVG icons for each entity type
- Detail panel shows SVG icon for known types, falls back to colored circle for others
- Component: client/src/components/visualize-entity-dialog.tsx

### Creative Work Field in Task Form (December 12, 2025)
- Added "Creative Work" collapsible section to Task form between Assignment and Scheduling
- Single-select dropdown to link a Task to a CreativeWork entity (film/project)
- Automatically creates/updates hidden Context entity with contributesTo.CreativeWork
- User never sees Context directly - it's managed automatically
- Clear button to remove Creative Work selection
- Component: client/src/components/task-form.tsx

### JSON Export Schema Compliance Transform (December 12, 2025)
- Added post-processing transform applied only to JSON export (RDF export unchanged)
- Task entities: state/stateDetails moved to customData (domain="me-nexus", namespace="workflow")
- Task entities: workUnit moved to customData (domain="me-nexus", namespace="work")
- Context entities: hasInputAssets replaced with uses.Asset array
- Context entities: scheduling moved to customData (domain="me-nexus", namespace="scheduling")
- customData uses array form with {domain, namespace, value} structure
- Merges into existing customData entries when domain/namespace matches
- Each Context transformed independently (no shared customData with parent Task)
- Export file: client/src/lib/export/index.ts

### Task RDF/TTL Export Enhancements (December 12, 2025)
- Enhanced Task-specific RDF serialization with proper OMC ontology patterns
- Task State: Exports omc:hasState with omc:State objects containing omc:hasStateDescriptor
- State descriptors map to canonical IRIs (omc:Assigned, omc:InProcess, etc.) with literal fallback
- Scheduling: Emits omc:hasScheduledStart/End, omc:hasActualStart/End datetimes on Task subject
- WorkUnit: Exported as omc:WorkUnit entities with proper identifier handling (blank nodes when no ID)
- WorkUnit participant relationship uses omcT: tentative namespace (omcT:aWorkUnitHas.Participant)
- Asset relationships: omc:uses for input assets, omc:hasProduct for output assets on Task subject
- Task relationships: omc:informs and omc:isInformedBy on Task subject
- Context: Typed as omc:MediaCreationContextComponent, preserves all nested fields (locations, participants, metadata)
- combinedFormToUri helper respects all identifier scopes (me-nexus: → me:, others → urn:scope:value)
- Added omcT: namespace prefix for tentative OMC v2.8 properties
- Serializer files: client/src/lib/export/rdf/serializer.ts, client/src/lib/export/rdf/prefixes.ts

### ME-NEXUS Hierarchical Task Classification (December 12, 2025)
- Implemented hierarchical classification system for Tasks using ME-NEXUS taxonomy
- L1 category maps to TaskSC structuralType (e.g., "Animation", "Production Services", "Compositing")
- L2/L3 service maps to taskFC functionalType (e.g., "3D Animation > Crowd Animation")
- Two-step cascading UI: select category first, then filtered service options
- TaskClassifier component with L1 dropdown (sorted by service count) and L2/L3 service tree
- L3 services display with tree indentation under their L2 parents
- Selected service shows description and OMC equivalent mapping
- Export transformation merges ME-NEXUS data into existing TaskSC/taskFC without overwriting
- JSON export outputs menexus: prefixed structuralType/functionalType values
- RDF export includes menexus namespace predicates (menexus:l1, menexus:l2, menexus:l3, etc.)
- Validation strips taskClassification field to prevent schema errors
- Component located in: client/src/components/task-classifier.tsx

### Multi-Entity Project Import (December 12, 2025)
- Import entire OMC projects with multiple entities from JSON or RDF/TTL files
- ImportMultiDialog component with drag-and-drop file upload
- Preview step shows all entities with type badges and counts before import
- Supports both single-entity and multi-entity files
- Duplicate ID handling: updates existing entities rather than creating duplicates
- JSON importer handles arrays and {entities: [...]} wrapper formats
- TTL importer extracts all root-level OMC entities and their nested structures
- Reverse mapping from RDF predicates to JSON keys for complete round-trip support
- Handles blank nodes and cross-entity references properly
- Import button in toolbar and on welcome screen
- Dialog component: client/src/components/import-multi-dialog.tsx
- Parser files: client/src/lib/import/

### Asset Import Wizard (December 11, 2025)
- Multi-step wizard for importing assets from files (Upload → Classify → Group → Review)
- Step 1: Drag-and-drop multi-file upload with auto-detection of structural types from MIME types
- Step 2: Functional classification with filtered options based on structural type, plus name and description
- Step 3: Optional asset grouping with isOrdered checkbox for sequences (e.g., image sequences, rolls)
- Step 4: Review summary showing all assets and groups to be created
- Comprehensive structural-to-functional type mapping for all OMC asset types
- Generates OMC v2.8 schema-compliant Asset entities with proper AssetSC and assetFC structures
- Asset groups include proper member references and functional characteristics
- Wizard components in: client/src/components/asset-wizard/

### RDF/TTL Export Feature (December 11, 2025)
- Added dual export capability: JSON and RDF/TTL (Turtle) formats
- Export dropdown menu in builder toolbar with format selection
- RDF serializer maps JSON entities to OMC 2.8 ontology predicates and classes
- Uses ontology-backed mappings from official omc_1765463407912.ttl schema file
- Key RDF predicates: omc:hasAssetStructuralCharacteristic, omc:hasAssetFunctionalCharacteristic, etc.
- Entity types mapped to correct classes: omc:Asset, omc:Participant, omc:Task, etc.
- SC/FC nodes typed as omc:AssetAsStructure, omc:AssetAsFunction, etc.
- URIs use me: prefix for me-nexus identifiers (https://me-nexus.com/id/)
- Deterministic blank node IDs using incrementing counter
- Export files located in: client/src/lib/export/

### Branding Audit Complete (December 11, 2025)
- Full FX-DMZ brand color audit with extended palette integration
- CSS variables updated with exact brand colors:
  - Primary: Light Blue #CEECF2, Dark Blue #232073
  - Accents: Green #3AA608, Orange #D97218, Yellow #F2C53D
  - Extended palette tints/shades for proper contrast
- Dark mode uses Dark Blue extended palette (#070617, #0E0D2E, etc.)
- Core Building Blocks cards use distinct accent colors per entity type
- CTA buttons use brand accent colors with proper contrast
- All icons have proper dark mode variants for accessibility

### Dark Mode Complete (December 11, 2025)
- Dark mode toggle added to header (intro page) and sidebar header (builder page)
- Full dark mode color scheme using CSS variables in index.css
- All UI elements properly styled for both light and dark modes
- Theme persists via next-themes with system preference support

### Landing Page Complete (December 11, 2025)
The intro/landing page at "/" is complete with:
- MovieLabs 2030 Vision branding and logo
- ME-DMZ branding with clickable logo linking to me-dmz.com
- "About the OMC Builder" content with engaging copy
- Three feature highlights: Schema Validated, Multiple Entity Types, Easy Export
- "What is the OMC?" educational section explaining the ontology
- Core Building Blocks cards for all 5 entity types (Participants, Tasks, Assets, Contexts, Infrastructure)
- Call-to-action section with quick-create buttons for each entity type
- ME-DMZ footer with tagline, copyright, and privacy policy link
- Help dialog accessible from header
- Consistent hover effects on all interactive elements
- Light blue (#CEECF2) accent color throughout

## Overview

ME-DMZ Ontology Builder is a web application for creating and exporting MovieLabs Ontology for Media Creation (OMC) compliant documents in both JSON and RDF/TTL (Turtle) formats. The application provides a visual form-based interface for building complex media production ontology entities (such as Creative Works, Assets, Characters, etc.) and validates them against the official OMC-JSON Schema v2.8.

The tool is designed for media production professionals who need to create standardized metadata that follows the MovieLabs OMC specification, enabling interoperability across production workflows.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: Zustand for global ontology entity state
- **Form Handling**: React Hook Form with Zod validation
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS v4 with custom theme variables
- **Code Editor**: Monaco Editor for JSON editing mode
- **Schema Validation**: AJV (Another JSON Validator) with format extensions

### Backend Architecture
- **Runtime**: Node.js with Express
- **Build Tool**: Vite for development, esbuild for production bundling
- **TypeScript**: Shared types between client and server via `shared/` directory

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Location**: `shared/schema.ts` defines database tables
- **Current Schema**: Basic users table (id, username, password)
- **Session Storage**: In-memory storage currently (`MemStorage` class)

### Key Design Decisions

**Dual Editor Mode**: Users can switch between a form-based UI and raw JSON editing. The form dynamically generates fields based on the selected entity type, while the JSON editor provides direct schema-validated editing.

**Schema-Driven Validation**: The OMC-JSON Schema v2.8 is bundled with the application and used for real-time validation via AJV. Validation errors are displayed inline.

**Entity Type System**: Supports 29+ OMC entity types (CreativeWork, Asset, Character, etc.) with type-specific field configurations and structural property mappings.

**Structural Properties Mapping**: Asset entities have structural type-dependent properties. The `structural-properties-map.ts` defines which properties are relevant for each asset structural class (digital, physical, geometry, etc.).

**File Import for Assets**: Users can drag-and-drop or browse for media files (video, audio, images, documents) to automatically create Asset entities. The system extracts metadata (file name, size, MIME type, dimensions, duration) and maps it to the appropriate AssetSC structural type and properties.

**Merged Asset/AssetSC Experience**: Asset entities now include an embedded AssetSC section with structural type dropdown and contextual structural properties, eliminating the need to create separate AssetSC entities.

**Merged Participant Experience**: Participant entities support four structural classes (Person, Organization, Department, Service) with a unified form experience. The structural class selector dynamically updates the form to show relevant properties for each type:
- **Person**: personName, jobTitle, gender, contact, Location
- **Organization**: organizationName, contact, Location
- **Department**: departmentName, contact, Location
- **Service**: serviceName, contact

Functional characteristics (participantFC) are contextually filtered based on the selected structural class, providing role options relevant to each participant type.

**Task Entity Support**: Task entities include TaskSC with proper baseEntity fields (entityType, schemaVersion, identifier) and structural type/properties for different task categories.

**Infrastructure Entity Support**: Infrastructure entities follow the same pattern with InfrastructureSC containing baseEntity fields and structural properties.

## External Dependencies

### Third-Party Services
- None currently configured

### Key NPM Packages
- **@tanstack/react-query**: Server state management
- **ajv / ajv-formats**: JSON Schema validation
- **drizzle-orm / drizzle-kit**: Database ORM and migrations
- **@monaco-editor/react**: In-browser code editing
- **zod**: Runtime type validation
- **uuid**: Entity identifier generation

### Database
- PostgreSQL (requires `DATABASE_URL` environment variable)
- Drizzle Kit for schema migrations (`npm run db:push`)

### External Schemas
- MovieLabs OMC-JSON Schema v2.8 (bundled in `client/public/schema.json`)
- MovieLabs OMC RDF/OWL Ontology v2.8 (attached_assets/omc_1765463407912.ttl) - used for RDF export predicate/class mappings