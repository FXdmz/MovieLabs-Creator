/**
 * @fileoverview React Application Root Component
 * 
 * The main application component that sets up the React application context
 * including routing, theme management, and global providers.
 * 
 * @routes
 * - "/" → Intro (landing page)
 * - "/builder" → Dashboard (main ontology builder interface)
 * - Fallback → NotFound (404 page)
 * 
 * @providers
 * - ThemeProvider: Dark/light mode support with system preference detection
 * - QueryClientProvider: TanStack Query for server state management
 * - TooltipProvider: Radix UI tooltips throughout the app
 * - Toaster: Toast notifications for user feedback
 */

import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Intro from "@/pages/intro";
import Dashboard from "@/pages/dashboard";
import NotFound from "@/pages/not-found";

/** Client-side router using wouter for lightweight routing */
function Router() {
  return (
    <Switch>
      <Route path="/" component={Intro} />
      <Route path="/builder" component={Dashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

/** Root application component with all providers configured */
function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
