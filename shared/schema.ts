import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users (for Admin)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// Personal Information
export const profile = pgTable("profile", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  bio: text("bio").notNull(),
  tagline: text("tagline").notNull(),
  avatarUrl: text("avatar_url"),
  resumeUrl: text("resume_url"),
});

// Skills
export const skills = pgTable("skills", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(), // 'frontend', 'backend', 'tool', 'soft'
  proficiency: integer("proficiency").default(100),
  icon: text("icon"), // lucide icon name
});

// Projects
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
  projectUrl: text("project_url"),
  repoUrl: text("repo_url"),
  techStack: text("tech_stack").array(), // Array of strings
  displayOrder: integer("display_order").default(0),
});

// Social Links / Contact
export const socials = pgTable("socials", {
  id: serial("id").primaryKey(),
  platform: text("platform").notNull(), // 'github', 'linkedin', 'twitter', 'email'
  url: text("url").notNull(),
  icon: text("icon"), // lucide icon name
  active: boolean("active").default(true),
});

// Zod Schemas
export const insertUserSchema = createInsertSchema(users);
export const insertProfileSchema = createInsertSchema(profile).omit({ id: true });
export const insertSkillSchema = createInsertSchema(skills).omit({ id: true });
export const insertProjectSchema = createInsertSchema(projects).omit({ id: true });
export const insertSocialSchema = createInsertSchema(socials).omit({ id: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Profile = typeof profile.$inferSelect;
export type InsertProfile = z.infer<typeof insertProfileSchema>;

export type Skill = typeof skills.$inferSelect;
export type InsertSkill = z.infer<typeof insertSkillSchema>;

export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;

export type Social = typeof socials.$inferSelect;
export type InsertSocial = z.infer<typeof insertSocialSchema>;
