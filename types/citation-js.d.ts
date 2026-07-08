// Ambient type declarations for @citation-js packages, which ship no types.
// Only the small surface used by plugins/citations.ts is modelled here.

declare module "@citation-js/core" {
  export interface CiteDataEntry {
    id: string;
    [key: string]: unknown;
  }

  export class Cite {
    constructor(data?: unknown, options?: unknown);
    data: CiteDataEntry[];
    format(type: string, options?: Record<string, unknown>): string;
  }
}

// Side-effect-only plugin registrations.
declare module "@citation-js/plugin-bibtex";
declare module "@citation-js/plugin-csl";
