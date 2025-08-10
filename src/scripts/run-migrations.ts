#!/usr/bin/env ts-node

import dotenv from "dotenv";
import { pool } from "../lib/database";
import { runMigrations } from "../lib/migrations";

dotenv.config();

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

const runMigrationsScript = async () => {
  console.log("🚀 Starting database migrations...");

  try {
    // Test connection first
    const client = await pool.connect();
    console.log("✅ Database connected successfully");

    // Check if tables already exist
    const tablesExist = await checkTablesExist();

    if (tablesExist) {
      console.log("✅ Database tables already exist");

      // Check if --force flag is provided
      const forceFlag = process.argv.includes("--force");
      if (forceFlag) {
        console.log("🔄 Force flag detected, running migrations anyway...");
        await runMigrations(client);
        console.log("🎉 All migrations completed successfully!");
      } else {
        console.log(
          "💡 Use 'npm run migrate -- --force' to run migrations even if tables exist"
        );
        client.release();
        await pool.end();
        process.exit(0);
      }
    } else {
      console.log("🔄 Tables don't exist, running migrations...");
      await runMigrations(client);
      console.log("🎉 All migrations completed successfully!");
    }

    client.release();

    // Close the pool
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    await pool.end();
    process.exit(1);
  }
};

// Run the script
runMigrationsScript();
