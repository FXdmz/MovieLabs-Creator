/**
 * @fileoverview Utility Functions - Common helper utilities.
 * Provides className merging utility using clsx and tailwind-merge.
 * 
 * @exports cn - Merge and deduplicate Tailwind CSS class names
 */
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
