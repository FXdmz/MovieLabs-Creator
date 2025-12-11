import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import * as mm from "music-metadata";
// pdf-parse uses CommonJS, we'll import it dynamically when needed

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 }
});

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

  // Asset metadata extraction endpoint
  app.post("/api/assets/metadata", upload.single('file'), async (req, res) => {
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({ error: "No file provided" });
      }

      const result: any = {
        fileName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype,
        provenance: {
          createdDate: null,
          modifiedDate: null,
          creator: null,
          source: null,
          software: null
        }
      };

      // Audio file extraction using music-metadata
      if (file.mimetype.startsWith('audio/') || file.mimetype.startsWith('video/')) {
        try {
          const metadata = await mm.parseBuffer(file.buffer, { mimeType: file.mimetype, size: file.size });
          result.duration = metadata.format.duration;
          result.sampleRate = metadata.format.sampleRate;
          result.bitRate = metadata.format.bitrate;
          result.channels = metadata.format.numberOfChannels;
          result.codec = metadata.format.codec;
          result.bitsPerSample = metadata.format.bitsPerSample;
          
          if (metadata.format.container) {
            result.container = metadata.format.container;
          }
          
          // For audio files, also extract common tags and provenance
          if (metadata.common) {
            result.title = metadata.common.title;
            result.artist = metadata.common.artist;
            result.album = metadata.common.album;
            
            // Extract provenance from audio metadata
            if (metadata.common.artist) {
              result.provenance.creator = metadata.common.artist;
            }
            if (metadata.common.encodersettings) {
              result.provenance.software = metadata.common.encodersettings;
            }
            if (metadata.common.date) {
              result.provenance.createdDate = metadata.common.date;
            }
          }
        } catch (mmError) {
          console.log("music-metadata extraction failed:", mmError);
        }
      }

      // PDF extraction
      if (file.mimetype === 'application/pdf') {
        try {
          const pdfModule = await import('pdf-parse');
          const pdfData = await pdfModule.default(file.buffer);
          result.pageCount = pdfData.numpages;
          result.pdfInfo = pdfData.info;
          
          // Extract provenance from PDF metadata
          if (pdfData.info) {
            if (pdfData.info.Author) {
              result.provenance.creator = pdfData.info.Author;
            }
            if (pdfData.info.Creator) {
              result.provenance.software = pdfData.info.Creator;
            }
            if (pdfData.info.CreationDate) {
              result.provenance.createdDate = pdfData.info.CreationDate;
            }
            if (pdfData.info.ModDate) {
              result.provenance.modifiedDate = pdfData.info.ModDate;
            }
          }
          
          // Check for script keywords in first 5000 characters
          const textSample = pdfData.text.substring(0, 5000).toUpperCase();
          const scriptKeywords = ['INT.', 'EXT.', 'FADE IN:', 'FADE OUT:', 'CUT TO:', 'DISSOLVE TO:'];
          const matchCount = scriptKeywords.filter(kw => textSample.includes(kw)).length;
          result.isLikelyScript = matchCount >= 2;
          result.scriptKeywordsFound = matchCount;
        } catch (pdfError) {
          console.log("pdf-parse extraction failed:", pdfError);
        }
      }

      res.json(result);
    } catch (error) {
      console.error("Metadata extraction error:", error);
      res.status(500).json({ error: "Failed to extract metadata" });
    }
  });

  return httpServer;
}
