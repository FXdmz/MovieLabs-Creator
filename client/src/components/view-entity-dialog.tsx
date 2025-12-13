/**
 * @fileoverview Dialog for viewing a single entity in JSON and RDF/TTL formats.
 * Provides export preview for individual OMC entities.
 * 
 * @features
 * - JSON tab with formatted entity content
 * - RDF/TTL tab with Turtle serialization
 * - Copy-to-clipboard for both formats
 * - Entity type and name in title
 * 
 * @exports ViewEntityDialog - Single entity output viewer dialog
 */

import { useMemo } from "react";
import { Entity } from "@/lib/store";
import { entityToTurtle } from "@/lib/export/rdf/serializer";
import { useToast } from "@/hooks/use-toast";
import { Copy, FileJson, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

/** Props for ViewEntityDialog component */
interface ViewEntityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entity: Entity | null;
}

export function ViewEntityDialog({ open, onOpenChange, entity }: ViewEntityDialogProps) {
  const { toast } = useToast();

  const jsonContent = useMemo(() => {
    if (!entity) return "";
    return JSON.stringify(entity.content, null, 2);
  }, [entity]);

  const rdfContent = useMemo(() => {
    if (!entity) return "";
    return entityToTurtle(entity);
  }, [entity]);

  const copyToClipboard = async (content: string, format: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: "Copied!",
        description: `${format} content copied to clipboard`,
      });
    } catch (err) {
      const textarea = document.createElement("textarea");
      textarea.value = content;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      toast({
        title: "Copied!",
        description: `${format} content copied to clipboard`,
      });
    }
  };

  if (!entity) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]" data-testid="dialog-view-entity">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-primary">{entity.type}</span>
            <span className="text-muted-foreground">—</span>
            <span>{entity.name}</span>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="json" className="w-full">
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="json" className="gap-2" data-testid="tab-json">
                <FileJson className="h-4 w-4" />
                JSON
              </TabsTrigger>
              <TabsTrigger value="rdf" className="gap-2" data-testid="tab-rdf">
                <FileText className="h-4 w-4" />
                RDF/TTL
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="json" className="mt-0">
            <div className="flex justify-end mb-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(jsonContent, "JSON")}
                className="gap-2"
                data-testid="button-copy-json"
              >
                <Copy className="h-4 w-4" />
                Copy JSON
              </Button>
            </div>
            <ScrollArea className="h-[400px] rounded-lg border bg-muted/30">
              <pre
                className="p-4 text-xs font-mono whitespace-pre-wrap break-words"
                data-testid="content-json"
              >
                {jsonContent}
              </pre>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="rdf" className="mt-0">
            <div className="flex justify-end mb-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(rdfContent, "RDF/TTL")}
                className="gap-2"
                data-testid="button-copy-rdf"
              >
                <Copy className="h-4 w-4" />
                Copy TTL
              </Button>
            </div>
            <ScrollArea className="h-[400px] rounded-lg border bg-muted/30">
              <pre
                className="p-4 text-xs font-mono whitespace-pre-wrap break-words"
                data-testid="content-rdf"
              >
                {rdfContent}
              </pre>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
