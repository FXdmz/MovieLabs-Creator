import { create } from 'zustand';
import { EntityType } from './constants';
import { v4 as uuidv4 } from 'uuid';
import { exportEntities, downloadExport, ExportFormat, prepareEntitiesForJsonExport } from './export';

export interface Entity {
  id: string;
  type: EntityType;
  name: string;
  content: any;
}

interface OntologyStore {
  entities: Entity[];
  selectedEntityId: string | null;
  addEntity: (type: EntityType) => void;
  addEntityFromContent: (type: EntityType, id: string, content: any) => void;
  updateEntity: (id: string, content: any) => void;
  removeEntity: (id: string) => void;
  selectEntity: (id: string | null) => void;
  exportJson: () => any;
  exportAs: (format: ExportFormat) => string;
  downloadAs: (format: ExportFormat, filename?: string) => void;
  downloadCurrentAs: (format: ExportFormat, filename?: string) => boolean;
  getSelectedEntity: () => Entity | null;
}

export const useOntologyStore = create<OntologyStore>((set, get) => ({
  entities: [],
  selectedEntityId: null,
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

    // Specific defaults for complex types
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
      entities: [...state.entities, newEntity],
      selectedEntityId: id
    }));
  },
  addEntityFromContent: (type, id, content) => {
    const newEntity: Entity = {
      id,
      type,
      name: content.name || `New ${type}`,
      content
    };
    set((state) => ({
      entities: [...state.entities, newEntity],
      selectedEntityId: id
    }));
  },
  updateEntity: (id, content) => {
    set((state) => ({
      entities: state.entities.map((e) => 
        e.id === id ? { ...e, content, name: content.name ?? e.name } : e
      )
    }));
  },
  removeEntity: (id) => {
    set((state) => ({
      entities: state.entities.filter((e) => e.id !== id),
      selectedEntityId: state.selectedEntityId === id ? null : state.selectedEntityId
    }));
  },
  selectEntity: (id) => set({ selectedEntityId: id }),
  exportJson: () => {
    const { entities } = get();
    const transformed = prepareEntitiesForJsonExport(entities);
    if (transformed.length === 1) return transformed[0].content;
    return transformed.map(e => e.content);
  },
  exportAs: (format: ExportFormat) => {
    const { entities } = get();
    return exportEntities(entities, { format, pretty: true });
  },
  downloadAs: (format: ExportFormat, filename?: string) => {
    const { entities } = get();
    downloadExport(entities, { format, pretty: true }, filename);
  },
  downloadCurrentAs: (format: ExportFormat, filename?: string) => {
    const { entities, selectedEntityId } = get();
    const selectedEntity = entities.find(e => e.id === selectedEntityId);
    if (!selectedEntity) return false;
    downloadExport([selectedEntity], { format, pretty: true }, filename);
    return true;
  },
  getSelectedEntity: () => {
    const { entities, selectedEntityId } = get();
    return entities.find(e => e.id === selectedEntityId) || null;
  }
}));
