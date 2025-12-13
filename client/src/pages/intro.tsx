/**
 * @fileoverview Landing Page - Project Aescher Private Beta
 * 
 * The private beta launch page for project_aescher - where knowledge builds production.
 * Introduces users to the intelligent production management platform.
 */

import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Sparkles, Network, Zap, Shield, Database, Building2, MapPin, Wrench } from "lucide-react";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";

const heroImage = "/hero-background.jpg";

const ParticipantIcon = ({ className }: { className?: string }) => (
  <svg viewBox="1620.35 1648.8 159.848 148.03" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path 
      d="M 1627.367 1731.241 C 1624.541 1726.171 1624.541 1720 1627.367 1714.93 L 1656.794 1662.124 C 1659.602 1657.091 1664.914 1653.972 1670.677 1653.974 L 1729.057 1653.974 C 1734.822 1653.974 1740.135 1657.097 1742.94 1662.134 L 1772.368 1714.93 C 1775.19 1719.997 1775.19 1726.164 1772.368 1731.231 L 1742.94 1784.018 C 1740.135 1789.055 1734.822 1792.178 1729.057 1792.178 L 1670.668 1792.178 C 1664.906 1792.175 1659.597 1789.052 1656.794 1784.018 L 1627.367 1731.241 Z" 
      stroke="currentColor" 
      strokeWidth="4" 
      fill="currentColor" 
    />
  </svg>
);

const TaskIcon = ({ className }: { className?: string }) => (
  <svg viewBox="1.899 2.2 199.771 141.894" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path 
      d="M 10.465 7.129 L 60.101 12.194 C 67.426 12.944 74.756 13.631 82.092 14.257 L 132.806 18.567 C 140.149 19.189 147.477 19.966 154.788 20.896 L 181.355 24.285 C 187.614 25.086 192.305 30.408 192.314 36.717 L 192.36 108.639 C 192.366 114.919 187.62 120.185 181.374 120.832 L 19.167 137.749 C 13.34 138.339 8.303 133.714 8.393 127.858 L 8.743 107.755 L 10.465 7.129 Z" 
      strokeWidth="4" 
      fill="currentColor" 
      stroke="currentColor"
    />
  </svg>
);

const AssetIcon = ({ className }: { className?: string }) => (
  <svg viewBox="1545.36 1648.8 149.92 149.93" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path 
      d="M 1550.154 1666.405 C 1550.154 1660.29 1555.112 1655.332 1561.228 1655.332 L 1677.428 1655.332 C 1683.543 1655.332 1688.501 1660.29 1688.501 1666.405 L 1688.501 1782.614 C 1688.501 1788.73 1683.543 1793.688 1677.428 1793.688 L 1561.228 1793.688 C 1555.112 1793.688 1550.154 1788.73 1550.154 1782.614 L 1550.154 1666.405 Z" 
      stroke="currentColor" 
      strokeWidth="4" 
      fill="currentColor"
    />
  </svg>
);

const ContextIcon = ({ className }: { className?: string }) => (
  <svg viewBox="1375.27 1509.47 150 150" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path 
      d="M 1517.343 1583.172 C 1517.343 1621.099 1486.602 1651.831 1448.684 1651.831 C 1410.767 1651.831 1380.026 1621.099 1380.026 1583.172 C 1380.026 1545.255 1410.767 1514.514 1448.684 1514.514 C 1486.602 1514.514 1517.343 1545.255 1517.343 1583.172 Z" 
      strokeWidth="4" 
      stroke="currentColor"
      fill="currentColor"
    />
  </svg>
);

const InfrastructureIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 264.57 149.92" xmlns="http://www.w3.org/2000/svg" className={className} fill="currentColor">
    <path d="M 207.698 5.208 C 234.978 5.208 257.087 36.529 257.087 75.167 C 257.087 113.805 234.968 145.126 207.698 145.126 L 59.538 145.126 C 32.286 145.126 10.167 113.805 10.167 75.167 C 10.167 36.529 32.286 5.208 59.538 5.208 L 207.698 5.208 Z" strokeWidth="4" stroke="currentColor"/>
  </svg>
);

const CreativeWorkIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 46.35 45.5" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path 
      fill="currentColor" 
      stroke="currentColor"
      strokeWidth="0.5"
      d="M36,22.17a33.27,33.27,0,0,1-9.67-3.41,12.62,12.62,0,0,0,.07-4.63Q24.49,3.3,24.49,3.29A33,33,0,0,1,14,7.17a32.91,32.91,0,0,1-11.18,0S3.46,10.73,4.73,18c1.62,9.19,13.61,13.84,13.61,13.84a30.66,30.66,0,0,0,6.2-8c-.26,1.48-.57,3.25-.94,5.33C22,38.32,31.66,46.79,31.66,46.79s12-4.65,13.61-13.84q1.9-10.83,1.91-10.83A32.91,32.91,0,0,1,36,22.17Z" 
      transform="translate(-1.82 -2.3)"
    />
  </svg>
);

export default function Intro() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#CEECF2]/30 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="https://www.me-dmz.com" target="_blank" rel="noopener noreferrer" className="block">
              <Logo className="h-8 w-auto dark:hidden" variant="light" />
              <Logo className="h-8 w-auto hidden dark:block" variant="dark" />
            </a>
            <span className="text-muted-foreground">|</span>
            <h1 className="text-lg font-light text-foreground tracking-wide">
              project_<span className="italic font-medium text-violet-600 dark:text-violet-400">aescher</span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/builder">
              <Button data-testid="button-access-beta" className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white border-0 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all duration-300">
                Access Beta
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative min-h-[80vh] flex items-center">
          <img 
            src={heroImage} 
            alt="" 
            className="absolute inset-0 w-full h-full object-cover opacity-20 dark:opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/50 via-white/80 to-white dark:from-slate-950/50 dark:via-slate-900/80 dark:to-slate-950" />
          <div className="relative container mx-auto px-6 py-24">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-4 py-2 mb-8">
                <Sparkles className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                <span className="text-sm text-violet-700 dark:text-violet-300 font-medium">Private Beta</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-light text-foreground mb-4 tracking-tight">
                project_<span className="italic font-medium bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-400 dark:to-indigo-400 bg-clip-text text-transparent">aescher</span>
              </h1>
              
              <p className="text-2xl md:text-3xl text-muted-foreground font-light">
                Where productions build knowledge
              </p>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-muted/50">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-light text-foreground mb-4">
                Intelligence at every step
              </h2>
              <p className="text-lg text-muted-foreground">
                A unified knowledge system for modern production workflows.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              <Card className="bg-card border-border hover:border-violet-500/30 transition-all duration-300 hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-violet-500/10 rounded-xl flex items-center justify-center mb-4">
                    <Database className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Industry Knowledge Foundation</h3>
                  <p className="text-sm text-muted-foreground">
                    Pre-loaded with 100K+ organizations, locations, and tools from ME-NEXUS—start building, not typing.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-card border-border hover:border-violet-500/30 transition-all duration-300 hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center mb-4">
                    <Network className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Connected Workflows</h3>
                  <p className="text-sm text-muted-foreground">
                    One production graph. Export to ShotGrid, ftrack, Frame.io, Aspera, and any OMC-compatible tool.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-card border-border hover:border-violet-500/30 transition-all duration-300 hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4">
                    <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Real-time Coordination</h3>
                  <p className="text-sm text-muted-foreground">
                    Changes propagate across your entire production ecosystem—everyone works from the same truth.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-card border-border hover:border-violet-500/30 transition-all duration-300 hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-4">
                    <Shield className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Built on Standards</h3>
                  <p className="text-sm text-muted-foreground">
                    MovieLabs OMC v2.8 ensures your production knowledge works with every major industry tool.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* ME-NEXUS Section */}
        <section className="py-24 bg-background">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <Badge variant="secondary" className="mb-4 bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/20">
                  Entertainment Industry DaaS
                </Badge>
                <h2 className="text-3xl md:text-4xl font-light text-foreground mb-4">
                  Pre-loaded with ME-NEXUS intelligence
                </h2>
              </div>
              
              <div className="grid md:grid-cols-4 gap-6 mb-12">
                <div className="text-center p-6 bg-muted/50 rounded-xl border border-border">
                  <Building2 className="h-8 w-8 text-violet-600 dark:text-violet-400 mx-auto mb-3" />
                  <div className="text-3xl font-bold text-foreground mb-1">100,000+</div>
                  <div className="text-sm text-muted-foreground">Organizations</div>
                </div>
                <div className="text-center p-6 bg-muted/50 rounded-xl border border-border">
                  <MapPin className="h-8 w-8 text-indigo-600 dark:text-indigo-400 mx-auto mb-3" />
                  <div className="text-3xl font-bold text-foreground mb-1">35,000+</div>
                  <div className="text-sm text-muted-foreground">Locations</div>
                </div>
                <div className="text-center p-6 bg-muted/50 rounded-xl border border-border">
                  <Wrench className="h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto mb-3" />
                  <div className="text-3xl font-bold text-foreground mb-1">300+</div>
                  <div className="text-sm text-muted-foreground">Infrastructure Tools</div>
                </div>
                <div className="text-center p-6 bg-muted/50 rounded-xl border border-border">
                  <Sparkles className="h-8 w-8 text-emerald-600 dark:text-emerald-400 mx-auto mb-3" />
                  <div className="text-3xl font-bold text-foreground mb-1">Day One</div>
                  <div className="text-sm text-muted-foreground">Ready to Use</div>
                </div>
              </div>
              
              <div className="bg-muted/30 rounded-xl p-6 border border-border">
                <p className="text-center text-muted-foreground">
                  <span className="font-semibold text-foreground">The advantage:</span> Search "ILM" and get 15+ global locations, service taxonomy, and org relationships instantly. No manual data entry.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 2030 Vision Section */}
        <section className="py-24 bg-muted/30 border-t border-border">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center">
              <img 
                src="https://movielabs.com/wp-content/uploads/2023/06/2030_vision_logo_tm.png" 
                alt="MovieLabs 2030 Vision" 
                className="h-32 md:h-40 mx-auto mb-8"
                data-testid="img-movielabs-logo"
              />
              <h2 className="text-3xl md:text-4xl font-light text-foreground mb-6">
                Aligned with the 2030 Vision
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                Built on MovieLabs' principles for software-defined workflows, semantic interoperability, and intelligent automation.
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
                <span className="px-4 py-2 bg-muted rounded-full border border-border">Software-Defined Workflows</span>
                <span className="px-4 py-2 bg-muted rounded-full border border-border">Cloud-Native Production</span>
                <span className="px-4 py-2 bg-muted rounded-full border border-border">Semantic Interoperability</span>
              </div>
            </div>
          </div>
        </section>

        {/* OMC Foundation Section */}
        <section className="py-24 bg-background border-t border-border">
          <div className="container mx-auto px-6">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-light text-foreground mb-4">
                  Powered by OMC
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  The production knowledge standard that connects every tool in your pipeline.
                </p>
              </div>
              
              <div className="mb-12">
                <h3 className="text-center text-sm font-medium text-muted-foreground uppercase tracking-wider mb-6">What you can model</h3>
                <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <div className="bg-card border border-border rounded-xl p-4 text-center hover:border-violet-500/30 transition-all">
                    <div className="w-10 h-10 bg-[#232073]/10 dark:bg-violet-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                      <ParticipantIcon className="h-5 w-5 text-[#232073] dark:text-violet-400" />
                    </div>
                    <h4 className="font-medium text-foreground text-sm">Participants</h4>
                    <p className="text-xs text-muted-foreground mt-1">People & Organizations</p>
                  </div>
                  
                  <div className="bg-card border border-border rounded-xl p-4 text-center hover:border-violet-500/30 transition-all">
                    <div className="w-10 h-10 bg-green-500/10 dark:bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                      <TaskIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <h4 className="font-medium text-foreground text-sm">Tasks</h4>
                    <p className="text-xs text-muted-foreground mt-1">Work Activities</p>
                  </div>
                  
                  <div className="bg-card border border-border rounded-xl p-4 text-center hover:border-violet-500/30 transition-all">
                    <div className="w-10 h-10 bg-orange-500/10 dark:bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                      <AssetIcon className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <h4 className="font-medium text-foreground text-sm">Assets</h4>
                    <p className="text-xs text-muted-foreground mt-1">Digital & Physical Media</p>
                  </div>
                  
                  <div className="bg-card border border-border rounded-xl p-4 text-center hover:border-violet-500/30 transition-all">
                    <div className="w-10 h-10 bg-yellow-500/10 dark:bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                      <ContextIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <h4 className="font-medium text-foreground text-sm">Contexts</h4>
                    <p className="text-xs text-muted-foreground mt-1">Workflow Groupings</p>
                  </div>
                  
                  <div className="bg-card border border-border rounded-xl p-4 text-center hover:border-violet-500/30 transition-all">
                    <div className="w-10 h-10 bg-blue-500/10 dark:bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                      <InfrastructureIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h4 className="font-medium text-foreground text-sm">Infrastructure</h4>
                    <p className="text-xs text-muted-foreground mt-1">Software & Equipment</p>
                  </div>
                  
                  <div className="bg-card border border-border rounded-xl p-4 text-center hover:border-violet-500/30 transition-all">
                    <div className="w-10 h-10 bg-purple-500/10 dark:bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                      <CreativeWorkIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h4 className="font-medium text-foreground text-sm">Creative Works</h4>
                    <p className="text-xs text-muted-foreground mt-1">Shows & Episodes</p>
                  </div>
                </div>
              </div>
              
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-gradient-to-r from-violet-600/10 to-indigo-600/10 dark:from-violet-900/20 dark:to-indigo-900/20 border-t border-border">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-light text-foreground mb-4">
              Ready to build production knowledge?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join the private beta and experience the future of connected production workflows.
            </p>
            <Link href="/builder">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white border-0 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all duration-300 text-lg px-8"
                data-testid="button-get-started"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-muted/30 py-8">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <a href="https://www.me-dmz.com" target="_blank" rel="noopener noreferrer">
                <Logo className="h-6 w-auto dark:hidden" variant="light" />
                <Logo className="h-6 w-auto hidden dark:block" variant="dark" />
              </a>
              <span className="text-sm text-muted-foreground">
                project_<span className="italic">aescher</span> — Where productions build knowledge
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Built on MovieLabs OMC v2.8</span>
              <span className="hidden md:inline">|</span>
              <span>Powered by ME-NEXUS</span>
              <span className="hidden md:inline">|</span>
              <span>Private Beta</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
