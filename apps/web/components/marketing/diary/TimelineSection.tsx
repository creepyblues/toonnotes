import { ReactNode } from 'react';

interface TimelineNodeProps {
  title: string;
  children: ReactNode;
  isLast?: boolean;
}

export function TimelineNode({ title, children, isLast = false }: TimelineNodeProps) {
  return (
    <div className="relative flex gap-4">
      {/* Timeline line and dot */}
      <div className="flex flex-col items-center">
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-500">
          <div className="h-2 w-2 rounded-full bg-white" />
        </div>
        {!isLast && <div className="w-0.5 flex-1 bg-warm-200" />}
      </div>

      {/* Content */}
      <div className={`flex-1 ${isLast ? '' : 'pb-6'}`}>
        <h4 className="mb-2 font-semibold text-warm-900">{title}</h4>
        <div className="rounded-xl border border-warm-200 bg-warm-50 p-4 text-warm-700">
          {children}
        </div>
      </div>
    </div>
  );
}

interface TimelineSectionProps {
  children: ReactNode;
}

export function TimelineSection({ children }: TimelineSectionProps) {
  return (
    <section className="my-8">
      <h2 className="mb-6 flex items-center gap-3 font-display text-2xl font-bold text-warm-900">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-warm-100 text-lg">
          🕐
        </span>
        Work Sessions
      </h2>
      <div className="ml-2">{children}</div>
    </section>
  );
}
