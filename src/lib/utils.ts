import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatEventCategory(category: string) {
  switch (category) {
    case 'Technical':
      return 'border-cyan-500/30 text-cyan-400 bg-cyan-500/10';
    case 'Non-Technical':
      return 'border-purple-500/30 text-purple-400 bg-purple-500/10';
    case 'Special':
      return 'border-amber-500/30 text-amber-400 bg-amber-500/10';
    default:
      return 'border-slate-500/30 text-slate-300 bg-slate-500/10';
  }
}
