import { PoolClient } from "pg";

// Migration queries for creating database tables
export const migrations = {
  // Create users table
  createUsersTable: async (client: PoolClient) => {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        is_verified BOOLEAN DEFAULT FALSE,
        verification_token VARCHAR(255),
        verification_expires TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
  },

  // Create user_profiles table
  createUserProfilesTable: async (client: PoolClient) => {
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_profiles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        bio TEXT,
        skills TEXT[],
        experience_level VARCHAR(50),
        location VARCHAR(255),
        website VARCHAR(255),
        github_url VARCHAR(255),
        linkedin_url VARCHAR(255),
        avatar_url VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
  },

  // Create projects table
  //createProjectsTable: async (client: PoolClient) => {
  //  await client.query(`
  //    CREATE TABLE IF NOT EXISTS projects (
  //      id SERIAL PRIMARY KEY,
  //     user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  //title VARCHAR(255) NOT NULL,
  //     description TEXT,
  //     technologies TEXT[],
  //      github_url VARCHAR(255),
  //     live_url VARCHAR(255),
  //     image_url VARCHAR(255),
  //     is_featured BOOLEAN DEFAULT FALSE,
  //     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  //     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  //   );
  // `);
  // },

  // Create connections table (for networking)
  //createConnectionsTable: async (client: PoolClient) => {
  //   await client.query(`
  //    CREATE TABLE IF NOT EXISTS connections (
  //     id SERIAL PRIMARY KEY,
  //     requester_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  //     recipient_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  //     status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  //      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  //     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  //     UNIQUE(requester_id, recipient_id)
  //   );
  // `);
  // },

  // Create messages table
  createMessagesTable: async (client: PoolClient) => {
    await client.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        recipient_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
  },

  // Create skills table
  createSkillsTable: async (client: PoolClient) => {
    await client.query(`
      CREATE TABLE IF NOT EXISTS skills (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        category VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
  },

  // Create user_skills table (many-to-many relationship)
  createUserSkillsTable: async (client: PoolClient) => {
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_skills (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        skill_id INTEGER REFERENCES skills(id) ON DELETE CASCADE,
        proficiency_level VARCHAR(20) DEFAULT 'beginner' CHECK (proficiency_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, skill_id)
      );
    `);
  },
};

// Seed data for initial setup
export const seedData = {
  // Insert default skills
  insertDefaultSkills: async (client: PoolClient) => {
    await client.query(`
      INSERT INTO skills (name, category) VALUES
        ('JavaScript', 'Programming'),
        ('TypeScript', 'Programming'),
        ('React', 'Frontend'),
        ('Node.js', 'Backend'),
        ('Python', 'Programming'),
        ('Java', 'Programming'),
        ('C++', 'Programming'),
        ('SQL', 'Database'),
        ('MongoDB', 'Database'),
        ('AWS', 'Cloud'),
        ('Docker', 'DevOps'),
        ('Git', 'Version Control'),
        ('HTML', 'Frontend'),
        ('CSS', 'Frontend'),
        ('Vue.js', 'Frontend'),
        ('Angular', 'Frontend'),
        ('Express.js', 'Backend'),
        ('Django', 'Backend'),
        ('Flask', 'Backend'),
        ('PostgreSQL', 'Database')
      ON CONFLICT (name) DO NOTHING;
    `);
  },
};

// Run all migrations
export const runMigrations = async (client: PoolClient) => {
  console.log("🔄 Running database migrations...");

  try {
    // Create tables in order (respecting foreign key dependencies)
    await migrations.createUsersTable(client);
    console.log("✅ Users table created");

    await migrations.createUserProfilesTable(client);
    console.log("✅ User profiles table created");

    //await migrations.createProjectsTable(client);
    //console.log("✅ Projects table created");

    // await migrations.createConnectionsTable(client);
    //console.log("✅ Connections table created");

    await migrations.createMessagesTable(client);
    console.log("✅ Messages table created");

    await migrations.createSkillsTable(client);
    console.log("✅ Skills table created");

    await migrations.createUserSkillsTable(client);
    console.log("✅ User skills table created");

    // Insert seed data
    await seedData.insertDefaultSkills(client);
    console.log("✅ Default skills inserted");

    console.log("✅ All migrations completed successfully");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  }
};
