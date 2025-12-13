# project_aescher — Where Productions Build Knowledge

> **Private Beta** — The intelligent production management platform built on MovieLabs OMC

## Overview

project_aescher is the brain for production—an intelligent orchestration layer that connects every aspect of your production workflow. Built on MovieLabs' Ontology for Media Creation (OMC), it provides a unified system for creating, editing, and managing production knowledge with real-time validation and dual-format export (JSON/RDF TTL).

The platform is currently in **private beta**, aligning with MovieLabs' 2030 Vision for software-defined workflows and semantic interoperability.

### Key Value Propositions
- **Industry Knowledge Foundation** — Pre-loaded with ME-NEXUS: 100K+ organizations, 35K+ locations, 300+ tools
- **Connected Workflows** — One production graph, exportable to industry tools (ShotGrid, ftrack, Frame.io, Aspera)
- **Real-Time Coordination** — Changes propagate across your entire production ecosystem
- **Built on Standards** — MovieLabs OMC v2.8 ensures universal tool compatibility

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions
- **Branding**: project_aescher with "aescher" in italics, violet/indigo accent colors for private beta
- **Landing Page**: Modern design with ME-DMZ logo, Private Beta badge, 2030 Vision alignment, ME-NEXUS stats
- **Builder Interface**: Responsive sidebar layout with collapsible sections, welcome screen with footer branding
- **Graph Visualization**: Cytoscape.js with custom MovieLabs visual language SVG icons for each entity type
- **Theme**: Full light/dark mode support with system preference detection

### Technical Implementations
- **Frontend**: React 18 with TypeScript, Wouter for routing, Zustand for global state management (including undo/redo), React Hook Form with Zod for validation, shadcn/ui (Radix UI) for components, Tailwind CSS v4 for styling, Monaco Editor for JSON editing, and AJV for schema validation.
- **Backend**: Node.js with Express.
- **Build Tools**: Vite for development, esbuild for production.
- **Data Storage**: PostgreSQL with Drizzle ORM.
- **RDF Handling**: Custom RDF domain layer using N3.js for parsing and serialization, with bidirectional adapters for JSON ↔ RDF conversion and a property mapping registry for schema-to-predicate translation.

### Feature Specifications

#### Entity Management
- **Entity Types**: Participants, Tasks, Assets, Creative Works, Infrastructure, Locations, Contexts
- **Multi-Entity Projects**: Create, edit, manage multiple OMC entities with bulk export and graph visualization
- **Folder Organization**: Group related entities into folders
- **Context Menu**: Right-click for quick actions (Rename, Duplicate, View OMC, Visualize, Export, Move to Folder, Delete)

#### Import Capabilities
- **Multi-Entity Import**: Drag-and-drop JSON or RDF/TTL files with preview before import
- **Duplicate Handling**: Updates existing entities rather than creating duplicates
- **Round-Trip Support**: Import TTL, modify, export as JSON (or vice versa)
- **Asset Import Wizard**: Guided multi-step wizard with auto-detection of structural types and functional classification

#### Export Capabilities
- **Dual Format Export**: JSON (OMC-JSON Schema v2.8) and RDF/TTL (Turtle) with proper ontology mappings
- **Export Package**: One-click download of all project entities plus graph screenshot
- **Validation**: Real-time inline validation against OMC schema, MovieLabs official validator integration

#### Productivity Features
- **Undo/Redo**: Up to 50 states with Ctrl+Z / Ctrl+Y keyboard shortcuts
- **Search & Filter**: Text search and type-based filtering in sidebar
- **Form/JSON Toggle**: Switch between form-based editing and raw JSON mode
- **Dark Mode**: Full theme support with system preference detection

### System Design Choices
The architecture emphasizes a strong separation of concerns between frontend and backend, with shared TypeScript types. The RDF domain layer is a critical component for ensuring round-trip parity between JSON and RDF representations, facilitating flexible data exchange. State management is handled globally for all ontology entities to enable features like undo/redo and project-wide operations efficiently.

## External Dependencies
- **Geoapify**: Used for address autocomplete in Location entities.
- **Wikidata**: Integrated for entity lookup for Participants and CreativeWorks.
- **ME-NEXUS**: Entertainment Industry Data-as-a-Service with 100K+ organizations, 35K+ locations, 300+ tools.
- **MovieLabs OMC-JSON Schema v2.8**: Bundled locally for client-side validation.
- **MovieLabs OMC RDF/OWL Ontology v2.8**: Used as the basis for RDF/TTL export mappings.
- **MovieLabs 2030 Vision**: Alignment with the 2030 Vision principles for media production.

## Recent Updates (December 2025)
- Rebranded to project_aescher with private beta positioning
- Updated landing page with ME-DMZ logo, 2030 Vision section, ME-NEXUS stats
- Updated welcome screen in builder with consistent branding and footer
- Added violet/indigo accent color scheme throughout
