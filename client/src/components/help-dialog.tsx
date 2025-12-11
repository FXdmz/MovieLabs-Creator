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
import { HelpCircle, ExternalLink } from "lucide-react";

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
          <TabsList className="grid grid-cols-6 w-full">
            <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
            <TabsTrigger value="task" data-testid="tab-task">Task</TabsTrigger>
            <TabsTrigger value="participant" data-testid="tab-participant">Participant</TabsTrigger>
            <TabsTrigger value="asset" data-testid="tab-asset">Asset</TabsTrigger>
            <TabsTrigger value="infrastructure" data-testid="tab-infrastructure">Infrastructure</TabsTrigger>
            <TabsTrigger value="context" data-testid="tab-context">Context</TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 mt-4">
            <TabsContent value="overview" className="mt-0 pr-4">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-[#232073] mb-3">What is the Ontology for Media Creation (OMC)?</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    The Ontology for Media Creation (OMC) is a framework developed by MovieLabs to standardize 
                    how media production data is structured and exchanged. It provides a common vocabulary and 
                    data model that enables different tools, systems, and organizations to work together seamlessly.
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    The OMC defines five core building blocks that represent the fundamental elements of any 
                    media production workflow:
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-[#232073]/10 rounded">
                        <TaskIcon className="h-5 w-5 text-[#232073]" />
                      </div>
                      <h4 className="font-semibold text-[#232073]">Tasks</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Pieces of work to be completed as steps in the production process.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-[#232073]/10 rounded">
                        <ParticipantIcon className="h-5 w-5 text-[#232073]" />
                      </div>
                      <h4 className="font-semibold text-[#232073]">Participants</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      People, organizations, departments, or services involved in production.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-[#232073]/10 rounded">
                        <AssetIcon className="h-5 w-5 text-[#232073]" />
                      </div>
                      <h4 className="font-semibold text-[#232073]">Assets</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Digital and physical media files, documents, and materials.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-[#232073]/10 rounded">
                        <InfrastructureIcon className="h-5 w-5 text-[#232073]" />
                      </div>
                      <h4 className="font-semibold text-[#232073]">Infrastructure</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Technical resources and systems that support production workflows.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg md:col-span-2">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-[#232073]/10 rounded">
                        <ContextIcon className="h-5 w-5 text-[#232073]" />
                      </div>
                      <h4 className="font-semibold text-[#232073]">Contexts</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Containers that group related entities for narrative, production, or workflow purposes.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-[#232073] mb-3">Using the OMC Builder</h3>
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <p><strong>1. Create Entities:</strong> Use the sidebar buttons or welcome screen to create new entities of any type.</p>
                    <p><strong>2. Fill in Details:</strong> Each entity has a form with fields specific to its type. Required fields are marked.</p>
                    <p><strong>3. Structural Types:</strong> Some entities (like Assets and Participants) have structural types that determine their specific properties.</p>
                    <p><strong>4. Validate:</strong> Use the validate button to check your entity against the official OMC v2.8 schema.</p>
                    <p><strong>5. Export:</strong> Export your entities as JSON for use in other OMC-compatible systems.</p>
                  </div>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold mb-2">Learn More</h4>
                  <a 
                    href="https://movielabs.com/production-technology/ontology-for-media-creation/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-[#232073] hover:underline flex items-center gap-1"
                  >
                    MovieLabs OMC Documentation <ExternalLink className="h-3 w-3" />
                  </a>
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
                    <h3 className="text-xl font-semibold text-[#232073] mb-2">Task</h3>
                    <p className="text-sm text-muted-foreground">
                      A piece of work to be done and completed as a step in the production process.
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-[#232073] mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">
                    Tasks represent discrete units of work in a production workflow. They are carried out by 
                    Participants, can take Assets as input and produce them as output, often require Context 
                    to be carried out properly, and may require particular pieces of Infrastructure. Tasks 
                    can be composed of other Tasks for appropriate granularity.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-[#232073] mb-2">Key Fields</h4>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li><strong>Name:</strong> A human-readable name for the task (e.g., "Color Grading", "Sound Mix")</li>
                    <li><strong>Description:</strong> Detailed description of what the task involves</li>
                    <li><strong>Identifier:</strong> Unique identifier with scope (auto-generated)</li>
                    <li><strong>Structural Type:</strong> The category of task (e.g., Ingest, Transcode, Review)</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-[#232073] mb-2">Structural Types</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Tasks can have structural characteristics that define their technical category:
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Ingest - Bringing content into the production pipeline</li>
                    <li>Transcode - Converting content between formats</li>
                    <li>QC (Quality Control) - Reviewing and verifying content quality</li>
                    <li>Review - Collaborative review sessions</li>
                    <li>Approval - Sign-off and approval workflows</li>
                    <li>Delivery - Final output and distribution</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-[#232073] mb-2">Relationships</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Performed by Participants</li>
                    <li>Uses Assets as inputs/outputs</li>
                    <li>Operates within Contexts</li>
                    <li>May require specific Infrastructure</li>
                    <li>Can contain sub-Tasks</li>
                  </ul>
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
                    <h3 className="text-xl font-semibold text-[#232073] mb-2">Participant</h3>
                    <p className="text-sm text-muted-foreground">
                      An entity responsible for the production of a Creative Work.
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-[#232073] mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">
                    Participants are the entities that perform Tasks in a production. This includes individuals 
                    (people), groups (organizations and departments), and automated systems (services). Each 
                    Participant can have roles, contact information, and other metadata.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-[#232073] mb-2">Structural Types</h4>
                  <div className="space-y-3">
                    <div className="p-3 border rounded">
                      <h5 className="font-medium text-[#232073]">Person</h5>
                      <p className="text-sm text-muted-foreground">
                        An individual human being contracted or employed to work on a production. 
                        Fields include: personName, jobTitle, gender, contact, Location.
                      </p>
                    </div>
                    <div className="p-3 border rounded">
                      <h5 className="font-medium text-[#232073]">Organization</h5>
                      <p className="text-sm text-muted-foreground">
                        A group of people or legal entities with a production-related purpose (studios, vendors, etc.).
                        Fields include: organizationName, contact, Location.
                      </p>
                    </div>
                    <div className="p-3 border rounded">
                      <h5 className="font-medium text-[#232073]">Department</h5>
                      <p className="text-sm text-muted-foreground">
                        A functional division within an organization (e.g., Editorial, VFX, Sound).
                        Fields include: departmentName, contact, Location.
                      </p>
                    </div>
                    <div className="p-3 border rounded">
                      <h5 className="font-medium text-[#232073]">Service</h5>
                      <p className="text-sm text-muted-foreground">
                        A computer-driven agent that performs tasks (APIs, automated systems, AI services).
                        Fields include: serviceName, contact.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-[#232073] mb-2">Functional Characteristics</h4>
                  <p className="text-sm text-muted-foreground">
                    Participants can have roles that describe their function in the production, such as 
                    Director, Producer, Editor, VFX Supervisor, etc. These are contextually filtered 
                    based on the structural type.
                  </p>
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
                    <h3 className="text-xl font-semibold text-[#232073] mb-2">Asset</h3>
                    <p className="text-sm text-muted-foreground">
                      Digital or physical media, documents, and materials used in production.
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-[#232073] mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">
                    Assets represent the actual content and materials used in production workflows. This 
                    includes video files, audio files, images, documents, 3D models, and even physical 
                    props or materials. Assets flow through Tasks and can be inputs or outputs of 
                    production processes.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-[#232073] mb-2">Key Fields</h4>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li><strong>Name:</strong> A human-readable name for the asset</li>
                    <li><strong>Description:</strong> What the asset contains or represents</li>
                    <li><strong>Identifier:</strong> Unique identifier with scope</li>
                    <li><strong>Asset Group:</strong> Logical grouping of related assets</li>
                    <li><strong>Version:</strong> Version information for the asset</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-[#232073] mb-2">Structural Types</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="p-2 border rounded">
                      <strong>Digital.Image</strong> - Still images
                    </div>
                    <div className="p-2 border rounded">
                      <strong>Digital.Video</strong> - Video content
                    </div>
                    <div className="p-2 border rounded">
                      <strong>Digital.Audio</strong> - Audio content
                    </div>
                    <div className="p-2 border rounded">
                      <strong>Digital.Document</strong> - Documents
                    </div>
                    <div className="p-2 border rounded">
                      <strong>Geometry.Mesh</strong> - 3D meshes
                    </div>
                    <div className="p-2 border rounded">
                      <strong>Physical.Prop</strong> - Physical props
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-[#232073] mb-2">Structural Properties</h4>
                  <p className="text-sm text-muted-foreground">
                    Based on the structural type, assets have specific technical properties like:
                    resolution, frame rate, duration, codec, file format, dimensions, and more.
                  </p>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                  <h5 className="font-medium text-blue-800 mb-1">Tip: Import from File</h5>
                  <p className="text-sm text-blue-700">
                    You can drag and drop media files into the builder to automatically create Asset 
                    entities with detected metadata like file type, dimensions, and duration.
                  </p>
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
                    <h3 className="text-xl font-semibold text-[#232073] mb-2">Infrastructure</h3>
                    <p className="text-sm text-muted-foreground">
                      Technical systems and facilities that support production workflows.
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-[#232073] mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">
                    Infrastructure represents the underlying technical systems, equipment, and facilities 
                    that enable production activities. This includes storage systems, networks, rendering 
                    farms, cloud services, and other technical resources used during the production process.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-[#232073] mb-2">Key Fields</h4>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li><strong>Name:</strong> A human-readable name for the infrastructure</li>
                    <li><strong>Description:</strong> What the infrastructure provides</li>
                    <li><strong>Identifier:</strong> Unique identifier with scope</li>
                    <li><strong>Structural Type:</strong> The category of infrastructure</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-[#232073] mb-2">Structural Types</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Storage - File storage systems, SAN, NAS, cloud storage</li>
                    <li>Compute - Rendering farms, processing clusters</li>
                    <li>Network - Network infrastructure, connectivity</li>
                    <li>Software - Software applications and platforms</li>
                    <li>Hardware - Physical equipment and devices</li>
                    <li>Facility - Physical locations and spaces</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-[#232073] mb-2">Relationships</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Required by Tasks to perform operations</li>
                    <li>May host or store Assets</li>
                    <li>Operated by Participants</li>
                    <li>Located within Contexts</li>
                  </ul>
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
                    <h3 className="text-xl font-semibold text-[#232073] mb-2">Context</h3>
                    <p className="text-sm text-muted-foreground">
                      A container for grouping related entities within a production workflow.
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-[#232073] mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">
                    Contexts organize and group related entities for specific purposes. They provide the 
                    framework within which production activities take place, grouping elements like scenes, 
                    locations, characters, and assets for narrative storytelling, production planning, 
                    shoot days, or post-production work.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-[#232073] mb-2">Structural Types</h4>
                  <div className="space-y-3">
                    <div className="p-3 border rounded">
                      <h5 className="font-medium text-[#232073]">Narrative Context</h5>
                      <p className="text-sm text-muted-foreground">
                        Groups elements related to the story being told (scenes, characters, story arcs).
                        Fields include: setting, timePeriod, genre, tone, narrativeDescription.
                      </p>
                    </div>
                    <div className="p-3 border rounded">
                      <h5 className="font-medium text-[#232073]">Production Context</h5>
                      <p className="text-sm text-muted-foreground">
                        Groups elements related to the physical production (shoot days, locations, schedules).
                        Fields include: productionPhase, shootDate, callTime, wrapTime, productionNotes.
                      </p>
                    </div>
                    <div className="p-3 border rounded">
                      <h5 className="font-medium text-[#232073]">Workflow Context</h5>
                      <p className="text-sm text-muted-foreground">
                        Groups elements related to post-production and technical workflows.
                        Fields include: workflowStage, priority, deadline, workflowNotes, technicalRequirements.
                      </p>
                    </div>
                    <div className="p-3 border rounded">
                      <h5 className="font-medium text-[#232073]">Temporal Context</h5>
                      <p className="text-sm text-muted-foreground">
                        Groups elements by time periods or schedules.
                        Fields include: startDate, endDate, duration, timezone, temporalNotes.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-[#232073] mb-2">Use Cases</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Organizing scenes and their associated characters, props, and locations</li>
                    <li>Grouping assets for a specific shoot day or production phase</li>
                    <li>Defining workflow stages for post-production pipelines</li>
                    <li>Creating temporal boundaries for project milestones</li>
                  </ul>
                </div>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
