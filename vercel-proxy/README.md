# Vercel Reverse Proxy for SEO Prerendering

This project sits in front of the Lovable-hosted SPA and serves prerendered HTML to bots for `/service-areas/:slug` pages.

## How it works

1. All traffic hits Vercel (point your custom domain here)
2. Bot requests to `/service-areas/:slug` → fetches prerendered HTML from the Edge Function
3. Everything else → proxied transparently to the Lovable app

## Setup

1. Create a new Vercel project with these files
2. Point your custom domain DNS to Vercel
3. Deploy — no env vars needed, endpoints are hardcoded

## Testing

```bash
# Bot request — should return prerendered HTML with unique meta tags
curl -H "User-Agent: Googlebot" https://your-domain.com/service-areas/los-angeles

# Normal request — should return the SPA shell
curl https://your-domain.com/service-areas/los-angeles
```
