import { Film } from 'lucide-react';

export function CreativeWorkHeader() {
  return (
    <div className="mb-8 p-6 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl border border-primary/20">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-primary/10 rounded-lg">
          <svg 
            width="48" 
            height="48" 
            viewBox="0 0 100 100" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="text-primary"
          >
            <rect x="10" y="20" width="80" height="60" rx="4" stroke="currentColor" strokeWidth="3" fill="none"/>
            <circle cx="30" cy="40" r="8" stroke="currentColor" strokeWidth="2" fill="none"/>
            <circle cx="70" cy="40" r="8" stroke="currentColor" strokeWidth="2" fill="none"/>
            <path d="M30 40 L30 65" stroke="currentColor" strokeWidth="2"/>
            <path d="M70 40 L70 65" stroke="currentColor" strokeWidth="2"/>
            <rect x="25" y="60" width="10" height="15" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
            <rect x="65" y="60" width="10" height="15" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
            <path d="M15 30 L85 30" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4"/>
            <rect x="40" y="45" width="20" height="20" rx="2" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.1"/>
            <path d="M47 52 L47 58 L55 55 Z" fill="currentColor"/>
          </svg>
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2">
            <Film className="h-5 w-5 text-primary" />
            Creative Work
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            <strong>A uniquely identified production.</strong> A single production process can produce 
            multiple Creative Works, e.g., several episodes of a series, or the theatrical version 
            and an extended streaming version of a movie. Creative Work covers aspects directly 
            related to or outputs of the film and television production process.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">OMC v2.8</span>
            <span className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded-full">MovieLabs Ontology</span>
          </div>
        </div>
      </div>
    </div>
  );
}
