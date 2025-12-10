import { Badge } from "@/components/ui/badge";

const ContextIcon = () => (
  <svg viewBox="1375.27 1509.47 150 150" className="w-12 h-12" xmlns="http://www.w3.org/2000/svg">
    <path 
      d="M 1517.343 1583.172 C 1517.343 1621.099 1486.602 1651.831 1448.684 1651.831 C 1410.767 1651.831 1380.026 1621.099 1380.026 1583.172 C 1380.026 1545.255 1410.767 1514.514 1448.684 1514.514 C 1486.602 1514.514 1517.343 1545.255 1517.343 1583.172 Z" 
      strokeWidth="4" 
      style={{ stroke: '#232073', fill: '#CEECF2' }}
    />
  </svg>
);

export function ContextHeader() {
  return (
    <div className="mb-6 p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border border-primary/20">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 p-2 bg-white rounded-lg shadow-sm">
          <ContextIcon />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-primary mb-1">Context</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            <strong>A container for grouping related entities within a production workflow.</strong> Contexts 
            organize elements like scenes, locations, characters, and assets for specific purposes such as 
            narrative storytelling, production planning, shoot days, or post-production work. Select a 
            context type to define how entities are grouped and used.
          </p>
          <div className="flex gap-2 mt-3">
            <Badge variant="secondary" className="text-xs">OMC v2.8</Badge>
            <Badge variant="outline" className="text-xs">MovieLabs Ontology</Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
