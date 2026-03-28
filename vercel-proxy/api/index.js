const BOT_USER_AGENTS = [
  'googlebot', 'bingbot', 'slurp', 'duckduckbot', 'baiduspider',
  'yandexbot', 'facebot', 'facebookexternalhit', 'twitterbot',
  'linkedinbot', 'whatsapp', 'telegrambot', 'applebot',
  'semrushbot', 'ahrefsbot', 'mj12bot', 'rogerbot', 'dotbot',
  'petalbot', 'bytespider'
];

module.exports = async function handler(req, res) {
  const userAgent = (req.headers['user-agent'] || '').toLowerCase();
  const isBot = BOT_USER_AGENTS.some(bot => userAgent.includes(bot));
  const path = req.url || '/';

  if (isBot) {
    const prerenderUrl = `https://icrnlvwzgoohgzrilyih.supabase.co/functions/v1/prerender?path=${encodeURIComponent(path)}`;
    try {
      const response = await fetch(prerenderUrl);
      const html = await response.text();
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400');
      res.status(response.status).send(html);
    } catch (error) {
      res.redirect(302, `https://embrace-web-spark.lovable.app${path}`);
    }
  } else {
    res.redirect(302, `https://embrace-web-spark.lovable.app${path}`);
  }
};
