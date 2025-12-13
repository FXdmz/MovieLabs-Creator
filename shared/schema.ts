/**
 * @fileoverview Shared Database Schema Definitions
 * 
 * Defines the PostgreSQL database schema using Drizzle ORM.
 * This file is shared between the server and client for type safety.
 * 
 * @note
 * The ME-DMZ Ontology Builder currently uses client-side state for
 * entity management. This schema provides a foundation for future
 * features like user authentication or project persistence.
 * 
 * @exports
 * - users: Drizzle table definition for user accounts
 * - insertUserSchema: Zod schema for validating user creation
 * - InsertUser: TypeScript type for user creation data
 * - User: TypeScript type for complete user records
 */

import { sql } from "drizzle-orm";
import { pgTable, text, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

/** Users table for authentication (future feature) */
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

/** Zod schema for validating user creation input */
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

/** Type for user creation data (excludes auto-generated id) */
export type InsertUser = z.infer<typeof insertUserSchema>;

/** Type for complete user records (includes all columns) */
export type User = typeof users.$inferSelect;
