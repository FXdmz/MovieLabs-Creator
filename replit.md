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

### Components
- `client/src/components/task-form.tsx` - Task entity form
- `client/src/components/task-classifier.tsx` - ME-NEXUS classification
- `client/src/components/asset-wizard/` - Asset import wizard
- `client/src/components/visualize-entity-dialog.tsx` - Graph visualization
- `client/src/components/import-multi-dialog.tsx` - Project import dialog

### Pages
- `client/src/pages/intro.tsx` - Landing/home page
- `client/src/pages/dashboard.tsx` - Main builder interface

## Development Milestones

### December 12, 2025
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
