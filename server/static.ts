/**
 * @fileoverview Production Static File Server
 * 
 * Serves the pre-built React frontend in production mode.
 * Falls back to index.html for client-side routing support.
 * 
 * @usage
 * Only used when NODE_ENV === "production".
 * In development, Vite handles static file serving with HMR.
 */

import express, { type Express } from "express";
import fs from "fs";
import path from "path";

/**
 * Configures Express to serve static files from the build directory.
 * Implements SPA fallback routing (all routes serve index.html).
 * 
 * @param app - The Express application instance
 * @throws Error if the build directory doesn't exist
 */
export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
