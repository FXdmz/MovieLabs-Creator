import { create } from 'zustand';
import { EntityType } from './constants';
import { v4 as uuidv4 } from 'uuid';

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
  updateEntity: (id: string, content: any) => void;
  removeEntity: (id: string) => void;
  selectEntity: (id: string | null) => void;
  exportJson: () => any;
}

export const useOntologyStore = create<OntologyStore>((set, get) => ({
  entities: [],
  selectedEntityId: null,
  addEntity: (type) => {
    const id = uuidv4();
    
    const defaultContent: any = {
      entityType: type,
      name: `New ${type}`,
      schemaVersion: "https://movielabs.com/omc/json/schema/v2.6",
      // OMC v2.6 Identifier is an array of objects
      identifier: [{
        identifierScope: "urn:uuid",
        identifierValue: id,
        combinedForm: `urn:uuid:${id}`
      }]
    };

    // Specific defaults for complex types
    if (type === "CreativeWork") {
       defaultContent.creativeWorkTitle = [{
         titleName: `New ${type}`,
         titleType: "working"
       }];
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
  updateEntity: (id, content) => {
    set((state) => ({
      entities: state.entities.map((e) => 
        e.id === id ? { ...e, content, name: content.name || e.name } : e
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
    // Wrap in rootObject or array depending on count, but for now let's just return the array of entities or single entity
    if (entities.length === 1) return entities[0].content;
    return entities.map(e => e.content);
  }
}));
