export default async function handler(req, res) {
  const BOT_USER_AGENTS = [
    "googlebot", "bingbot", "slurp", "duckduckbot",
    "facebookexternalhit", "twitterbot", "linkedinbot",
    "semrushbot", "ahrefsbot", "sebot-wa"
  ];

  const userAgent = (req.headers["user-agent"] || "").toLowerCase();
  const isBot = BOT_USER_AGENTS.some(bot => userAgent.includes(bot));

    // Serve sitemap.xml directly (no redirect)
  if (req.url.split("?")[0] === "/sitemap.xml") {
    const r = await fetch("https://icrnlvwzgoohgzrilyih.supabase.co/functions/v1/sitemap");
    const xml = await r.text();
    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=3600");
    return res.status(r.status).send(xml);
  }


  const slugMatch = req.url.match(/^\/service-areas\/([a-z0-9-]+)/);

  // ✅ BOT → prerender
  if (isBot && slugMatch) {
    const slug = slugMatch[1];

    const prerenderUrl = `https://icrnlvwzgoohgzrilyih.supabase.co/functions/v1/prerender?path=/service-areas/${slug}`;

    const response = await fetch(prerenderUrl);
    const html = await response.text();

    res.setHeader("Content-Type", "text/html");
    res.setHeader("X-Prerendered", "true");
    return res.status(200).send(html);
  }

  // ✅ USER → Lovable (SAFE, NO LOOP)
  const response = await fetch(`https://embrace-web-spark.lovable.app${req.url}`);
  const buffer = await response.arrayBuffer();

  res.setHeader("Content-Type", response.headers.get("content-type") || "text/html");
  return res.status(200).send(Buffer.from(buffer));
}
