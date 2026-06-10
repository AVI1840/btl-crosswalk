import { useMemo } from 'react';
import { calculateTranslation } from '../utils/scoringEngine';
import { INITIAL_ASSESSMENT } from '../data/types';
import type { AssessmentInput } from '../data/types';
import { CheckCircle, XCircle, X } from 'lucide-react';

interface TestCase {
  name: string;
  description: string;
  input: Partial<AssessmentInput>;
  expectedTotalPoints: number;
  expectedLabel: string;
}

const TEST_CASES: TestCase[] = [
  {
    name: 'מאיה, 78, אחרי שבר ירך',
    description: 'Barthel פירוט=60, MoCA=24, ללא דמנציה, נפילה אחת בשנה',
    input: {
      barthelMode: 'subitems',
      barthelTotal: 60,
      barthelSubItems: {
        mobility: 5, dressing: 5, bathing: 0, feeding: 10,
        bowels: 10, bladder: 10, toilet_use: 5, transfers: 10,
        grooming: 5, stairs: 0,
      },
      cognitionTool: 'moca',
      mocaScore: 24,
      dementiaDiagnosis: false,
      dementiaSeverity: null,
      bpsd: false,
      safetyRiskAlone: false,
      fallsLastYear: '1',
    },
    expectedTotalPoints: 3.5,
    expectedLabel: 'רמה ג\'',
  },
  {
    name: 'יוסף, 84, דמנציה בינונית',
    description: 'Barthel כולל=45, MMSE=18, דמנציה בינונית, BPSD כן',
    input: {
      barthelMode: 'total',
      barthelTotal: 45,
      cognitionTool: 'mmse',
      mmseScore: 18,
      dementiaDiagnosis: true,
      dementiaSeverity: 'moderate',
      bpsd: true,
      safetyRiskAlone: false,
      fallsLastYear: 'none',
    },
    expectedTotalPoints: 8,
    expectedLabel: 'רמה ה\'',
  },
  {
    name: 'רות, 91, תלויה מלאה',
    description: 'Barthel כולל=15, MoCA=12, דמנציה חמורה, סיכון בטיחותי',
    input: {
      barthelMode: 'total',
      barthelTotal: 15,
      cognitionTool: 'moca',
      mocaScore: 12,
      dementiaDiagnosis: true,
      dementiaSeverity: 'severe',
      bpsd: true,
      safetyRiskAlone: true,
      fallsLastYear: '2plus',
    },
    expectedTotalPoints: 16,
    expectedLabel: 'סיעוד מלא',
  },
  {
    name: 'אברהם, 72, עצמאי יחסית',
    description: 'Barthel כולל=85, MMSE=27, ללא דמנציה, ללא נפילות',
    input: {
      barthelMode: 'total',
      barthelTotal: 85,
      cognitionTool: 'mmse',
      mmseScore: 27,
      dementiaDiagnosis: false,
      dementiaSeverity: null,
      bpsd: false,
      safetyRiskAlone: false,
      fallsLastYear: 'none',
    },
    expectedTotalPoints: 1.5,
    expectedLabel: 'רמה א\'',
  },
];

function runTestCase(testCase: TestCase) {
  const input: AssessmentInput = {
    ...INITIAL_ASSESSMENT,
    ...testCase.input,
  };
  return calculateTranslation(input);
}

interface Props {
  open: boolean;
  onClose: () => void;
}

export function ValidationPanel({ open, onClose }: Props) {
  const results = useMemo(() => {
    return TEST_CASES.map(tc => {
      const result = runTestCase(tc);
      const pointsDiff = Math.abs(result.totalPoints - tc.expectedTotalPoints);
      const pass = pointsDiff <= 0.5 || result.eligibilityLabel === tc.expectedLabel;
      return { tc, result, pointsDiff, pass };
    });
  }, []);

  if (!open) return null;

  const allPass = results.every(r => r.pass);

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-2xl max-w-3xl w-full mx-4 max-h-[85vh] overflow-y-auto"
        dir="rtl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between rounded-t-xl">
          <div>
            <h2 className="text-lg font-bold text-gray-800">🧪 פאנל ולידציה פנימי</h2>
            <p className="text-xs text-gray-500">4 מקרי בדיקה קליניים לפי חוזר 1539 | Ctrl+Shift+V להפעלה</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-sm font-medium px-3 py-1 rounded-full ${allPass ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {allPass ? '✓ כל הבדיקות עברו' : `✗ ${results.filter(r => !r.pass).length} נכשלו`}
            </span>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Test cases */}
        <div className="p-4 space-y-4">
          {results.map(({ tc, result, pointsDiff, pass }, i) => (
            <div key={i} className={`border rounded-lg p-4 ${pass ? 'border-green-200 bg-green-50/50' : 'border-red-200 bg-red-50/50'}`}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    {pass
                      ? <CheckCircle className="h-5 w-5 text-green-600" />
                      : <XCircle className="h-5 w-5 text-red-600" />
                    }
                    <span className="font-semibold text-sm">{tc.name}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 mr-7">{tc.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mt-3 mr-7">
                <div className="bg-white rounded-lg p-2 border border-gray-200">
                  <p className="text-[10px] text-gray-500">צפוי</p>
                  <p className="text-sm font-bold">{tc.expectedTotalPoints} נק' → {tc.expectedLabel}</p>
                </div>
                <div className="bg-white rounded-lg p-2 border border-gray-200">
                  <p className="text-[10px] text-gray-500">בפועל</p>
                  <p className="text-sm font-bold">{result.totalPoints} נק' → {result.eligibilityLabel}</p>
                </div>
                <div className="bg-white rounded-lg p-2 border border-gray-200">
                  <p className="text-[10px] text-gray-500">הפרש</p>
                  <p className={`text-sm font-bold ${pointsDiff <= 0.5 ? 'text-green-600' : 'text-red-600'}`}>
                    {pointsDiff === 0 ? '0 (מדויק)' : `±${pointsDiff.toFixed(1)} נק'`}
                  </p>
                </div>
              </div>

              {/* Domain breakdown */}
              <div className="mt-2 mr-7">
                <details className="text-xs">
                  <summary className="cursor-pointer text-gray-500 hover:text-gray-700">פירוט תחומים</summary>
                  <div className="mt-1 grid grid-cols-2 gap-1">
                    {result.domains.map(d => (
                      <div key={d.domain} className="bg-gray-50 rounded p-1.5">
                        <span className="text-gray-600">{d.domainLabel}:</span>{' '}
                        <span className="font-medium">{d.btlScore}/{d.maxScore}</span>
                      </div>
                    ))}
                    <div className="bg-purple-50 rounded p-1.5">
                      <span className="text-purple-600">השגחה:</span>{' '}
                      <span className="font-medium">{result.supervisionPoints}</span>
                    </div>
                  </div>
                </details>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-3 text-center text-xs text-gray-400">
          פאנל פנימי בלבד — אינו מוצג למשתמשי קצה | מקרי בדיקה מבוססי חוזר 1539
        </div>
      </div>
    </div>
  );
}
