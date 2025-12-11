import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search, User, Loader2, AlertCircle, ExternalLink } from "lucide-react";
import { searchPeople, WikidataPerson } from "@/lib/wikidata";

interface PersonSearchProps {
  onPersonSelect: (person: WikidataPerson) => void;
}

export function PersonSearch({ onPersonSelect }: PersonSearchProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<WikidataPerson[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = async (text: string) => {
    if (text.length < 2) {
      setSuggestions([]);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const results = await searchPeople(text);
      setSuggestions(results);
      setShowDropdown(true);
      if (results.length === 0 && text.length >= 3) {
        setError(null);
      }
    } catch (err) {
      console.error("Person search error:", err);
      setError("Search failed. Please try again.");
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (value: string) => {
    setQuery(value);
    
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      handleSearch(value);
    }, 400);
  };

  const handleSelect = (person: WikidataPerson) => {
    onPersonSelect(person);
    setQuery(person.name);
    setShowDropdown(false);
    setSuggestions([]);
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search for a person (e.g., Steven Spielberg)..."
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
            className="pl-10 pr-10"
            data-testid="input-person-search"
          />
          {isLoading && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
      </div>
      
      {showDropdown && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-80 overflow-y-auto">
          {suggestions.map((person, index) => (
            <button
              key={person.id}
              type="button"
              onClick={() => handleSelect(person)}
              className="w-full px-3 py-3 text-left hover:bg-accent flex items-start gap-3 text-sm transition-colors border-b border-border/50 last:border-b-0"
              data-testid={`person-suggestion-${index}`}
            >
              {person.image ? (
                <img 
                  src={person.image} 
                  alt={person.name}
                  className="w-10 h-10 rounded-full object-cover shrink-0 bg-muted"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <User className="h-5 w-5 text-primary" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-foreground truncate">{person.name}</div>
                {person.description && (
                  <div className="text-xs text-muted-foreground truncate mt-0.5">
                    {person.description}
                  </div>
                )}
                {person.birthDate && (
                  <div className="text-xs text-muted-foreground/70 mt-0.5">
                    Born: {person.birthDate}
                  </div>
                )}
              </div>
              <ExternalLink className="h-3 w-3 text-muted-foreground/50 shrink-0 mt-1" />
            </button>
          ))}
        </div>
      )}
      
      {showDropdown && query.length >= 3 && suggestions.length === 0 && !isLoading && !error && (
        <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg p-3 text-sm text-muted-foreground">
          No people found. Try a different name.
        </div>
      )}
      
      {error && (
        <div className="mt-2 flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
      
      <p className="text-xs text-muted-foreground mt-2">
        Search Wikidata for notable people. Data will populate the Participant form.
      </p>
    </div>
  );
}
