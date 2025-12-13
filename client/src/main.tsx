/**
 * @fileoverview Application Entry Point
 * 
 * Mounts the React application to the DOM.
 * This is the first JavaScript file executed by the browser.
 * 
 * @bootstrap
 * 1. Imports global CSS styles
 * 2. Creates React root on #root element
 * 3. Renders the App component
 */

import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
