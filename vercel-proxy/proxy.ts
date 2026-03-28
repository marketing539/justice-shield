import type { VercelRequest, VercelResponse } from "@vercel/node";

const LOVABLE_ORIGIN = "https://embrace-web-spark.lovable.app";
const PRERENDER_ENDPOINT =
  "https://icrnlvwzgoohgzrilyih.supabase.co/functions/v1/prerender";

const BOT_USER_AGENTS = [
  "googlebot",
  "google-extended",
  "adsbot-google",
  "mediapartners-google",
  "googlebot-image",
  "bingbot",
  "slurp",
  "duckduckbot",
  "baiduspider",
  "yandexbot",
  "sogou",
  "facebookexternalhit",
  "twitterbot",
  "linkedinbot",
  "whatsapp",
  "telegrambot",
  "applebot",
  "semrushbot",
  "ahrefsbot",
  "mj12bot",
  "petalbot",
  "sebot-wa",
];

function isBot(userAgent: string): boolean {
  const ua = userAgent.toLowerCase();
  return BOT_USER_AGENTS.some((bot) => ua.includes(bot));
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const userAgent = (req.headers["user-agent"] as string) || "";
  const path = req.url || "/";

  // Check if this is a bot requesting a service area page
  const match = path.match(/^\/service-areas\/([a-z0-9-]+)$/);

  if (match && isBot(userAgent)) {
    const slug = match[1];
    const prerenderUrl = `${PRERENDER_ENDPOINT}?path=service-areas/${slug}`;

    try {
      const prerenderRes = await fetch(prerenderUrl, {
        headers: { "User-Agent": userAgent },
      });

      if (prerenderRes.ok) {
        const html = await prerenderRes.text();
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=86400");
        res.setHeader("Vary", "User-Agent");
        res.setHeader("X-Prerendered", "true");
        return res.status(200).send(html);
      }
    } catch (err) {
      console.error("Prerender fetch failed:", err);
      // Fall through to origin
    }
  }

  // Proxy all other requests to the Lovable origin
  const originUrl = `${LOVABLE_ORIGIN}${path}`;

  try {
    const originRes = await fetch(originUrl, {
      method: req.method,
      headers: {
        "User-Agent": userAgent,
        Accept: (req.headers.accept as string) || "*/*",
      },
    });

    // Forward status and key headers
    const contentType = originRes.headers.get("content-type") || "text/html";
    res.setHeader("Content-Type", contentType);

    const cacheControl = originRes.headers.get("cache-control");
    if (cacheControl) res.setHeader("Cache-Control", cacheControl);

    const body = await originRes.arrayBuffer();
    return res.status(originRes.status).send(Buffer.from(body));
  } catch (err) {
    console.error("Origin fetch failed:", err);
    return res.status(502).send("Bad Gateway");
  }
}
