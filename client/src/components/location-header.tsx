import { AddressSearch } from "./address-search";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

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

interface LocationHeaderProps {
  value?: any;
  onChange?: (newValue: any) => void;
}

export function LocationHeader({ value, onChange }: LocationHeaderProps) {
  const handleAddressSelect = (address: AddressData) => {
    if (!onChange || !value) return;

    const existingAddress = value.address ?? {};
    const existingCoordinates = value.coordinates ?? {};

    const updatedValue = {
      ...value,
      address: {
        ...existingAddress,
        street: address.street || existingAddress.street,
        locality: address.locality || existingAddress.locality,
        region: address.region || existingAddress.region,
        postalCode: address.postalCode || existingAddress.postalCode,
        country: address.country || existingAddress.country,
      },
      coordinates: {
        ...existingCoordinates,
        latitude: address.latitude ?? existingCoordinates.latitude,
        longitude: address.longitude ?? existingCoordinates.longitude,
      },
    };

    onChange(updatedValue);
  };

  return (
    <div className="mb-8 p-6 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl border border-primary/20">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-primary/10 rounded-lg">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 28 46"
            width="48" 
            height="48" 
            className="text-primary"
            fill="currentColor"
          >
            <g>
              <path d="M25,10a6,6,0,1,0,6,6A6,6,0,0,0,25,10Zm0,10a4,4,0,1,1,4-4A4,4,0,0,1,25,20Z" transform="translate(-11 -2)"/>
              <path d="M25,2A14,14,0,0,0,11,16c0,9,14,32,14,32S39,25,39,16A14,14,0,0,0,25,2ZM13,16a12,12,0,0,1,24,0c0,6-7.55,20.37-12,28.07C20.55,36.37,13,22,13,16Z" transform="translate(-11 -2)"/>
            </g>
          </svg>
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 28 46"
              width="20" 
              height="20" 
              className="text-primary"
              fill="currentColor"
            >
              <g>
                <path d="M25,10a6,6,0,1,0,6,6A6,6,0,0,0,25,10Zm0,10a4,4,0,1,1,4-4A4,4,0,0,1,25,20Z" transform="translate(-11 -2)"/>
                <path d="M25,2A14,14,0,0,0,11,16c0,9,14,32,14,32S39,25,39,16A14,14,0,0,0,25,2ZM13,16a12,12,0,0,1,24,0c0,6-7.55,20.37-12,28.07C20.55,36.37,13,22,13,16Z" transform="translate(-11 -2)"/>
              </g>
            </svg>
            Location
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            <strong>A real-world place or address.</strong> Location represents physical places in the real 
            world that may be used for production activities. This includes addresses, geographic coordinates, 
            and other location-specific metadata for organizing production logistics.
          </p>
          
          {onChange && (
            <>
              <div className="grid grid-cols-1 gap-4 mb-4">
                <div>
                  <Label htmlFor="location-name" className="text-sm font-medium mb-2 block">
                    Location Name
                  </Label>
                  <Input
                    id="location-name"
                    value={value?.name || ''}
                    onChange={(e) => onChange({ ...value, name: e.target.value })}
                    placeholder="e.g., Main Studio, Central Park Location"
                    data-testid="input-location-name"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    A friendly name for this location
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="location-description" className="text-sm font-medium mb-2 block">
                    Description
                  </Label>
                  <Textarea
                    id="location-description"
                    value={value?.description || ''}
                    onChange={(e) => onChange({ ...value, description: e.target.value })}
                    placeholder="Describe this location and its purpose in the production..."
                    rows={3}
                    data-testid="input-location-description"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Additional details about this location
                  </p>
                </div>
              </div>
              
              <div className="mb-4">
                <Label className="text-sm font-medium mb-2 block">
                  Quick Address Lookup
                </Label>
                <AddressSearch onAddressSelect={handleAddressSelect} />
                <p className="text-xs text-muted-foreground mt-1">
                  Search for an address to auto-fill the location fields below
                </p>
              </div>
            </>
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
