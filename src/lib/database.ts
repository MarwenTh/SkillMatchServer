import { Pool } from "pg";
import dotenv from "dotenv";
import { runMigrations } from "./migrations";

dotenv.config();

// Database configuration
const databaseConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Required for NeonDB
  },
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
};

// Create a new pool instance
const pool = new Pool(databaseConfig);

// Test the database connection
const testConnection = async (): Promise<void> => {
  try {
    const client = await pool.connect();
    console.log("✅ Database connected successfully");
    client.release();
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    throw error;
  }
};

// Check if tables already exist
const checkTablesExist = async (): Promise<boolean> => {
  try {
    const client = await pool.connect();

    // Check if the users table exists (as a primary table)
    const result = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);

    client.release();
    return result.rows[0].exists;
  } catch (error) {
    console.error("❌ Error checking if tables exist:", error);
    return false;
  }
};

// Initialize database tables
const initializeDatabase = async (): Promise<void> => {
  try {
    const client = await pool.connect();

    // Check if tables already exist
    const tablesExist = await checkTablesExist();

    if (tablesExist) {
      console.log("✅ Database tables already exist, skipping migrations");
      client.release();
      return;
    }

    console.log("🔄 Tables don't exist, running migrations...");

    // Run all migrations
    await runMigrations(client);

    client.release();
    console.log("✅ Database tables initialized successfully");
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
    throw error;
  }
};

// Graceful shutdown
const closeDatabase = async (): Promise<void> => {
  try {
    await pool.end();
    console.log("✅ Database connection closed");
  } catch (error) {
    console.error("❌ Error closing database connection:", error);
  }
};

// Handle process termination
process.on("SIGINT", async () => {
  console.log("\n🔄 Shutting down gracefully...");
  await closeDatabase();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\n🔄 Shutting down gracefully...");
  await closeDatabase();
  process.exit(0);
});

export { pool, testConnection, initializeDatabase, closeDatabase };
