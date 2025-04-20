import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertQuizResultSchema } from "@shared/schema";
import { ZodError } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Quiz results API
  app.post("/api/quiz-results", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const userId = req.user?.id;
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      // Validate quiz results
      const validatedData = insertQuizResultSchema.parse({
        ...req.body,
        userId,
      });

      // Save quiz result
      const result = await storage.saveQuizResult(validatedData);
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid quiz data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Error saving quiz result" });
      }
    }
  });

  // Get user's quiz results
  app.get("/api/quiz-results", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const userId = req.user?.id;
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      const results = await storage.getUserQuizResults(userId);
      res.json(results);
    } catch (error) {
      res.status(500).json({ message: "Error fetching quiz results" });
    }
  });

  // Get specific quiz result
  app.get("/api/quiz-results/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const resultId = parseInt(req.params.id);
      if (isNaN(resultId)) {
        return res.status(400).json({ message: "Invalid quiz result ID" });
      }

      const result = await storage.getQuizResultById(resultId);
      if (!result) {
        return res.status(404).json({ message: "Quiz result not found" });
      }

      // Check if the result belongs to the authenticated user
      if (result.userId !== req.user?.id) {
        return res.status(403).json({ message: "Not authorized to access this quiz result" });
      }

      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Error fetching quiz result" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
