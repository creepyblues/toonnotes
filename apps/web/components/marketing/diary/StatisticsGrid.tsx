interface StatCardProps {
  label: string;
  value: string | number;
  icon?: string;
}

export function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-warm-200 bg-white p-4 text-center shadow-sm">
      {icon && <span className="mb-1 text-2xl">{icon}</span>}
      <div className="text-2xl font-bold text-warm-900">{value}</div>
      <div className="text-sm text-warm-500">{label}</div>
    </div>
  );
}

interface StatisticsGridProps {
  stats: Array<{
    label: string;
    value: string | number;
    icon?: string;
  }>;
}

export function StatisticsGrid({ stats }: StatisticsGridProps) {
  return (
    <section className="my-8">
      <h2 className="mb-6 flex items-center gap-3 font-display text-2xl font-bold text-warm-900">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-warm-100 text-lg">
          📊
        </span>
        Statistics
      </h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>
    </section>
  );
}

// Helper to parse markdown table into stats
export function parseStatsFromTable(tableContent: string): Array<{
  label: string;
  value: string | number;
  icon?: string;
}> {
  const lines = tableContent.trim().split('\n');
  const stats: Array<{ label: string; value: string | number; icon?: string }> = [];

  // Skip header and separator rows
  for (let i = 2; i < lines.length; i++) {
    const line = lines[i];
    const cells = line.split('|').map((c) => c.trim()).filter(Boolean);
    if (cells.length >= 2) {
      const label = cells[0];
      const value = cells[1];

      // Determine icon based on label
      let icon: string | undefined;
      const labelLower = label.toLowerCase();
      if (labelLower.includes('session')) icon = '🕐';
      else if (labelLower.includes('commit')) icon = '📝';
      else if (labelLower.includes('file')) icon = '📁';
      else if (labelLower.includes('line') && labelLower.includes('add')) icon = '➕';
      else if (labelLower.includes('line') && labelLower.includes('delete')) icon = '➖';
      else if (labelLower.includes('category')) icon = '🏷️';

      stats.push({ label, value, icon });
    }
  }

  return stats;
}
