# ME-DMZ Ontology Builder

## Milestones

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