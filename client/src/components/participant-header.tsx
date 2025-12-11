import { PersonSearch } from "./person-search";
import { WikidataPerson } from "@/lib/wikidata";

const ParticipantIcon = ({ className, size = 48 }: { className?: string; size?: number }) => (
  <svg 
    viewBox="1620.35 1648.8 159.848 148.03" 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size}
    className={className}
  >
    <path 
      d="M 1627.367 1731.241 C 1624.541 1726.171 1624.541 1720 1627.367 1714.93 L 1656.794 1662.124 C 1659.602 1657.091 1664.914 1653.972 1670.677 1653.974 L 1729.057 1653.974 C 1734.822 1653.974 1740.135 1657.097 1742.94 1662.134 L 1772.368 1714.93 C 1775.19 1719.997 1775.19 1726.164 1772.368 1731.231 L 1742.94 1784.018 C 1740.135 1789.055 1734.822 1792.178 1729.057 1792.178 L 1670.668 1792.178 C 1664.906 1792.175 1659.597 1789.052 1656.794 1784.018 L 1627.367 1731.241 Z" 
      stroke="#232073" 
      strokeWidth="4" 
      fill="#CEECF2" 
    />
  </svg>
);

interface ParticipantHeaderProps {
  value?: any;
  onChange?: (newValue: any) => void;
}

export function ParticipantHeader({ value, onChange }: ParticipantHeaderProps) {
  const handlePersonSelect = (participantData: Record<string, any>, person: WikidataPerson) => {
    if (!onChange || !value) return;

    const updatedValue = {
      ...value,
      ...participantData,
      identifier: value.identifier || participantData.identifier,
    };

    onChange(updatedValue);
  };

  return (
    <div className="mb-8 p-6 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl border border-primary/20">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-white rounded-lg shadow-sm">
          <ParticipantIcon size={48} />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2">
            <ParticipantIcon size={20} />
            Participant
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            <strong>Entities responsible for the production of a Creative Work.</strong> Participants 
            include People (individuals contracted or employed), Organizations (groups or legal entities 
            with a production purpose), and Services (computer-driven agents that perform tasks). 
            Select a structural type to define whether this is a Person, Organization, Department, or Service.
          </p>
          
          {onChange && (
            <div className="mb-4">
              <label className="text-sm font-medium text-foreground mb-2 block">
                Quick Person Lookup
              </label>
              <PersonSearch onPersonSelect={handlePersonSelect} />
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
