import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Geoapify address autocomplete proxy (keeps API key secure on server)
  app.get("/api/geocode/autocomplete", async (req, res) => {
    try {
      const { text } = req.query;
      if (!text || typeof text !== 'string') {
        return res.status(400).json({ error: "Missing 'text' query parameter" });
      }

      const apiKey = process.env.GEOAPIFY_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "Geoapify API key not configured" });
      }

      const response = await fetch(
        `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(text)}&apiKey=${apiKey}&limit=5`
      );
      
      if (!response.ok) {
        return res.status(response.status).json({ error: "Geoapify API error" });
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Geocode autocomplete error:", error);
      res.status(500).json({ error: "Failed to fetch address suggestions" });
    }
  });

  return httpServer;
}
