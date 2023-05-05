import type { EventOptions, PlausibleOptions } from 'plausible-tracker';
import Plausible from 'plausible-tracker';

let plausible: ReturnType<typeof Plausible> | null = null;
export const initPlausible = () => {
  const { VITE_PLAUSIBLE_API_HOST, VITE_PLAUSIBLE_DOMAIN } = import.meta.env;
  if (
    typeof VITE_PLAUSIBLE_DOMAIN === 'string' &&
    typeof VITE_PLAUSIBLE_API_HOST === 'string' &&
    !plausible
  ) {
    plausible = Plausible({
      domain: VITE_PLAUSIBLE_DOMAIN,
      apiHost: VITE_PLAUSIBLE_API_HOST,
    });
    plausible.enableAutoPageviews();
  }
};

export const trackEvent = (
  eventName: string,
  options?: EventOptions | undefined,
  eventData?: PlausibleOptions | undefined
) => {
  if (plausible) {
    plausible.trackEvent(eventName, options, eventData);
  }
};

export const trackOutboundLinkClick = (url: string) => {
  trackEvent('Outbound Link: Click', { props: { url: url } });
};
