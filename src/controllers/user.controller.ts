import { Request, Response } from "express";
import { userQueries, profileQueries } from "../lib/db-utils";
import bcrypt from "bcrypt";
import crypto from "crypto";
import sendMails from "../services/mail.service";

// Register a new user
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Check if user already exists
    const existingUser = await userQueries.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await userQueries.createUser(
      email,
      passwordHash,
      firstName,
      lastName
    );

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Save verification token
    await userQueries.setVerificationToken(email, verificationToken, expiresAt);

    // Send verification email
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

    await sendMails({
      email,
      subject: "Verify Your SkillMatch Account",
      template: "verify-account",
      data: {
        name: firstName || email.split("@")[0],
        verificationUrl,
        websiteUrl: process.env.FRONTEND_URL,
        email,
      },
    });

    res.status(201).json({
      success: true,
      message:
        "User registered successfully. Please check your email to verify your account.",
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        isVerified: user.is_verified,
      },
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({
      success: false,
      message: "Failed to register user",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Verify user email
export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    // Find user by verification token
    const user = await userQueries.findByVerificationToken(token);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification token",
      });
    }

    // Update user verification status
    await userQueries.updateVerification(user.id, true, undefined);

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    console.error("Error verifying email:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify email",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Get user profile
export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);

    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const profile = await profileQueries.getProfileWithUser(userId);

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      profile: {
        id: profile.id,
        email: profile.email,
        firstName: profile.first_name,
        lastName: profile.last_name,
        isVerified: profile.is_verified,
        bio: profile.bio,
        skills: profile.skills,
        experienceLevel: profile.experience_level,
        location: profile.location,
        website: profile.website,
        githubUrl: profile.github_url,
        linkedinUrl: profile.linkedin_url,
        avatarUrl: profile.avatar_url,
        createdAt: profile.created_at,
        updatedAt: profile.updated_at,
      },
    });
  } catch (error) {
    console.error("Error getting user profile:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get user profile",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Update user profile
export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    const profileData = req.body;

    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    // Check if user exists
    const user = await userQueries.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update profile
    const updatedProfile = await profileQueries.upsertProfile(userId, {
      bio: profileData.bio,
      skills: profileData.skills,
      experienceLevel: profileData.experienceLevel,
      location: profileData.location,
      website: profileData.website,
      githubUrl: profileData.githubUrl,
      linkedinUrl: profileData.linkedinUrl,
      avatarUrl: profileData.avatarUrl,
    });

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      profile: updatedProfile,
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update user profile",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
