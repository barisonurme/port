/**
 * First-party pageview tracking.
 *
 * Pings the collector at contact.barisonurme.com/api/pageview. The client only
 * ever sends the path it is on — IP, geo, user agent and timestamp are all
 * derived server-side, and nothing here blocks or can break the page.
 *
 * Endpoint contract lives in the contact service's README. Keep the payload
 * shape in sync: the collector rejects unknown fields (`.strict()`).
 */

const ENDPOINT =
  process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT ??
  'https://contact.barisonurme.com/api/pageview';

const SITE = 'portfolio';

/** Hosts that should never show up in the stats (local dev, preview builds). */
const IGNORED_HOSTS = new Set(['localhost', '127.0.0.1', '0.0.0.0']);

/** Last path reported, so a re-render or `replace` nav can't double-count. */
let lastPath: string | null = null;

export function trackPageview(rawPath: string): void {
  if (typeof window === 'undefined') return;
  if (IGNORED_HOSTS.has(window.location.hostname)) return;

  let path: string;
  try {
    // `rawPath` may be a full href (router transitions) or a bare pathname.
    path = new URL(rawPath, window.location.origin).pathname;
  } catch {
    return;
  }

  if (path === lastPath) return;
  lastPath = path;

  // Sent as text/plain: a "simple" request (no CORS preflight) and the same
  // content type navigator.sendBeacon uses. The collector parses both.
  const body = JSON.stringify({
    site: SITE,
    path,
    referrer: document.referrer,
    screen: `${window.screen.width}x${window.screen.height}`,
  });

  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon(ENDPOINT, body);
    } else {
      void fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body,
        keepalive: true,
      });
    }
  } catch {
    // Analytics must never surface an error to the visitor.
  }
}
