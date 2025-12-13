# project_aescher — The Brain for Production

## Overview
project_aescher is an intelligent production management platform that serves as the "brain" for media production workflows. Built on MovieLabs' Ontology for Media Creation (OMC), it provides a unified system for creating, editing, and managing production metadata with real-time validation and dual-format export (JSON/RDF TTL).

The platform is currently in private beta, offering an orchestration layer that connects every aspect of production workflow—from creative vision to final delivery. It aligns with MovieLabs' 2030 Vision for software-defined workflows and semantic interoperability.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions
The application features a modern, dark-themed design for the landing page with violet/indigo accent colors signifying the private beta status. The builder interface uses a responsive sidebar layout with collapsible sections. Interactive graph visualization uses Cytoscape.js with custom SVG icons representing different OMC entity types (Task, Asset, Participant, Context, Infrastructure, CreativeWork, Location).

### Technical Implementations
- **Frontend**: React 18 with TypeScript, Wouter for routing, Zustand for global state management (including undo/redo), React Hook Form with Zod for validation, shadcn/ui (Radix UI) for components, Tailwind CSS v4 for styling, Monaco Editor for JSON editing, and AJV for schema validation.
- **Backend**: Node.js with Express.
- **Build Tools**: Vite for development, esbuild for production.
- **Data Storage**: PostgreSQL with Drizzle ORM.
- **RDF Handling**: Custom RDF domain layer using N3.js for parsing and serialization, with bidirectional adapters for JSON ↔ RDF conversion and a property mapping registry for schema-to-predicate translation.

### Feature Specifications
- **Multi-Entity Project Management**: Create, edit, and manage multiple OMC entities within a single project, with bulk export capabilities and project-level graph visualization.
- **Import Capabilities**: Supports importing entire OMC projects from JSON or RDF/TTL files via drag-and-drop, including multi-entity files and duplicate ID handling. An Asset Import Wizard provides guided import with auto-detection of structural types and functional classification.
- **Export Capabilities**: Dual format export (JSON and RDF/TTL) validated against OMC-JSON Schema v2.8, with proper RDF/TTL serialization including namespaces and entity-to-RDF class mappings. A one-click "Export Package" downloads all project entities and a graph screenshot.
- **Entity Type Support**: Comprehensive support for OMC entity types including Participants, Tasks, Assets, Creative Works, Infrastructure, Locations, and automatically managed Contexts, each with specialized form fields and validation.
- **Form-Based Editing**: Features real-time, inline validation against the OMC schema and a toggle between form and raw JSON editing modes.
- **Search & Filter**: Allows text search and type-based filtering of entities in the sidebar.
- **Undo/Redo**: Maintains up to 50 states with keyboard shortcuts and toolbar buttons.
- **Context Menu**: Right-click on entities for quick actions (Rename, Duplicate, View OMC, Visualize, Export, Move to Folder, Delete with confirmation).

### System Design Choices
The architecture emphasizes a strong separation of concerns between frontend and backend, with shared TypeScript types. The RDF domain layer is a critical component for ensuring round-trip parity between JSON and RDF representations, facilitating flexible data exchange. State management is handled globally for all ontology entities to enable features like undo/redo and project-wide operations efficiently.

## External Dependencies
- **Geoapify**: Used for address autocomplete in Location entities.
- **Wikidata**: Integrated for entity lookup for Participants and CreativeWorks.
- **MovieLabs OMC-JSON Schema v2.8**: Bundled locally for client-side validation.
- **MovieLabs OMC RDF/OWL Ontology v2.8**: Used as the basis for RDF/TTL export mappings.
- **MovieLabs 2030 Vision**: Alignment with the 2030 Vision principles for media production.
