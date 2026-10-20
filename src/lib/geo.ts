export interface VisitorLocation {
  city?: string;
  country?: string;
}

/** Trims a header value and drops anything odd, so a forged or malformed
 * header can't put long or control-character text into the database. */
function clean(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const text = value.replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, 80);
  return text || undefined;
}

function safeDecode(value: string | null): string | undefined {
  if (!value) return undefined;
  try {
    return clean(decodeURIComponent(value));
  } catch {
    return clean(value);
  }
}

/** The visitor's approximate city and country, worked out by the host from
 * their network address - only the place name is kept, never the address
 * itself. Netlify sends it as a base64 JSON header (`x-nf-geo`); a couple of
 * other hosts' headers are understood too so a move wouldn't lose it. */
export function getVisitorLocation(headers: Headers): VisitorLocation {
  const netlify = headers.get("x-nf-geo");
  if (netlify) {
    try {
      const geo = JSON.parse(Buffer.from(netlify, "base64").toString("utf8"));
      const city = clean(geo?.city);
      const country = clean(geo?.country?.name) ?? clean(geo?.country?.code);
      if (city || country) return { city, country };
    } catch {
      // Fall through to the other headers.
    }
  }

  const city = safeDecode(headers.get("x-vercel-ip-city"));
  const country = clean(headers.get("x-vercel-ip-country")) ?? clean(headers.get("cf-ipcountry"));
  return { city, country };
}

/** "Pune, India" - or whichever of the two is known, or null for neither. */
export function formatLocation(city?: string | null, country?: string | null): string | null {
  const parts = [city, country].filter((p): p is string => Boolean(p));
  return parts.length > 0 ? parts.join(", ") : null;
}
