"use client";

/**
 * app/components/DealsTable.tsx  (Client Component)
 *
 * Fetches Deals data from the server-side /api/deals route.
 * Uses CURSOR-BASED pagination (nextToken) from @zcatalyst/datastore.
 * Catalyst credentials never leave the server.
 */

import { useEffect, useState, useCallback } from "react";
import type { DealsApiResponse, CatalystRow } from "@/types/deals";

const DEFAULT_MAX_ROWS = 20;

export default function DealsTable() {
  const [deals, setDeals] = useState<CatalystRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tokenStack, setTokenStack] = useState<Array<string | undefined>>([undefined]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const fetchDeals = useCallback(
    async (token: string | undefined, idx: number) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({ maxRows: String(DEFAULT_MAX_ROWS) });
        if (token) params.set("nextToken", token);

        const res = await fetch(`/api/deals?${params.toString()}`, { cache: "no-store" });
        const json: DealsApiResponse = await res.json();

        if (!json.success || !json.data) {
          throw new Error(json.error ?? "Unknown error from /api/deals");
        }

        setDeals(json.data);
        setHasMore(json.hasMore ?? false);

        if (json.hasMore && json.nextToken) {
          setTokenStack((prev) => {
            const updated = prev.slice(0, idx + 1);
            if (!updated[idx + 1]) updated[idx + 1] = json.nextToken;
            return updated;
          });
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load deals");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchDeals(tokenStack[currentIdx], currentIdx);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIdx]);

  const goNext = () => { if (hasMore) setCurrentIdx((i) => i + 1); };
  const goPrev = () => { if (currentIdx > 0) setCurrentIdx((i) => i - 1); };
  const refresh = () => fetchDeals(tokenStack[currentIdx], currentIdx);

  // Exclude Catalyst meta-fields from the data columns (SDK returns UPPERCASE)
  const META_FIELDS = new Set(["ROWID", "CREATORID", "CREATEDTIME", "MODIFIEDTIME"]);
  const displayColumns =
    deals.length > 0
      ? Object.keys(deals[0]).filter((k) => !META_FIELDS.has(k))
      : [];

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-4 text-red-700 text-sm">
          <strong>Error:</strong> {error}
          <button onClick={refresh} className="ml-3 underline text-red-600 hover:text-red-800">
            Retry
          </button>
        </div>
      )}

      {!loading && !error && deals.length === 0 && (
        <p className="text-gray-500 text-sm py-8 text-center">
          No deals found. Check CATALYST_DEALS_TABLE_ID in .env.local.
        </p>
      )}

      {deals.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-500 text-xs tracking-wider">
                  ROW ID
                </th>
                {displayColumns.map((col) => (
                  <th key={col} className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">
                    {col.replace(/_/g, " ")}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {deals.map((row, idx) => (
                <tr key={row.ROWID ?? idx} className="hover:bg-blue-50 transition-colors">
                  <td className="px-4 py-3 text-gray-400 text-xs font-mono">{String(row.ROWID)}</td>
                  {displayColumns.map((col) => (
                    <td key={col} className="px-4 py-3 text-gray-700">
                      {row[col] != null ? String(row[col]) : "—"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {loading && (
        <div className="space-y-2 animate-pulse">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 bg-gray-200 rounded" />
          ))}
        </div>
      )}

      <div className="flex items-center gap-3 pt-2">
        <button
          disabled={currentIdx === 0 || loading}
          onClick={goPrev}
          className="px-4 py-2 text-sm rounded border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          ← Previous
        </button>
        <span className="text-sm text-gray-500">Page {currentIdx + 1}</span>
        <button
          disabled={!hasMore || loading}
          onClick={goNext}
          className="px-4 py-2 text-sm rounded border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          Next →
        </button>
        <button
          onClick={refresh}
          disabled={loading}
          className="ml-auto px-4 py-2 text-sm rounded border border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100 disabled:opacity-40 transition"
        >
          {loading ? "Loading…" : "↻ Refresh"}
        </button>
      </div>
    </div>
  );
}
