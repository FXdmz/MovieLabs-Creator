import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, FileJson, Users, Layers, CheckCircle } from "lucide-react";
import { Logo } from "@/components/logo";

export default function Intro() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#CEECF2]/30 to-white">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo className="h-8 w-auto" />
          </div>
          <Link href="/builder">
            <Button data-testid="button-get-started-header" className="bg-[#232073] hover:bg-[#232073]/90">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </header>

      <main>
        <section className="container mx-auto px-6 py-16 md:py-24">
          <div className="max-w-4xl mx-auto text-center">
            <img 
              src="https://movielabs.com/wp-content/uploads/2023/06/2030_vision_logo_tm.png" 
              alt="MovieLabs 2030 Vision" 
              className="h-24 md:h-32 mx-auto mb-8"
              data-testid="img-movielabs-logo"
            />
            <h1 className="text-4xl md:text-5xl font-bold text-[#232073] mb-6">
              MovieLabs Ontology for Media Creation
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              A standardized vocabulary and data model enabling software interoperability 
              across the entire media production workflow—from script to screen.
            </p>
            <Link href="/builder">
              <Button size="lg" data-testid="button-start-building" className="bg-[#232073] hover:bg-[#232073]/90 text-lg px-8 py-6">
                Start Building Entities
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>

        <section className="bg-white py-16">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-[#232073] mb-6 text-center">What is the OMC?</h2>
              <div className="prose prose-lg max-w-none text-muted-foreground">
                <p className="mb-6">
                  The <strong>MovieLabs Ontology for Media Creation (OMC)</strong> is an industry-standard 
                  data model developed by MovieLabs and its member studios to improve communication about 
                  production workflows between people, organizations, and software.
                </p>
                <p className="mb-6">
                  In order for software that supports collaboration and automation in production workflows 
                  to interoperate, common data models and schemas for data exchange are needed. The OMC 
                  provides consistent naming and definitions of terms, as well as ways to express how 
                  various concepts and components relate to one another in production workflows.
                </p>
                <p>
                  All productions have <strong>Participants</strong> that conduct <strong>Tasks</strong>, 
                  often involving media <strong>Assets</strong> within the realm of a workflow <strong>Context</strong>. 
                  By defining these key building blocks and their relationships, we can design complex 
                  workflows that both humans and machines can understand.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-[#CEECF2]/20">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold text-[#232073] mb-12 text-center">Core Building Blocks</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              <Card className="border-[#232073]/20 hover:border-[#232073]/40 transition-colors" data-testid="card-participants">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-[#232073]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-[#232073]" />
                  </div>
                  <h3 className="font-semibold text-[#232073] mb-2">Participants</h3>
                  <p className="text-sm text-muted-foreground">
                    People, organizations, departments, and services involved in production
                  </p>
                </CardContent>
              </Card>
              <Card className="border-[#232073]/20 hover:border-[#232073]/40 transition-colors" data-testid="card-tasks">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-[#232073]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-[#232073]" />
                  </div>
                  <h3 className="font-semibold text-[#232073] mb-2">Tasks</h3>
                  <p className="text-sm text-muted-foreground">
                    Work activities and processes that move production forward
                  </p>
                </CardContent>
              </Card>
              <Card className="border-[#232073]/20 hover:border-[#232073]/40 transition-colors" data-testid="card-assets">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-[#232073]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileJson className="h-8 w-8 text-[#232073]" />
                  </div>
                  <h3 className="font-semibold text-[#232073] mb-2">Assets</h3>
                  <p className="text-sm text-muted-foreground">
                    Digital and physical media files, documents, and materials
                  </p>
                </CardContent>
              </Card>
              <Card className="border-[#232073]/20 hover:border-[#232073]/40 transition-colors" data-testid="card-contexts">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-[#232073]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Layers className="h-8 w-8 text-[#232073]" />
                  </div>
                  <h3 className="font-semibold text-[#232073] mb-2">Contexts</h3>
                  <p className="text-sm text-muted-foreground">
                    Narrative, production, and workflow contexts that group related entities
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-[#232073] mb-6 text-center">About This Tool</h2>
              <div className="prose prose-lg max-w-none text-muted-foreground mb-8">
                <p className="mb-6">
                  The <strong>ME-DMZ OMC Builder</strong> is a web application designed to help media 
                  production professionals create and export OMC-compliant JSON documents. Whether 
                  you're defining creative works, cataloging assets, or mapping production workflows, 
                  this tool provides an intuitive form-based interface with built-in validation.
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-[#CEECF2] rounded-lg flex items-center justify-center mx-auto mb-3">
                    <FileJson className="h-6 w-6 text-[#232073]" />
                  </div>
                  <h3 className="font-semibold text-[#232073] mb-2">Schema Validated</h3>
                  <p className="text-sm text-muted-foreground">
                    Real-time validation against OMC-JSON Schema v2.8
                  </p>
                </div>
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-[#CEECF2] rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Layers className="h-6 w-6 text-[#232073]" />
                  </div>
                  <h3 className="font-semibold text-[#232073] mb-2">Multiple Entity Types</h3>
                  <p className="text-sm text-muted-foreground">
                    Support for Assets, Participants, Tasks, Locations, and more
                  </p>
                </div>
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-[#CEECF2] rounded-lg flex items-center justify-center mx-auto mb-3">
                    <ArrowRight className="h-6 w-6 text-[#232073]" />
                  </div>
                  <h3 className="font-semibold text-[#232073] mb-2">Easy Export</h3>
                  <p className="text-sm text-muted-foreground">
                    Export valid JSON ready for integration with production systems
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-[#232073] text-white">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Build OMC Entities?</h2>
            <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
              Start creating standardized metadata for your media production workflows.
            </p>
            <Link href="/builder">
              <Button size="lg" variant="secondary" data-testid="button-start-building-footer" className="text-[#232073] text-lg px-8 py-6">
                Open the Builder
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="bg-gray-50 border-t py-8">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          <p className="mb-2">
            The Ontology for Media Creation is developed by{" "}
            <a href="https://movielabs.com" target="_blank" rel="noopener noreferrer" className="text-[#232073] hover:underline">
              MovieLabs
            </a>{" "}
            and is licensed under the Creative Commons Attribution 4.0 International License.
          </p>
          <p>
            Learn more at the{" "}
            <a href="https://mc.movielabs.com/" target="_blank" rel="noopener noreferrer" className="text-[#232073] hover:underline">
              MovieLabs Documentation Site
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
