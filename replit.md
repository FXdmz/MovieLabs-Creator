# ME-DMZ Ontology Builder

## Overview
ME-DMZ Ontology Builder is a web application designed for creating and exporting MovieLabs Ontology for Media Creation (OMC) compliant documents. It supports both JSON and RDF/TTL formats. The application provides a visual, form-based interface for building complex media production ontology entities and validates them against the official OMC-JSON Schema v2.8. Its primary purpose is to enable media production professionals to create standardized metadata for interoperability across production workflows.

The project aims to streamline the creation of OMC-compliant metadata, making it accessible even for users without deep technical knowledge of semantic web technologies. This tool has the potential to significantly enhance metadata standardization in the media industry, fostering better collaboration and data exchange.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions
The application features a responsive design with a clear, organized form layout using collapsible sections. It supports a dark mode, adhering to ME-DMZ branding with a custom color palette and icons. Interactive graph visualization uses Cytoscape.js with custom SVG icons representing different MovieLabs entity types (Task, Asset, Participant, Context, Infrastructure, CreativeWork, Location), offering multiple layout options and interactive selection.

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

### System Design Choices
The architecture emphasizes a strong separation of concerns between frontend and backend, with shared TypeScript types. The RDF domain layer is a critical component for ensuring round-trip parity between JSON and RDF representations, facilitating flexible data exchange. State management is handled globally for all ontology entities to enable features like undo/redo and project-wide operations efficiently.

## External Dependencies
- **Geoapify**: Used for address autocomplete in Location entities.
- **Wikidata**: Integrated for entity lookup for Participants and CreativeWorks.
- **MovieLabs OMC-JSON Schema v2.8**: Bundled locally for client-side validation.
- **MovieLabs OMC RDF/OWL Ontology v2.8**: Used as the basis for RDF/TTL export mappings.
```