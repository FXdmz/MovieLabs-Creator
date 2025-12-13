/**
 * @fileoverview Interactive header for Creative Work entity with Wikidata media lookup.
 * Allows quick population of Creative Work fields by searching for films/TV shows.
 * 
 * @features
 * - MediaSearch integration for Wikidata film/TV lookup
 * - Auto-maps media type to OMC creativeWorkType/category
 * - Populates title, description, and duration from selected media
 */

import { MediaSearch } from "./media-search";
import { WikidataMedia } from "@/lib/wikidata";

const CreativeWorkIcon = ({ className, size = 48 }: { className?: string; size?: number }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 46.35 45.5"
    width={size}
    height={size}
    className={className}
  >
    <path 
      fill="#CEECF2" 
      stroke="#232073"
      strokeWidth="1.5"
      d="M36,22.17a33.27,33.27,0,0,1-9.67-3.41,12.62,12.62,0,0,0,.07-4.63Q24.49,3.3,24.49,3.29A33,33,0,0,1,14,7.17a32.91,32.91,0,0,1-11.18,0S3.46,10.73,4.73,18c1.62,9.19,13.61,13.84,13.61,13.84a30.66,30.66,0,0,0,6.2-8c-.26,1.48-.57,3.25-.94,5.33C22,38.32,31.66,46.79,31.66,46.79s12-4.65,13.61-13.84q1.9-10.83,1.91-10.83A32.91,32.91,0,0,1,36,22.17Z" 
      transform="translate(-1.82 -2.3)"
    />
    <g fill="#232073">
      <path d="M34.09,33a7.42,7.42,0,0,0-6.34,2.38,1,1,0,1,0,1.44,1.38A5.44,5.44,0,0,1,33.74,35a5.44,5.44,0,0,1,3.66,3.24,1,1,0,0,0,.92.6,1,1,0,0,0,.4-.09,1,1,0,0,0,.51-1.32A7.4,7.4,0,0,0,34.09,33Z" transform="translate(-1.82 -2.3)"/>
      <path d="M40.29,28.31a2.47,2.47,0,0,1-1.4.47,2.5,2.5,0,0,1-1.15-.93A1,1,0,1,0,36.11,29a4.31,4.31,0,0,0,2.44,1.75,3.42,3.42,0,0,0,.45,0,4.72,4.72,0,0,0,2.44-.85,1,1,0,0,0-1.15-1.63Z" transform="translate(-1.82 -2.3)"/>
      <path d="M30.67,29.36a2.32,2.32,0,0,0,.46,0,4.83,4.83,0,0,0,2.43-.84,1,1,0,0,0,.25-1.39,1,1,0,0,0-1.39-.25,2.48,2.48,0,0,1-1.4.47,2.52,2.52,0,0,1-1.16-.92,1,1,0,1,0-1.63,1.14A4.31,4.31,0,0,0,30.67,29.36Z" transform="translate(-1.82 -2.3)"/>
      <path d="M21.41,17.21a1,1,0,0,0-1.31.51A5.48,5.48,0,0,1,16.44,21a5.43,5.43,0,0,1-4.55-1.79,1,1,0,0,0-1.42,0,1,1,0,0,0,0,1.41A7.6,7.6,0,0,0,16,23a4.46,4.46,0,0,0,.81-.06,7.46,7.46,0,0,0,5.15-4.4A1,1,0,0,0,21.41,17.21Z" transform="translate(-1.82 -2.3)"/>
      <path d="M18.81,11.4a4.39,4.39,0,0,0-2.44,1.75,1,1,0,0,0,.24,1.39,1,1,0,0,0,.58.18A1,1,0,0,0,18,14.3a2.54,2.54,0,0,1,1.16-.93,2.46,2.46,0,0,1,1.39.48A1,1,0,0,0,22,13.6a1,1,0,0,0-.25-1.39A4.37,4.37,0,0,0,18.81,11.4Z" transform="translate(-1.82 -2.3)"/>
      <path d="M11.28,14.76a2.66,2.66,0,0,1,1.4.47,1,1,0,1,0,1.14-1.63,4.34,4.34,0,0,0-2.89-.81,4.39,4.39,0,0,0-2.44,1.75,1,1,0,0,0,.24,1.39,1,1,0,0,0,.58.18,1,1,0,0,0,.82-.42A2.4,2.4,0,0,1,11.28,14.76Z" transform="translate(-1.82 -2.3)"/>
    </g>
  </svg>
);

/** Props for CreativeWorkHeader with optional form integration */
interface CreativeWorkHeaderProps {
  /** Current form value for the Creative Work entity */
  value?: any;
  /** Callback to update form value when media is selected */
  onChange?: (newValue: any) => void;
}

/**
 * Maps Wikidata media types to OMC creativeWorkType and category.
 * @param mediaType - The Wikidata media type (film, tvSeries, tvEpisode)
 * @returns Object with OMC creativeWorkType and creativeWorkCategory
 */
function mapMediaTypeToOMC(mediaType: WikidataMedia["mediaType"]): { 
  creativeWorkType: string; 
  creativeWorkCategory: string | null;
} {
  switch (mediaType) {
    case "film":
      return { creativeWorkType: "creativeWork", creativeWorkCategory: "movie" };
    case "tvSeries":
      return { creativeWorkType: "series", creativeWorkCategory: "tv" };
    case "tvEpisode":
      return { creativeWorkType: "episode", creativeWorkCategory: "tv" };
    default:
      return { creativeWorkType: "creativeWork", creativeWorkCategory: null };
  }
}

export function CreativeWorkHeader({ value, onChange }: CreativeWorkHeaderProps) {
  const handleMediaSelect = (media: WikidataMedia) => {
    if (!onChange || !value) return;

    const { creativeWorkType, creativeWorkCategory } = mapMediaTypeToOMC(media.mediaType);
    
    const creativeWorkTitle = [{
      titleName: media.title,
      titleType: "release",
      titleLanguage: "en"
    }];

    const updatedValue = {
      ...value,
      name: media.title,
      description: media.description || value.description,
      creativeWorkType,
      creativeWorkCategory,
      creativeWorkTitle,
      ...(media.duration && { approximateLength: media.duration })
    };

    onChange(updatedValue);
  };

  return (
    <div className="mb-8 p-6 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl border border-primary/20">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-white dark:bg-primary/20 rounded-lg shadow-sm">
          <CreativeWorkIcon size={48} />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2">
            <CreativeWorkIcon size={20} />
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
