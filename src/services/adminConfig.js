// Admin configuration management for Team Plov
// Persisted across all visitors via public/admin-config.json, Vite disk API, and optional cloud sync.

import { ROSTER_PLAYERS, TEAM_INFO } from '../config/roster';

const STORAGE_KEY = 'teamplov_admin_config_v2';
let memoryConfig = null;
let isFetchingShared = false;

// Default fallback configuration
const DEFAULT_CONFIG = {
  teamInfo: { ...TEAM_INFO },
  announcement: {
    enabled: false,
    text: "NEXT MATCH: TONIGHT AT 21:00 UTC // PRACTICE SESSION",
    type: "info",
  },
  general: {
    matchLimit: 15,
    matchFilterDefault: "all",
    crosshairCursor: true,
    photoTheme: "soldier",
    cloudSyncUrl: "",
    cloudSyncKey: "",
  },
  players: ROSTER_PLAYERS.reduce((acc, player) => {
    acc[player.id] = {
      id: player.id,
      name: player.name,
      role: player.role,
      callsign: player.callsign,
      steam64_id: player.steam64_id,
      favoriteWeapon: player.favoriteWeapon,
      image: player.image,
      imageAi: player.imageAi,
      photoType: 'soldier',
      detailsMode: (player.id === 'mitka219' || player.id === 'mystery') ? 'custom_message' : 'stats',
      customMessage: 'NOT READY YET',
      customMessageSub: (player.id === 'mitka219' || player.id === 'mystery') ? 'OPERATIVE CLASSIFIED // DEPLOYMENT PENDING' : 'PROFILE UNDER RECALIBRATION',
    };
    return acc;
  }, {}),
};

/**
 * Synchronously get active configuration from memory or localStorage
 */
export function getAdminConfig() {
  if (memoryConfig) return memoryConfig;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      memoryConfig = deepMerge(DEFAULT_CONFIG, parsed);
      return memoryConfig;
    }
  } catch (e) {
    console.warn('[AdminConfig] Error loading from localStorage:', e);
  }

  memoryConfig = { ...DEFAULT_CONFIG };
  return memoryConfig;
}

/**
 * Fetch shared configuration for ALL users from public/admin-config.json (and optional Cloud Sync)
 */
export async function fetchSharedConfig() {
  if (isFetchingShared) return memoryConfig;
  isFetchingShared = true;

  try {
    // 1. Fetch public/admin-config.json
    const baseUrl = import.meta.env.BASE_URL || '/';
    const jsonUrl = `${baseUrl.endsWith('/') ? baseUrl : baseUrl + '/'}admin-config.json?t=${Date.now()}`;

    const res = await fetch(jsonUrl, { cache: 'no-store' });
    if (res.ok) {
      const remoteConfig = await res.json();
      if (remoteConfig && typeof remoteConfig === 'object') {
        const merged = deepMerge(DEFAULT_CONFIG, remoteConfig);

        // 2. If Cloud Sync URL is configured, fetch from cloud
        if (merged.general?.cloudSyncUrl) {
          try {
            const headers = {};
            if (merged.general.cloudSyncKey) {
              headers['X-Master-Key'] = merged.general.cloudSyncKey;
              headers['Authorization'] = `Bearer ${merged.general.cloudSyncKey}`;
            }
            const cloudRes = await fetch(merged.general.cloudSyncUrl, { headers, cache: 'no-store' });
            if (cloudRes.ok) {
              const cloudData = await cloudRes.json();
              const cloudPayload = cloudData.record || cloudData;
              if (cloudPayload && typeof cloudPayload === 'object') {
                Object.assign(merged, deepMerge(merged, cloudPayload));
              }
            }
          } catch (cloudErr) {
            console.warn('[AdminConfig] Cloud sync fetch warning:', cloudErr);
          }
        }

        memoryConfig = merged;
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        } catch (e) {}

        window.dispatchEvent(new Event('teamplov_config_updated'));
        return merged;
      }
    }
  } catch (err) {
    console.warn('[AdminConfig] Could not fetch public/admin-config.json:', err);
  } finally {
    isFetchingShared = false;
  }

  return getAdminConfig();
}

/**
 * Save configuration across ALL users:
 * 1. Writes to public/admin-config.json via Vite dev server
 * 2. Writes to Cloud Sync endpoint (if configured)
 * 3. Updates localStorage and in-memory cache
 */
export async function saveAdminConfig(newConfig) {
  memoryConfig = deepMerge(DEFAULT_CONFIG, newConfig);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryConfig));
  } catch (e) {}

  window.dispatchEvent(new Event('teamplov_config_updated'));

  // 1. Save to local disk via dev server middleware
  try {
    await fetch('/api/save-admin-config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(memoryConfig, null, 2),
    });
  } catch (err) {
    // Might be in static production mode without dev server
  }

  // 2. Save to Cloud Sync URL (e.g. JSONBin, Gist, or custom REST endpoint)
  if (memoryConfig.general?.cloudSyncUrl) {
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (memoryConfig.general.cloudSyncKey) {
        headers['X-Master-Key'] = memoryConfig.general.cloudSyncKey;
        headers['Authorization'] = `Bearer ${memoryConfig.general.cloudSyncKey}`;
      }
      await fetch(memoryConfig.general.cloudSyncUrl, {
        method: 'PUT',
        headers,
        body: JSON.stringify(memoryConfig),
      });
    } catch (cloudSaveErr) {
      console.warn('[AdminConfig] Cloud sync save failed:', cloudSaveErr);
    }
  }

  return true;
}

export function resetAdminConfig() {
  memoryConfig = { ...DEFAULT_CONFIG };
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {}
  window.dispatchEvent(new Event('teamplov_config_updated'));
  return memoryConfig;
}

function deepMerge(base, override) {
  if (!override || typeof override !== 'object') return { ...base };
  return {
    ...base,
    ...override,
    teamInfo: { ...(base.teamInfo || {}), ...(override.teamInfo || {}) },
    announcement: { ...(base.announcement || {}), ...(override.announcement || {}) },
    general: { ...(base.general || {}), ...(override.general || {}) },
    players: {
      ...(base.players || {}),
      ...(override.players || {}),
    },
  };
}

// Automatically initiate shared fetch on load
if (typeof window !== 'undefined') {
  fetchSharedConfig();
}
