import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function object_map(o : Object, lambda: (key: string, value: any) => any) {
  return Object.entries(o).map(([key, value]) => {
    return lambda(key, value);
  })
}
