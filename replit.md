# ME-DMZ Ontology Builder

## Overview

ME-DMZ Ontology Builder is a web application for creating and exporting MovieLabs Ontology for Media Creation (OMC) compliant documents in both JSON and RDF/TTL (Turtle) formats. The application provides a visual form-based interface for building complex media production ontology entities and validates them against the official OMC-JSON Schema v2.8.

The tool is designed for media production professionals who need to create standardized metadata that follows the MovieLabs OMC specification, enabling interoperability across production workflows.

## Key Features

### Multi-Entity Project Management
- Create, edit, and manage multiple OMC entities in a single project
- Entity sidebar with filtering by type and quick navigation
- Bulk export all entities as JSON or RDF/TTL
- Project-level graph visualization showing all entities and their relationships

### Import Capabilities
- **Multi-Entity Project Import**: Import entire OMC projects from JSON or RDF/TTL files
  - Drag-and-drop file upload with preview before import
  - Supports both single-entity and multi-entity files
  - Duplicate ID handling (updates existing entities)
  - Round-trip support between JSON and TTL formats
- **Asset Import Wizard**: Multi-step wizard for importing assets from files
  - Auto-detection of structural types from MIME types
  - Functional classification with filtered options
  - Optional asset grouping for sequences (image sequences, rolls)
  - Generates OMC v2.8 schema-compliant Asset entities

### Export Capabilities
- **Dual Format Export**: JSON and RDF/TTL (Turtle) formats
- **Schema-Compliant JSON**: Validated against OMC-JSON Schema v2.8
- **RDF/TTL Export**: Uses ontology-backed mappings from official OMC ontology
  - Proper namespace prefixes (omc:, omcT:, me:, menexus:)
  - Entity types mapped to correct RDF classes
  - Relationships serialized with correct predicates
- **Export Package**: One-click export of complete project
  - Downloads JSON file with all entities
  - Downloads TTL (RDF) file with all entities
  - Auto-captures graph visualization as JPG screenshot
  - Single filename dialog for all three files

### Graph Visualization
- **Interactive Cytoscape.js Graph**: Visualize entity relationships
- **MovieLabs Visual Language Icons**: Custom SVG shapes for each entity type
  - Task: Document shape (green)
  - Asset: Rounded rectangle (orange)
  - Participant: Hexagon (dark blue)
  - Context: Circle (yellow)
  - Infrastructure: Stadium/pill shape (light blue)
  - CreativeWork: Abstract shape (purple)
  - Location: Map pin (red)
- **Multiple Layout Options**: Circle, hierarchical, force-directed, grid, concentric
- **Interactive Selection**: Click nodes/edges to view properties
- **Relationship Edges**: Visual connections between related entities

### Entity Type Support
- **Participants**: People, Organizations, Departments, Services
  - Structural class selector with context-aware form fields
  - Wikidata integration for person lookup
  - Location references with address autocomplete (Geoapify)
  - Contact information (email, phone)
- **Tasks**: Production workflow activities
  - ME-NEXUS hierarchical classification (L1 category, L2/L3 service)
  - Work assignments with participant references
  - Scheduling (start/end dates, actual vs scheduled)
  - Task state tracking (Assigned, In Process, Complete, etc.)
  - Input/output asset relationships
  - Creative Work linking with automatic Context management
  - Infrastructure references via Context
- **Assets**: Digital and physical media
  - Structural type selection with type-specific properties
  - Functional characteristics
  - File metadata extraction from uploaded files
- **Creative Works**: Films, shows, and productions
  - Wikidata integration for film/show lookup
  - Title information with language support
- **Infrastructure**: Technical resources
  - Software, hardware, services
  - Structural type and properties
- **Locations**: Physical and virtual places
  - Geoapify address autocomplete
  - Coordinates (lat/lon) support
- **Contexts**: Workflow groupings (auto-managed)
  - Production and narrative contexts
  - Automatically created when linking entities

### Form-Based Editing
- **Collapsible Sections**: Organized form layout with expandable sections
- **Real-Time Validation**: Inline validation errors against OMC schema
- **JSON Editor Mode**: Switch between form and raw JSON editing
- **Monaco Editor**: Syntax highlighting and code completion

### Search & Filter
- **Text Search**: Search entities by name in the sidebar
- **Type Filter**: Filter entities by type with dropdown showing counts
- **Clear Controls**: Clear search or all filters with single click
- **Result Count**: Shows filtered count when filters are active

### Undo/Redo
- **History Management**: Up to 50 undo/redo states
- **Keyboard Shortcuts**: Ctrl+Z (undo), Ctrl+Shift+Z or Ctrl+Y (redo)
- **Toolbar Buttons**: Undo/redo buttons in entity toolbar
- **Tracks All Changes**: Entity creation, updates, and deletion

### UI/UX Features
- **Dark Mode**: Full dark mode support with system preference detection
- **ME-DMZ Branding**: Custom color palette and icons
- **Responsive Design**: Works on desktop and tablet
- **Theme Persistence**: Remembers user preference

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
- **Graph Visualization**: Cytoscape.js with react-cytoscapejs

### Backend Architecture
- **Runtime**: Node.js with Express
- **Build Tool**: Vite for development, esbuild for production bundling
- **TypeScript**: Shared types between client and server via `shared/` directory

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Location**: `shared/schema.ts` defines database tables
- **Session Storage**: In-memory storage currently (`MemStorage` class)

### External Integrations
- **Geoapify**: Address autocomplete for Location entities (requires API key)
- **Wikidata**: Entity lookup for Participants and CreativeWorks (no API key required)

### Key NPM Packages
- **@tanstack/react-query**: Server state management
- **ajv / ajv-formats**: JSON Schema validation
- **drizzle-orm / drizzle-kit**: Database ORM and migrations
- **@monaco-editor/react**: In-browser code editing
- **cytoscape / react-cytoscapejs**: Graph visualization
- **n3**: RDF/TTL parsing and serialization
- **zod**: Runtime type validation
- **uuid**: Entity identifier generation

### External Schemas
- MovieLabs OMC-JSON Schema v2.8 (bundled in `client/public/schema.json`)
- MovieLabs OMC RDF/OWL Ontology v2.8 (attached_assets/omc_1765463407912.ttl)

## Key File Locations

### Import/Export
- `client/src/lib/import/` - JSON and TTL importers
- `client/src/lib/export/` - JSON and RDF export logic
- `client/src/lib/export/rdf/` - RDF serializer and prefixes

### RDF Domain Layer
- `client/src/lib/rdf/store.ts` - N3.js-based RDF store wrapper
- `client/src/lib/rdf/namespaces.ts` - OMC namespace definitions and predicates
- `client/src/lib/rdf/registry.ts` - JSON-to-RDF property mapping registry
- `client/src/lib/rdf/adapters/` - Entity type adapters (JSON↔RDF conversion)
- `client/src/lib/rdf/adapters/json-to-rdf.ts` - JSON→RDF converters
- `client/src/lib/rdf/adapters/rdf-to-json.ts` - RDF→JSON converters

### Components
- `client/src/components/task-form.tsx` - Task entity form
- `client/src/components/task-classifier.tsx` - ME-NEXUS classification
- `client/src/components/asset-wizard/` - Asset import wizard
- `client/src/components/visualize-entity-dialog.tsx` - Graph visualization
- `client/src/components/import-multi-dialog.tsx` - Project import dialog
- `client/src/components/view-all-omc-dialog.tsx` - Combined OMC output viewer

### Pages
- `client/src/pages/intro.tsx` - Landing/home page
- `client/src/pages/dashboard.tsx` - Main builder interface

## Development Milestones

### December 13, 2025
- Export Package feature
  - Single dialog to export JSON + TTL + graph screenshot
  - Auto-screenshot when graph visualization opens
  - Filename reused for all three files (project.json, project.ttl, project.jpg)
- JSON Export Schema Compliance Transforms
  - Property name mapping (RDF→JSON): streetNumberAndName→street, city→locality, firstName→givenName, lastName→familyName, geo→coordinates, creativeWorkTitle→title, titleName→titleText, titleLanguage→language
  - Object reference conversion: CURIE string refs (prefix:value) converted to {"@id": value} format
  - Identifier structure flattening: double-nested identifiers fixed, combinedForm field removed
  - Nested metadata cleanup: entityType/schemaVersion removed from nested objects
  - Blank node ID handling: b0_ prefixed IDs filtered out of exports
  - New file: `client/src/lib/export/property-mapping.ts`
- "View All OMC" button in sidebar
  - Opens popup dialog showing combined output of all entities
  - JSON tab with copy button
  - RDF/TTL tab with copy button
  - Entity count badge display
- Hybrid RDF architecture implementation
  - RDF domain layer with N3.js Store and OmcRdfStore wrapper
  - JSON-to-RDF and RDF-to-JSON bidirectional adapters
  - Property mapping registry for schema-to-predicate translation
  - Entity adapters for all OMC types (Asset, Task, Participant, etc.)
  - Round-trip parity between JSON and TTL import/export
- RDF-to-JSON adapter format fixes for workUnit, participantRef, Location refs
- Unit test suite for RDF/JSON round-trip verification
  - Vitest-based test framework with AJV schema validation
  - Test fixtures for all entity types (Asset, Task, Participant, etc.)
  - Round-trip tests: JSON → RDF → JSON parity verification
  - Tests located at `client/src/lib/rdf/rdf-roundtrip.spec.ts`
  - Run tests with: `npx vitest run`
  - All 23 tests passing (fixed adapter issues for all entity types)
- Fixed RDF adapter round-trip issues:
  - Participant Location string refs now handled correctly
  - Task workUnit.participantRef string format supported
  - CreativeWork title.titleValue preserved
  - Infrastructure description and structuralCharacteristics fixed
  - Location description, fullAddress, and lat/lon coordinates working
  - Context entity type mapping fixed (MediaCreationContextComponent → Context)

### December 12, 2025
- JSON import Task relationship transformation (workUnit, scheduling, state, assets)
- Undo/redo with keyboard shortcuts (Ctrl+Z, Ctrl+Shift+Z)
- Enhanced search & filter with type dropdown and clear controls
- Graph relationship edge visualization fix for imported entities
- MovieLabs visual language SVG icons in graph
- Creative Work field in Task form with automatic Context
- JSON export schema compliance transforms
- Task RDF/TTL export enhancements
- ME-NEXUS hierarchical Task classification
- Multi-entity project import (JSON and TTL)

### December 11, 2025
- Asset import wizard from files
- RDF/TTL dual export format
- ME-DMZ branding audit with extended palette
- Dark mode implementation
- Landing page design
