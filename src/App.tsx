import { useState, useMemo, useEffect } from 'react';
import { MessageCircle, Presentation } from 'lucide-react';
import { Tab1Assessment } from './components/Tab1Assessment';
import { Tab2Translation } from './components/Tab2Translation';
import { Tab3Report } from './components/Tab3Report';
import { FeedbackModal } from './components/FeedbackModal';
import { ValidationPanel } from './components/ValidationPanel';
import { calculateTranslation } from './utils/scoringEngine';
import { INITIAL_ASSESSMENT } from './data/types';
import type { AssessmentInput } from './data/types';

type TabId = 'assessment' | 'translation' | 'report';

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'assessment', label: 'הערכת מצב', icon: '📋' },
  { id: 'translation', label: 'תרגום לשפת בט"ל', icon: '🏛️' },
  { id: 'report', label: 'דוח מסכם', icon: '📄' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('assessment');
  const [data, setData] = useState<AssessmentInput>(INITIAL_ASSESSMENT);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [validationOpen, setValidationOpen] = useState(false);
  const [presentationMode, setPresentationMode] = useState(false);

  const result = useMemo(() => calculateTranslation(data), [data]);

  // Ctrl+Shift+V → validation panel
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'V') {
        e.preventDefault();
        setValidationOpen(v => !v);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className={`min-h-screen bg-gray-50 ${presentationMode ? 'text-[120%]' : ''}`} dir="rtl">
      {/* Presentation mode banner */}
      {presentationMode && (
        <div className="bg-gradient-to-l from-primary to-[#2a4f7a] text-white text-center py-3 text-sm font-medium no-print animate-pulse-slow">
          מערכת גשר קופה↔בט"ל | פורום בר״ק | גרסת הדגמה | אינה מחליפה הערכת בט"ל רשמית
        </div>
      )}

      {/* Header */}
      <header className="bg-primary text-white shadow-lg no-print">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className={`font-semibold ${presentationMode ? 'text-xl' : 'text-lg'}`}>
              מערכת גשר קופה↔בט"ל — תרגום מדדי תפקוד
            </h1>
            <p className="text-primary-light text-sm mt-0.5">פורום בר"ק | צוות תפקוד | גרסה 1.0 | יוני 2026</p>
          </div>
          <button
            onClick={() => setPresentationMode(p => !p)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              presentationMode
                ? 'bg-white text-primary'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
            title="מצב הצגה"
          >
            <Presentation className="h-4 w-4" />
            <span className="hidden sm:inline">{presentationMode ? 'יציאה ממצב הצגה' : 'מצב הצגה'}</span>
          </button>
        </div>
      </header>

      {/* Tabs */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 no-print">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 py-2">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className="ml-1.5">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'assessment' && (
          <Tab1Assessment data={data} onChange={setData} />
        )}
        {activeTab === 'translation' && (
          <Tab2Translation data={data} result={result} presentationMode={presentationMode} />
        )}
        {activeTab === 'report' && (
          <Tab3Report data={data} result={result} presentationMode={presentationMode} />
        )}
      </main>

      {/* Disclaimer */}
      <footer className="text-center py-4 text-xs text-gray-400 border-t border-gray-100 no-print">
        הערכה זו אינה מחליפה הערכת בט"ל רשמית | מתודולוגיית Crosswalk לאומי v1.0 | פורום בר"ק
      </footer>

      {/* Feedback button */}
      <button
        onClick={() => setFeedbackOpen(true)}
        className="fixed bottom-6 left-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full shadow-lg text-white text-sm font-medium transition-transform hover:scale-105 active:scale-95 no-print"
        style={{ backgroundColor: "#1B3A5C" }}
        aria-label="משוב פיילוט"
      >
        <MessageCircle className="h-5 w-5" />
        <span className="hidden sm:inline">משוב פיילוט</span>
      </button>
      <FeedbackModal open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />

      {/* Validation Panel (Ctrl+Shift+V) */}
      <ValidationPanel open={validationOpen} onClose={() => setValidationOpen(false)} />
    </div>
  );
}
