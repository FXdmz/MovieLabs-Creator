# ME-DMZ OMC Builder

A web application for creating and exporting **MovieLabs Ontology for Media Creation (OMC)** compliant documents. Build standardized metadata for media production workflows with an intuitive form-based interface, real-time validation, and dual-format export capabilities.

![OMC Builder](https://img.shields.io/badge/OMC-v2.8-blue) ![License](https://img.shields.io/badge/license-MIT-green) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)

## Overview

The **ME-DMZ OMC Builder** empowers media production professionals to create industry-standard metadata that follows the MovieLabs OMC specification. Whether you're cataloging assets, defining production workflows, or mapping creative hierarchies, this tool provides schema-validated exports in both JSON and RDF/TTL formats.

### Key Capabilities

- **Multi-Entity Project Management** - Create, edit, and manage multiple OMC entities in a single project
- **Dual Format Export** - Export as JSON (OMC-JSON Schema v2.8) or RDF/TTL (Turtle) with proper ontology mappings
- **Project Import** - Import entire projects from JSON or TTL files with round-trip support
- **Graph Visualization** - Interactive Cytoscape.js graph with MovieLabs visual language icons
- **Real-Time Validation** - Inline validation against the official OMC-JSON Schema v2.8
- **Dark Mode** - Full dark mode support with system preference detection

## Features

### Entity Types Supported

| Entity | Description | Special Features |
|--------|-------------|------------------|
| **Creative Works** | Films, shows, productions | Wikidata integration for lookup |
| **Participants** | People, organizations, departments, services | Location references, contact info |
| **Tasks** | Production workflow activities | ME-NEXUS hierarchical classification |
| **Assets** | Digital and physical media | File import wizard with metadata extraction |
| **Locations** | Physical and virtual places | Geoapify address autocomplete |
| **Infrastructure** | Software, hardware, services | Structural type properties |
| **Contexts** | Workflow groupings | Auto-managed when linking entities |

### Import Capabilities

- **Multi-Entity Project Import**: Drag-and-drop JSON or RDF/TTL files
- **Preview Before Import**: See all entities with type badges before committing
- **Duplicate Handling**: Updates existing entities rather than creating duplicates
- **Round-Trip Support**: Import TTL, modify, export as JSON (or vice versa)

### Asset Import Wizard

A multi-step wizard for importing assets from files:

1. **Upload**: Drag-and-drop multi-file upload with auto-detection
2. **Classify**: Functional classification based on structural type
3. **Group**: Optional asset grouping for sequences (image sequences, rolls)
4. **Review**: Summary of all assets and groups to be created

### Graph Visualization

Interactive project visualization powered by Cytoscape.js:

- **MovieLabs Visual Language**: Custom SVG shapes for each entity type
- **Multiple Layouts**: Circle, hierarchical, force-directed, grid, concentric
- **Interactive Selection**: Click nodes/edges to view properties
- **Relationship Edges**: Visual connections between related entities

### ME-NEXUS Task Classification

Hierarchical classification system for Tasks:

- **L1 Categories**: Animation, Production Services, Compositing, etc.
- **L2/L3 Services**: Detailed service taxonomy with descriptions
- **OMC Equivalents**: Mappings to official OMC task types

## Architecture

### Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, TypeScript, Tailwind CSS v4 |
| **State Management** | Zustand |
| **UI Components** | shadcn/ui (Radix UI primitives) |
| **Form Handling** | React Hook Form + Zod validation |
| **Code Editor** | Monaco Editor |
| **Graph Visualization** | Cytoscape.js |
| **RDF Processing** | N3.js |
| **Schema Validation** | AJV (Another JSON Validator) |
| **Routing** | Wouter |
| **Backend** | Node.js, Express |
| **Database** | PostgreSQL + Drizzle ORM |
| **Build Tool** | Vite (dev), esbuild (prod) |

### Project Structure

```
├── client/
│   ├── src/
│   │   ├── components/          # React components
│   │   │   ├── asset-wizard/    # Asset import wizard
│   │   │   ├── ui/              # shadcn/ui components
│   │   │   ├── task-form.tsx    # Task entity form
│   │   │   ├── task-classifier.tsx  # ME-NEXUS classification
│   │   │   ├── visualize-entity-dialog.tsx  # Graph visualization
│   │   │   └── import-multi-dialog.tsx  # Project import
│   │   ├── lib/
│   │   │   ├── import/          # JSON and TTL importers
│   │   │   ├── export/          # JSON and RDF export
│   │   │   │   └── rdf/         # RDF serializer and prefixes
│   │   │   ├── store.ts         # Zustand state management
│   │   │   └── constants.ts     # Entity types and mappings
│   │   ├── pages/
│   │   │   ├── intro.tsx        # Landing page
│   │   │   └── dashboard.tsx    # Main builder interface
│   │   └── types/               # TypeScript type definitions
│   └── public/
│       └── schema.json          # OMC-JSON Schema v2.8
├── server/
│   ├── index.ts                 # Express server entry
│   ├── routes.ts                # API routes
│   └── storage.ts               # Database interface
├── shared/
│   └── schema.ts                # Drizzle database schema
└── attached_assets/
    └── omc_*.ttl                # OMC RDF/OWL Ontology
```

### Data Flow

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Form Input    │────▶│  Zustand Store   │────▶│  JSON Export    │
│   (React Hook   │     │  (Entity State)  │     │  (Schema Valid) │
│    Form + Zod)  │     │                  │     └─────────────────┘
└─────────────────┘     │                  │     ┌─────────────────┐
                        │                  │────▶│  RDF/TTL Export │
┌─────────────────┐     │                  │     │  (N3 Serializer)│
│  File Import    │────▶│                  │     └─────────────────┘
│  (JSON/TTL)     │     │                  │     ┌─────────────────┐
└─────────────────┘     │                  │────▶│  Graph Viz      │
                        └──────────────────┘     │  (Cytoscape.js) │
                                                 └─────────────────┘
```

### RDF Export Namespaces

| Prefix | Namespace | Description |
|--------|-----------|-------------|
| `omc:` | `https://movielabs.com/omc/rdf/schema/v2.8#` | Official OMC ontology |
| `omcT:` | `https://movielabs.com/omc/rdf/schema/v2.8Tentative#` | Tentative OMC properties |
| `me:` | `https://me-nexus.com/id/` | ME-NEXUS entity identifiers |
| `menexus:` | `https://me-nexus.com/schema#` | ME-NEXUS classification schema |

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Geoapify API key (optional, for address autocomplete)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/omc-builder.git
cd omc-builder

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your DATABASE_URL and optional GEOAPIFY_API_KEY

# Push database schema
npm run db:push

# Start development server
npm run dev
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `GEOAPIFY_API_KEY` | No | API key for address autocomplete |

## Usage

### Creating Entities

1. Navigate to the Builder (`/builder`)
2. Click "+ New Entity" and select an entity type
3. Fill in the form fields (collapsible sections for organization)
4. View real-time validation errors
5. Switch to JSON editor mode for direct editing

### Importing Projects

1. Click "Import" in the toolbar
2. Drag-and-drop a JSON or TTL file
3. Preview entities before importing
4. Click "Import All" to add to your project

### Exporting

1. Click the export dropdown in the toolbar
2. Choose JSON or RDF/TTL format
3. For single entity: "Export Current"
4. For all entities: "Export All"

### Visualizing Relationships

1. Click "View Graph" in the toolbar
2. Select a layout (hierarchical recommended)
3. Click nodes/edges to view properties
4. Use zoom controls or scroll to navigate

## Development History

### December 2025

- **Graph Visualization** - Interactive Cytoscape.js graph with MovieLabs visual language SVG icons
- **Relationship Edge Fix** - Edges now display correctly for imported entities
- **Creative Work Linking** - Task form includes Creative Work field with automatic Context management
- **JSON Schema Compliance** - Export transforms for full OMC-JSON v2.8 compliance
- **Task RDF Export** - Enhanced Task-specific RDF serialization with proper ontology patterns
- **ME-NEXUS Classification** - Hierarchical L1/L2/L3 task classification system
- **Multi-Entity Import** - Import entire projects from JSON or TTL files
- **Asset Import Wizard** - Multi-step wizard for importing assets from files
- **RDF/TTL Export** - Dual export capability with ontology-backed mappings
- **Dark Mode** - Full dark mode support with theme persistence
- **ME-DMZ Branding** - Custom color palette and visual identity

## Potential Enhancements

### Near-Term

- [ ] **Undo/Redo** - History management for entity edits
- [ ] **Entity Templates** - Pre-configured entity templates for common use cases
- [ ] **Bulk Edit** - Select and edit multiple entities simultaneously
- [ ] **Search & Filter** - Advanced search across all entity properties
- [ ] **Keyboard Shortcuts** - Power user navigation and actions

### Medium-Term

- [ ] **Collaboration** - Real-time multi-user editing
- [ ] **Version History** - Track changes over time with diff view
- [ ] **Entity Cloning** - Duplicate entities with new identifiers
- [ ] **Custom Schemas** - Support for OMC extensions and custom properties
- [ ] **API Integration** - REST API for programmatic access

### Long-Term

- [ ] **SHACL Validation** - RDF shape validation for imported TTL
- [ ] **Ontology Browser** - Explore the OMC ontology structure
- [ ] **Workflow Automation** - Define and execute production workflows
- [ ] **Asset Management** - Direct file storage and retrieval
- [ ] **Production Dashboard** - Overview of project status and metrics

## External References

- [MovieLabs OMC Specification](https://movielabs.com/production-technology/ontology-for-media-creation/)
- [OMC-JSON Schema v2.8](https://github.com/movielabs/OMC/tree/main/schema/json)
- [MovieLabs 2030 Vision](https://movielabs.com/production-technology/the-2030-vision/)

## Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests to the `develop` branch.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

The Ontology for Media Creation is developed by [MovieLabs](https://movielabs.com) and is licensed under the Creative Commons Attribution 4.0 International License.

---

Built with care by [ME-DMZ](https://www.me-dmz.com) - *We live at the intersection of art and data.*
