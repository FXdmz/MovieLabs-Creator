import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // MovieLabs OMC Validator API proxy
  app.post("/api/validate/movielabs", async (req, res) => {
    try {
      const entityData = req.body;
      
      if (!entityData || typeof entityData !== 'object') {
        return res.status(400).json({ 
          success: false, 
          source: 'server',
          error: "Invalid request body" 
        });
      }

      // MovieLabs API expects multipart/form-data with file upload
      const jsonContent = JSON.stringify(entityData, null, 2);
      
      // Create multipart form boundary
      const boundary = '----FormBoundary' + Math.random().toString(36).substring(2);
      const body = [
        `--${boundary}`,
        'Content-Disposition: form-data; name="file"; filename="entity.json"',
        'Content-Type: application/json',
        '',
        jsonContent,
        `--${boundary}--`
      ].join('\r\n');

      // Call the official MovieLabs validator API at /api/check
      const response = await fetch('https://omc-validator.mc.movielabs.com/api/check', {
        method: 'POST',
        headers: {
          'Content-Type': `multipart/form-data; boundary=${boundary}`
        },
        body: body
      });

      // Handle non-OK responses (4xx, 5xx)
      if (!response.ok) {
        console.error("MovieLabs validator returned HTTP", response.status);
        return res.json({ 
          success: false, 
          source: 'server',
          error: `MovieLabs validator returned HTTP ${response.status}`,
          fallbackToLocal: true
        });
      }

      // Safely parse JSON response
      let validationResult;
      try {
        const responseText = await response.text();
        validationResult = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Failed to parse MovieLabs response as JSON:", parseError);
        return res.json({ 
          success: false, 
          source: 'server',
          error: "MovieLabs validator returned invalid JSON",
          fallbackToLocal: true
        });
      }
      
      res.json({
        success: true,
        source: 'movielabs',
        status: response.status,
        result: validationResult
      });
    } catch (error) {
      console.error("MovieLabs validator error:", error);
      res.json({ 
        success: false, 
        source: 'server',
        error: "Failed to reach MovieLabs validator. Using local validation as fallback.",
        fallbackToLocal: true
      });
    }
  });

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
