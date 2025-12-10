import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DurationInputProps {
  value: string;
  onChange: (value: string) => void;
}

function parseISO8601Duration(duration: string): { hours: number; minutes: number; seconds: number; days: number } {
  const result = { hours: 0, minutes: 0, seconds: 0, days: 0 };
  
  if (!duration || typeof duration !== 'string') return result;
  
  const match = duration.match(/^(-?)P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d*\.?\d+)S)?)?$/);
  
  if (match) {
    result.days = parseInt(match[2] || '0', 10);
    result.hours = parseInt(match[3] || '0', 10);
    result.minutes = parseInt(match[4] || '0', 10);
    result.seconds = parseFloat(match[5] || '0');
  }
  
  return result;
}

function formatISO8601Duration(days: number, hours: number, minutes: number, seconds: number): string {
  if (days === 0 && hours === 0 && minutes === 0 && seconds === 0) {
    return '';
  }
  
  let result = 'P';
  
  if (days > 0) {
    result += `${days}D`;
  }
  
  if (hours > 0 || minutes > 0 || seconds > 0) {
    result += 'T';
    if (hours > 0) result += `${hours}H`;
    if (minutes > 0) result += `${minutes}M`;
    if (seconds > 0) {
      result += Number.isInteger(seconds) ? `${seconds}S` : `${seconds.toFixed(2)}S`;
    }
  }
  
  return result;
}

export function DurationInput({ value, onChange }: DurationInputProps) {
  const parsed = parseISO8601Duration(value);
  const [days, setDays] = useState(parsed.days);
  const [hours, setHours] = useState(parsed.hours);
  const [minutes, setMinutes] = useState(parsed.minutes);
  const [seconds, setSeconds] = useState(parsed.seconds);

  useEffect(() => {
    const newParsed = parseISO8601Duration(value);
    setDays(newParsed.days);
    setHours(newParsed.hours);
    setMinutes(newParsed.minutes);
    setSeconds(newParsed.seconds);
  }, [value]);

  const handleChange = (newDays: number, newHours: number, newMinutes: number, newSeconds: number) => {
    const formatted = formatISO8601Duration(newDays, newHours, newMinutes, newSeconds);
    onChange(formatted);
  };

  return (
    <div className="flex flex-wrap items-center gap-3 p-3 bg-muted/30 rounded-lg border border-border">
      <div className="flex items-center gap-1.5">
        <Input
          type="number"
          min="0"
          max="365"
          value={days || ''}
          onChange={(e) => {
            const val = parseInt(e.target.value) || 0;
            setDays(val);
            handleChange(val, hours, minutes, seconds);
          }}
          className="w-16 h-9 text-center bg-background"
          placeholder="0"
        />
        <span className="text-xs text-muted-foreground font-medium">days</span>
      </div>
      
      <div className="flex items-center gap-1.5">
        <Input
          type="number"
          min="0"
          max="23"
          value={hours || ''}
          onChange={(e) => {
            const val = parseInt(e.target.value) || 0;
            setHours(val);
            handleChange(days, val, minutes, seconds);
          }}
          className="w-14 h-9 text-center bg-background"
          placeholder="0"
        />
        <span className="text-xs text-muted-foreground font-medium">hrs</span>
      </div>
      
      <div className="flex items-center gap-1.5">
        <Input
          type="number"
          min="0"
          max="59"
          value={minutes || ''}
          onChange={(e) => {
            const val = parseInt(e.target.value) || 0;
            setMinutes(val);
            handleChange(days, hours, val, seconds);
          }}
          className="w-14 h-9 text-center bg-background"
          placeholder="0"
        />
        <span className="text-xs text-muted-foreground font-medium">min</span>
      </div>
      
      <div className="flex items-center gap-1.5">
        <Input
          type="number"
          min="0"
          max="59"
          step="0.1"
          value={seconds || ''}
          onChange={(e) => {
            const val = parseFloat(e.target.value) || 0;
            setSeconds(val);
            handleChange(days, hours, minutes, val);
          }}
          className="w-16 h-9 text-center bg-background"
          placeholder="0"
        />
        <span className="text-xs text-muted-foreground font-medium">sec</span>
      </div>
      
      {value && (
        <div className="ml-auto text-xs font-mono text-muted-foreground bg-background px-2 py-1 rounded border">
          {value}
        </div>
      )}
    </div>
  );
}
