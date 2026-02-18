/**
 * iOS Share Extension: sync auth token and API base to App Group
 * so "Share to Zuno" can make authenticated requests.
 * No-op on web and Android (Android uses MainActivity sync).
 */
import { getApiBase } from './config.js';

export function syncAuthToNativeIfIOS() {
  if (typeof window === 'undefined' || !window.Capacitor?.getPlatform) return;
  if (window.Capacitor.getPlatform() !== 'ios') return;
  const token = localStorage.getItem('zuno_token');
  if (!token) return;
  const apiBase = getApiBase();
  const ZunoAuthSync = window.Capacitor?.Plugins?.ZunoAuthSync;
  if (!ZunoAuthSync?.syncToken) return;
  ZunoAuthSync.syncToken({ token, apiBase }).catch(() => {});
}
