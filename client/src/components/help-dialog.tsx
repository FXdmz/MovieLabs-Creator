import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HelpCircle, ExternalLink, BookOpen, FileText } from "lucide-react";

const TaskIcon = ({ className }: { className?: string }) => (
  <svg viewBox="1.899 2.2 199.771 141.894" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M 10.465 7.129 L 60.101 12.194 C 67.426 12.944 74.756 13.631 82.092 14.257 L 132.806 18.567 C 140.149 19.189 147.477 19.966 154.788 20.896 L 181.355 24.285 C 187.614 25.086 192.305 30.408 192.314 36.717 L 192.36 108.639 C 192.366 114.919 187.62 120.185 181.374 120.832 L 19.167 137.749 C 13.34 138.339 8.303 133.714 8.393 127.858 L 8.743 107.755 L 10.465 7.129 Z" strokeWidth="4" fill="currentColor" stroke="currentColor"/>
  </svg>
);

const ParticipantIcon = ({ className }: { className?: string }) => (
  <svg viewBox="1620.35 1648.8 159.848 148.03" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M 1627.367 1731.241 C 1624.541 1726.171 1624.541 1720 1627.367 1714.93 L 1656.794 1662.124 C 1659.602 1657.091 1664.914 1653.972 1670.677 1653.974 L 1729.057 1653.974 C 1734.822 1653.974 1740.135 1657.097 1742.94 1662.134 L 1772.368 1714.93 C 1775.19 1719.997 1775.19 1726.164 1772.368 1731.231 L 1742.94 1784.018 C 1740.135 1789.055 1734.822 1792.178 1729.057 1792.178 L 1670.668 1792.178 C 1664.906 1792.175 1659.597 1789.052 1656.794 1784.018 L 1627.367 1731.241 Z" stroke="currentColor" strokeWidth="4" fill="currentColor" />
  </svg>
);

const AssetIcon = ({ className }: { className?: string }) => (
  <svg viewBox="1545.36 1648.8 149.92 149.93" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M 1550.154 1666.405 C 1550.154 1660.29 1555.112 1655.332 1561.228 1655.332 L 1677.428 1655.332 C 1683.543 1655.332 1688.501 1660.29 1688.501 1666.405 L 1688.501 1782.614 C 1688.501 1788.73 1683.543 1793.688 1677.428 1793.688 L 1561.228 1793.688 C 1555.112 1793.688 1550.154 1788.73 1550.154 1782.614 L 1550.154 1666.405 Z" stroke="currentColor" strokeWidth="4" fill="currentColor"/>
  </svg>
);

const InfrastructureIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 264.57 149.92" xmlns="http://www.w3.org/2000/svg" className={className} fill="currentColor">
    <path d="M 207.698 5.208 C 234.978 5.208 257.087 36.529 257.087 75.167 C 257.087 113.805 234.968 145.126 207.698 145.126 L 59.538 145.126 C 32.286 145.126 10.167 113.805 10.167 75.167 C 10.167 36.529 32.286 5.208 59.538 5.208 L 207.698 5.208 Z" strokeWidth="4" stroke="currentColor"/>
  </svg>
);

const ContextIcon = ({ className }: { className?: string }) => (
  <svg viewBox="1375.27 1509.47 150 150" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M 1517.343 1583.172 C 1517.343 1621.099 1486.602 1651.831 1448.684 1651.831 C 1410.767 1651.831 1380.026 1621.099 1380.026 1583.172 C 1380.026 1545.255 1410.767 1514.514 1448.684 1514.514 C 1486.602 1514.514 1517.343 1545.255 1517.343 1583.172 Z" strokeWidth="4" stroke="currentColor" fill="currentColor"/>
  </svg>
);

const LocationIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);

interface HelpDialogProps {
  trigger?: React.ReactNode;
  defaultTab?: string;
}

export function HelpDialog({ trigger, defaultTab = "overview" }: HelpDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="icon" data-testid="button-help">
            <HelpCircle className="h-5 w-5" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[#232073]">
            <HelpCircle className="h-5 w-5" />
            OMC Builder Help
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue={defaultTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid grid-cols-7 w-full">
            <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
            <TabsTrigger value="task" data-testid="tab-task">Task</TabsTrigger>
            <TabsTrigger value="participant" data-testid="tab-participant">Participant</TabsTrigger>
            <TabsTrigger value="asset" data-testid="tab-asset">Asset</TabsTrigger>
            <TabsTrigger value="infrastructure" data-testid="tab-infrastructure">Infrastructure</TabsTrigger>
            <TabsTrigger value="location" data-testid="tab-location">Location</TabsTrigger>
            <TabsTrigger value="context" data-testid="tab-context">Context</TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 mt-4">
            <TabsContent value="overview" className="mt-0 pr-4">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-[#232073] mb-3">Ontology for Media Creation (OMC)</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    The Ontology for Media Creation (OMC) was developed by MovieLabs and its member studios to 
                    improve communication about workflows between people, organizations, and software. In order 
                    for the software that supports collaboration and automation in production workflows to 
                    interoperate, common data models and schemas for data exchange are needed.
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    OMC provides consistent naming and definitions of terms, as well as ways to express how 
                    various concepts and components relate to one another in production workflows. This builder 
                    implements the OMC v2.8 JSON Schema.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg hover:border-[#232073]/50 transition-colors">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-[#232073]/10 rounded">
                        <TaskIcon className="h-5 w-5 text-[#232073]" />
                      </div>
                      <h4 className="font-semibold text-[#232073]">Tasks</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Pieces of work to be done and completed as steps in the production process. Tasks are 
                      carried out by Participants and can take Assets as input and produce them as output.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg hover:border-[#232073]/50 transition-colors">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-[#232073]/10 rounded">
                        <ParticipantIcon className="h-5 w-5 text-[#232073]" />
                      </div>
                      <h4 className="font-semibold text-[#232073]">Participants</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Entities responsible for the production of a Creative Work: people, organizations, 
                      departments, and services (computer-driven agents).
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg hover:border-[#232073]/50 transition-colors">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-[#232073]/10 rounded">
                        <AssetIcon className="h-5 w-5 text-[#232073]" />
                      </div>
                      <h4 className="font-semibold text-[#232073]">Assets</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Digital and physical media, documents, and materials. Assets flow through Tasks and 
                      can be inputs or outputs of production processes.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg hover:border-[#232073]/50 transition-colors">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-[#232073]/10 rounded">
                        <InfrastructureIcon className="h-5 w-5 text-[#232073]" />
                      </div>
                      <h4 className="font-semibold text-[#232073]">Infrastructure</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Underlying technical systems and framework required for production: cameras, storage, 
                      networks, and compute resources.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg hover:border-[#232073]/50 transition-colors">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-[#232073]/10 rounded">
                        <LocationIcon className="h-5 w-5 text-[#232073]" />
                      </div>
                      <h4 className="font-semibold text-[#232073]">Locations</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Physical or virtual places associated with production activities, including filming 
                      locations, studios, and offices.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg hover:border-[#232073]/50 transition-colors">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-[#232073]/10 rounded">
                        <ContextIcon className="h-5 w-5 text-[#232073]" />
                      </div>
                      <h4 className="font-semibold text-[#232073]">Contexts</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Containers that group related entities and provide the framework within which 
                      production activities take place.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-[#232073] mb-3">Using the OMC Builder</h3>
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <p><strong>1. Create Entities:</strong> Use the sidebar buttons or welcome screen to create new entities of any type.</p>
                    <p><strong>2. Fill in Details:</strong> Each entity has a form with fields specific to its type. Required fields are marked.</p>
                    <p><strong>3. Structural & Functional Types:</strong> Entities have structural characteristics (what they are) and functional characteristics (what they do).</p>
                    <p><strong>4. Validate:</strong> Use the validate button to check your entity against the official OMC v2.8 schema.</p>
                    <p><strong>5. Export:</strong> Export your entities as JSON for use in other OMC-compatible systems.</p>
                  </div>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <BookOpen className="h-4 w-4" /> Official Resources
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <a 
                      href="https://mc.movielabs.com/docs/ontology/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-[#232073] hover:underline flex items-center gap-1"
                    >
                      OMC Documentation Portal <ExternalLink className="h-3 w-3" />
                    </a>
                    <a 
                      href="https://mc.movielabs.com/vmc/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-[#232073] hover:underline flex items-center gap-1"
                    >
                      Vocabulary Dictionary <ExternalLink className="h-3 w-3" />
                    </a>
                    <a 
                      href="https://github.com/MovieLabs/OMC/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-[#232073] hover:underline flex items-center gap-1"
                    >
                      GitHub Repository <ExternalLink className="h-3 w-3" />
                    </a>
                    <a 
                      href="https://movielabs.com/production-technology/sdw/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-[#232073] hover:underline flex items-center gap-1"
                    >
                      Software-Defined Workflows <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="task" className="mt-0 pr-4">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-[#232073]/10 rounded-lg">
                    <TaskIcon className="h-10 w-10 text-[#232073]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-[#232073] mb-2">Task (Part 5)</h3>
                    <p className="text-sm text-muted-foreground">
                      A piece of work to be done and completed as a step towards the finished Creative Work.
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-[#232073] mb-2">From the OMC Documentation</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    In the production process, a Task is any piece of work that must be done and completed as 
                    a step towards the finished Creative Work. Many of the other pieces of the Ontology converge 
                    around Tasks: Tasks are carried out by Participants; Tasks can take Assets as input and 
                    produce them as output; most Tasks require Context to be carried out properly and efficiently; 
                    some Tasks require particular pieces of Infrastructure.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Software-defined workflows require well-defined Tasks. With that, the SDW can manage and 
                    track not only what needs to be done, but what each component depends on, allowing management 
                    and orchestration of Assets, coordination of Participants, and implementation of dynamic 
                    security policies.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-[#232073] mb-2">Key Concepts</h4>
                  <div className="space-y-3">
                    <div className="p-3 border rounded">
                      <h5 className="font-medium text-[#232073]">Appropriate Granularity</h5>
                      <p className="text-sm text-muted-foreground">
                        A Task can be composed of other Tasks, or broken down into components. For example, 
                        "write script" can be composed of sub-tasks (create ideas, review script, refine script), 
                        or "shoot scene" can involve performing scenes and stunts as well as capturing picture and sound.
                      </p>
                    </div>
                    <div className="p-3 border rounded">
                      <h5 className="font-medium text-[#232073]">Relationships</h5>
                      <p className="text-sm text-muted-foreground">
                        Tasks can have formal relationships to Assets (as inputs and outputs), to Contexts 
                        (used to inform the work), and to Participants (the entity performing the Task). 
                        Tasks can depend on other Tasks or be composed of sub-Tasks.
                      </p>
                    </div>
                    <div className="p-3 border rounded">
                      <h5 className="font-medium text-[#232073]">Structural vs Functional</h5>
                      <p className="text-sm text-muted-foreground">
                        Tasks have a Task Structural Class for categorization. Implementations can define 
                        structural characteristics based on the production phase or department.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-[#232073] mb-2">Example Task Types</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Ingest - Bringing content into the production pipeline</li>
                    <li>Transcode - Converting content between formats</li>
                    <li>QC (Quality Control) - Reviewing and verifying content quality</li>
                    <li>Review - Collaborative review sessions</li>
                    <li>Script Breakdown - Analyzing script for production requirements</li>
                    <li>Generate Dailies - Sync sound, create proxies, create packages</li>
                  </ul>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <FileText className="h-4 w-4" /> Learn More
                  </h4>
                  <a 
                    href="https://mc.movielabs.com/docs/ontology/tasks/introduction/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-[#232073] hover:underline flex items-center gap-1"
                  >
                    Part 5: Tasks - Full Documentation <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="participant" className="mt-0 pr-4">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-[#232073]/10 rounded-lg">
                    <ParticipantIcon className="h-10 w-10 text-[#232073]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-[#232073] mb-2">Participant (Part 4)</h3>
                    <p className="text-sm text-muted-foreground">
                      An entity responsible for the production of a Creative Work.
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-[#232073] mb-2">From the OMC Documentation</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Participants are the entities (people, organizations, or services) that are responsible 
                    for the production of a Creative Work. People are individuals contracted or employed to 
                    perform given tasks. Organizations are groups of people or legal entities with a particular 
                    purpose. Services are computer-driven agents that can perform tasks given proper context 
                    and structured data input.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Defining Participants in a software-defined workflow is crucial for automation, security, 
                    and production management. Understanding the nature of Participants in each task can help 
                    prepare assets and infrastructure for work. Workflows can be secured by accessing the 
                    permissions of a given Participant and authorizing them appropriately.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-[#232073] mb-2">Structural Types</h4>
                  <div className="space-y-3">
                    <div className="p-3 border rounded">
                      <h5 className="font-medium text-[#232073]">Person</h5>
                      <p className="text-sm text-muted-foreground">
                        An individual human being contracted or employed to work on a production. Has attributes 
                        like name, age, nationality, job title, and contact information.
                      </p>
                    </div>
                    <div className="p-3 border rounded">
                      <h5 className="font-medium text-[#232073]">Organization</h5>
                      <p className="text-sm text-muted-foreground">
                        A group of people or legal entities with a particular purpose relative to the production 
                        (studios, vendors, production companies).
                      </p>
                    </div>
                    <div className="p-3 border rounded">
                      <h5 className="font-medium text-[#232073]">Department</h5>
                      <p className="text-sm text-muted-foreground">
                        A functional division within an organization (e.g., Editorial, VFX, Sound, Art Department).
                      </p>
                    </div>
                    <div className="p-3 border rounded">
                      <h5 className="font-medium text-[#232073]">Service</h5>
                      <p className="text-sm text-muted-foreground">
                        A computer-driven agent that performs tasks (APIs, automated systems, AI services, 
                        transcoding microservices).
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-[#232073] mb-2">Job Title vs. Role</h4>
                  <p className="text-sm text-muted-foreground">
                    <strong>Job Title</strong> is stated on a production or employment contract and often 
                    advocated by unions and guilds for collective bargaining purposes. <strong>Role</strong> is 
                    more variable and tied to how participants are associated with given tasks. The OMC keeps 
                    these as separate attributes.
                  </p>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <FileText className="h-4 w-4" /> Learn More
                  </h4>
                  <a 
                    href="https://mc.movielabs.com/docs/ontology/participants/introduction/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-[#232073] hover:underline flex items-center gap-1"
                  >
                    Part 4: Participants - Full Documentation <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="asset" className="mt-0 pr-4">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-[#232073]/10 rounded-lg">
                    <AssetIcon className="h-10 w-10 text-[#232073]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-[#232073] mb-2">Asset (Part 3)</h3>
                    <p className="text-sm text-muted-foreground">
                      Digital or physical media, documents, and materials used in production.
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-[#232073] mb-2">From the OMC Documentation</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Managing a software-defined workflow requires managing physical assets as well as digital 
                    ones. The production of a filmed Creative Work has physical components, such as printed 
                    scripts and props used on set, and even a fully computer-generated Creative Work can have 
                    physical components, such as hand-drawn sketches and storyboards.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    The ontology draws a distinction between Assets, which are used in the production of a 
                    particular Creative Work, and Infrastructure, which covers the underlying systems used 
                    for productions in general.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-[#232073] mb-2">Structural vs. Functional</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Assets have <strong>structural characteristics</strong> (e.g., "it is an image") and 
                    <strong>functional characteristics</strong> (e.g., "it is a VFX Plate" or "it is concept art"). 
                    These are often independent - a printed script and a PDF are functionally similar but 
                    structurally different.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-[#232073] mb-2">Structural Types</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="p-2 border rounded">
                      <strong>Digital.Image</strong> - Still images, photographs
                    </div>
                    <div className="p-2 border rounded">
                      <strong>Digital.Video</strong> - Video footage, sequences
                    </div>
                    <div className="p-2 border rounded">
                      <strong>Digital.Audio</strong> - Audio recordings, music
                    </div>
                    <div className="p-2 border rounded">
                      <strong>Digital.Document</strong> - Scripts, notes, PDFs
                    </div>
                    <div className="p-2 border rounded">
                      <strong>Geometry.Mesh</strong> - 3D models, CG assets
                    </div>
                    <div className="p-2 border rounded">
                      <strong>Physical.Prop</strong> - Physical props, costumes
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-[#232073] mb-2">Appropriate Granularity</h4>
                  <p className="text-sm text-muted-foreground">
                    An Asset can be made up of other Assets (Asset Groups). For example, the Infinity Gauntlet 
                    in the Avengers movies contains six individual Infinity Stones, each of which can be a 
                    separate Asset. A CG model may contain meshes, materials, and textures as separate Assets.
                  </p>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                  <h5 className="font-medium text-blue-800 mb-1">Tip: Import from File</h5>
                  <p className="text-sm text-blue-700">
                    Drag and drop media files into the builder to automatically create Asset entities with 
                    detected metadata like file type, dimensions, duration, and codec information.
                  </p>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <FileText className="h-4 w-4" /> Learn More
                  </h4>
                  <div className="flex flex-wrap gap-x-4 gap-y-1">
                    <a 
                      href="https://mc.movielabs.com/docs/ontology/assets/introduction/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-[#232073] hover:underline flex items-center gap-1"
                    >
                      Part 3: Assets <ExternalLink className="h-3 w-3" />
                    </a>
                    <a 
                      href="https://mc.movielabs.com/docs/ontology/assets-camera-metadata/introduction/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-[#232073] hover:underline flex items-center gap-1"
                    >
                      Part 3A: Camera Metadata <ExternalLink className="h-3 w-3" />
                    </a>
                    <a 
                      href="https://mc.movielabs.com/docs/ontology/assets-versions/introduction/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-[#232073] hover:underline flex items-center gap-1"
                    >
                      Part 3B: Versions <ExternalLink className="h-3 w-3" />
                    </a>
                    <a 
                      href="https://mc.movielabs.com/docs/ontology/assets-audio/introduction/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-[#232073] hover:underline flex items-center gap-1"
                    >
                      Part 3C: Audio <ExternalLink className="h-3 w-3" />
                    </a>
                    <a 
                      href="https://mc.movielabs.com/docs/ontology/assets-cg/introduction/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-[#232073] hover:underline flex items-center gap-1"
                    >
                      Part 3D: CG Assets <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="infrastructure" className="mt-0 pr-4">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-[#232073]/10 rounded-lg">
                    <InfrastructureIcon className="h-10 w-10 text-[#232073]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-[#232073] mb-2">Infrastructure (Part 8)</h3>
                    <p className="text-sm text-muted-foreground">
                      Underlying systems and framework required for production of Creative Works.
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-[#232073] mb-2">From the OMC Documentation</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Infrastructure components are the underlying systems and framework required for the 
                    production of the Creative Work. Infrastructure is generally not specific to a particular 
                    Creative Work. Modern filmmaking requires physical infrastructure (cameras, lights) and 
                    digital infrastructure (computers, networks, storage systems).
                  </p>
                  <p className="text-sm text-muted-foreground">
                    A good rule of thumb: a Service is told to go do something and then goes and does it. 
                    Infrastructure just sits there until it is used by a Participant performing a Task. 
                    A remote desktop is infrastructure; a transcoding microservice is a Service.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-[#232073] mb-2">Categories</h4>
                  <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
                    <li><strong>Cameras</strong> - Capture devices that produce Camera Metadata</li>
                    <li><strong>Storage</strong> - File storage systems, SAN, NAS, cloud storage</li>
                    <li><strong>Compute</strong> - Rendering farms, processing clusters, workstations</li>
                    <li><strong>Network</strong> - Network infrastructure, connectivity, bandwidth</li>
                    <li><strong>Software</strong> - Applications and platforms (editing, VFX, color grading)</li>
                    <li><strong>Hardware</strong> - Physical equipment, lights, rigs, displays</li>
                    <li><strong>Facility</strong> - Physical locations, stages, studios, screening rooms</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-[#232073] mb-2">Relationships</h4>
                  <p className="text-sm text-muted-foreground">
                    Infrastructure is most often related to Tasks. For instance, an editing Task may require 
                    a specialized workstation. Shooting a scene requires a camera. Rendering may require 
                    particular compute resources and fast storage.
                  </p>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <FileText className="h-4 w-4" /> Learn More
                  </h4>
                  <a 
                    href="https://mc.movielabs.com/docs/ontology/infrastructure/introduction/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-[#232073] hover:underline flex items-center gap-1"
                  >
                    Part 8: Infrastructure - Full Documentation <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="location" className="mt-0 pr-4">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-[#232073]/10 rounded-lg">
                    <LocationIcon className="h-10 w-10 text-[#232073]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-[#232073] mb-2">Location</h3>
                    <p className="text-sm text-muted-foreground">
                      A physical or virtual place associated with production activities.
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-[#232073] mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">
                    Locations represent places where production activities occur or that are relevant to the 
                    Creative Work. This includes filming locations, studio facilities, offices, and any 
                    physical address associated with Participants, Infrastructure, or narrative elements. 
                    Locations can be associated with both Production Contexts (physical filming) and 
                    Narrative Contexts (story settings).
                  </p>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                  <h5 className="font-medium text-blue-800 mb-1">Tip: Address Search</h5>
                  <p className="text-sm text-blue-700">
                    Use the address search bar at the top of the Location form to quickly find and auto-fill 
                    address details. Simply type an address and select from the suggestions to automatically 
                    populate the street, city, region, country, and geographic coordinates fields.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-[#232073] mb-2">Key Fields</h4>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li><strong>Name:</strong> A human-readable name for the location (e.g., "Main Studio", "NYC Office", "Beach Exterior")</li>
                    <li><strong>Description:</strong> Details about the location's purpose or characteristics</li>
                    <li><strong>Address:</strong> Full postal address with street, city, region, postal code, and country</li>
                    <li><strong>Coordinates:</strong> Geographic coordinates (latitude/longitude) for mapping and logistics</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-[#232073] mb-2">Address Components</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="p-2 border rounded">
                      <strong>Street</strong> - Street address and number
                    </div>
                    <div className="p-2 border rounded">
                      <strong>City</strong> - City or locality name
                    </div>
                    <div className="p-2 border rounded">
                      <strong>Region</strong> - State, province, or region
                    </div>
                    <div className="p-2 border rounded">
                      <strong>Postal Code</strong> - ZIP or postal code
                    </div>
                    <div className="p-2 border rounded">
                      <strong>Country</strong> - Country name
                    </div>
                    <div className="p-2 border rounded">
                      <strong>Lat/Long</strong> - Geographic coordinates
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-[#232073] mb-2">Use Cases</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Documenting filming locations for production scheduling</li>
                    <li>Recording participant office or contact addresses</li>
                    <li>Tracking studio facilities, stages, and screening rooms</li>
                    <li>Defining narrative story locations for Context</li>
                    <li>Logistics planning for equipment and crew transport</li>
                  </ul>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <FileText className="h-4 w-4" /> Related Documentation
                  </h4>
                  <a 
                    href="https://mc.movielabs.com/docs/ontology/context/introduction/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-[#232073] hover:underline flex items-center gap-1"
                  >
                    Part 2: Context - Narrative and Production Locations <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="context" className="mt-0 pr-4">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-[#232073]/10 rounded-lg">
                    <ContextIcon className="h-10 w-10 text-[#232073]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-[#232073] mb-2">Context (Part 2)</h3>
                    <p className="text-sm text-muted-foreground">
                      The circumstances or interrelated conditions within which something exists or occurs.
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-[#232073] mb-2">From the OMC Documentation</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Context is essential to understanding things. A common complaint is that words are taken 
                    "out of context" to imply a different meaning from what was initially intended. Software-defined 
                    workflows need Context to be explicit or at least easily discoverable.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    No performance exists on its own – each one is surrounded by creative and technical decisions 
                    that, taken together, provide Context for that performance. Context can range from the overall 
                    production context to specific scene requirements (like a sword that glows when enemies are nearby).
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-[#232073] mb-2">Context Types</h4>
                  <div className="space-y-3">
                    <div className="p-3 border rounded">
                      <h5 className="font-medium text-[#232073]">Narrative Context</h5>
                      <p className="text-sm text-muted-foreground">
                        Groups elements related to the story being told: scenes, characters, story arcs, 
                        settings, time periods. Defines the creative intent and storytelling requirements.
                      </p>
                    </div>
                    <div className="p-3 border rounded">
                      <h5 className="font-medium text-[#232073]">Production Context</h5>
                      <p className="text-sm text-muted-foreground">
                        Groups elements related to physical production: shoot days, locations, schedules, 
                        call times, wrap times. Organizes the logistics of making the Creative Work.
                      </p>
                    </div>
                    <div className="p-3 border rounded">
                      <h5 className="font-medium text-[#232073]">Workflow Context</h5>
                      <p className="text-sm text-muted-foreground">
                        Groups elements related to post-production and technical workflows: stages, 
                        priorities, deadlines, technical requirements for VFX, editorial, sound, etc.
                      </p>
                    </div>
                    <div className="p-3 border rounded">
                      <h5 className="font-medium text-[#232073]">Temporal Context</h5>
                      <p className="text-sm text-muted-foreground">
                        Groups elements by time periods or schedules: start/end dates, durations, 
                        timezones, project milestones and phases.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-[#232073] mb-2">Related Concepts</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li><strong>Scene</strong> - A narrative or production unit within a Creative Work</li>
                    <li><strong>Slate</strong> - Information identifying a specific take or setup</li>
                    <li><strong>Shot/Sequence</strong> - Specific camera setups and edited sequences</li>
                    <li><strong>Set</strong> - Physical or virtual environments for production</li>
                    <li><strong>Partition</strong> - Logical divisions within a production</li>
                  </ul>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <FileText className="h-4 w-4" /> Learn More
                  </h4>
                  <a 
                    href="https://mc.movielabs.com/docs/ontology/context/introduction/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-[#232073] hover:underline flex items-center gap-1"
                  >
                    Part 2: Context - Full Documentation <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
