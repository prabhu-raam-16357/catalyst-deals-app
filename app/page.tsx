/**
 * app/page.tsx  (Server Component)
 *
 * Root page.  Renders the header + the client-side DealsTable component.
 * No sensitive data is handled here — all Catalyst calls go through
 * /api/deals (also server-side).
 */

import DealsTable from "@/app/components/DealsTable";

export default function HomePage() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-2xl">🏷️</span>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Catalyst Deals
          </h1>
        </div>
        <p className="text-sm text-gray-500">
          Live data from{" "}
          <span className="font-medium text-gray-700">Zoho Catalyst</span> →
          Data Store → <span className="font-medium text-gray-700">Deals</span>{" "}
          table
          <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700 font-mono">
            project #{process.env.CATALYST_PROJECT_ID}
          </span>
        </p>
      </header>

      {/* Deals table (client component for pagination + refresh) */}
      <DealsTable />
    </main>
  );
}
