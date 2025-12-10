import { ScrollArea } from "@/components/ui/scroll-area";

interface JsonEditorProps {
  value: any;
  onChange: (value: any) => void;
  schema?: any;
}

export function JsonEditor({ value, onChange, schema }: JsonEditorProps) {
  const jsonString = JSON.stringify(value, null, 2);
  
  return (
    <div className="h-full w-full rounded-md overflow-hidden border border-border bg-card">
      <ScrollArea className="h-full">
        <pre className="p-4 text-sm font-mono text-foreground whitespace-pre-wrap break-words">
          {jsonString}
        </pre>
      </ScrollArea>
    </div>
  );
}
