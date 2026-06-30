export interface SectorMetaEntry {
  id: string;
  label: string;
}

// Maps the GICS sector strings Yahoo returns to our Hebrew labels + stable ids.
export const SECTOR_META: Record<string, SectorMetaEntry> = {
  Technology: { id: "technology", label: "טכנולוגיה" },
  "Information Technology": { id: "technology", label: "טכנולוגיה" },
  "Financial Services": { id: "financial", label: "פיננסים" },
  Financials: { id: "financial", label: "פיננסים" },
  Healthcare: { id: "healthcare", label: "בריאות" },
  "Health Care": { id: "healthcare", label: "בריאות" },
  "Consumer Cyclical": { id: "consumer-cyclical", label: "צריכה מחזורית" },
  "Consumer Discretionary": { id: "consumer-cyclical", label: "צריכה מחזורית" },
  "Communication Services": { id: "communication", label: "תקשורת" },
  "Consumer Defensive": { id: "consumer-defensive", label: "צריכה בסיסית" },
  "Consumer Staples": { id: "consumer-defensive", label: "צריכה בסיסית" },
  Energy: { id: "energy", label: "אנרגיה" },
  Industrials: { id: "industrials", label: "תעשייה" },
  "Real Estate": { id: "real-estate", label: "נדל\"ן" },
  "Basic Materials": { id: "materials", label: "חומרי גלם" },
  Materials: { id: "materials", label: "חומרי גלם" },
  Utilities: { id: "utilities", label: "שירותים ציבוריים" },
};

export function sectorMeta(rawSector: string): SectorMetaEntry {
  return (
    SECTOR_META[rawSector] ?? { id: rawSector.toLowerCase().replace(/\s+/g, "-"), label: rawSector }
  );
}

export function rawSectorsForId(id: string): string[] {
  return Object.entries(SECTOR_META)
    .filter(([, meta]) => meta.id === id)
    .map(([raw]) => raw);
}
