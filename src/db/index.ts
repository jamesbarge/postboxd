import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

/**
 * Database connection for Pictures
 *
 * Uses postgres.js driver with Drizzle ORM.
 * Connection string comes from environment variable.
 */

// Connection string from Supabase
const connectionString = process.env.DATABASE_URL;

// Create postgres client
// For serverless environments, we use connection pooling
// Fallback to dummy string if env (e.g. build time) is missing to prevent crash
const client = postgres(connectionString || "postgres://localhost:5432/postgres", {
  prepare: false, // Required for Supabase connection pooling (transaction mode)
  max: 1, // Limit connections in serverless
});

// Create Drizzle instance with schema
export const db = drizzle(client, { schema });

// Export schema for use in queries
export { schema };

// Type exports for convenience
export type Database = typeof db;
