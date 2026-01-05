import StrategyTabs from '@/components/marketing/StrategyTabs';

export default function StrategyPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-rose-500 via-orange-400 to-pink-500 rounded-2xl p-8 text-white">
        <span className="inline-block bg-white/20 px-3 py-1 rounded-full text-xs font-semibold mb-4">
          STRATEGIC SUMMARY v2
        </span>
        <h1 className="text-3xl font-extrabold mb-3 tracking-tight">
          ToonNotes
        </h1>
        <p className="text-lg opacity-95 max-w-xl leading-relaxed">
          <strong>AI Organization</strong> + <strong>AI Design</strong> for heavy note-takers who hate organizing.
        </p>
      </div>

      {/* Tabs */}
      <StrategyTabs />

      {/* Footer */}
      <div className="text-center text-sm text-gray-400 pb-6">
        ToonNotes Strategy v2 — AI Organization + AI Design — January 2026
      </div>
    </div>
  );
}
