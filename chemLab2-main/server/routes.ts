import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserProgressSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health/ping endpoint for Vite HMR clients behind certain proxies
  app.get("/__vite_ping", (_req, res) => {
    res.status(200).end("pong");
  });

  // Get all experiments
  app.get("/api/experiments", async (req, res) => {
    try {
      const experiments = await storage.getAllExperiments();
      res.json(experiments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch experiments" });
    }
  });

  // Get specific experiment
  app.get("/api/experiments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid experiment ID" });
      }

      const experiment = await storage.getExperiment(id);
      if (!experiment) {
        return res.status(404).json({ message: "Experiment not found" });
      }

      res.json(experiment);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch experiment" });
    }
  });

  // Get user progress for all experiments
  app.get("/api/progress/:userId", async (req, res) => {
    try {
      const userId = req.params.userId;
      const progress = await storage.getAllUserProgress(userId);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user progress" });
    }
  });

  // Get user progress for specific experiment
  app.get("/api/progress/:userId/:experimentId", async (req, res) => {
    try {
      const userId = req.params.userId;
      const experimentId = parseInt(req.params.experimentId);
      
      if (isNaN(experimentId)) {
        return res.status(400).json({ message: "Invalid experiment ID" });
      }

      const progress = await storage.getUserProgress(userId, experimentId);
      res.json(progress || null);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch progress" });
    }
  });

  // Update user progress
  app.post("/api/progress", async (req, res) => {
    try {
      const progressData = insertUserProgressSchema.parse(req.body);
      const progress = await storage.updateUserProgress(progressData);
      res.json(progress);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid progress data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update progress" });
    }
  });

  // Get platform stats
  app.get("/api/stats", async (req, res) => {
    try {
      const experiments = await storage.getAllExperiments();
      const stats = {
        experiments: experiments.length,
        students: 2543, // Mock data for demo
        completed: 15678, // Mock data for demo
        rating: 4.9 // Mock data for demo
      };
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Proxy and return an image from a remote URL to avoid CORS when processing in browser
  app.get('/api/proxy-image', async (req, res) => {
    const url = String(req.query.url || '');
    if (!url) return res.status(400).json({ message: 'Missing url parameter' });

    try {
      const parsed = new URL(url);
      if (!/^https?:$/.test(parsed.protocol)) {
        return res.status(400).json({ message: 'Invalid URL protocol' });
      }

      const allowedHost = parsed.hostname.endsWith('builder.io') || parsed.hostname.endsWith('cdn.builder.io');
      // For safety, allow builder.io host or cdn.builder.io only
      if (!allowedHost) {
        return res.status(403).json({ message: 'Host not allowed' });
      }

      const resp = await fetch(parsed.toString());
      if (!resp.ok) return res.status(502).json({ message: 'Failed to fetch remote image' });
      const contentType = resp.headers.get('content-type') || 'image/png';
      const arrayBuffer = await resp.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      res.set('Content-Type', contentType);
      res.set('Cache-Control', 'public, max-age=86400');
      res.send(buffer);
    } catch (e) {
      res.status(500).json({ message: 'Failed to proxy image' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
