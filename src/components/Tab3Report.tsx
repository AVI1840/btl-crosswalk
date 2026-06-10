import type { AssessmentInput } from '../data/types';
import type { TranslationResult } from '../data/types';
import { ConfidenceBadge } from './ConfidenceBadge';
import { Printer, Copy } from 'lucide-react';
import { HMO_OPTIONS, ASSESSOR_OPTIONS, CONTEXT_OPTIONS } from '../data/constants';

interface Props {
  data: AssessmentInput;
  result: TranslationResult;
  presentationMode?: boolean;
}

function getHmoLabel(hmo: string) { return HMO_OPTIONS.find(o => o.value === hmo)?.label ?? hmo; }
function getAssessorLabel(a: string) { return ASSESSOR_OPTIONS.find(o => o.value === a)?.label ?? a; }
function getContextLabel(c: string) { return CONTEXT_OPTIONS.find(o => o.value === c)?.label ?? c; }

function generateFunctionalSummary(data: AssessmentInput, result: TranslationResult): string {
  const barthelTotal = data.barthelMode === 'subitems'
    ? Object.values(data.barthelSubItems).reduce((a, b) => a + b, 0)
    : data.barthelTotal;

  let adlDesc = '';
  if (barthelTotal >= 80) adlDesc = 'עצמאי ברוב פעולות היומיום';
  else if (barthelTotal >= 60) adlDesc = 'תלות חלקית בפעולות יומיום';
  else if (barthelTotal >= 40) adlDesc = 'תלות בינונית-קשה בפעולות יומיום';
  else adlDesc = 'תלות קשה עד מלאה בפעולות יומיום';

  let cogDesc = '';
  const cogScore = data.cognitionTool === 'mmse' ? data.mmseScore : data.mocaScore;
  if (cogScore !== null) {
    const tool = data.cognitionTool === 'mmse' ? 'MMSE' : 'MoCA';
    const threshold = data.cognitionTool === 'mmse' ? 24 : 22;
    if (cogScore >= threshold) cogDesc = `מצב קוגניטיבי תקין (${tool}=${cogScore})`;
    else if (cogScore >= (threshold - 5)) cogDesc = `ירידה קוגניטיבית קלה (${tool}=${cogScore})`;
    else cogDesc = `ירידה קוגניטיבית משמעותית (${tool}=${cogScore})`;
  } else {
    cogDesc = 'מצב קוגניטיבי לא הוערך';
  }

  return `מבוטח מוערך ב${getHmoLabel(data.hmo)} ב${data.assessmentDate}. מצב ADL: ${adlDesc} (Barthel=${barthelTotal}). ${cogDesc}. ` +
    `${data.dementiaDiagnosis ? 'קיימת אבחנת דמנציה' : 'ללא אבחנת דמנציה'}.`;
}

function generateRecommendations(data: AssessmentInput, result: TranslationResult): string[] {
  const recs: string[] = [];

  if (data.mmseScore === null && data.mocaScore === null) {
    recs.push('מומלץ: הערכת מצב קוגניטיבי מלאה (MMSE או MoCA)');
  }

  if (data.barthelMode === 'total') {
    recs.push('מומלץ: פירוט סעיפי Barthel לשיפור דיוק');
  }

  if (data.lawtonTotal === null) {
    recs.push('מומלץ: הערכת IADL לפי Lawton');
  }

  if (data.dementiaDiagnosis && !data.dementiaSeverity) {
    recs.push('מומלץ: קביעת חומרת דמנציה');
  }

  if (result.gaps.some(g => g.type === 'red' && g.domain === 'supervision')) {
    recs.push('מומלץ: בירור השגחה — עשוי להוסיף 4-10 נקודות');
  }

  if (recs.length === 0) {
    recs.push('הנתונים מספיקים להערכה ראשונית אמינה');
  }

  return recs;
}

function generatePlainText(data: AssessmentInput, result: TranslationResult): string {
  const lines: string[] = [];
  lines.push('═══════════════════════════════════════════════════════');
  lines.push('דו"ח תרגום תפקודי — מערכת גשר קופה↔בט"ל');
  lines.push('═══════════════════════════════════════════════════════');
  lines.push('');
  lines.push(`מטופל: ${data.patientId || 'לא צוין'}`);
  lines.push(`תאריך: ${data.assessmentDate} | קופה: ${getHmoLabel(data.hmo)} | מעריך: ${getAssessorLabel(data.assessorType)} | הקשר: ${getContextLabel(data.assessmentContext)}`);
  lines.push('');
  lines.push('--- תמצית תפקודית ---');
  lines.push(generateFunctionalSummary(data, result));
  lines.push('');
  lines.push('--- ניקוד BTL משוער ---');
  result.domains.forEach(d => {
    lines.push(`  ${d.domainLabel}: ${d.btlScore}/${d.maxScore} (${d.label}) [אמינות: ${d.confidence}]`);
  });
  lines.push(`  השגחה: ${result.supervisionPoints} נק' (${result.supervisionLabel})`);
  lines.push('');
  lines.push(`  סה"כ: ${result.totalPoints} נקודות`);
  lines.push(`  רמת זכאות משוערת: ${result.eligibilityLabel}${result.hoursPerWeek ? ` (~${result.hoursPerWeek} ש'/שבוע)` : ''}`);
  lines.push('');
  lines.push('--- צעדים מומלצים ---');
  generateRecommendations(data, result).forEach(r => lines.push(`  • ${r}`));
  lines.push('');
  lines.push('───────────────────────────────────────────────────────');
  lines.push('מסמך זה מבוסס על מתודולוגיית Crosswalk לאומי גרסה 1.0');
  lines.push('פורום בר"ק | אינו מחליף הערכת בט"ל רשמית | ניתן להשגחה אנושית');

  return lines.join('\n');
}

export function Tab3Report({ data, result, presentationMode }: Props) {
  const handlePrint = () => window.print();
  const handleCopy = () => {
    navigator.clipboard.writeText(generatePlainText(data, result));
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Actions bar */}
      <div className="flex gap-3 mb-4 no-print">
        <button
          onClick={handlePrint}
          className={`flex items-center gap-2 rounded-lg font-medium hover:opacity-90 transition-all ${
            presentationMode
              ? 'px-6 py-3 bg-primary text-white text-base shadow-lg hover:shadow-xl scale-105'
              : 'px-4 py-2 bg-primary text-white text-sm'
          }`}
        >
          <Printer className={presentationMode ? 'h-5 w-5' : 'h-4 w-4'} />
          {presentationMode ? '🖨️ הדפס דוח' : 'הדפסה'}
        </button>
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg text-sm hover:bg-gray-200"
        >
          <Copy className="h-4 w-4" />
          העתק ללוח
        </button>
      </div>

      {/* Report content */}
      <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm space-y-6 print:shadow-none print:border-none">
        {/* Header */}
        <div className="text-center border-b border-gray-200 pb-4">
          <h2 className="text-xl font-bold text-primary">דו"ח תרגום תפקודי — מערכת גשר קופה↔בט"ל</h2>
          <p className="text-sm text-gray-500 mt-1">פורום בר"ק | צוות תפקוד | גרסה 1.0</p>
        </div>

        {/* Patient info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 rounded-lg p-4">
          <div>
            <p className="text-xs text-gray-500">מטופל</p>
            <p className="text-sm font-medium">{data.patientId || 'לא צוין'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">תאריך</p>
            <p className="text-sm font-medium">{data.assessmentDate}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">קופה</p>
            <p className="text-sm font-medium">{getHmoLabel(data.hmo)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">מעריך</p>
            <p className="text-sm font-medium">{getAssessorLabel(data.assessorType)} | {getContextLabel(data.assessmentContext)}</p>
          </div>
        </div>

        {/* Section 1: Functional Summary */}
        <div>
          <h3 className="font-semibold text-sm text-primary mb-2">1. תמצית תפקודית</h3>
          <p className="text-sm text-gray-800 leading-relaxed">
            {generateFunctionalSummary(data, result)}
          </p>
        </div>

        {/* Section 2: BTL Scoring */}
        <div>
          <h3 className="font-semibold text-sm text-primary mb-2">2. ניקוד BTL משוער</h3>
          <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-2 text-right font-medium">תחום</th>
                <th className="p-2 text-center font-medium">ניקוד BTL</th>
                <th className="p-2 text-center font-medium">אמינות</th>
                <th className="p-2 text-right font-medium">תיאור</th>
              </tr>
            </thead>
            <tbody>
              {result.domains.map(d => (
                <tr key={d.domain} className="border-t border-gray-100">
                  <td className="p-2 font-medium">{d.domainLabel}</td>
                  <td className="p-2 text-center font-bold">{d.btlScore}/{d.maxScore}</td>
                  <td className="p-2 text-center"><ConfidenceBadge level={d.confidence} /></td>
                  <td className="p-2 text-xs text-gray-600">{d.label}</td>
                </tr>
              ))}
              <tr className="border-t-2 border-purple-200 bg-purple-50">
                <td className="p-2 font-medium text-purple-800">השגחה</td>
                <td className="p-2 text-center font-bold text-purple-700">{result.supervisionPoints}</td>
                <td className="p-2 text-center"><ConfidenceBadge level={result.supervisionConfidence} /></td>
                <td className="p-2 text-xs text-purple-700">{result.supervisionLabel}</td>
              </tr>
            </tbody>
            <tfoot className="bg-primary/5">
              <tr className="border-t-2 border-primary">
                <td className="p-3 font-bold">סה"כ</td>
                <td className="p-3 text-center text-xl font-bold text-primary">{result.totalPoints}</td>
                <td className="p-3 text-center"><ConfidenceBadge level={result.overallConfidence} size="md" /></td>
                <td className="p-3 font-bold text-primary">{result.eligibilityLabel}
                  {result.hoursPerWeek !== null && result.hoursPerWeek > 0 && ` (~${result.hoursPerWeek} ש'/שבוע)`}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Section 3: Confidence */}
        <div>
          <h3 className="font-semibold text-sm text-primary mb-2">3. אות ביטחון ורמת אמינות</h3>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-sm">רמת אמינות כוללת:</span>
            <ConfidenceBadge level={result.overallConfidence} size="md" />
          </div>
          {result.gaps.filter(g => g.type !== 'green').length > 0 && (
            <ul className="space-y-1">
              {result.gaps.filter(g => g.type !== 'green').map((gap, i) => (
                <li key={i} className="text-xs text-gray-700 flex items-start gap-2">
                  <span>{gap.type === 'red' ? '🔴' : '🟡'}</span>
                  <span>{gap.message}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Section 4: Recommendations */}
        <div>
          <h3 className="font-semibold text-sm text-primary mb-2">4. צעדים מומלצים</h3>
          <ul className="space-y-1.5">
            {generateRecommendations(data, result).map((rec, i) => (
              <li key={i} className="text-sm text-gray-800 flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 pt-4 text-center">
          <p className="text-xs text-gray-400">
            מסמך זה מבוסס על מתודולוגיית Crosswalk לאומי גרסה 1.0 | פורום בר"ק | אינו מחליף הערכת בט"ל רשמית | ניתן להשגחה אנושית
          </p>
        </div>
      </div>
    </div>
  );
}
