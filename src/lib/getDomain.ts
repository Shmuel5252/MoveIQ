const STRIP_SUFFIXES =
  /[,.]?\s*(inc\.?|corp\.?|corporation|ltd\.?|llc\.?|limited|plc\.?|n\.v\.?|s\.a\.?|co\.?|group|holdings?|technologies|technology|services|systems|solutions|international|global|enterprises?|platforms?|networks?)\s*$/gi;

/**
 * Derives a best-effort domain from a company name.
 * Used when no website field is returned by the API.
 * e.g. "Apple Inc."  → "apple.com"
 *      "NVIDIA Corporation" → "nvidia.com"
 */
export function getDomainFromCompanyName(name: string): string {
  const cleaned = name
    .replace(STRIP_SUFFIXES, "")
    .replace(STRIP_SUFFIXES, "") // second pass catches "Holdings, Inc."
    .replace(/[^a-zA-Z0-9]/g, "")
    .toLowerCase();
  return cleaned ? `${cleaned}.com` : "";
}

/** Strips protocol and path from a URL leaving just the hostname. */
export function normalizeDomain(url: string): string {
  try {
    const { hostname } = new URL(url.startsWith("http") ? url : `https://${url}`);
    return hostname.replace(/^www\./, "");
  } catch {
    return url.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];
  }
}
