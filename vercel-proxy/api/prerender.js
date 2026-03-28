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
      const response = await fetch(prerenderUrl, {
        headers: { "User-Agent": userAgent }
      });

      const html = await response.text();

      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.setHeader("X-Prerendered", "true");
      return res.status(200).send(html);
    } catch (e) {}
  }

  // ✅ USER → PROXY (FIXED: STREAM RESPONSE)
  const originUrl = `https://embrace-web-spark.lovable.app${req.url}`;

  const proxyRes = await fetch(originUrl, {
    method: req.method,
    headers: {
      "User-Agent": req.headers["user-agent"] || "",
      "Accept": req.headers["accept"] || "*/*",
    }
  });

  // 🔥 COPY ALL HEADERS
  proxyRes.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });

  // 🔥 STREAM RESPONSE (CRITICAL FIX)
  res.status(proxyRes.status);
  proxyRes.body.pipe(res);
}
