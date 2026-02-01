import type { HassServiceTarget } from 'home-assistant-js-websocket';
import { HomeAssistant } from './types';

export async function callService(
  hass: HomeAssistant | undefined,
  domain: string,
  service: string,
  data?: Record<string, any>,
  target?: HassServiceTarget
): Promise<void> {
  if (!hass) {
    console.error('[callService] Failed Hass Object is undefined');
    return;
  }
  try {
    await hass.callService(domain, service, data, target);
  } catch (error) {
    console.error(
      `[callService] Service call failed: ${domain}.${service}`,
      error
    );
  }
}
