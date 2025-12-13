/**
 * @fileoverview Dimension input component with numeric value and unit selector.
 * Outputs OMC-compliant dimension strings (e.g., "1920px", "100cm").
 * 
 * @features
 * - Numeric input with unit dropdown
 * - Supports pixels, metric (mm, cm, m, km), and imperial (in, ft, mi) units
 * - Parses existing dimension strings on load
 * - Outputs combined value+unit string
 */

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";

/** Available dimension units grouped by category */
const DIMENSION_UNITS = [
  { value: 'px', label: 'Pixels (px)', category: 'Digital' },
  { value: 'cm', label: 'Centimeters (cm)', category: 'Metric' },
  { value: 'm', label: 'Meters (m)', category: 'Metric' },
  { value: 'mm', label: 'Millimeters (mm)', category: 'Metric' },
  { value: 'km', label: 'Kilometers (km)', category: 'Metric' },
  { value: 'ft', label: 'Feet (ft)', category: 'Imperial' },
  { value: 'in', label: 'Inches (in)', category: 'Imperial' },
  { value: 'mi', label: 'Miles (mi)', category: 'Imperial' },
];

/** Props for DimensionInput component */
interface DimensionInputProps {
  /** Current dimension value (e.g., "1920px") or null */
  value: string | null;
  /** Callback when dimension changes, passes combined value+unit or null */
  onChange: (value: string | null) => void;
  /** Placeholder text for numeric input */
  placeholder?: string;
}

/**
 * Dimension input with value and unit selector.
 * Combines numeric value with selected unit for OMC dimension fields.
 */
export function DimensionInput({ value, onChange, placeholder }: DimensionInputProps) {
  const [numericValue, setNumericValue] = useState<string>('');
  const [unit, setUnit] = useState<string>('px');

  useEffect(() => {
    if (value && typeof value === 'string') {
      const match = value.match(/^(-?\d+)(km|m|cm|mm|mi|ft|in|px)$/);
      if (match) {
        setNumericValue(match[1]);
        setUnit(match[2]);
      }
    } else {
      setNumericValue('');
    }
  }, []);

  const updateValue = (num: string, u: string) => {
    if (num === '' || num === null) {
      onChange(null);
    } else {
      onChange(`${num}${u}`);
    }
  };

  const handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = e.target.value;
    setNumericValue(num);
    updateValue(num, unit);
  };

  const handleUnitChange = (u: string) => {
    setUnit(u);
    updateValue(numericValue, u);
  };

  return (
    <div className="flex gap-2">
      <Input
        type="number"
        value={numericValue}
        onChange={handleNumericChange}
        placeholder={placeholder || "Value"}
        className="bg-background flex-1"
        data-testid="input-dimension-value"
      />
      <Select value={unit} onValueChange={handleUnitChange}>
        <SelectTrigger className="w-[140px]" data-testid="select-dimension-unit">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="px" className="font-medium">Pixels (px)</SelectItem>
          <div className="px-2 py-1 text-xs text-muted-foreground font-semibold">Metric</div>
          <SelectItem value="mm">Millimeters (mm)</SelectItem>
          <SelectItem value="cm">Centimeters (cm)</SelectItem>
          <SelectItem value="m">Meters (m)</SelectItem>
          <SelectItem value="km">Kilometers (km)</SelectItem>
          <div className="px-2 py-1 text-xs text-muted-foreground font-semibold">Imperial</div>
          <SelectItem value="in">Inches (in)</SelectItem>
          <SelectItem value="ft">Feet (ft)</SelectItem>
          <SelectItem value="mi">Miles (mi)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
