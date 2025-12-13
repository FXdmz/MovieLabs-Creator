/**
 * @fileoverview Data Storage Layer
 * 
 * Provides an abstraction layer for data persistence operations.
 * Currently implements in-memory storage; can be extended to use
 * PostgreSQL with Drizzle ORM for production use.
 * 
 * @note
 * The ME-DMZ Ontology Builder primarily uses client-side Zustand state
 * for entity management. This storage layer is available for future
 * server-side persistence features like user accounts or saved projects.
 * 
 * @pattern Repository Pattern
 * The IStorage interface defines CRUD operations that can be implemented
 * by different backends (MemStorage, PostgresStorage, etc.).
 */

import { type User, type InsertUser } from "@shared/schema";
import { randomUUID } from "crypto";

/**
 * Storage interface defining available data operations.
 * Implement this interface for different storage backends.
 */
export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
}

/**
 * In-memory storage implementation.
 * Data is lost when the server restarts.
 * Suitable for development and stateless deployments.
 */
export class MemStorage implements IStorage {
  private users: Map<string, User>;

  constructor() {
    this.users = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
}

export const storage = new MemStorage();
