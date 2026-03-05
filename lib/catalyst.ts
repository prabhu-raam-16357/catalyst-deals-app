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

const PROJECT_ID = process.env.CATALYST_PROJECT_ID;
const DEALS_TABLE_ID = process.env.CATALYST_DEALS_TABLE_ID;
const API_TOKEN = process.env.CATALYST_API_TOKEN;

if (!PROJECT_ID || !DEALS_TABLE_ID || !API_TOKEN) {
  throw new Error(
    "[catalyst.ts] Missing env vars. Make sure .env.local contains:\n" +
      "  CATALYST_PROJECT_ID\n" +
      "  CATALYST_DEALS_TABLE_ID\n" +
      "  CATALYST_API_TOKEN"
  );
}

// Initialise once for the server process.
// 'custom' type bypasses the Catalyst Function runtime context check.
//
// project_key must be set to a non-undefined value or the SDK transport will
// set header "PROJECT_ID" to undefined and Node.js will throw.
// For external callers, the project ID itself satisfies this requirement.
const catalystApp = new ZCAuth().init(
  {
    project_id: PROJECT_ID,
    project_key: PROJECT_ID, // <-- this was the missing piece
    credential: new AccessTokenCredential({ access_token: API_TOKEN }),
  },
  { type: "custom" }
);

/**
 * Returns a Datastore Table instance for the Deals table.
 * Synchronous — only builds the wrapper, no network call yet.
 */
export function getDealsTable() {
  const datastore = new Datastore(catalystApp);
  return datastore.table(DEALS_TABLE_ID as string);
}
