import { useMemo } from "react";
import { Entity } from "@/lib/store";
import { exportEntities } from "@/lib/export";
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
import { Badge } from "@/components/ui/badge";

interface ViewAllOmcDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entities: Entity[];
}

export function ViewAllOmcDialog({ open, onOpenChange, entities }: ViewAllOmcDialogProps) {
  const { toast } = useToast();

  const jsonContent = useMemo(() => {
    if (entities.length === 0) return "[]";
    return exportEntities(entities, { format: "json", pretty: true });
  }, [entities]);

  const rdfContent = useMemo(() => {
    if (entities.length === 0) return "";
    return exportEntities(entities, { format: "ttl", pretty: true });
  }, [entities]);

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]" data-testid="dialog-view-all-omc">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-primary">All OMC Entities</span>
            <Badge variant="secondary" className="ml-2">{entities.length} entities</Badge>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="json" className="w-full">
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="json" className="gap-2" data-testid="tab-all-json">
                <FileJson className="h-4 w-4" />
                JSON
              </TabsTrigger>
              <TabsTrigger value="rdf" className="gap-2" data-testid="tab-all-rdf">
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
                data-testid="button-copy-all-json"
              >
                <Copy className="h-4 w-4" />
                Copy JSON
              </Button>
            </div>
            <ScrollArea className="h-[400px] rounded-lg border bg-muted/30">
              <pre
                className="p-4 text-xs font-mono whitespace-pre-wrap break-words"
                data-testid="content-all-json"
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
                data-testid="button-copy-all-rdf"
              >
                <Copy className="h-4 w-4" />
                Copy TTL
              </Button>
            </div>
            <ScrollArea className="h-[400px] rounded-lg border bg-muted/30">
              <pre
                className="p-4 text-xs font-mono whitespace-pre-wrap break-words"
                data-testid="content-all-rdf"
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
