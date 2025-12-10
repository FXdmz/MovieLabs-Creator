# ME-DMZ Ontology Builder

## Overview

ME-DMZ Ontology Builder is a web application for creating and exporting MovieLabs Ontology for Media Creation (OMC) compliant JSON documents. The application provides a visual form-based interface for building complex media production ontology entities (such as Creative Works, Assets, Characters, etc.) and validates them against the official OMC-JSON Schema v2.8.

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