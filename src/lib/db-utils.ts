import { pool } from "./database";
import { PoolClient } from "pg";

// User-related queries
export const userQueries = {
  // Create a new user
  createUser: async (
    email: string,
    passwordHash: string,
    firstName?: string,
    lastName?: string
  ) => {
    const query = `
      INSERT INTO users (email, password, first_name, last_name)
      VALUES ($1, $2, $3, $4)
      RETURNING id, email, first_name, last_name, is_verified, created_at;
    `;
    const result = await pool.query(query, [
      email,
      passwordHash,
      firstName,
      lastName,
    ]);
    return result.rows[0];
  },

  // Find user by email
  findByEmail: async (email: string) => {
    const query = "SELECT * FROM users WHERE email = $1;";
    const result = await pool.query(query, [email]);
    return result.rows[0];
  },

  // Find user by ID
  findById: async (id: number) => {
    const query = "SELECT * FROM users WHERE id = $1;";
    const result = await pool.query(query, [id]);
    return result.rows[0];
  },

  // Update verification status
  updateVerification: async (
    userId: number,
    isVerified: boolean,
    token?: string
  ) => {
    const query = `
      UPDATE users 
      SET is_verified = $2, verification_token = $3, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, email, is_verified;
    `;
    const result = await pool.query(query, [userId, isVerified, token]);
    return result.rows[0];
  },

  // Set verification token
  setVerificationToken: async (
    email: string,
    token: string,
    expiresAt: Date
  ) => {
    const query = `
      UPDATE users 
      SET verification_token = $2, verification_expires = $3, updated_at = CURRENT_TIMESTAMP
      WHERE email = $1
      RETURNING id, email;
    `;
    const result = await pool.query(query, [email, token, expiresAt]);
    return result.rows[0];
  },

  // Find user by verification token
  findByVerificationToken: async (token: string) => {
    const query = `
      SELECT * FROM users 
      WHERE verification_token = $1 AND verification_expires > CURRENT_TIMESTAMP;
    `;
    const result = await pool.query(query, [token]);
    return result.rows[0];
  },
};

// Profile-related queries
export const profileQueries = {
  // Create or update user profile
  upsertProfile: async (
    userId: number,
    profileData: {
      bio?: string;
      skills?: string[];
      experienceLevel?: string;
      location?: string;
      website?: string;
      githubUrl?: string;
      linkedinUrl?: string;
      avatarUrl?: string;
    }
  ) => {
    const query = `
      INSERT INTO user_profiles (
        user_id, bio, skills, experience_level, location, website, 
        github_url, linkedin_url, avatar_url
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (user_id) DO UPDATE SET
        bio = EXCLUDED.bio,
        skills = EXCLUDED.skills,
        experience_level = EXCLUDED.experience_level,
        location = EXCLUDED.location,
        website = EXCLUDED.website,
        github_url = EXCLUDED.github_url,
        linkedin_url = EXCLUDED.linkedin_url,
        avatar_url = EXCLUDED.avatar_url,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;

    const values = [
      userId,
      profileData.bio,
      profileData.skills,
      profileData.experienceLevel,
      profileData.location,
      profileData.website,
      profileData.githubUrl,
      profileData.linkedinUrl,
      profileData.avatarUrl,
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  },

  // Get user profile with user data
  getProfileWithUser: async (userId: number) => {
    const query = `
      SELECT 
        u.id, u.email, u.first_name, u.last_name, u.is_verified, u.created_at,
        p.bio, p.skills, p.experience_level, p.location, p.website,
        p.github_url, p.linkedin_url, p.avatar_url, p.updated_at
      FROM users u
      LEFT JOIN user_profiles p ON u.id = p.user_id
      WHERE u.id = $1;
    `;
    const result = await pool.query(query, [userId]);
    return result.rows[0];
  },
};

// Skill-related queries
export const skillQueries = {
  // Get all skills
  getAllSkills: async () => {
    const query = "SELECT * FROM skills ORDER BY name;";
    const result = await pool.query(query);
    return result.rows;
  },

  // Get skills by category
  getSkillsByCategory: async (category: string) => {
    const query = "SELECT * FROM skills WHERE category = $1 ORDER BY name;";
    const result = await pool.query(query, [category]);
    return result.rows;
  },

  // Add skill to user
  addUserSkill: async (
    userId: number,
    skillId: number,
    proficiencyLevel: string = "beginner"
  ) => {
    const query = `
      INSERT INTO user_skills (user_id, skill_id, proficiency_level)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id, skill_id) DO UPDATE SET
        proficiency_level = EXCLUDED.proficiency_level,
        created_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;
    const result = await pool.query(query, [userId, skillId, proficiencyLevel]);
    return result.rows[0];
  },

  // Get user skills
  getUserSkills: async (userId: number) => {
    const query = `
      SELECT s.id, s.name, s.category, us.proficiency_level
      FROM user_skills us
      JOIN skills s ON us.skill_id = s.id
      WHERE us.user_id = $1
      ORDER BY s.name;
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
  },
};

// Project-related queries
export const projectQueries = {
  // Create project
  createProject: async (
    userId: number,
    projectData: {
      title: string;
      description?: string;
      technologies?: string[];
      githubUrl?: string;
      liveUrl?: string;
      imageUrl?: string;
      isFeatured?: boolean;
    }
  ) => {
    const query = `
      INSERT INTO projects (
        user_id, title, description, technologies, github_url, live_url, image_url, is_featured
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;

    const values = [
      userId,
      projectData.title,
      projectData.description,
      projectData.technologies,
      projectData.githubUrl,
      projectData.liveUrl,
      projectData.imageUrl,
      projectData.isFeatured || false,
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  },

  // Get user projects
  getUserProjects: async (userId: number) => {
    const query = `
      SELECT * FROM projects 
      WHERE user_id = $1 
      ORDER BY created_at DESC;
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
  },

  // Get featured projects
  getFeaturedProjects: async (limit: number = 10) => {
    const query = `
      SELECT p.*, u.first_name, u.last_name
      FROM projects p
      JOIN users u ON p.user_id = u.id
      WHERE p.is_featured = true
      ORDER BY p.created_at DESC
      LIMIT $1;
    `;
    const result = await pool.query(query, [limit]);
    return result.rows;
  },
};

// Connection-related queries
export const connectionQueries = {
  // Send connection request
  sendRequest: async (requesterId: number, recipientId: number) => {
    const query = `
      INSERT INTO connections (requester_id, recipient_id)
      VALUES ($1, $2)
      ON CONFLICT (requester_id, recipient_id) DO NOTHING
      RETURNING *;
    `;
    const result = await pool.query(query, [requesterId, recipientId]);
    return result.rows[0];
  },

  // Accept/reject connection
  updateConnectionStatus: async (
    connectionId: number,
    status: "accepted" | "rejected"
  ) => {
    const query = `
      UPDATE connections 
      SET status = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *;
    `;
    const result = await pool.query(query, [connectionId, status]);
    return result.rows[0];
  },

  // Get user connections
  getUserConnections: async (userId: number) => {
    const query = `
      SELECT 
        c.*,
        u1.first_name as requester_first_name, u1.last_name as requester_last_name,
        u2.first_name as recipient_first_name, u2.last_name as recipient_last_name
      FROM connections c
      JOIN users u1 ON c.requester_id = u1.id
      JOIN users u2 ON c.recipient_id = u2.id
      WHERE c.requester_id = $1 OR c.recipient_id = $1
      ORDER BY c.created_at DESC;
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
  },
};

// Utility function for transactions
export const withTransaction = async <T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
