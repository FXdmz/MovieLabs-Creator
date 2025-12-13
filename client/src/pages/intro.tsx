/**
 * @fileoverview Landing Page - Project Aescher Private Beta
 * 
 * The private beta launch page for project_aescher - the brain for production.
 * Introduces users to the intelligent production management platform.
 * 
 * @sections
 * - Hero: Project Aescher branding with private beta messaging
 * - Features: Core capabilities of the production brain
 * - 2030 Vision: MovieLabs partnership and vision alignment
 * - OMC Foundation: Technical foundation using OMC standard
 * 
 * @navigation
 * - Header: Logo, theme toggle, beta access button
 * - Footer: Attribution and partnership logos
 */

import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowRight, Brain, Sparkles, Zap, Network, Shield, Clock, Check } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useToast } from "@/hooks/use-toast";

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

export default function Intro() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleBetaSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    
    setIsSubmitting(true);
    // Simulate signup
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    setIsSubmitted(true);
    toast({
      title: "You're on the list!",
      description: "We'll notify you when private beta access is available.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-light text-white tracking-wide">
              project_<span className="italic font-medium">aescher</span>
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
            className="absolute inset-0 w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/50 via-slate-900/80 to-slate-950" />
          <div className="relative container mx-auto px-6 py-24">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-4 py-2 mb-8">
                <Sparkles className="h-4 w-4 text-violet-400" />
                <span className="text-sm text-violet-300 font-medium">Private Beta</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-light text-white mb-6 tracking-tight">
                project_<span className="italic font-medium bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">aescher</span>
              </h1>
              
              <p className="text-2xl md:text-3xl text-slate-300 font-light mb-4">
                The brain for production.
              </p>
              
              <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-12">
                An intelligent orchestration layer that connects every aspect of your production workflow—from creative vision to final delivery.
              </p>

              {!isSubmitted ? (
                <form onSubmit={handleBetaSignup} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-violet-500"
                    data-testid="input-beta-email"
                  />
                  <Button 
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white border-0 shadow-lg shadow-violet-500/25 whitespace-nowrap"
                    data-testid="button-request-access"
                  >
                    {isSubmitting ? "Joining..." : "Request Access"}
                  </Button>
                </form>
              ) : (
                <div className="flex items-center justify-center gap-2 text-green-400">
                  <Check className="h-5 w-5" />
                  <span>You're on the waitlist!</span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-slate-900/50">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-light text-white mb-4">
                Intelligence at every step
              </h2>
              <p className="text-lg text-slate-400">
                A unified system that understands the full context of your production.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <Card className="bg-white/5 border-white/10 hover:border-violet-500/30 transition-all duration-300 hover:bg-white/[0.07]">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-violet-500/10 rounded-xl flex items-center justify-center mb-4">
                    <Brain className="h-6 w-6 text-violet-400" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">Contextual Intelligence</h3>
                  <p className="text-sm text-slate-400">
                    Understands relationships between people, tasks, assets, and timelines to surface what matters.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-white/5 border-white/10 hover:border-violet-500/30 transition-all duration-300 hover:bg-white/[0.07]">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center mb-4">
                    <Network className="h-6 w-6 text-indigo-400" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">Connected Workflows</h3>
                  <p className="text-sm text-slate-400">
                    Seamlessly integrates across departments, tools, and stages of production.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-white/5 border-white/10 hover:border-violet-500/30 transition-all duration-300 hover:bg-white/[0.07]">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4">
                    <Zap className="h-6 w-6 text-blue-400" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">Real-time Coordination</h3>
                  <p className="text-sm text-slate-400">
                    Instantly propagates changes and keeps everyone aligned without manual updates.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-white/5 border-white/10 hover:border-violet-500/30 transition-all duration-300 hover:bg-white/[0.07]">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-4">
                    <Shield className="h-6 w-6 text-emerald-400" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">Industry Standards</h3>
                  <p className="text-sm text-slate-400">
                    Built on MovieLabs OMC for true interoperability across the production ecosystem.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-white/5 border-white/10 hover:border-violet-500/30 transition-all duration-300 hover:bg-white/[0.07]">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center mb-4">
                    <Clock className="h-6 w-6 text-amber-400" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">Predictive Planning</h3>
                  <p className="text-sm text-slate-400">
                    Anticipates bottlenecks and resource conflicts before they impact your schedule.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-white/5 border-white/10 hover:border-violet-500/30 transition-all duration-300 hover:bg-white/[0.07]">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-rose-500/10 rounded-xl flex items-center justify-center mb-4">
                    <Sparkles className="h-6 w-6 text-rose-400" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">AI-Powered Insights</h3>
                  <p className="text-sm text-slate-400">
                    Surfaces actionable recommendations based on production patterns and best practices.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* 2030 Vision Section */}
        <section className="py-24 bg-gradient-to-b from-slate-900 to-slate-950">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center">
              <img 
                src="https://movielabs.com/wp-content/uploads/2023/06/2030_vision_logo_tm.png" 
                alt="MovieLabs 2030 Vision" 
                className="h-32 md:h-40 mx-auto mb-8 opacity-90"
                data-testid="img-movielabs-logo"
              />
              <h2 className="text-3xl md:text-4xl font-light text-white mb-6">
                Aligned with the 2030 Vision
              </h2>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-8">
                Project Aescher is built on the principles of MovieLabs' 2030 Vision for the future of media production—enabling software-defined workflows, interoperability, and intelligent automation.
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm text-slate-500">
                <span className="px-4 py-2 bg-white/5 rounded-full border border-white/10">Software-Defined Workflows</span>
                <span className="px-4 py-2 bg-white/5 rounded-full border border-white/10">Cloud-Native Production</span>
                <span className="px-4 py-2 bg-white/5 rounded-full border border-white/10">Semantic Interoperability</span>
              </div>
            </div>
          </div>
        </section>

        {/* OMC Foundation Section */}
        <section className="py-24 bg-slate-950 border-t border-white/5">
          <div className="container mx-auto px-6">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-light text-white mb-4">
                  Powered by OMC
                </h2>
                <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                  The Ontology for Media Creation provides the semantic foundation for understanding production workflows.
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
                <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center hover:border-violet-500/30 transition-all">
                  <div className="w-12 h-12 bg-[#232073]/30 rounded-full flex items-center justify-center mx-auto mb-3">
                    <ParticipantIcon className="h-6 w-6 text-violet-400" />
                  </div>
                  <h3 className="font-medium text-white text-sm">Participants</h3>
                  <p className="text-xs text-slate-500 mt-1">People & Organizations</p>
                </div>
                
                <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center hover:border-violet-500/30 transition-all">
                  <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <TaskIcon className="h-6 w-6 text-green-400" />
                  </div>
                  <h3 className="font-medium text-white text-sm">Tasks</h3>
                  <p className="text-xs text-slate-500 mt-1">Work Activities</p>
                </div>
                
                <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center hover:border-violet-500/30 transition-all">
                  <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <AssetIcon className="h-6 w-6 text-orange-400" />
                  </div>
                  <h3 className="font-medium text-white text-sm">Assets</h3>
                  <p className="text-xs text-slate-500 mt-1">Digital & Physical Media</p>
                </div>
                
                <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center hover:border-violet-500/30 transition-all">
                  <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <ContextIcon className="h-6 w-6 text-yellow-400" />
                  </div>
                  <h3 className="font-medium text-white text-sm">Contexts</h3>
                  <p className="text-xs text-slate-500 mt-1">Workflow Groupings</p>
                </div>
              </div>
              
              <div className="text-center">
                <Link href="/builder">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="border-white/20 text-white hover:bg-white/10 hover:border-white/30"
                    data-testid="button-explore-omc"
                  >
                    Explore OMC Builder
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-gradient-to-r from-violet-900/20 to-indigo-900/20 border-t border-white/5">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-light text-white mb-4">
              Ready to transform your production?
            </h2>
            <p className="text-lg text-slate-400 mb-8 max-w-2xl mx-auto">
              Join the private beta and be among the first to experience the future of production management.
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

      <footer className="border-t border-white/10 bg-slate-950 py-8">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-slate-500">
              project_<span className="italic">aescher</span> — The brain for production
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-500">
              <span>Built on MovieLabs OMC v2.8</span>
              <span className="hidden md:inline">•</span>
              <span>Private Beta</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
