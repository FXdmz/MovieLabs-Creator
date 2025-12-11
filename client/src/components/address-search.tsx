import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Loader2, AlertCircle } from "lucide-react";

interface GeoapifyFeature {
  properties: {
    formatted: string;
    street?: string;
    housenumber?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
    country_code?: string;
    lat?: number;
    lon?: number;
  };
}

interface GeoapifyResponse {
  features: GeoapifyFeature[];
}

interface AddressData {
  street?: string;
  locality?: string;
  region?: string;
  postalCode?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  formatted?: string;
}

interface AddressSearchProps {
  onAddressSelect: (address: AddressData) => void;
}

export function AddressSearch({ onAddressSelect }: AddressSearchProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<GeoapifyFeature[]>([]);
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

  const searchAddress = async (text: string) => {
    if (text.length < 3) {
      setSuggestions([]);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/geocode/autocomplete?text=${encodeURIComponent(text)}`);
      if (response.ok) {
        const data: GeoapifyResponse = await response.json();
        setSuggestions(data.features || []);
        setShowDropdown(true);
      } else {
        setError("Could not search addresses. Please try again.");
        setSuggestions([]);
      }
    } catch (err) {
      console.error("Address search error:", err);
      setError("Address lookup failed. Check your connection.");
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
      searchAddress(value);
    }, 300);
  };

  const handleSelect = (feature: GeoapifyFeature) => {
    const props = feature.properties;
    
    let street = props.street || "";
    if (props.housenumber) {
      street = `${props.housenumber} ${street}`.trim();
    }

    const addressData: AddressData = {
      street: street || undefined,
      locality: props.city || undefined,
      region: props.state || undefined,
      postalCode: props.postcode || undefined,
      country: props.country_code?.toUpperCase() || undefined,
      latitude: props.lat,
      longitude: props.lon,
      formatted: props.formatted,
    };

    onAddressSelect(addressData);
    setQuery(props.formatted || "");
    setShowDropdown(false);
    setSuggestions([]);
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search for an address..."
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
            className="pl-10 pr-10"
            data-testid="input-address-search"
          />
          {isLoading && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
      </div>
      
      {showDropdown && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((feature, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSelect(feature)}
              className="w-full px-3 py-2 text-left hover:bg-accent flex items-start gap-2 text-sm transition-colors"
              data-testid={`address-suggestion-${index}`}
            >
              <MapPin className="h-4 w-4 mt-0.5 text-primary shrink-0" />
              <span className="text-foreground">{feature.properties.formatted}</span>
            </button>
          ))}
        </div>
      )}
      
      {showDropdown && query.length >= 3 && suggestions.length === 0 && !isLoading && !error && (
        <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg p-3 text-sm text-muted-foreground">
          No addresses found. Try a different search.
        </div>
      )}
      
      {error && (
        <div className="mt-2 flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
