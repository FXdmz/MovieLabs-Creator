import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, HelpCircle } from "lucide-react";
import { Logo } from "@/components/logo";
import { HelpDialog } from "@/components/help-dialog";

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
  <svg viewBox="2210.983 568.944 264.57 149.92" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path 
      d="M 2418.681 574.152 C 2445.961 574.152 2468.07 605.473 2468.07 644.111 C 2468.07 682.749 2445.951 714.07 2418.681 714.07 L 2270.521 714.07 C 2243.269 714.07 2221.15 682.749 2221.15 644.111 C 2221.15 605.473 2243.269 574.152 2270.521 574.152 L 2418.681 574.152 Z" 
      strokeWidth="4" 
      fill="currentColor"
      stroke="currentColor"
    />
  </svg>
);

export default function Intro() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#CEECF2]/30 to-white">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo className="h-8 w-auto" />
          </div>
          <div className="flex items-center gap-2">
            <HelpDialog 
              trigger={
                <Button variant="outline" className="gap-2 hover:bg-[#CEECF2] hover:border-[#232073] transition-all duration-200" data-testid="button-help-intro">
                  <HelpCircle className="h-4 w-4" /> Help
                </Button>
              }
            />
            <Link href="/builder">
              <Button data-testid="button-get-started-header" className="bg-[#232073] hover:bg-[#1a1857] hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="container mx-auto px-6 py-16 md:py-24">
          <div className="max-w-4xl mx-auto text-center">
            <img 
              src="https://movielabs.com/wp-content/uploads/2023/06/2030_vision_logo_tm.png" 
              alt="MovieLabs 2030 Vision" 
              className="h-48 md:h-64 mx-auto mb-8"
              data-testid="img-movielabs-logo"
            />
            <h1 className="text-4xl md:text-5xl font-bold text-[#232073] mb-6">
              MovieLabs Ontology for Media Creation Builder
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              A standardized vocabulary and data model enabling software interoperability 
              across the entire media production workflow—from script to screen.
            </p>
            <Link href="/builder">
              <Button size="lg" data-testid="button-start-building" className="bg-[#232073] hover:bg-[#1a1857] hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl text-lg px-8 py-6">
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
                  often involving media <strong>Assets</strong> and <strong>Infrastructure</strong> within 
                  the realm of a workflow <strong>Context</strong>. By defining these key building blocks 
                  and their relationships, we can design complex workflows that both humans and machines 
                  can understand.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-[#CEECF2]/20">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold text-[#232073] mb-12 text-center">Core Building Blocks</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 max-w-6xl mx-auto">
              <Card className="border-[#232073]/20 hover:border-[#232073]/40 transition-colors" data-testid="card-participants">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-[#232073]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ParticipantIcon className="h-8 w-8 text-[#232073]" />
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
                    <TaskIcon className="h-8 w-8 text-[#232073]" />
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
                    <AssetIcon className="h-8 w-8 text-[#232073]" />
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
                    <ContextIcon className="h-8 w-8 text-[#232073]" />
                  </div>
                  <h3 className="font-semibold text-[#232073] mb-2">Contexts</h3>
                  <p className="text-sm text-muted-foreground">
                    Narrative, production, and workflow contexts that group related entities
                  </p>
                </CardContent>
              </Card>
              <Card className="border-[#232073]/20 hover:border-[#232073]/40 transition-colors" data-testid="card-infrastructure">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-[#232073]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <InfrastructureIcon className="h-8 w-8 text-[#232073]" />
                  </div>
                  <h3 className="font-semibold text-[#232073] mb-2">Infrastructure</h3>
                  <p className="text-sm text-muted-foreground">
                    Technical resources and systems that support production workflows
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-[#232073] mb-6 text-center">About the OMC Builder</h2>
              <div className="prose prose-lg max-w-none text-muted-foreground mb-8">
                <p className="mb-6">
                  The <strong>OMC Builder</strong> is a web application designed to help media 
                  production professionals create and export OMC-compliant JSON documents. Whether 
                  you're defining creative works, cataloging assets, or mapping production workflows, 
                  this tool provides an intuitive form-based interface with built-in validation.
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-[#CEECF2] rounded-lg flex items-center justify-center mx-auto mb-3">
                    <AssetIcon className="h-6 w-6 text-[#232073]" />
                  </div>
                  <h3 className="font-semibold text-[#232073] mb-2">Schema Validated</h3>
                  <p className="text-sm text-muted-foreground">
                    Real-time validation against OMC-JSON Schema v2.8
                  </p>
                </div>
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-[#CEECF2] rounded-lg flex items-center justify-center mx-auto mb-3">
                    <ContextIcon className="h-6 w-6 text-[#232073]" />
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
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/builder?create=Task">
                <Button size="lg" variant="secondary" data-testid="button-create-task" className="text-[#232073] gap-2 hover:bg-[#CEECF2] hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg">
                  <TaskIcon className="h-5 w-5" />
                  Create Task
                </Button>
              </Link>
              <Link href="/builder?create=Participant">
                <Button size="lg" variant="secondary" data-testid="button-create-participant" className="text-[#232073] gap-2 hover:bg-[#CEECF2] hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg">
                  <ParticipantIcon className="h-5 w-5" />
                  Create Participant
                </Button>
              </Link>
              <Link href="/builder?create=Asset">
                <Button size="lg" variant="secondary" data-testid="button-create-asset" className="text-[#232073] gap-2 hover:bg-[#CEECF2] hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg">
                  <AssetIcon className="h-5 w-5" />
                  Create Asset
                </Button>
              </Link>
              <Link href="/builder?create=Infrastructure">
                <Button size="lg" variant="secondary" data-testid="button-create-infrastructure" className="text-[#232073] gap-2 hover:bg-[#CEECF2] hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg">
                  <InfrastructureIcon className="h-5 w-5" />
                  Create Infrastructure
                </Button>
              </Link>
            </div>
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
