import { Store, DataFactory, Quad, NamedNode, BlankNode, Literal, Term } from 'n3';
import { NAMESPACES, entityUri, ns, RDF, RDFS, OMC } from './namespaces';

const { namedNode, literal, quad } = DataFactory;

export type RdfSubject = NamedNode | BlankNode;
export type RdfObject = NamedNode | BlankNode | Literal;

export interface RdfStoreOptions {
  prefixes?: Record<string, string>;
}

export class OmcRdfStore {
  private store: Store;
  private prefixes: Record<string, string>;

  constructor(options: RdfStoreOptions = {}) {
    this.store = new Store();
    this.prefixes = options.prefixes || { ...NAMESPACES };
  }

  get size(): number {
    return this.store.size;
  }

  getN3Store(): Store {
    return this.store;
  }

  addQuad(subject: RdfSubject, predicate: NamedNode, object: RdfObject): void {
    this.store.addQuad(quad(subject, predicate, object));
  }

  addQuads(quads: Quad[]): void {
    this.store.addQuads(quads);
  }

  removeQuads(quads: Quad[]): void {
    this.store.removeQuads(quads);
  }

  getQuads(
    subject?: RdfSubject | null,
    predicate?: NamedNode | null,
    object?: RdfObject | null
  ): Quad[] {
    return this.store.getQuads(subject || null, predicate || null, object || null, null);
  }

  getSubjects(predicate?: NamedNode | null, object?: RdfObject | null): Term[] {
    return this.store.getSubjects(predicate || null, object || null, null);
  }

  getObjects(subject?: RdfSubject | null, predicate?: NamedNode | null): Term[] {
    return this.store.getObjects(subject || null, predicate || null, null);
  }

  getPredicates(subject?: RdfSubject | null, object?: RdfObject | null): Term[] {
    return this.store.getPredicates(subject || null, object || null, null);
  }

  has(subject: RdfSubject, predicate: NamedNode, object?: RdfObject): boolean {
    const quads = this.getQuads(subject, predicate, object);
    return quads.length > 0;
  }

  addEntity(id: string, type: NamedNode): NamedNode {
    const subject = entityUri(id);
    this.addQuad(subject, RDF.type, type);
    this.addQuad(subject, OMC.schemaVersion, literal("https://movielabs.com/omc/json/schema/v2.8"));
    return subject;
  }

  addLiteral(subject: RdfSubject, predicate: NamedNode, value: string | number | boolean): void {
    if (value === null || value === undefined) return;
    
    let lit: Literal;
    if (typeof value === 'number') {
      if (Number.isInteger(value)) {
        lit = literal(value.toString(), namedNode(`${NAMESPACES.xsd}integer`));
      } else {
        lit = literal(value.toString(), namedNode(`${NAMESPACES.xsd}decimal`));
      }
    } else if (typeof value === 'boolean') {
      lit = literal(value.toString(), namedNode(`${NAMESPACES.xsd}boolean`));
    } else {
      lit = literal(value);
    }
    
    this.addQuad(subject, predicate, lit);
  }

  addDateLiteral(subject: RdfSubject, predicate: NamedNode, isoDate: string): void {
    if (!isoDate) return;
    const lit = literal(isoDate, namedNode(`${NAMESPACES.xsd}dateTime`));
    this.addQuad(subject, predicate, lit);
  }

  addReference(subject: RdfSubject, predicate: NamedNode, targetId: string): void {
    const target = entityUri(targetId);
    this.addQuad(subject, predicate, target);
  }

  getEntityType(subject: RdfSubject): NamedNode | null {
    const types = this.getObjects(subject, RDF.type);
    return types.length > 0 ? (types[0] as NamedNode) : null;
  }

  getLiteralValue(subject: RdfSubject, predicate: NamedNode): string | number | boolean | null {
    const objects = this.getObjects(subject, predicate);
    if (objects.length === 0) return null;
    
    const obj = objects[0];
    if (obj.termType !== 'Literal') return null;
    
    const lit = obj as Literal;
    const datatype = lit.datatype?.value || '';
    
    if (datatype.endsWith('#integer') || datatype.endsWith('#int')) {
      return parseInt(lit.value, 10);
    }
    if (datatype.endsWith('#decimal') || datatype.endsWith('#double') || datatype.endsWith('#float')) {
      return parseFloat(lit.value);
    }
    if (datatype.endsWith('#boolean')) {
      return lit.value === 'true';
    }
    
    return lit.value;
  }

  getAllLiteralValues(subject: RdfSubject, predicate: NamedNode): (string | number | boolean)[] {
    const objects = this.getObjects(subject, predicate);
    return objects
      .filter(obj => obj.termType === 'Literal')
      .map(obj => {
        const lit = obj as Literal;
        const datatype = lit.datatype?.value || '';
        
        if (datatype.endsWith('#integer') || datatype.endsWith('#int')) {
          return parseInt(lit.value, 10);
        }
        if (datatype.endsWith('#decimal') || datatype.endsWith('#double') || datatype.endsWith('#float')) {
          return parseFloat(lit.value);
        }
        if (datatype.endsWith('#boolean')) {
          return lit.value === 'true';
        }
        
        return lit.value;
      });
  }

  getReference(subject: RdfSubject, predicate: NamedNode): string | null {
    const objects = this.getObjects(subject, predicate);
    if (objects.length === 0) return null;
    
    const obj = objects[0];
    if (obj.termType !== 'NamedNode') return null;
    
    const uri = obj.value;
    if (uri.startsWith(NAMESPACES.me)) {
      return uri.slice(NAMESPACES.me.length);
    }
    return uri;
  }

  getAllReferences(subject: RdfSubject, predicate: NamedNode): string[] {
    const objects = this.getObjects(subject, predicate);
    return objects
      .filter(obj => obj.termType === 'NamedNode')
      .map(obj => {
        const uri = obj.value;
        if (uri.startsWith(NAMESPACES.me)) {
          return uri.slice(NAMESPACES.me.length);
        }
        return uri;
      });
  }

  removeEntity(id: string): void {
    const subject = entityUri(id);
    const quads = this.getQuads(subject);
    this.removeQuads(quads);
    
    const refQuads = this.store.getQuads(null, null, subject, null);
    this.removeQuads(refQuads);
  }

  clear(): void {
    const allQuads = this.store.getQuads(null, null, null, null);
    this.store.removeQuads(allQuads);
  }

  getAllEntityIds(): string[] {
    const subjects = this.store.getSubjects(RDF.type, null, null);
    return subjects
      .filter(s => s.termType === 'NamedNode' && s.value.startsWith(NAMESPACES.me))
      .map(s => s.value.slice(NAMESPACES.me.length));
  }

  getEntitiesByType(type: NamedNode): string[] {
    const subjects = this.store.getSubjects(RDF.type, type, null);
    return subjects
      .filter(s => s.termType === 'NamedNode' && s.value.startsWith(NAMESPACES.me))
      .map(s => s.value.slice(NAMESPACES.me.length));
  }

  getPrefixes(): Record<string, string> {
    return { ...this.prefixes };
  }

  clone(): OmcRdfStore {
    const newStore = new OmcRdfStore({ prefixes: this.prefixes });
    const allQuads = this.store.getQuads(null, null, null, null);
    newStore.addQuads(allQuads);
    return newStore;
  }
}

let globalRdfStore: OmcRdfStore | null = null;

export function getRdfStore(): OmcRdfStore {
  if (!globalRdfStore) {
    globalRdfStore = new OmcRdfStore();
  }
  return globalRdfStore;
}

export function resetRdfStore(): void {
  globalRdfStore = new OmcRdfStore();
}
