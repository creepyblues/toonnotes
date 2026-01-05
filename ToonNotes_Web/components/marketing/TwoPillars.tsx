export function TwoPillars() {
  return (
    <section className="py-24 md:py-32 bg-warm-50">
      <div className="mx-auto max-w-5xl px-6">
        {/* Section intro */}
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl font-bold text-warm-900 md:text-4xl mb-4">
            ToonNotes is different.
          </h2>
          <p className="text-xl text-warm-600">
            AI handles both organization <span className="font-semibold text-teal-600">AND</span> design.
          </p>
        </div>

        {/* Two pillars */}
        <div className="grid gap-8 md:grid-cols-2">
          {/* AI Organization */}
          <div className="rounded-3xl bg-white border border-warm-200 p-8 md:p-10 shadow-sm">
            <div className="mb-6 inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-teal-100">
              <OrganizeIcon className="w-7 h-7 text-teal-600" />
            </div>
            <h3 className="font-display text-2xl font-bold text-warm-900 mb-4">
              AI Organization
            </h3>
            <p className="text-lg text-warm-600 mb-6">
              Notes auto-labeled by topic, type, and theme.
              Find anything instantly.
            </p>
            <ul className="space-y-3">
              <BenefitItem>No manual tagging</BenefitItem>
              <BenefitItem>Smart grouping by topic</BenefitItem>
              <BenefitItem>Search that actually works</BenefitItem>
            </ul>
          </div>

          {/* AI Design */}
          <div className="rounded-3xl bg-white border border-warm-200 p-8 md:p-10 shadow-sm">
            <div className="mb-6 inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-coral-100">
              <PaletteIcon className="w-7 h-7 text-coral-500" />
            </div>
            <h3 className="font-display text-2xl font-bold text-warm-900 mb-4">
              AI Design
            </h3>
            <p className="text-lg text-warm-600 mb-6">
              Notes look beautiful with colors and styles
              that match your taste.
            </p>
            <ul className="space-y-3">
              <BenefitItem>Personalized aesthetics</BenefitItem>
              <BenefitItem>No design skills needed</BenefitItem>
              <BenefitItem>Shareable outputs</BenefitItem>
            </ul>
          </div>
        </div>

        {/* Key insight */}
        <div className="mt-16 text-center">
          <div className="inline-block rounded-2xl bg-teal-50 border border-teal-200 px-8 py-6">
            <p className="text-lg text-teal-800">
              <span className="font-semibold">Key insight:</span> When notes <em>look</em> organized,
              you <em>feel</em> organized&mdash;even without folders.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function BenefitItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-3 text-warm-700">
      <CheckIcon className="w-5 h-5 text-teal-500 flex-shrink-0" />
      <span>{children}</span>
    </li>
  );
}

function OrganizeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  );
}

function PaletteIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}
