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
    } catch (e) {
      // fallback to origin
    }
  }

  // ✅ USER → proxy to Lovable (SAFE VERSION)
  const originUrl = `https://embrace-web-spark.lovable.app${req.url}`;

  const proxyRes = await fetch(originUrl, {
    method: req.method,
    headers: {
      "User-Agent": req.headers["user-agent"] || "",
      "Accept": req.headers["accept"] || "*/*",
    },
    redirect: "manual", // 🔥 CRITICAL: prevents infinite loop
  });

  // 🔥 Handle redirect manually to prevent loop
  if (proxyRes.status >= 300 && proxyRes.status < 400) {
    const location = proxyRes.headers.get("location");

    // 🚫 If redirect goes back to your domain → STOP LOOP
    if (location && location.includes("justiceshieldlaw.com")) {
      const body = await proxyRes.text();
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      return res.status(200).send(body);
    }

    // ✅ Otherwise allow redirect
    if (location) {
      return res.redirect(location);
    }
  }

  // ✅ Normal response
  const contentType = proxyRes.headers.get("content-type") || "text/html";
  const body = await proxyRes.text();

  res.setHeader("Content-Type", contentType);
  return res.status(proxyRes.status).send(body);
}
