/**
 * types/deals.ts
 *
 * Shared types for /api/deals and DealsTable component.
 *
 * The @zcatalyst/datastore SDK returns rows with these meta fields (UPPERCASE):
 *   ROWID, CREATORID, CREATEDTIME, MODIFIEDTIME
 */

export interface CatalystRow {
  ROWID: string;
  CREATORID: string;
  CREATEDTIME: string;
  MODIFIEDTIME: string;
  /** All custom table columns */
  [column: string]: unknown;
}

export interface DealsApiResponse {
  success: boolean;
  data?: CatalystRow[];
  total?: number;
  /** Cursor for the next page — pass as ?nextToken= in the next request */
  nextToken?: string;
  /** True when more records exist beyond this page */
  hasMore?: boolean;
  /** Error message when success is false */
  error?: string;
}
