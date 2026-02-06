import type { Express } from "express";
import { createServer, type Server } from "http";

export async function registerRoutes(app: Express): Promise<Server> {
  // Minimal Routes - Frontend handles data via Supabase Client
  const httpServer = createServer(app);
  return httpServer;
}
