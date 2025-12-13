# project_aescher — Where Productions Build Knowledge

> **Private Beta** — The intelligent production management platform built on MovieLabs OMC

![OMC v2.8](https://img.shields.io/badge/OMC-v2.8-violet) ![Private Beta](https://img.shields.io/badge/status-Private%20Beta-indigo) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue) ![License](https://img.shields.io/badge/license-MIT-green)

## Overview

**project_aescher** is the brain for production—an intelligent orchestration layer that connects every aspect of your production workflow. Built on MovieLabs' Ontology for Media Creation (OMC), it provides a unified system for creating, editing, and managing production knowledge with real-time validation and dual-format export.

Aligned with MovieLabs' 2030 Vision for software-defined workflows and semantic interoperability, project_aescher transforms how productions manage their metadata infrastructure.

### Why project_aescher?

- **Industry Knowledge Foundation** — Pre-loaded with ME-NEXUS data: 100K+ organizations, 35K+ locations, and 300+ production tools
- **Connected Workflows** — One production graph, exportable to ShotGrid, ftrack, Frame.io, Aspera, and any OMC-compatible tool
- **Real-Time Coordination** — Changes propagate across your entire production ecosystem
- **Built on Standards** — MovieLabs OMC v2.8 ensures your production knowledge works with every major industry tool

## Features

### Entity Types Supported

| Entity | Description | Special Features |
|--------|-------------|------------------|
| **Creative Works** | Films, shows, productions | Wikidata integration for lookup |
| **Participants** | People, organizations, departments, services | Location references, contact info |
| **Tasks** | Production workflow activities | ME-NEXUS hierarchical L1/L2/L3 classification |
| **Assets** | Digital and physical media | File import wizard with metadata extraction |
| **Locations** | Physical and virtual places | Geoapify address autocomplete |
| **Infrastructure** | Software, hardware, services | Structural type properties |
| **Contexts** | Workflow groupings | Auto-managed when linking entities |

### Core Capabilities

#### Multi-Entity Project Management
- Create, edit, and manage multiple OMC entities in a single project
- Folder organization for grouping related entities
- Bulk export capabilities for entire projects
- Project-level graph visualization

#### Dual Format Export
- **JSON** — OMC-JSON Schema v2.8 compliant output
- **RDF/TTL** — Turtle format with proper ontology mappings and namespaces
- One-click "Export Package" downloads all entities plus graph screenshot
- Full round-trip support between formats

#### Import Capabilities
- **Multi-Entity Project Import** — Drag-and-drop JSON or RDF/TTL files
- **Preview Before Import** — See all entities with type badges before committing
- **Duplicate Handling** — Updates existing entities rather than creating duplicates
- **Round-Trip Support** — Import TTL, modify, export as JSON (or vice versa)

#### Asset Import Wizard
A guided multi-step wizard for importing assets from files:
1. **Upload** — Drag-and-drop multi-file upload with auto-detection
2. **Classify** — Functional classification based on structural type
3. **Group** — Optional asset grouping for sequences (image sequences, rolls)
4. **Review** — Summary of all assets and groups to be created

#### Graph Visualization
Interactive project visualization powered by Cytoscape.js:
- **MovieLabs Visual Language** — Custom SVG shapes for each entity type
- **Multiple Layouts** — Circle, hierarchical, force-directed, grid, concentric
- **Interactive Selection** — Click nodes/edges to view properties
- **Relationship Edges** — Visual connections between related entities

#### ME-NEXUS Task Classification
Hierarchical classification system for Tasks:
- **L1 Categories** — Animation, Production Services, Compositing, etc.
- **L2/L3 Services** — Detailed service taxonomy with descriptions
- **OMC Equivalents** — Mappings to official OMC task types

#### Productivity Features
- **Undo/Redo** — Up to 50 states with keyboard shortcuts (Ctrl+Z / Ctrl+Y)
- **Search & Filter** — Text search and type-based filtering in sidebar
- **Context Menu** — Right-click for quick actions (Rename, Duplicate, Export, Delete)
- **Dark Mode** — Full dark mode support with system preference detection
- **Form/JSON Toggle** — Switch between form-based editing and raw JSON

### Real-Time Validation
- Inline validation against OMC-JSON Schema v2.8
- MovieLabs official validator integration (when available)
- Local fallback validation for offline use
- Clear error messaging with path highlighting

## Architecture

### Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, TypeScript, Tailwind CSS v4 |
| **State Management** | Zustand (with undo/redo history) |
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
git clone https://github.com/me-dmz/project-aescher.git
cd project-aescher

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
4. For all entities: "Export All" or "Export Package"

### Visualizing Relationships

1. Click "View Graph" in the toolbar
2. Select a layout (hierarchical recommended)
3. Click nodes/edges to view properties
4. Use zoom controls or scroll to navigate

## 2030 Vision Alignment

project_aescher is built on MovieLabs' 2030 Vision principles:

- **Software-Defined Workflows** — Metadata-driven production pipelines
- **Cloud-Native Production** — Built for modern distributed workflows
- **Semantic Interoperability** — OMC-based knowledge graphs for universal tool compatibility

## Roadmap

### Private Beta Focus
- [ ] User feedback integration
- [ ] Performance optimization for large projects
- [ ] Enhanced collaboration features
- [ ] Custom entity templates

### Future Development
- [ ] Real-time multi-user editing
- [ ] Version history with diff view
- [ ] SHACL validation for RDF
- [ ] API for programmatic access
- [ ] Production dashboard and metrics

## External References

- [MovieLabs OMC Specification](https://movielabs.com/production-technology/ontology-for-media-creation/)
- [OMC-JSON Schema v2.8](https://github.com/movielabs/OMC/tree/main/schema/json)
- [MovieLabs 2030 Vision](https://movielabs.com/production-technology/the-2030-vision/)
- [ME-NEXUS](https://me-nexus.com) — Entertainment Industry Data-as-a-Service

## Contributing

This project is currently in private beta. Contact us for access and contribution guidelines.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

The Ontology for Media Creation is developed by [MovieLabs](https://movielabs.com) and is licensed under the Creative Commons Attribution 4.0 International License.

---

Built with care by [ME-DMZ](https://www.me-dmz.com) — *Where productions build knowledge.*
