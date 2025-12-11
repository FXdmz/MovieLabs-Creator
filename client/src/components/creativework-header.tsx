import { MediaSearch } from "./media-search";
import { WikidataMedia, extractWikidataMediaData } from "@/lib/wikidata";
import { v4 as uuidv4 } from "uuid";
import { Film } from "lucide-react";

interface CreativeWorkHeaderProps {
  value?: any;
  onChange?: (newValue: any) => void;
}

export function CreativeWorkHeader({ value, onChange }: CreativeWorkHeaderProps) {
  const handleMediaSelect = (media: WikidataMedia) => {
    if (!onChange || !value) return;

    const wikidataData = extractWikidataMediaData(media);
    
    const updatedValue = {
      ...value,
      name: wikidataData.name,
      description: wikidataData.description || value.description
    };

    onChange(updatedValue);
  };

  return (
    <div className="mb-8 p-6 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl border border-primary/20">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-white dark:bg-primary/20 rounded-lg shadow-sm">
          <Film className="h-12 w-12 text-[#232073] dark:text-primary" />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2">
            <Film className="h-5 w-5" />
            Creative Work
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            <strong>A uniquely identified production.</strong> A Creative Work encompasses 
            the entire intellectual property being created, including all its versions and manifestations. 
            It represents movies, TV shows, series, episodes, or any other form of media content 
            being produced.
          </p>
          
          {onChange && (
            <div className="mb-4">
              <label className="text-sm font-medium text-foreground mb-2 block">
                Quick Media Lookup
              </label>
              <MediaSearch onMediaSelect={handleMediaSelect} />
            </div>
          )}
          
          <div className="flex flex-wrap gap-2">
            <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">OMC v2.8</span>
            <span className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded-full">MovieLabs Ontology</span>
          </div>
        </div>
      </div>
    </div>
  );
}
