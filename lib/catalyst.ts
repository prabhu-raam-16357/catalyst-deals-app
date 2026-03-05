/**
 * lib/catalyst.ts  (server-only)
 *
 * Initialises the @zcatalyst/datastore SDK for use outside a Catalyst Function.
 *
 * Root cause of "Invalid value undefined for header PROJECT_ID":
 * ─────────────────────────────────────────────────────────────────────────────
 * The SDK transport unconditionally sets:
 *   req.headers["PROJECT_ID"] = app.config.projectKey
 * If you omit `project_key` from the init options, projectKey is undefined and
 * Node.js throws the header error. The fix: pass `project_key: PROJECT_ID`.
 * The Catalyst API accepts the project ID in that header for external callers.
 *
 * TOKEN TYPES supported:
 *   • catalyst token:generate  (short-lived, from CLI — good for dev/testing)
 *   • Zoho OAuth access_token  (long-lived, via OAuth 2.0 client-credentials)
 *   Both are passed identically as  Zoho-oauthtoken <value>.
 */

import { ZCAuth, AccessTokenCredential } from "@zcatalyst/auth";
import { Datastore } from "@zcatalyst/datastore";

// Lazily initialised — do NOT access env vars or throw at module load time.
// Next.js evaluates this module during the build phase (static page collection)
// when .env.local is not present; any top-level throw breaks the build.
let catalystApp: ReturnType<InstanceType<typeof ZCAuth>["init"]> | null = null;

function getCatalystApp() {
  if (catalystApp) return catalystApp;

  const PROJECT_ID = process.env.CATALYST_PROJECT_ID;
  const API_TOKEN = process.env.CATALYST_API_TOKEN;

  if (!PROJECT_ID || !API_TOKEN) {
    throw new Error(
      "[catalyst.ts] Missing env vars. Make sure .env.local contains:\n" +
        "  CATALYST_PROJECT_ID\n" +
        "  CATALYST_API_TOKEN"
    );
  }

  // 'custom' type bypasses the Catalyst Function runtime context check.
  // project_key must match project_id — if omitted the SDK transport sets
  // header "PROJECT_ID" to undefined and Node.js throws.
  catalystApp = new ZCAuth().init(
    {
      project_id: PROJECT_ID,
      project_key: PROJECT_ID,
      credential: new AccessTokenCredential({ access_token: API_TOKEN }),
    },
    { type: "custom" }
  );

  return catalystApp;
}

/**
 * Returns a Datastore Table instance for the Deals table.
 * Synchronous — only builds the wrapper, no network call yet.
 */
export function getDealsTable() {
  const DEALS_TABLE_ID = process.env.CATALYST_DEALS_TABLE_ID;
  if (!DEALS_TABLE_ID) {
    throw new Error(
      "[catalyst.ts] Missing env var CATALYST_DEALS_TABLE_ID in .env.local"
    );
  }
  const datastore = new Datastore(getCatalystApp());
  return datastore.table(DEALS_TABLE_ID);
}
