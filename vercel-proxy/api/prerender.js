export default async function handler(req, res) {
  const BOT_USER_AGENTS = [
    "googlebot", "google-extended", "adsbot-google", "mediapartners-google",
    "googlebot-image", "bingbot", "slurp", "duckduckbot", "baiduspider",
    "yandexbot", "sogou", "facebookexternalhit", "twitterbot",
    "linkedinbot", "whatsapp", "telegrambot", "applebot",
    "semrushbot", "ahrefsbot", "mj12bot", "petalbot", "sebot-wa",
  ];

  const userAgent = (req.headers["user-agent"] || "").toLowerCase();
  const isBot = BOT_USER_AGENTS.some(bot => userAgent.includes(bot));

  const slugMatch = req.url.match(/^\/service-areas\/([a-z0-9-]+)/);

  // ✅ BOT → prerender
  if (isBot && slugMatch) {
    const slug = slugMatch[1];

    const prerenderUrl = `https://icrnlvwzgoohgzrilyih.supabase.co/functions/v1/prerender?path=/service-areas/${slug}`;

    try {
      const response = await fetch(prerenderUrl);
      const html = await response.text();

      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.setHeader("X-Prerendered", "true");
      return res.status(200).send(html);
    } catch (e) {
      console.error("Prerender error:", e);
    }
  }

  // ✅ USER → SIMPLE PROXY (NO LOOP LOGIC)
  const originUrl = `https://embrace-web-spark.lovable.app${req.url}`;

  try {
    const response = await fetch(originUrl);

    const buffer = await response.arrayBuffer();

    res.setHeader("Content-Type", response.headers.get("content-type") || "text/html");
    return res.status(200).send(Buffer.from(buffer));

  } catch (err) {
    console.error("Proxy error:", err);
    return res.status(500).send("Proxy failed");
  }
}
