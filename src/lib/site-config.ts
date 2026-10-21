// Vercel sets VERCEL_PROJECT_PRODUCTION_URL (no scheme) on every build and
// function, so canonical URLs follow whatever domain the project is on
// without hardcoding one here.
const productionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL;

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (productionHost ? `https://${productionHost}` : "http://localhost:3000");
export const SITE_NAME = "LDN Legal Associates";
export const SITE_WORDMARK = "LDN";
export const SITE_WORDMARK_SUBTITLE = "Legal Associates";
export const SITE_LOCATION = "London, United Kingdom";

export const SITE_DEMO_NOTICE =
  "Nothing on this site constitutes legal advice. Please contact us directly to discuss your specific circumstances.";
