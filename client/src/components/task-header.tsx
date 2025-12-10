export function TaskHeader() {
  return (
    <div className="mb-8 p-6 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl border border-primary/20">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-primary/10 rounded-lg">
          <svg 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
            width="48" 
            height="48" 
            className="text-primary"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 11l3 3L22 4" />
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
          </svg>
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2">
            <svg 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
              width="20" 
              height="20" 
              className="text-primary"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
            Task
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            <strong>A piece of work to be done and completed as a step in the production process.</strong> Tasks 
            are carried out by Participants; can take Assets as input and produce them as output; most 
            Tasks require Context to be carried out properly; and some Tasks require particular 
            pieces of Infrastructure. Tasks can be composed of other Tasks for appropriate granularity.
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
