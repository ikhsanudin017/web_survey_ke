import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number,
  options: { leading?: boolean; trailing?: boolean } = {}
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastCallTime: number | null = null;
  const { leading = false, trailing = true } = options;

  return (...args: Parameters<T>) => {
    const now = Date.now();

    if (lastCallTime === null && leading) {
      func(...args);
    }

    lastCallTime = now;

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      if (trailing && lastCallTime === now) {
        func(...args);
      }
      timeoutId = null;
      lastCallTime = null;
    }, delay);
  };
}
