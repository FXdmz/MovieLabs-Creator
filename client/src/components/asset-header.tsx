export function AssetHeader() {
  return (
    <div className="mb-8 p-6 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl border border-primary/20">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-primary/10 rounded-lg">
          <svg 
            width="48" 
            height="48" 
            viewBox="1545.36 1648.8 149.92 149.93"
            xmlns="http://www.w3.org/2000/svg"
            className="text-primary"
          >
            <path 
              d="M 1550.154 1666.405 C 1550.154 1660.29 1555.112 1655.332 1561.228 1655.332 L 1677.428 1655.332 C 1683.543 1655.332 1688.501 1660.29 1688.501 1666.405 L 1688.501 1782.614 C 1688.501 1788.73 1683.543 1793.688 1677.428 1793.688 L 1561.228 1793.688 C 1555.112 1793.688 1550.154 1788.73 1550.154 1782.614 L 1550.154 1666.405 Z" 
              stroke="currentColor" 
              strokeWidth="4" 
              fill="none"
            />
          </svg>
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2">
            <svg 
              width="20" 
              height="20" 
              viewBox="1545.36 1648.8 149.92 149.93"
              xmlns="http://www.w3.org/2000/svg"
              className="text-primary"
            >
              <path 
                d="M 1550.154 1666.405 C 1550.154 1660.29 1555.112 1655.332 1561.228 1655.332 L 1677.428 1655.332 C 1683.543 1655.332 1688.501 1660.29 1688.501 1666.405 L 1688.501 1782.614 C 1688.501 1788.73 1683.543 1793.688 1677.428 1793.688 L 1561.228 1793.688 C 1555.112 1793.688 1550.154 1788.73 1550.154 1782.614 L 1550.154 1666.405 Z" 
                stroke="currentColor" 
                strokeWidth="4" 
                fill="none"
              />
            </svg>
            Asset
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            <strong>A physical or digital object or collection of objects.</strong> Assets are 
            the building blocks of media production, representing everything from cameras and 
            props to digital files and rendered footage. Each Asset has a <em>Functional Type</em> describing 
            its role in production, and an <em>Asset Structural Class (AssetSC)</em> describing its form 
            and attributes specific to that form.
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
