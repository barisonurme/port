import { trackPageview } from './lib/analytics';

// Runs after the HTML loads, before hydration. `onRouterTransitionStart` only
// fires for client-side navigations, so the first pageview is recorded here.
trackPageview(window.location.pathname);

export function onRouterTransitionStart(url: string): void {
  trackPageview(url);
}
