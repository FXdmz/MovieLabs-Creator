export function InfrastructureHeader() {
  return (
    <div className="mb-8 p-6 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl border border-primary/20">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-primary/10 rounded-lg">
          <svg 
            viewBox="0 0 264.57 149.92" 
            xmlns="http://www.w3.org/2000/svg"
            width="48" 
            height="48" 
            className="text-primary"
          >
            <path 
              d="M 207.698 5.208 C 234.978 5.208 257.087 36.529 257.087 75.167 C 257.087 113.805 234.968 145.126 207.698 145.126 L 59.538 145.126 C 32.286 145.126 10.167 113.805 10.167 75.167 C 10.167 36.529 32.286 5.208 59.538 5.208 L 207.698 5.208 Z" 
              strokeWidth="4" 
              fill="currentColor"
              stroke="currentColor"
            />
          </svg>
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2">
            <svg 
              viewBox="0 0 264.57 149.92" 
              xmlns="http://www.w3.org/2000/svg"
              width="20" 
              height="12" 
              className="text-primary"
            >
              <path 
                d="M 207.698 5.208 C 234.978 5.208 257.087 36.529 257.087 75.167 C 257.087 113.805 234.968 145.126 207.698 145.126 L 59.538 145.126 C 32.286 145.126 10.167 113.805 10.167 75.167 C 10.167 36.529 32.286 5.208 59.538 5.208 L 207.698 5.208 Z" 
                strokeWidth="4" 
                fill="currentColor"
                stroke="currentColor"
              />
            </svg>
            Infrastructure
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            <strong>Technical systems and facilities supporting production.</strong> Infrastructure 
            represents the underlying technical systems, equipment, and facilities that enable 
            production activities. This includes storage systems, networks, rendering farms, 
            and other technical resources used during the production process.
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
