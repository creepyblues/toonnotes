'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ScrollProgress, ScrollIndicator, PanelFrame } from '../components';

// Recipe data
const savedRecipes = [
  { name: 'Chocolate Chip Cookies', source: '@bakingwithmaria', made: 0 },
  { name: 'Overnight Oats', source: 'Pinterest', made: 0 },
  { name: 'Garlic Butter Pasta', source: 'NYT Cooking', made: 0 },
  { name: 'Banana Bread', source: 'Mom', made: 0 },
  { name: 'Thai Green Curry', source: 'YouTube', made: 0 },
  { name: 'Shakshuka', source: 'Instagram', made: 0 },
];

const favoriteRecipes = [
  { name: 'Chocolate Chip Cookies', source: '@bakingwithmaria', made: 6, rating: 5, note: 'Use dark chocolate, add 2 min bake time' },
  { name: "Mom's Oatmeal Raisin", source: 'Mom', made: 8, rating: 5, note: 'Double the cinnamon' },
  { name: 'Weeknight Pasta', source: 'NYT Cooking', made: 12, rating: 4, note: 'Works with any veggies' },
  { name: 'Quick Stir Fry', source: 'Woks of Life', made: 9, rating: 5, note: 'Prep everything first!' },
  { name: 'Banana Bread', source: 'Mom', made: 5, rating: 5, note: 'Extra ripe bananas are key' },
];

export default function RecipeTrackingScenario() {
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);
  const [madeIt, setMadeIt] = useState(false);
  const [rating, setRating] = useState(0);
  const [madeCount, setMadeCount] = useState(1);

  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', (value) => {
      if (value > 0.05) {
        setShowScrollIndicator(false);
      }
    });
    return () => unsubscribe();
  }, [scrollYProgress]);

  return (
    <div ref={containerRef} className="relative">
      <ScrollProgress />

      {/* ========== SCENE 1: THE PAIN ========== */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-warm-50 overflow-hidden">
        <FloatingRecipeCards scrollYProgress={scrollYProgress} />

        <div className="relative z-10 mx-auto max-w-4xl px-4 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-white rounded-full shadow-md border border-warm-200">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold">
                J
              </div>
              <span className="text-warm-600 font-medium">Jamie&apos;s Story</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h1 className="font-hand text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-warm-800 leading-tight mb-6">
              &ldquo;I save recipes but <span className="text-green-600">never cook them.</span>{' '}
              <span className="text-coral-500">They just sit there.</span>&rdquo;
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-lg md:text-xl text-warm-500 max-w-2xl mx-auto"
          >
            Sound familiar? Let&apos;s see how the Librarian Agent helped Jamie actually use their recipes.
          </motion.p>

          <ScrollIndicator show={showScrollIndicator} />
        </div>
      </section>

      {/* ========== SCENE 2: THE GRAVEYARD ========== */}
      <section className="relative min-h-screen flex items-center justify-center bg-warm-50 py-20">
        <div className="mx-auto max-w-5xl px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: '-100px' }}
            className="text-center mb-12"
          >
            <span className="inline-block px-3 py-1 bg-warm-200 text-warm-600 rounded-full text-sm font-medium mb-4">
              Scene 2
            </span>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-warm-900 mb-4">
              The Recipe Graveyard
            </h2>
            <p className="text-warm-600 max-w-xl mx-auto">
              Jamie saves every recipe that looks good. TikTok pasta. That NYT bread.
              They pile up... and collect dust.
            </p>
          </motion.div>

          <RecipeGraveyard recipes={savedRecipes} />

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8 }}
            className="text-center mt-8"
          >
            <p className="text-warm-500 text-lg">
              <span className="text-4xl font-bold text-warm-400">128</span> recipes saved.{' '}
              <span className="text-coral-500 font-medium">5 ever made.</span>
            </p>
          </motion.div>
        </div>
      </section>

      {/* ========== SCENE 3: THE SAVE ========== */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-warm-50 to-green-50 py-20">
        <div className="mx-auto max-w-5xl px-4">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-100px' }}
            >
              <span className="inline-block px-3 py-1 bg-green-200 text-green-700 rounded-full text-sm font-medium mb-4">
                Scene 3
              </span>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-warm-900 mb-4">
                Smart Auto-Tagging
              </h2>
              <p className="text-warm-600 mb-6">
                Jamie saves another TikTok recipe. But this time, the Librarian Agent notices
                and automatically organizes it.
              </p>

              <div className="space-y-3 text-warm-700">
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm">✓</span>
                  <span>Content pattern detected: Recipe</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm">✓</span>
                  <span>Category: Desserts → Cookies</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm">✓</span>
                  <span>Effort level: Medium</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              className="flex justify-center"
            >
              <RecipeCardWithTags />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ========== SCENE 4: THE REDISCOVERY ========== */}
      <section className="relative min-h-screen flex items-center justify-center bg-green-50 py-20">
        <div className="mx-auto max-w-5xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            className="text-center mb-12"
          >
            <span className="inline-block px-3 py-1 bg-green-200 text-green-700 rounded-full text-sm font-medium mb-4">
              Scene 4
            </span>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-warm-900 mb-4">
              6 Months Later...
            </h2>
            <p className="text-warm-600 max-w-xl mx-auto">
              Saturday afternoon. Jamie wants to bake something.
              Searches &ldquo;cookies&rdquo; and finds it <em>instantly</em>.
            </p>
          </motion.div>

          <SearchResults />
        </div>
      </section>

      {/* ========== SCENE 5: THE TRACKING ========== */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white py-20">
        <div className="mx-auto max-w-5xl px-4">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-100px' }}
            >
              <span className="inline-block px-3 py-1 bg-green-200 text-green-700 rounded-full text-sm font-medium mb-4">
                Scene 5
              </span>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-warm-900 mb-4">
                Usage Tracking
              </h2>
              <p className="text-warm-600 mb-6">
                After Jamie views the recipe, the Librarian asks a simple question.
                One tap turns a saved recipe into <em>data</em>.
              </p>

              <div className="bg-white rounded-xl p-4 border border-green-200 shadow-sm">
                <p className="text-sm text-warm-500 mb-2">What gets tracked:</p>
                <ul className="space-y-2 text-warm-700">
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">🍪</span> Times made
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">⭐</span> Your rating
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">📝</span> Personal notes
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">📅</span> Last made date
                  </li>
                </ul>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              className="flex justify-center"
            >
              <PhoneMockup>
                <LibrarianNudge
                  madeIt={madeIt}
                  setMadeIt={setMadeIt}
                  rating={rating}
                  setRating={setRating}
                />
              </PhoneMockup>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ========== SCENE 6: THE FAVORITE ========== */}
      <section className="relative min-h-screen flex items-center justify-center bg-white py-20">
        <div className="mx-auto max-w-5xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            className="text-center mb-12"
          >
            <span className="inline-block px-3 py-1 bg-amber-200 text-amber-700 rounded-full text-sm font-medium mb-4">
              Scene 6
            </span>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-warm-900 mb-4">
              The Recognition
            </h2>
            <p className="text-warm-600 max-w-xl mx-auto">
              Jamie makes the cookies again. And again. Third time...
            </p>
          </motion.div>

          <FavoriteRecognition madeCount={madeCount} setMadeCount={setMadeCount} />
        </div>
      </section>

      {/* ========== SCENE 7: THE TRANSFORMATION ========== */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-green-50 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            className="text-center mb-12"
          >
            <span className="inline-block px-3 py-1 bg-green-200 text-green-700 rounded-full text-sm font-medium mb-4">
              The Transformation
            </span>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-warm-900 mb-2">
              A Living Recipe Collection
            </h2>
            <p className="text-warm-600">
              Not a graveyard. A menu.
            </p>
          </motion.div>

          <RecipeCollectionView favorites={favoriteRecipes} />
        </div>
      </section>

      {/* ========== SCENE 8: THE RESULT ========== */}
      <section className="relative min-h-[70vh] flex items-center justify-center bg-green-50 py-20">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
          >
            <span className="inline-block px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm font-medium mb-6">
              The Result
            </span>

            <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 mb-10">
              <div className="px-6 py-4 bg-warm-100 rounded-2xl border-2 border-warm-200">
                <p className="text-warm-600 font-medium">Saved recipes</p>
              </div>

              <motion.div
                animate={{ x: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="text-3xl text-green-500"
              >
                →
              </motion.div>

              <div className="px-6 py-4 bg-green-100 rounded-2xl border-2 border-green-300">
                <p className="text-green-700 font-bold">Recipes you actually cook</p>
              </div>
            </div>

            <PanelFrame color="green" className="max-w-2xl mx-auto">
              <div className="text-left">
                <p className="font-hand text-xl md:text-2xl text-warm-700 mb-4">
                  &ldquo;Stop collecting. Start cooking.&rdquo;
                </p>
                <p className="text-warm-500 text-sm">— The Librarian Agent</p>
              </div>
            </PanelFrame>
          </motion.div>
        </div>
      </section>

      {/* ========== CTA SECTION ========== */}
      <section className="relative py-20 bg-gradient-to-b from-green-50 to-teal-50">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-2xl md:text-3xl font-bold text-warm-900 mb-4">
              Ready to meet your Librarian Agent?
            </h2>
            <p className="text-warm-600 mb-8 max-w-xl mx-auto">
              Download ToonNotes and turn your recipe graveyard into a living cookbook.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
              <Link
                href={process.env.NEXT_PUBLIC_APP_STORE_URL || '#'}
                className="inline-flex items-center justify-center gap-3 rounded-xl bg-teal-600 px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-teal-700"
              >
                <AppleIcon className="h-6 w-6" />
                Download for iOS
              </Link>
              <Link
                href={process.env.NEXT_PUBLIC_PLAY_STORE_URL || '#'}
                className="inline-flex items-center justify-center gap-3 rounded-xl bg-warm-800 px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-warm-900"
              >
                <PlayStoreIcon className="h-5 w-5" />
                Download for Android
              </Link>
            </div>

            <div className="pt-8 border-t border-warm-200">
              <p className="text-sm text-warm-500 mb-4">Explore other scenarios:</p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link
                  href="/scenarios/trip-planning"
                  className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium hover:bg-blue-200 transition-colors"
                >
                  📋 Trip Planning
                </Link>
                <Link
                  href="/scenarios/idea-growth"
                  className="px-4 py-2 bg-amber-100 text-amber-700 rounded-full text-sm font-medium hover:bg-amber-200 transition-colors"
                >
                  💡 Idea Growth
                </Link>
                <Link
                  href="/scenarios/memory-capsule"
                  className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium hover:bg-purple-200 transition-colors"
                >
                  📜 Memory Capsule
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

// ========== HELPER COMPONENTS ==========

function FloatingRecipeCards({ scrollYProgress }: { scrollYProgress: ReturnType<typeof useScroll>['scrollYProgress'] }) {
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, -300]);

  const cards = [
    { text: '🍪 Cookies', x: '10%', y: '20%', motion: y1, color: '#FED7AA' },
    { text: '🍝 Pasta', x: '85%', y: '25%', motion: y2, color: '#FFE4E6' },
    { text: '🥗 Salad', x: '12%', y: '65%', motion: y3, color: '#D1FAE5' },
    { text: '🍜 Ramen', x: '78%', y: '60%', motion: y1, color: '#E0F2FE' },
    { text: '🥐 Bread', x: '8%', y: '42%', motion: y2, color: '#EDE9FE' },
    { text: '🍰 Cake', x: '88%', y: '45%', motion: y3, color: '#DDD6FE' },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {cards.map((card, i) => (
        <motion.div
          key={i}
          style={{
            left: card.x,
            top: card.y,
            y: card.motion,
            backgroundColor: card.color,
          }}
          className="absolute px-4 py-2 rounded-lg shadow-md opacity-40 text-sm"
        >
          {card.text}
        </motion.div>
      ))}
    </div>
  );
}

function RecipeGraveyard({ recipes }: { recipes: typeof savedRecipes }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {recipes.map((recipe, index) => (
        <motion.div
          key={recipe.name}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.1 }}
          className="relative bg-white rounded-xl p-4 border border-warm-200 shadow-sm opacity-60"
        >
          {/* Dust effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-warm-100/50 to-transparent rounded-xl" />

          <p className="font-medium text-warm-700 mb-1">{recipe.name}</p>
          <p className="text-xs text-warm-400">{recipe.source}</p>
          <div className="mt-2 flex items-center gap-1 text-xs text-warm-400">
            <span>Never made</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function RecipeCardWithTags() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="w-full max-w-sm"
    >
      {/* Recipe Card */}
      <div className="bg-white rounded-2xl border-2 border-green-200 shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-amber-100 to-orange-100 p-4">
          <p className="text-4xl mb-2">🍪</p>
          <h3 className="font-display text-lg font-bold text-warm-900">
            Best Chocolate Chip Cookies
          </h3>
          <p className="text-sm text-warm-500">@bakingwithmaria • TikTok</p>
        </div>

        <div className="p-4">
          <p className="text-sm text-warm-600 mb-4">
            2¼ cups flour, 1 tsp baking soda, 1 cup butter...
          </p>

          {/* Auto-tagged labels */}
          <div className="flex flex-wrap gap-2">
            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
              #recipe
            </span>
            <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
              #dessert
            </span>
            <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
              #cookies
            </span>
            <span className="px-2 py-1 bg-rose-100 text-rose-700 rounded-full text-xs font-medium">
              #baking
            </span>
          </div>
        </div>
      </div>

      {/* Librarian nudge */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
        className="mt-4 bg-green-50 border border-green-200 rounded-xl p-4"
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">📚</span>
          <span className="text-sm font-semibold text-green-600">Librarian Agent</span>
        </div>
        <p className="text-sm text-warm-700 mb-3">I noticed this is a recipe! Auto-tagged:</p>
        <div className="flex gap-2">
          <button className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium">
            ✓ Accept tags
          </button>
          <button className="px-3 py-2 bg-white border border-warm-200 text-warm-600 rounded-lg text-sm">
            Edit
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function SearchResults() {
  const results = [
    { name: 'Best Chocolate Chip Cookies', source: '@bakingwithmaria', saved: '6 months ago', made: 0 },
    { name: 'Snickerdoodles', source: 'NYT Cooking', saved: '8 months ago', made: 0 },
    { name: "Mom's Oatmeal Raisin", source: 'Mom', saved: '2 years ago', made: 4, favorite: true },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="max-w-md mx-auto"
    >
      {/* Search bar */}
      <div className="bg-white rounded-xl border-2 border-green-200 p-3 mb-4 shadow-lg">
        <div className="flex items-center gap-3">
          <span className="text-warm-400">🔍</span>
          <span className="text-warm-900 font-medium">cookies</span>
          <span className="ml-auto text-xs text-warm-400">3 results</span>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-3">
        {results.map((recipe, index) => (
          <motion.div
            key={recipe.name}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.15 }}
            className={`bg-white rounded-xl border-2 p-4 ${
              recipe.favorite ? 'border-amber-300 bg-amber-50' : 'border-warm-200'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-warm-900">{recipe.name}</p>
                <p className="text-xs text-warm-500">{recipe.source}</p>
                <p className="text-xs text-warm-400 mt-1">Saved {recipe.saved}</p>
              </div>
              <div className="text-right">
                {recipe.favorite ? (
                  <span className="text-xs font-medium text-amber-600">
                    ⭐ Made {recipe.made}x
                  </span>
                ) : (
                  <span className="text-xs text-warm-400">Never made</span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function PhoneMockup({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-[280px] md:w-[320px] bg-warm-900 rounded-[3rem] p-3 shadow-2xl">
      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-6 bg-warm-900 rounded-full z-10" />
      <div className="relative bg-white rounded-[2.5rem] overflow-hidden min-h-[500px] md:min-h-[520px]">
        <div className="flex justify-between items-center px-6 py-2 bg-warm-50">
          <span className="text-xs text-warm-600 font-medium">9:41</span>
          <div className="flex gap-1">
            <div className="w-4 h-2 bg-warm-400 rounded-sm" />
            <div className="w-4 h-2 bg-warm-400 rounded-sm" />
            <div className="w-6 h-3 bg-warm-600 rounded-sm" />
          </div>
        </div>
        <div className="p-4">{children}</div>
      </div>
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-warm-600 rounded-full" />
    </div>
  );
}

function LibrarianNudge({
  madeIt,
  setMadeIt,
  rating,
  setRating,
}: {
  madeIt: boolean;
  setMadeIt: (v: boolean) => void;
  rating: number;
  setRating: (v: number) => void;
}) {
  return (
    <div className="space-y-4">
      {/* Recipe being viewed */}
      <div className="bg-warm-50 rounded-xl p-3 border border-warm-200">
        <p className="font-medium text-warm-900 text-sm">Best Chocolate Chip Cookies</p>
        <p className="text-xs text-warm-500">@bakingwithmaria</p>
      </div>

      {/* Librarian nudge */}
      <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-white border border-green-200 flex items-center justify-center">
            📚
          </div>
          <span className="text-sm font-semibold text-green-600">Librarian Agent</span>
        </div>

        {!madeIt ? (
          <>
            <p className="text-warm-800 font-medium mb-4">Did you make this recipe?</p>
            <div className="space-y-2">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => setMadeIt(true)}
                className="w-full px-4 py-3 bg-green-600 text-white rounded-xl font-medium text-sm hover:bg-green-700 transition-colors"
              >
                🍪 Yes, I made it!
              </motion.button>
              <button className="w-full px-4 py-2 bg-white border border-warm-200 text-warm-600 rounded-xl text-sm">
                Just looking
              </button>
            </div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
          >
            <p className="text-green-700 font-medium mb-2">Nice! First time making this.</p>
            <p className="text-warm-700 text-sm mb-3">How did it turn out?</p>

            {/* Star rating */}
            <div className="flex gap-1 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`text-2xl transition-transform hover:scale-110 ${
                    star <= rating ? 'opacity-100' : 'opacity-30'
                  }`}
                >
                  ⭐
                </button>
              ))}
            </div>

            {rating > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-2"
              >
                <textarea
                  placeholder="Add notes (optional)..."
                  className="w-full px-3 py-2 border border-warm-200 rounded-lg text-sm resize-none h-16"
                  defaultValue="Used dark chocolate, needed 2 more minutes..."
                />
                <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg font-medium text-sm">
                  ✓ Save
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

function FavoriteRecognition({
  madeCount,
  setMadeCount,
}: {
  madeCount: number;
  setMadeCount: (v: number) => void;
}) {
  return (
    <div className="max-w-md mx-auto">
      {/* Progress indicator */}
      <div className="flex items-center justify-center gap-4 mb-8">
        {[1, 2, 3].map((num) => (
          <motion.button
            key={num}
            onClick={() => setMadeCount(num)}
            whileTap={{ scale: 0.95 }}
            className={`w-12 h-12 rounded-full font-bold text-lg transition-all ${
              num <= madeCount
                ? 'bg-green-500 text-white'
                : 'bg-warm-100 text-warm-400'
            }`}
          >
            {num}
          </motion.button>
        ))}
        <span className="text-warm-500">times</span>
      </div>

      {/* Recognition card */}
      <AnimatePresence mode="wait">
        {madeCount >= 3 ? (
          <motion.div
            key="favorite"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl p-6 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="text-5xl mb-4"
            >
              🎉
            </motion.div>

            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-lg">📚</span>
              <span className="text-sm font-semibold text-green-600">Librarian Agent</span>
            </div>

            <p className="text-lg font-medium text-warm-800 mb-4">
              You&apos;ve made this 3 times now!
            </p>

            <div className="bg-white rounded-xl p-4 border border-amber-200 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-warm-900">Best Chocolate Chip Cookies</span>
                <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">
                  ⭐ FAVORITE
                </span>
              </div>
              <p className="text-sm text-warm-600">Made 3 times • Last made: yesterday</p>
              <p className="text-xs text-warm-500 mt-2 italic">
                &ldquo;Use dark chocolate, add extra 2 min bake time&rdquo;
              </p>
            </div>

            <button className="w-full px-4 py-3 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 transition-colors">
              Add to Favorites board
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="counting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white border-2 border-warm-200 rounded-2xl p-6 text-center"
          >
            <p className="text-warm-600">
              Make it {3 - madeCount} more time{3 - madeCount > 1 ? 's' : ''} to unlock Favorite status!
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function RecipeCollectionView({ favorites }: { favorites: typeof favoriteRecipes }) {
  return (
    <div className="grid md:grid-cols-3 gap-6">
      {/* Favorites section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="md:col-span-2 bg-white rounded-2xl border-2 border-amber-200 overflow-hidden shadow-lg"
      >
        <div className="bg-gradient-to-r from-amber-100 to-orange-100 px-4 py-3 border-b border-amber-200">
          <h3 className="font-bold text-amber-800 flex items-center gap-2">
            ⭐ FAVORITES <span className="text-amber-600 font-normal">({favorites.length})</span>
          </h3>
          <p className="text-xs text-amber-600">Recipes you actually make</p>
        </div>
        <div className="p-4 space-y-3">
          {favorites.slice(0, 4).map((recipe, index) => (
            <motion.div
              key={recipe.name}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-3 bg-amber-50 rounded-lg"
            >
              <div>
                <p className="font-medium text-warm-900 text-sm">{recipe.name}</p>
                <p className="text-xs text-warm-500">{recipe.source}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-amber-600">{recipe.made}x made</p>
                <p className="text-xs text-warm-400">{'⭐'.repeat(recipe.rating)}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Stats section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        <div className="bg-white rounded-2xl border-2 border-green-200 p-4 shadow-lg">
          <h3 className="font-bold text-green-800 mb-3 flex items-center gap-2">
            📊 STATS
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-warm-600 text-sm">Recipes saved</span>
              <span className="font-bold text-warm-900">128</span>
            </div>
            <div className="flex justify-between">
              <span className="text-warm-600 text-sm">Recipes tried</span>
              <span className="font-bold text-green-600">23</span>
            </div>
            <div className="flex justify-between">
              <span className="text-warm-600 text-sm">Favorites</span>
              <span className="font-bold text-amber-600">5</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border-2 border-blue-200 p-4 shadow-lg">
          <h3 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
            🆕 TRY NEXT
          </h3>
          <p className="text-xs text-warm-500 mb-2">Saved but never made</p>
          <div className="text-2xl font-bold text-blue-600">12 recipes</div>
        </div>
      </motion.div>
    </div>
  );
}

// Icons
function AppleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
}

function PlayStoreIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
    </svg>
  );
}
