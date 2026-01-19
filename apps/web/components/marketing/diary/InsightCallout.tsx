import { ReactNode } from 'react';

interface InsightCalloutProps {
  title: string;
  children: ReactNode;
}

export function InsightCallout({ title, children }: InsightCalloutProps) {
  return (
    <div className="my-6 rounded-xl border-l-4 border-teal-500 bg-teal-50 p-5">
      <div className="mb-3 flex items-start gap-3">
        <span className="mt-0.5 text-xl">💡</span>
        <h4 className="text-lg font-semibold text-teal-900">{title}</h4>
      </div>
      <div className="ml-8 space-y-3 text-teal-800">{children}</div>
    </div>
  );
}

interface InsightsSectionProps {
  children: ReactNode;
}

export function InsightsSection({ children }: InsightsSectionProps) {
  return (
    <section className="my-8">
      <h2 className="mb-6 flex items-center gap-3 font-display text-2xl font-bold text-warm-900">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 text-lg">
          💡
        </span>
        Insights &amp; Learnings
      </h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}
