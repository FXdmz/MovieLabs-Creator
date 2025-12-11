import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search, Film, Tv, Loader2, AlertCircle, ExternalLink } from "lucide-react";
import { searchMedia, WikidataMedia } from "@/lib/wikidata";

interface MediaSearchProps {
  onMediaSelect: (media: WikidataMedia) => void;
}

export function MediaSearch({ onMediaSelect }: MediaSearchProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<WikidataMedia[]>([]);
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
      const results = await searchMedia(text);
      setSuggestions(results);
      setShowDropdown(true);
      if (results.length === 0 && text.length >= 3) {
        setError(null);
      }
    } catch (err) {
      console.error("Media search error:", err);
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

  const handleSelect = (media: WikidataMedia) => {
    onMediaSelect(media);
    setQuery(media.title);
    setShowDropdown(false);
    setSuggestions([]);
  };

  const getMediaIcon = (type: WikidataMedia["mediaType"]) => {
    switch (type) {
      case "film":
        return <Film className="h-5 w-5 text-primary" />;
      case "tvSeries":
      case "tvEpisode":
        return <Tv className="h-5 w-5 text-primary" />;
      default:
        return <Film className="h-5 w-5 text-primary" />;
    }
  };

  const getMediaTypeLabel = (type: WikidataMedia["mediaType"]) => {
    switch (type) {
      case "film":
        return "Film";
      case "tvSeries":
        return "TV Series";
      case "tvEpisode":
        return "TV Episode";
      default:
        return "Media";
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search for a movie or TV show..."
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
            className="pl-10 pr-10"
            data-testid="input-media-search"
          />
          {isLoading && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
      </div>
      
      {showDropdown && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-80 overflow-y-auto">
          {suggestions.map((media, index) => (
            <button
              key={media.id}
              type="button"
              onClick={() => handleSelect(media)}
              className="w-full px-3 py-3 text-left hover:bg-accent flex items-start gap-3 text-sm transition-colors border-b border-border/50 last:border-b-0"
              data-testid={`media-suggestion-${index}`}
            >
              {media.image ? (
                <img 
                  src={media.image} 
                  alt={media.title}
                  className="w-12 h-16 rounded object-cover shrink-0 bg-muted"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-12 h-16 rounded bg-primary/10 flex items-center justify-center shrink-0">
                  {getMediaIcon(media.mediaType)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-foreground truncate">{media.title}</div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">
                    {getMediaTypeLabel(media.mediaType)}
                  </span>
                  {media.releaseDate && (
                    <span className="text-xs text-muted-foreground">
                      {media.releaseDate.split("-")[0]}
                    </span>
                  )}
                </div>
                {media.description && (
                  <div className="text-xs text-muted-foreground truncate mt-1">
                    {media.description}
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
          No movies or TV shows found. Try a different title.
        </div>
      )}
      
      {error && (
        <div className="mt-2 flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
      
      <p className="text-xs text-muted-foreground mt-2">
        Search Wikidata for movies and TV shows. Data will populate the Creative Work form.
      </p>
    </div>
  );
}
