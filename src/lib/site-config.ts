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

// This is a sample site for a fictional firm. The notice is rendered on
// every page (root layout) and must stay in place for as long as the site
// is publicly reachable.
export const SITE_DEMO_NOTICE =
  "Sample website for a fictional firm. LDN Legal Associates is not a real solicitors' practice and is not authorised or regulated by the Solicitors Regulation Authority. Nothing on this site is legal advice.";
