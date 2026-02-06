import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedPasswordBuf = Buffer.from(hashed, "hex");
  const suppliedPasswordBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedPasswordBuf, suppliedPasswordBuf);
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Auth Setup
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "default_secret",
      resave: false,
      saveUninitialized: false,
      cookie: { secure: process.env.NODE_ENV === "production" },
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) return done(null, false);
        const isValid = await comparePasswords(password, user.password);
        if (!isValid) return done(null, false);
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );

  passport.serializeUser((user: any, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  const requireAuth = (req: any, res: any, next: any) => {
    if (req.isAuthenticated()) return next();
    res.status(401).json({ message: "Unauthorized" });
  };

  // Auth Routes
  app.post(api.auth.login.path, passport.authenticate("local"), (req, res) => {
    res.json(req.user);
  });

  app.post(api.auth.logout.path, (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get(api.auth.me.path, (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });

  // Profile Routes
  app.get(api.profile.get.path, async (req, res) => {
    const profile = await storage.getProfile();
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    res.json(profile);
  });

  app.put(api.profile.update.path, requireAuth, async (req, res) => {
    try {
      const input = api.profile.update.input.parse(req.body);
      const updated = await storage.updateProfile(input);
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json(err);
      throw err;
    }
  });

  // Skills Routes
  app.get(api.skills.list.path, async (req, res) => {
    const skills = await storage.getSkills();
    res.json(skills);
  });

  app.post(api.skills.create.path, requireAuth, async (req, res) => {
    try {
      const input = api.skills.create.input.parse(req.body);
      const skill = await storage.createSkill(input);
      res.status(201).json(skill);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json(err);
      throw err;
    }
  });

  app.put(api.skills.update.path, requireAuth, async (req, res) => {
    try {
      const input = api.skills.update.input.parse(req.body);
      const skill = await storage.updateSkill(Number(req.params.id), input);
      if (!skill) return res.status(404).send();
      res.json(skill);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json(err);
      throw err;
    }
  });

  app.delete(api.skills.delete.path, requireAuth, async (req, res) => {
    await storage.deleteSkill(Number(req.params.id));
    res.sendStatus(204);
  });

  // Projects Routes
  app.get(api.projects.list.path, async (req, res) => {
    const projects = await storage.getProjects();
    res.json(projects);
  });

  app.post(api.projects.create.path, requireAuth, async (req, res) => {
    try {
      const input = api.projects.create.input.parse(req.body);
      const project = await storage.createProject(input);
      res.status(201).json(project);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json(err);
      throw err;
    }
  });

  app.put(api.projects.update.path, requireAuth, async (req, res) => {
    try {
      const input = api.projects.update.input.parse(req.body);
      const project = await storage.updateProject(Number(req.params.id), input);
      if (!project) return res.status(404).send();
      res.json(project);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json(err);
      throw err;
    }
  });

  app.delete(api.projects.delete.path, requireAuth, async (req, res) => {
    await storage.deleteProject(Number(req.params.id));
    res.sendStatus(204);
  });

  // Socials Routes
  app.get(api.socials.list.path, async (req, res) => {
    const socials = await storage.getSocials();
    res.json(socials);
  });

  app.post(api.socials.create.path, requireAuth, async (req, res) => {
    try {
      const input = api.socials.create.input.parse(req.body);
      const social = await storage.createSocial(input);
      res.status(201).json(social);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json(err);
      throw err;
    }
  });

  app.put(api.socials.update.path, requireAuth, async (req, res) => {
    try {
      const input = api.socials.update.input.parse(req.body);
      const social = await storage.updateSocial(Number(req.params.id), input);
      if (!social) return res.status(404).send();
      res.json(social);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json(err);
      throw err;
    }
  });

  app.delete(api.socials.delete.path, requireAuth, async (req, res) => {
    await storage.deleteSocial(Number(req.params.id));
    res.sendStatus(204);
  });

  // Seed Data
  if (await storage.getUserByUsername("admin") === undefined) {
    const hashedPassword = await hashPassword("admin123");
    await storage.createUser({ username: "admin", password: hashedPassword });
    
    // Seed Profile
    await storage.createProfile({
      name: "Jane Doe",
      bio: "Full Stack Developer passionate about building accessible and performant web applications.",
      tagline: "Building digital experiences that matter.",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200",
      resumeUrl: "#"
    });

    // Seed Skills
    await storage.createSkill({ name: "React", category: "frontend", proficiency: 95 });
    await storage.createSkill({ name: "Node.js", category: "backend", proficiency: 90 });
    await storage.createSkill({ name: "TypeScript", category: "frontend", proficiency: 90 });
    await storage.createSkill({ name: "PostgreSQL", category: "backend", proficiency: 85 });
    
    // Seed Projects
    await storage.createProject({
      title: "E-Commerce Dashboard",
      description: "A comprehensive dashboard for managing online stores with real-time analytics.",
      imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=500",
      projectUrl: "#",
      repoUrl: "#",
      techStack: ["React", "TypeScript", "Tailwind"],
      displayOrder: 1
    });

    await storage.createProject({
      title: "Task Management App",
      description: "Collaborative task manager with drag-and-drop support and team features.",
      imageUrl: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&q=80&w=500",
      projectUrl: "#",
      repoUrl: "#",
      techStack: ["Vue", "Firebase"],
      displayOrder: 2
    });

    // Seed Socials
    await storage.createSocial({ platform: "GitHub", url: "https://github.com", icon: "Github" });
    await storage.createSocial({ platform: "LinkedIn", url: "https://linkedin.com", icon: "Linkedin" });
    await storage.createSocial({ platform: "Twitter", url: "https://twitter.com", icon: "Twitter" });
    await storage.createSocial({ platform: "Email", url: "mailto:hello@example.com", icon: "Mail" });
  }

  return httpServer;
}
