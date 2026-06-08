/**
 * App Version Configuration
 *
 * HOW IT WORKS:
 * - APP_VERSION: The current version of this app build. 
 *   Update this manually every time you release a new version.
 *
 * - VERSION_CHECK_URL: A URL that returns JSON like:
 *     { "latest_version": "1.2.0", "force_update": false, "update_notes": "Bug fixes..." }
 *
 *   You can host this on your own backend:
 *     GET https://crm.walstartechnologies.com/api/app-version
 *   
 *   Or use a simple public JSON file on GitHub Gist, etc.
 *
 * - STORE_URL: Where the user goes to download the new APK.
 *   For internal apps, this is typically a direct APK download link
 *   or a Google Play Store link.
 */

export const APP_CONFIG = {
  // ── Current build version ──────────────────────────────────────
  APP_VERSION: '1.0.0',

  // ── Remote endpoint that returns version info ─────────────────
  VERSION_CHECK_URL: 'https://crm.walstartechnologies.com/api/app-version',

  // ── Where user downloads the update ───────────────────────────
  // Change this to your Play Store or direct APK URL
  STORE_URL: 'https://crm.walstartechnologies.com/app/download',
};
