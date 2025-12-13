/**
 * @fileoverview Zustand State Management Store for OMC Ontology Entities
 * 
 * This module provides the central state management for the ME-DMZ Ontology Builder
 * application using Zustand. It manages:
 * - Collection of OMC entities (Assets, Tasks, Participants, etc.)
 * - Entity selection state for the editor UI
 * - Undo/redo history with configurable depth
 * - Export functionality for JSON and RDF/TTL formats
 * 
 * @module store
 * 
 * @description
 * The store follows a centralized state pattern where all entity operations
 * (create, read, update, delete) flow through this single source of truth.
 * Components subscribe to specific slices of state using Zustand selectors.
 * 
 * Key architectural decisions:
 * - Undo/redo uses a past/future stack pattern (max 50 states)
 * - Entity creation includes type-specific default content
 * - All mutations save current state to history before applying changes
 * 
 * @example
 * // Subscribe to entities in a React component
 * const entities = useOntologyStore(state => state.entities);
 * 
 * @example
 * // Add a new entity
 * const addEntity = useOntologyStore(state => state.addEntity);
 * addEntity('Task');
 * 
 * @example
 * // Export all entities as TTL
 * const exportAs = useOntologyStore(state => state.exportAs);
 * const ttl = exportAs('ttl');
 */

import { create } from 'zustand';
import { EntityType } from './constants';
import { v4 as uuidv4 } from 'uuid';
import { exportEntities, downloadExport, ExportFormat, prepareEntitiesForJsonExport } from './export';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Represents a single OMC entity in the application.
 * 
 * @interface Entity
 * @property {string} id - Unique identifier (UUID v4) for the entity
 * @property {EntityType} type - The OMC entity type (Asset, Task, Participant, etc.)
 * @property {string} name - Display name for the entity (shown in sidebar)
 * @property {any} content - Full OMC-compliant entity content object
 * 
 * @example
 * const entity: Entity = {
 *   id: '550e8400-e29b-41d4-a716-446655440000',
 *   type: 'Task',
 *   name: 'Color Grading',
 *   content: {
 *     entityType: 'Task',
 *     schemaVersion: 'https://movielabs.com/omc/json/schema/v2.8',
 *     identifier: [{ identifierScope: 'me-nexus', identifierValue: '550e8400...' }]
 *   }
 * };
 */
export interface Entity {
  id: string;
  type: EntityType;
  name: string;
  content: any;
}

/**
 * Snapshot of application state for undo/redo history.
 * 
 * @interface HistoryState
 * @property {Entity[]} entities - Array of all entities at this point in history
 * @property {string|null} selectedEntityId - ID of selected entity at this point
 */
interface HistoryState {
  entities: Entity[];
  selectedEntityId: string | null;
}

/**
 * Maximum number of undo/redo states to retain.
 * Prevents unbounded memory growth while allowing reasonable undo depth.
 */
const MAX_HISTORY = 50;

/**
 * Complete interface for the Zustand ontology store.
 * 
 * @interface OntologyStore
 * 
 * @property {Entity[]} entities - All entities currently in the project
 * @property {string|null} selectedEntityId - Currently selected entity ID
 * @property {HistoryState[]} past - Stack of previous states for undo
 * @property {HistoryState[]} future - Stack of future states for redo
 * 
 * @property {Function} addEntity - Create a new entity with type-specific defaults
 * @property {Function} addEntityFromContent - Import an entity from existing content
 * @property {Function} updateEntity - Update an entity's content
 * @property {Function} removeEntity - Delete an entity
 * @property {Function} selectEntity - Set the selected entity
 * @property {Function} undo - Restore previous state
 * @property {Function} redo - Restore next state
 * @property {Function} canUndo - Check if undo is available
 * @property {Function} canRedo - Check if redo is available
 * @property {Function} exportJson - Export all entities as JSON
 * @property {Function} exportAs - Export all entities in specified format
 * @property {Function} downloadAs - Download all entities as file
 * @property {Function} downloadCurrentAs - Download selected entity as file
 * @property {Function} getSelectedEntity - Get the currently selected entity
 */
interface OntologyStore {
  entities: Entity[];
  selectedEntityId: string | null;
  past: HistoryState[];
  future: HistoryState[];
  addEntity: (type: EntityType) => void;
  addEntityFromContent: (type: EntityType, id: string, content: any) => void;
  updateEntity: (id: string, content: any) => void;
  removeEntity: (id: string) => void;
  selectEntity: (id: string | null) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  exportJson: () => any;
  exportAs: (format: ExportFormat) => string;
  downloadAs: (format: ExportFormat, filename?: string) => void;
  downloadCurrentAs: (format: ExportFormat, filename?: string) => boolean;
  getSelectedEntity: () => Entity | null;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Saves the current state to history before a mutation.
 * 
 * This function captures a snapshot of the current entities and selection,
 * appending it to the past history stack. The stack is capped at MAX_HISTORY
 * to prevent unbounded memory growth.
 * 
 * @param {OntologyStore} state - Current store state
 * @returns {HistoryState[]} New past history stack with current state appended
 * 
 * @example
 * set((state) => ({
 *   past: saveToHistory(state),
 *   future: [], // Clear redo stack on new action
 *   entities: [...state.entities, newEntity]
 * }));
 */
const saveToHistory = (state: OntologyStore): HistoryState[] => {
  const newPast = [...state.past, { entities: state.entities, selectedEntityId: state.selectedEntityId }];
  return newPast.slice(-MAX_HISTORY);
};

// ============================================================================
// ZUSTAND STORE
// ============================================================================

/**
 * Zustand store hook for ontology entity state management.
 * 
 * This is the primary state management mechanism for the application.
 * All entity operations should flow through this store to ensure
 * consistent state and proper undo/redo support.
 * 
 * @example
 * // Get all entities
 * const entities = useOntologyStore(state => state.entities);
 * 
 * @example
 * // Get store actions
 * const { addEntity, updateEntity, removeEntity } = useOntologyStore();
 * 
 * @example
 * // Undo with keyboard shortcut
 * useEffect(() => {
 *   const handleKeyDown = (e: KeyboardEvent) => {
 *     if (e.ctrlKey && e.key === 'z') {
 *       useOntologyStore.getState().undo();
 *     }
 *   };
 *   window.addEventListener('keydown', handleKeyDown);
 *   return () => window.removeEventListener('keydown', handleKeyDown);
 * }, []);
 */
export const useOntologyStore = create<OntologyStore>((set, get) => ({
  entities: [],
  selectedEntityId: null,
  past: [],
  future: [],
  
  /**
   * Creates a new entity with type-specific default content.
   * 
   * Each entity type has specific default structure:
   * - Asset: Includes AssetSC and assetFC containers
   * - Task: Includes TaskSC, state, and Context containers
   * - Participant: Includes ParticipantSC with Person defaults
   * - Infrastructure: Includes InfrastructureSC container
   * - Context: Includes ContextSC with NarrativeContext defaults
   * - CreativeWork: Includes creativeWorkTitle array
   * 
   * @param {EntityType} type - The OMC entity type to create
   */
  addEntity: (type) => {
    const id = uuidv4();
    
    const defaultContent: any = {
      entityType: type,
      name: `New ${type}`,
      schemaVersion: "https://movielabs.com/omc/json/schema/v2.8",
      identifier: [{
        identifierScope: "me-nexus",
        identifierValue: id,
        combinedForm: `me-nexus:${id}`
      }]
    };

    if (type === "CreativeWork") {
       defaultContent.creativeWorkTitle = [{
         titleName: `New ${type}`,
         titleType: "working"
       }];
    }

    if (type === "Asset") {
       defaultContent.assetFC = {
         functionalType: null
       };
       defaultContent.AssetSC = {
         structuralType: null,
         structuralProperties: {}
       };
    }

    if (type === "Infrastructure") {
       const infraScId = uuidv4();
       defaultContent.InfrastructureSC = {
         entityType: "InfrastructureSC",
         schemaVersion: "https://movielabs.com/omc/json/schema/v2.8",
         identifier: [{
           identifierScope: "me-nexus",
           identifierValue: infraScId,
           combinedForm: `me-nexus:${infraScId}`
         }],
         structuralType: null,
         structuralProperties: {}
       };
       defaultContent.infrastructureFC = null;
       defaultContent.Context = null;
    }

    if (type === "Task") {
       const taskScId = uuidv4();
       defaultContent.TaskSC = {
         entityType: "TaskSC",
         schemaVersion: "https://movielabs.com/omc/json/schema/v2.8",
         identifier: [{
           identifierScope: "me-nexus",
           identifierValue: taskScId,
           combinedForm: `me-nexus:${taskScId}`
         }],
         structuralType: null,
         structuralProperties: {}
       };
       defaultContent.taskFC = null;
       defaultContent.state = "assigned";
       defaultContent.Context = null;
    }

    if (type === "Participant") {
       const participantScId = uuidv4();
       defaultContent.ParticipantSC = {
         entityType: "Person",
         schemaVersion: "https://movielabs.com/omc/json/schema/v2.8",
         identifier: [{
           identifierScope: "me-nexus",
           identifierValue: participantScId,
           combinedForm: `me-nexus:${participantScId}`
         }],
         structuralType: "person",
         personName: null,
         gender: null,
         contact: null
       };
       defaultContent.participantFC = null;
       defaultContent.Context = null;
    }

    if (type === "Context") {
       const contextScId = uuidv4();
       defaultContent.ContextSC = {
         entityType: "NarrativeContext",
         schemaVersion: "https://movielabs.com/omc/json/schema/v2.8",
         identifier: [{
           identifierScope: "me-nexus",
           identifierValue: contextScId,
           combinedForm: `me-nexus:${contextScId}`
         }],
         structuralType: "narrativeContext",
       };
       defaultContent.contextFC = null;
    }

    const newEntity: Entity = {
      id,
      type,
      name: `New ${type}`,
      content: defaultContent
    };
    set((state) => ({
      past: saveToHistory(state),
      future: [],
      entities: [...state.entities, newEntity],
      selectedEntityId: id
    }));
  },
  
  /**
   * Imports an entity from pre-existing content (used during file import).
   * 
   * Unlike addEntity(), this doesn't generate default content but uses
   * the provided content directly. Used by JSON and TTL importers.
   * 
   * @param {EntityType} type - The OMC entity type
   * @param {string} id - The entity's unique identifier
   * @param {any} content - Full OMC-compliant entity content
   */
  addEntityFromContent: (type, id, content) => {
    const newEntity: Entity = {
      id,
      type,
      name: content.name || `New ${type}`,
      content
    };
    set((state) => ({
      past: saveToHistory(state),
      future: [],
      entities: [...state.entities, newEntity],
      selectedEntityId: id
    }));
  },
  
  /**
   * Updates an existing entity's content.
   * 
   * Also updates the entity's display name if content.name is present.
   * Saves current state to history for undo support.
   * 
   * @param {string} id - ID of the entity to update
   * @param {any} content - New content to replace existing content
   */
  updateEntity: (id, content) => {
    set((state) => ({
      past: saveToHistory(state),
      future: [],
      entities: state.entities.map((e) => 
        e.id === id ? { ...e, content, name: content.name ?? e.name } : e
      )
    }));
  },
  
  /**
   * Removes an entity from the project.
   * 
   * If the removed entity was selected, clears the selection.
   * 
   * @param {string} id - ID of the entity to remove
   */
  removeEntity: (id) => {
    set((state) => ({
      past: saveToHistory(state),
      future: [],
      entities: state.entities.filter((e) => e.id !== id),
      selectedEntityId: state.selectedEntityId === id ? null : state.selectedEntityId
    }));
  },
  
  /**
   * Sets the currently selected entity for editing.
   * 
   * Does not affect undo/redo history as selection is not a data mutation.
   * 
   * @param {string|null} id - ID of entity to select, or null to deselect
   */
  selectEntity: (id) => set({ selectedEntityId: id }),
  
  /**
   * Restores the previous state from history (undo operation).
   * 
   * Moves current state to future stack for potential redo.
   * No-op if past stack is empty.
   */
  undo: () => {
    const { past, entities, selectedEntityId, future } = get();
    if (past.length === 0) return;
    
    const previous = past[past.length - 1];
    const newPast = past.slice(0, -1);
    
    set({
      past: newPast,
      entities: previous.entities,
      selectedEntityId: previous.selectedEntityId,
      future: [{ entities, selectedEntityId }, ...future].slice(0, MAX_HISTORY)
    });
  },
  
  /**
   * Restores the next state from history (redo operation).
   * 
   * Moves current state to past stack for potential undo.
   * No-op if future stack is empty.
   */
  redo: () => {
    const { past, entities, selectedEntityId, future } = get();
    if (future.length === 0) return;
    
    const next = future[0];
    const newFuture = future.slice(1);
    
    set({
      past: [...past, { entities, selectedEntityId }].slice(-MAX_HISTORY),
      entities: next.entities,
      selectedEntityId: next.selectedEntityId,
      future: newFuture
    });
  },
  
  /**
   * Checks if undo is available.
   * @returns {boolean} True if past history has entries
   */
  canUndo: () => get().past.length > 0,
  
  /**
   * Checks if redo is available.
   * @returns {boolean} True if future history has entries
   */
  canRedo: () => get().future.length > 0,
  
  /**
   * Exports all entities as JSON with schema compliance transforms.
   * 
   * @returns {any} Single entity content or array of entity contents
   */
  exportJson: () => {
    const { entities } = get();
    const transformed = prepareEntitiesForJsonExport(entities);
    if (transformed.length === 1) return transformed[0].content;
    return transformed.map(e => e.content);
  },
  
  /**
   * Exports all entities in the specified format.
   * 
   * @param {ExportFormat} format - 'json' or 'ttl'
   * @returns {string} Serialized output string
   */
  exportAs: (format: ExportFormat) => {
    const { entities } = get();
    return exportEntities(entities, { format, pretty: true });
  },
  
  /**
   * Downloads all entities as a file.
   * 
   * @param {ExportFormat} format - 'json' or 'ttl'
   * @param {string} [filename] - Optional custom filename
   */
  downloadAs: (format: ExportFormat, filename?: string) => {
    const { entities } = get();
    downloadExport(entities, { format, pretty: true }, filename);
  },
  
  /**
   * Downloads the currently selected entity as a file.
   * 
   * @param {ExportFormat} format - 'json' or 'ttl'
   * @param {string} [filename] - Optional custom filename
   * @returns {boolean} True if download succeeded, false if no entity selected
   */
  downloadCurrentAs: (format: ExportFormat, filename?: string) => {
    const { entities, selectedEntityId } = get();
    const selectedEntity = entities.find(e => e.id === selectedEntityId);
    if (!selectedEntity) return false;
    downloadExport([selectedEntity], { format, pretty: true }, filename);
    return true;
  },
  
  /**
   * Gets the currently selected entity.
   * 
   * @returns {Entity|null} The selected entity or null if none selected
   */
  getSelectedEntity: () => {
    const { entities, selectedEntityId } = get();
    return entities.find(e => e.id === selectedEntityId) || null;
  }
}));
