'use client';

import { useState } from 'react';

interface UseCaseType {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  noteTypes: string[];
  boardOutput: string;
  userStory: string;
  aiOrg: string[];
  aiDesign: string[];
}

interface AIPillarType {
  id: string;
  icon: string;
  title: string;
  tagline: string;
  description: string;
  features: { name: string; detail: string }[];
  color: string;
}

const useCases: UseCaseType[] = [
  {
    id: 'study',
    icon: '📚',
    title: 'Studying a Subject',
    subtitle: 'From scattered research to structured knowledge',
    noteTypes: ['Article highlights', 'Video notes', 'Definitions', 'Questions', 'Connections'],
    boardOutput: 'Knowledge Map',
    userStory: '"I\'m learning about investing. I clip articles, jot down terms, save YouTube insights. After a week, I have 40 notes. ToonNotes groups them into themes: Risk Management, Portfolio Strategy, Tax Optimization—with summaries I can actually study from."',
    aiOrg: ['Auto-label by subtopic', 'Group related concepts', 'Generate study summary'],
    aiDesign: ['Color-code by mastery level', 'Visual concept map layout', 'Progress indicators']
  },
  {
    id: 'collect',
    icon: '💡',
    title: 'Collecting Thoughts & Ideas',
    subtitle: 'From random sparks to connected insights',
    noteTypes: ['Shower thoughts', 'Quotes', 'Observations', 'Inspirations', 'Questions'],
    boardOutput: 'Idea Constellation',
    userStory: '"I have random thoughts throughout the day—about my career, a business idea, something I read. They pile up. ToonNotes connects them: \'These 8 notes are all about your interest in creative independence.\' Now I see patterns I never noticed."',
    aiOrg: ['Detect thematic threads', 'Connect across time', 'Surface recurring themes'],
    aiDesign: ['Constellation visualization', 'Theme-based color clusters', 'Timeline view option']
  },
  {
    id: 'draft',
    icon: '✍️',
    title: 'Drafting a Writing',
    subtitle: 'From fragments to first draft',
    noteTypes: ['Outline bullets', 'Key points', 'Examples', 'Quotes to use', 'Structure ideas'],
    boardOutput: 'Writing Workspace',
    userStory: '"I want to write a blog post about remote work. I\'ve been collecting thoughts for months—rants, insights, data points. ToonNotes pulls them together, suggests an outline, and I finally have a starting point instead of a blank page."',
    aiOrg: ['Organize by narrative flow', 'Suggest outline structure', 'Identify missing pieces'],
    aiDesign: ['Card-based outline view', 'Drag-drop arrangement', 'Section color coding']
  },
  {
    id: 'plan',
    icon: '✈️',
    title: 'Planning a Trip',
    subtitle: 'From bookmarks to itinerary',
    noteTypes: ['Restaurant saves', 'Hotel options', 'Activity ideas', 'Packing notes', 'Budget items'],
    boardOutput: 'Trip Planner',
    userStory: '"Planning Japan trip. I\'ve saved 50 Instagram posts, Google Maps pins, blog recommendations, flight options. ToonNotes organizes by city, creates a day-by-day draft itinerary, and gives me a packing checklist. Trip planning actually feels doable."',
    aiOrg: ['Categorize by location/day', 'Generate schedule draft', 'Create packing checklist'],
    aiDesign: ['Map-based visualization', 'Day-by-day timeline cards', 'Shareable itinerary format']
  }
];

const aiPillars: AIPillarType[] = [
  {
    id: 'organize',
    icon: '🧠',
    title: 'AI Organization',
    tagline: 'Structure without effort',
    description: 'AI reads, categorizes, and connects your notes automatically. No manual tagging, no folder decisions, no maintenance.',
    features: [
      { name: 'Auto-Labeling', detail: 'AI assigns topics, categories, and types to every note' },
      { name: 'Smart Grouping', detail: 'Vector similarity connects related notes across time' },
      { name: 'Summaries', detail: 'AI generates overviews of note clusters' },
      { name: 'Suggestions', detail: 'Proactive recommendations for what to develop next' }
    ],
    color: '#3B82F6'
  },
  {
    id: 'design',
    icon: '🎨',
    title: 'AI Design',
    tagline: 'Visualization as organization',
    description: 'How notes look IS how they\'re organized. AI creates visual layouts that make sense of your thoughts—personalized to your aesthetic.',
    features: [
      { name: 'Visual Layouts', detail: 'AI suggests layouts based on content type (timeline, map, constellation)' },
      { name: 'Smart Theming', detail: 'Auto-apply themes based on board type, mood, or content' },
      { name: 'Personal Aesthetic', detail: 'Learn your style preferences over time' },
      { name: 'Shareable Beauty', detail: 'Outputs look polished enough to share without cleanup' }
    ],
    color: '#EC4899'
  }
];

const tabs = [
  { id: 'icp', label: 'ICP', icon: '👤' },
  { id: 'pain', label: 'Pain Points', icon: '😤' },
  { id: 'landscape', label: 'Landscape', icon: '🗺️' },
  { id: 'solution', label: 'Solution', icon: '✨' },
  { id: 'usecases', label: 'Use Cases', icon: '🎯' }
];

export default function StrategyTabs() {
  const [activeTab, setActiveTab] = useState('icp');
  const [activeUseCase, setActiveUseCase] = useState(0);
  const [activePillar, setActivePillar] = useState(0);

  return (
    <div className="space-y-8">
      {/* Tab Navigation */}
      <div className="bg-white rounded-2xl shadow-sm p-2 flex gap-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-4 py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ICP Tab */}
      {activeTab === 'icp' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Ideal Customer Profile</h2>

            <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-2xl p-6 mb-6 border border-pink-100">
              <div className="text-2xl mb-3">🎯</div>
              <h3 className="text-lg font-bold text-pink-600 mb-2">The Prolific Procrastinator</h3>
              <p className="text-gray-600 leading-relaxed italic">
                "I take a lot of notes but lack the organization skill or time to organize them.
                I've tried the fancy tools—they're too much work. I just need my notes to make sense
                <strong> and look good</strong> without me doing anything."
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl p-5">
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">What They Capture</h4>
                <ul className="space-y-2">
                  {['💭 Ideas & thoughts', '✅ Todos & tasks', '🔖 Bookmarks & saves', '💬 Quotes & snippets', '📝 Drafts & outlines', '📋 Lists & checklists'].map((item, i) => (
                    <li key={i} className="text-sm text-gray-600">{item}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-gray-50 rounded-xl p-5">
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">What They Need</h4>
                <ul className="space-y-2">
                  {['🔨 Build on notes over time', '🗂️ Organize meaningfully', '🎨 Visualize their thinking', '✍️ Create shareable outputs', '✨ Personal aesthetic'].map((item, i) => (
                    <li key={i} className="text-sm text-gray-600">{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Key Insight Card */}
          <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-8 border border-pink-100">
            <h3 className="text-lg font-bold text-purple-700 mb-4">🎨 Key Insight: Design IS Organization</h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              For our ICP, <strong>visual presentation</strong> is a form of organization. When notes <em>look</em> organized
              and match their personal aesthetic, users <em>feel</em> organized—even without folders or tags.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-xl p-4">
                <h4 className="text-sm font-semibold text-pink-600 mb-2">Without Visual Design</h4>
                <p className="text-xs text-gray-500">"I have 100 notes somewhere. It's chaos. I don't even want to look at it."</p>
              </div>
              <div className="bg-white rounded-xl p-4">
                <h4 className="text-sm font-semibold text-green-600 mb-2">With AI Design</h4>
                <p className="text-xs text-gray-500">"I can see my thoughts laid out beautifully. It makes sense. It feels like mine."</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-5">Behavioral Signals</h3>
            <div className="space-y-3">
              {[
                { signal: 'Takes 20-100+ notes per month', indicator: 'High volume' },
                { signal: 'Has abandoned Notion/Obsidian workspace', indicator: 'Failed power tools' },
                { signal: 'Cares about aesthetics (Pinterest, design-forward apps)', indicator: 'Visual thinker' },
                { signal: 'Says "I know I wrote this somewhere..."', indicator: 'Retrieval pain' },
                { signal: 'Envies organized people\'s systems but won\'t build one', indicator: 'Wants outcome, not process' }
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700">✓ {item.signal}</span>
                  <span className="text-xs font-semibold text-pink-600 bg-pink-50 px-3 py-1 rounded-full">{item.indicator}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Pain Points Tab */}
      {activeTab === 'pain' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">The Pain Journey</h2>
            <div className="space-y-4">
              {[
                { stage: '1', title: 'The Capture Habit', pain: 'No immediate pain—capturing feels productive', quote: '"I\'ll organize this later..."', color: 'bg-green-500' },
                { stage: '2', title: 'The Pile-Up', pain: 'Notes accumulate, finding things gets harder', quote: '"I know I saved something about this..."', color: 'bg-amber-500' },
                { stage: '3', title: 'The Power Tool Attempt', pain: 'Try Notion/Obsidian, spend hours on setup', quote: '"This will finally fix everything!"', color: 'bg-blue-500' },
                { stage: '4', title: 'The Abandonment', pain: 'System becomes work, usage drops, back to basics', quote: '"It\'s just too much overhead..."', color: 'bg-red-500' },
                { stage: '5', title: 'The Resignation', pain: 'Accept chaos, lower expectations, notes become a graveyard', quote: '"Maybe I\'m just not an organized person."', color: 'bg-gray-500' }
              ].map((item, i) => (
                <div key={i} className={`flex gap-5 p-5 bg-gray-50 rounded-xl border-l-4`} style={{ borderLeftColor: item.color.replace('bg-', '').includes('green') ? '#22c55e' : item.color.includes('amber') ? '#f59e0b' : item.color.includes('blue') ? '#3b82f6' : item.color.includes('red') ? '#ef4444' : '#6b7280' }}>
                  <div className={`w-10 h-10 ${item.color} rounded-full flex items-center justify-center text-white font-bold shrink-0`}>
                    {item.stage}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">{item.title}</h4>
                    <p className="text-sm text-gray-500 mb-2">{item.pain}</p>
                    <p className="text-sm text-gray-700 italic">{item.quote}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl p-8 border border-red-100">
            <h3 className="text-lg font-bold text-red-600 mb-5">Core Pain Statements</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { pain: 'Retrieval Failure', detail: '"I know I saved it but can\'t find it"', type: 'org' },
                { pain: 'Organization Guilt', detail: '"I should organize but never do"', type: 'org' },
                { pain: 'Visual Overwhelm', detail: '"My notes are an ugly mess—I don\'t want to look"', type: 'design' },
                { pain: 'Tool Fatigue', detail: '"I\'ve tried everything, nothing sticks"', type: 'org' },
                { pain: 'Sharing Shame', detail: '"My notes are too messy and ugly to share"', type: 'design' },
                { pain: 'Identity Gap', detail: '"I want my notes to feel like mine"', type: 'design' }
              ].map((item, i) => (
                <div key={i} className={`bg-white p-4 rounded-xl border-l-4 ${item.type === 'design' ? 'border-pink-500' : 'border-blue-500'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-bold text-red-600">{item.pain}</h4>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${item.type === 'design' ? 'bg-pink-100 text-pink-600' : 'bg-blue-100 text-blue-600'}`}>
                      {item.type === 'design' ? 'DESIGN' : 'ORG'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 italic">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Landscape Tab */}
      {activeTab === 'landscape' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Competitive Landscape</h2>
            <p className="text-sm text-gray-500 mb-6">Mapped by Organization Effort vs. Note Volume capacity</p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {/* Top Left - Opportunity */}
              <div className="bg-gradient-to-br from-green-100 to-pink-100 rounded-2xl p-5 border-2 border-green-500 relative">
                <span className="absolute top-3 right-3 bg-gradient-to-r from-green-500 to-pink-500 text-white text-[10px] font-bold px-2 py-1 rounded">OPPORTUNITY</span>
                <h4 className="text-sm font-bold text-green-800 mb-2">High Volume + Low Effort</h4>
                <p className="text-xs text-green-700 mb-3">Heavy capture, auto organization + beautiful design</p>
                <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white px-3 py-1.5 rounded-full text-sm font-semibold">
                  🎯 ToonNotes
                </span>
              </div>

              {/* Top Right */}
              <div className="bg-purple-100 rounded-2xl p-5">
                <h4 className="text-sm font-bold text-purple-800 mb-2">High Volume + High Effort</h4>
                <p className="text-xs text-purple-600 mb-3">Power tools for power users</p>
                <div className="flex flex-wrap gap-1.5">
                  {['Notion', 'Obsidian', 'Roam'].map(p => (
                    <span key={p} className="bg-white text-purple-700 px-2.5 py-1 rounded-full text-xs font-medium">{p}</span>
                  ))}
                </div>
              </div>

              {/* Bottom Left */}
              <div className="bg-gray-100 rounded-2xl p-5">
                <h4 className="text-sm font-bold text-gray-700 mb-2">Low Volume + Low Effort</h4>
                <p className="text-xs text-gray-500 mb-3">Quick capture, minimal features, generic design</p>
                <div className="flex flex-wrap gap-1.5">
                  {['Apple Notes', 'Google Keep'].map(p => (
                    <span key={p} className="bg-white text-gray-600 px-2.5 py-1 rounded-full text-xs font-medium">{p}</span>
                  ))}
                </div>
              </div>

              {/* Bottom Right */}
              <div className="bg-amber-100 rounded-2xl p-5">
                <h4 className="text-sm font-bold text-amber-800 mb-2">Low Volume + High Effort</h4>
                <p className="text-xs text-amber-600 mb-3">Overkill for simple needs</p>
                <div className="flex flex-wrap gap-1.5">
                  {['Evernote', 'Bear', 'GoodNotes'].map(p => (
                    <span key={p} className="bg-white text-amber-700 px-2.5 py-1 rounded-full text-xs font-medium">{p}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-between text-xs text-gray-400">
              <span>← Zero Effort (AI)</span>
              <span>Manual Effort →</span>
            </div>
          </div>

          <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-8 border border-pink-100">
            <h3 className="text-lg font-bold text-purple-700 mb-4">🎨 The Design Gap No One Addresses</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { product: 'Apple Notes / Keep', design: 'Generic, utilitarian, no personalization' },
                { product: 'Notion', design: 'Customizable but YOU do the design work' },
                { product: 'Obsidian', design: 'Plain text, no visual organization' },
                { product: 'Bear', design: 'Pretty but no AI, limited layouts' }
              ].map((item, i) => (
                <div key={i} className="bg-white p-4 rounded-xl">
                  <h4 className="text-sm font-semibold text-gray-600 mb-1">{item.product}</h4>
                  <p className="text-xs text-pink-600">✗ {item.design}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 p-4 bg-white rounded-xl border-l-4 border-green-500">
              <h4 className="text-sm font-semibold text-green-600 mb-1">ToonNotes</h4>
              <p className="text-xs text-gray-600">✓ <strong>AI creates visual layouts</strong> — organization you can see and feel, personalized to your aesthetic</p>
            </div>
          </div>
        </div>
      )}

      {/* Solution Tab */}
      {activeTab === 'solution' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-rose-500 to-pink-500 rounded-2xl p-8 text-white">
            <h2 className="text-2xl font-bold mb-4">The Core Insight</h2>
            <p className="text-lg leading-relaxed opacity-95">
              <strong>People don't start with a blank note.</strong><br />
              They start with an objective in mind—a "Board" they're building toward.<br /><br />
              <strong>And how it looks IS how it's organized.</strong><br />
              Visual design is organization. AI handles both.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6">The Two AI Pillars</h2>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {aiPillars.map((pillar, i) => (
                <button
                  key={pillar.id}
                  onClick={() => setActivePillar(i)}
                  className={`p-5 rounded-2xl text-left transition-all border-2 ${
                    activePillar === i
                      ? 'border-current'
                      : 'border-transparent bg-gray-50 hover:bg-gray-100'
                  }`}
                  style={{
                    borderColor: activePillar === i ? pillar.color : 'transparent',
                    background: activePillar === i ? `${pillar.color}10` : undefined
                  }}
                >
                  <div className="text-3xl mb-2">{pillar.icon}</div>
                  <h3 className="text-lg font-bold mb-1" style={{ color: activePillar === i ? pillar.color : '#475569' }}>
                    {pillar.title}
                  </h3>
                  <p className="text-sm text-gray-500">{pillar.tagline}</p>
                </button>
              ))}
            </div>

            <div className="bg-gray-50 rounded-2xl p-6">
              <p className="text-gray-600 leading-relaxed mb-5">{aiPillars[activePillar].description}</p>
              <div className="grid grid-cols-2 gap-3">
                {aiPillars[activePillar].features.map((feature, i) => (
                  <div key={i} className="bg-white p-4 rounded-xl border-l-4" style={{ borderLeftColor: aiPillars[activePillar].color }}>
                    <h4 className="text-sm font-semibold mb-1" style={{ color: aiPillars[activePillar].color }}>{feature.name}</h4>
                    <p className="text-xs text-gray-500">{feature.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Two-Layer Architecture</h2>
            <div className="grid grid-cols-2 gap-5">
              <div className="bg-gray-100 rounded-2xl p-6 border-2 border-dashed border-gray-300">
                <div className="text-3xl mb-3">📥</div>
                <h3 className="text-lg font-bold text-gray-600 mb-2">Notes Layer</h3>
                <p className="text-sm text-gray-500 mb-4">The "Random Dump"</p>
                <ul className="space-y-2">
                  {['Zero-friction capture', 'Any format, any length', 'Auto-labeled by AI', 'Timestamped & searchable'].map((item, i) => (
                    <li key={i} className="text-sm text-gray-600 flex items-center gap-2">
                      <span className="text-gray-400">•</span> {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl p-6 border-2 border-pink-500">
                <div className="text-3xl mb-3">🎯</div>
                <h3 className="text-lg font-bold text-pink-600 mb-2">Boards Layer</h3>
                <p className="text-sm text-gray-500 mb-4">Where Real Work Happens (with AI)</p>
                <ul className="space-y-2">
                  {['Objective-driven workspaces', 'AI groups related notes', 'Beautiful visual layouts', 'Shareable outputs'].map((item, i) => (
                    <li key={i} className="text-sm text-amber-700 flex items-center gap-2">
                      <span className="text-pink-500">✦</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex justify-center items-center py-6 gap-3 flex-wrap">
              <span className="text-sm text-gray-400">Capture</span>
              <span className="text-2xl">→</span>
              <span className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-semibold">🧠 AI Organize</span>
              <span className="text-xl">+</span>
              <span className="bg-pink-500 text-white px-4 py-2 rounded-full text-sm font-semibold">🎨 AI Design</span>
              <span className="text-2xl">→</span>
              <span className="text-sm text-gray-400">Beautiful Output</span>
            </div>
          </div>
        </div>
      )}

      {/* Use Cases Tab */}
      {activeTab === 'usecases' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Primary Use Cases</h2>

            <div className="grid grid-cols-4 gap-3 mb-6">
              {useCases.map((uc, i) => (
                <button
                  key={uc.id}
                  onClick={() => setActiveUseCase(i)}
                  className={`p-4 rounded-xl text-center transition-all ${
                    activeUseCase === i
                      ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <div className="text-2xl mb-2">{uc.icon}</div>
                  <div className="text-xs font-semibold">{uc.title.split(' ').slice(0, 2).join(' ')}</div>
                </button>
              ))}
            </div>

            <div className="bg-gray-50 rounded-2xl p-7">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{useCases[activeUseCase].icon}</span>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{useCases[activeUseCase].title}</h3>
                  <p className="text-sm text-gray-500">{useCases[activeUseCase].subtitle}</p>
                </div>
              </div>

              <div className="bg-white rounded-xl p-5 mb-5 border-l-4 border-pink-500">
                <p className="text-gray-600 italic leading-relaxed">{useCases[activeUseCase].userStory}</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Notes Captured</h4>
                  <div className="space-y-1.5">
                    {useCases[activeUseCase].noteTypes.map((type, i) => (
                      <span key={i} className="block bg-white text-gray-600 px-3 py-1.5 rounded-lg text-xs">{type}</span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-blue-500 uppercase tracking-wide mb-3">🧠 AI Organization</h4>
                  <div className="space-y-1.5">
                    {useCases[activeUseCase].aiOrg.map((action, i) => (
                      <span key={i} className="text-sm text-gray-600 flex items-center gap-2">
                        <span className="text-blue-500">•</span> {action}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-pink-500 uppercase tracking-wide mb-3">🎨 AI Design</h4>
                  <div className="space-y-1.5">
                    {useCases[activeUseCase].aiDesign.map((action, i) => (
                      <span key={i} className="text-sm text-gray-600 flex items-center gap-2">
                        <span className="text-pink-500">•</span> {action}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-5 p-4 bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl flex items-center justify-between">
                <span className="text-sm text-gray-500">Board Output →</span>
                <span className="text-lg font-bold bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">
                  {useCases[activeUseCase].boardOutput}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
