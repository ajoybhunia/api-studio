export type ClassValue =
  | string
  | number
  | null
  | undefined
  | false
  | Record<string, unknown>
  | ClassValue[];

export function cn(...inputs: ClassValue[]): string {
  const out: string[] = [];

  const append = (value: ClassValue) => {
    if (!value && value !== 0) return;
    if (Array.isArray(value)) {
      value.forEach(append);
      return;
    }
    if (typeof value === "object") {
      for (const [key, val] of Object.entries(value)) {
        if (val) out.push(key);
      }
      return;
    }
    out.push(String(value));
  };

  inputs.forEach(append);
  return out.join(" ");
}
