import { db } from "./db";
import {
  profile, skills, projects, socials,
  type Profile, type InsertProfile,
  type Skill, type InsertSkill,
  type Project, type InsertProject,
  type Social, type InsertSocial
} from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Profile
  getProfile(): Promise<Profile | undefined>;
  updateProfile(profile: InsertProfile): Promise<Profile>;
  createProfile(profile: InsertProfile): Promise<Profile>;

  // Skills
  getSkills(): Promise<Skill[]>;
  getSkill(id: number): Promise<Skill | undefined>;
  createSkill(skill: InsertSkill): Promise<Skill>;
  updateSkill(id: number, skill: Partial<InsertSkill>): Promise<Skill>;
  deleteSkill(id: number): Promise<void>;

  // Projects
  getProjects(): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<InsertProject>): Promise<Project>;
  deleteProject(id: number): Promise<void>;

  // Socials
  getSocials(): Promise<Social[]>;
  getSocial(id: number): Promise<Social | undefined>;
  createSocial(social: InsertSocial): Promise<Social>;
  updateSocial(id: number, social: Partial<InsertSocial>): Promise<Social>;
  deleteSocial(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Profile
  async getProfile(): Promise<Profile | undefined> {
    const [p] = await db.select().from(profile).limit(1);
    return p;
  }

  async createProfile(insertProfile: InsertProfile): Promise<Profile> {
    const [p] = await db.insert(profile).values(insertProfile).returning();
    return p;
  }

  async updateProfile(insertProfile: InsertProfile): Promise<Profile> {
    // Check if profile exists
    const existing = await this.getProfile();
    if (!existing) {
      return this.createProfile(insertProfile);
    }
    const [p] = await db.update(profile)
      .set(insertProfile)
      .where(eq(profile.id, existing.id))
      .returning();
    return p;
  }

  // Skills
  async getSkills(): Promise<Skill[]> {
    return await db.select().from(skills);
  }

  async getSkill(id: number): Promise<Skill | undefined> {
    const [s] = await db.select().from(skills).where(eq(skills.id, id));
    return s;
  }

  async createSkill(insertSkill: InsertSkill): Promise<Skill> {
    const [s] = await db.insert(skills).values(insertSkill).returning();
    return s;
  }

  async updateSkill(id: number, updates: Partial<InsertSkill>): Promise<Skill> {
    const [s] = await db.update(skills).set(updates).where(eq(skills.id, id)).returning();
    return s;
  }

  async deleteSkill(id: number): Promise<void> {
    await db.delete(skills).where(eq(skills.id, id));
  }

  // Projects
  async getProjects(): Promise<Project[]> {
    return await db.select().from(projects).orderBy(projects.displayOrder);
  }

  async getProject(id: number): Promise<Project | undefined> {
    const [p] = await db.select().from(projects).where(eq(projects.id, id));
    return p;
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const [p] = await db.insert(projects).values(insertProject).returning();
    return p;
  }

  async updateProject(id: number, updates: Partial<InsertProject>): Promise<Project> {
    const [p] = await db.update(projects).set(updates).where(eq(projects.id, id)).returning();
    return p;
  }

  async deleteProject(id: number): Promise<void> {
    await db.delete(projects).where(eq(projects.id, id));
  }

  // Socials
  async getSocials(): Promise<Social[]> {
    return await db.select().from(socials);
  }

  async getSocial(id: number): Promise<Social | undefined> {
    const [s] = await db.select().from(socials).where(eq(socials.id, id));
    return s;
  }

  async createSocial(insertSocial: InsertSocial): Promise<Social> {
    const [s] = await db.insert(socials).values(insertSocial).returning();
    return s;
  }

  async updateSocial(id: number, updates: Partial<InsertSocial>): Promise<Social> {
    const [s] = await db.update(socials).set(updates).where(eq(socials.id, id)).returning();
    return s;
  }

  async deleteSocial(id: number): Promise<void> {
    await db.delete(socials).where(eq(socials.id, id));
  }
}

export const storage = new DatabaseStorage();
