import type { AssessmentInput } from '../data/types';
import type { TranslationResult } from '../data/types';
import { ConfidenceBadge, ConfidenceBox } from './ConfidenceBadge';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface Props {
  data: AssessmentInput;
  result: TranslationResult;
  presentationMode?: boolean;
}

const CONF_LABELS: Record<string, string> = {
  high: 'גבוהה', medium: 'בינונית', low: 'נמוכה', research_required: 'דורש מחקר',
};

function DomainCard({ domain, highlight }: { domain: TranslationResult['domains'][0]; highlight?: boolean }) {
  return (
    <div className={`border rounded-lg p-3 space-y-2 transition-all ${
      highlight ? 'border-primary/50 shadow-md ring-2 ring-primary/20' : 'border-gray-200'
    }`}>
      <div className="flex items-center justify-between">
        <span className="font-medium text-sm">{domain.domainLabel}</span>
        <ConfidenceBadge level={domain.confidence} />
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-primary">{domain.btlScore}</span>
        <span className="text-xs text-gray-500">/ {domain.maxScore} נקודות</span>
      </div>
      <p className="text-xs text-gray-700">{domain.label}</p>

      {/* 4-field output */}
      <div className={`grid grid-cols-2 gap-1.5 mt-2 ${highlight ? 'animate-highlight-fields' : ''}`}>
        <div className={`rounded p-2 ${highlight ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'}`}>
          <div className="text-[10px] text-gray-500">source_value</div>
          <div className="text-xs font-medium">{domain.sourceValue}</div>
        </div>
        <div className={`rounded p-2 ${highlight ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'}`}>
          <div className="text-[10px] text-gray-500">btl_equivalent</div>
          <div className="text-xs font-medium">{domain.btlScore} נקודות — {domain.label}</div>
        </div>
        <div className={`rounded p-2 ${highlight ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'}`}>
          <div className="text-[10px] text-gray-500">confidence</div>
          <div className="text-xs font-medium"><ConfidenceBadge level={domain.confidence} /></div>
        </div>
        <div className={`rounded p-2 ${highlight ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'}`}>
          <div className="text-[10px] text-gray-500">human_review</div>
          <div className="text-xs font-medium">{domain.humanReview ? '✓ נדרש' : '— '}</div>
        </div>
      </div>

      {domain.note && (
        <p className="text-xs text-amber-700 bg-amber-50 rounded p-1.5 mt-1">⚠️ {domain.note}</p>
      )}
    </div>
  );
}

function GapItem({ gap }: { gap: TranslationResult['gaps'][0] }) {
  const icon = gap.type === 'red' ? <XCircle className="h-4 w-4 text-red-500 shrink-0" />
    : gap.type === 'yellow' ? <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
    : <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />;

  const bg = gap.type === 'red' ? 'bg-red-50 border-red-200'
    : gap.type === 'yellow' ? 'bg-amber-50 border-amber-200'
    : 'bg-green-50 border-green-200';

  return (
    <div className={`flex items-start gap-2 p-2.5 rounded-lg border ${bg}`}>
      {icon}
      <span className="text-xs text-gray-800">{gap.message}</span>
    </div>
  );
}

export function Tab2Translation({ result, presentationMode }: Props) {
  const confLabel = result.overallConfidence === 'high' ? 'גבוהה'
    : result.overallConfidence === 'medium' ? 'בינונית'
    : result.overallConfidence === 'low' ? 'נמוכה' : 'דורש מחקר';

  return (
    <div className="space-y-6">
      {/* FIX 2: Verdict card — always visible, first thing */}
      <div className="border-2 border-[#1F3864] rounded-xl p-6 bg-white shadow-md">
        <div className="text-center space-y-3">
          <p className="text-sm text-gray-600 font-medium">ניקוד BTL משוער</p>
          <p className="text-4xl font-bold text-[#1F3864]">{result.totalPoints} נקודות</p>
          <p className="text-2xl font-bold text-[#1F3864]">
            רמת זכאות: {result.eligibilityLabel}
            {result.hoursPerWeek !== null && result.hoursPerWeek > 0 && (
              <span className="text-lg font-medium text-gray-600"> (~{result.hoursPerWeek} ש'/שבוע)</span>
            )}
          </p>
          <div className="flex items-center justify-center gap-2">
            <span className="text-sm text-gray-600">רמת אמינות:</span>
            <ConfidenceBadge level={result.overallConfidence} size="md" />
          </div>
          {result.gaps.some(g => g.type === 'red' || g.type === 'yellow') && (
            <p className="text-sm text-amber-700 bg-amber-50 inline-block px-3 py-1 rounded-lg">
              ⚠️ יש פערים בנתונים — יש לבחון
            </p>
          )}
        </div>
      </div>

      {/* FIX 3: Plain Hebrew explanation */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
        <p className="text-sm text-gray-800 leading-relaxed">
          על בסיס הנתונים שהוזנו, הניקוד המשוער בסולם בט"ל הוא <strong>{result.totalPoints} נקודות</strong>,
          המתאים לרמת זכאות <strong>{result.eligibilityLabel}</strong>
          {result.hoursPerWeek !== null && result.hoursPerWeek > 0 && (
            <span> (~{result.hoursPerWeek} שעות שבועיות)</span>
          )}.
          <br />
          <span className="text-xs text-gray-500 mt-1 inline-block">המערכת אינה מחליפה הערכת בט"ל רשמית.</span>
        </p>
      </div>

      {/* Presentation mode extra banner */}
      {presentationMode && (
        <div className="bg-gradient-to-l from-primary/5 to-primary/10 border border-primary/20 rounded-xl p-5 text-center">
          <p className="text-lg font-semibold text-primary">
            על בסיס הנתונים שהוזנו: הזכאות המשוערת היא{' '}
            <span className="text-2xl font-bold underline decoration-primary/30">{result.eligibilityLabel}</span>
            {result.hoursPerWeek !== null && result.hoursPerWeek > 0 && (
              <span> (~{result.hoursPerWeek} שעות שבועיות)</span>
            )}
          </p>
          <p className="text-sm text-gray-600 mt-2">
            ברמת אמינות <ConfidenceBadge level={result.overallConfidence} size="md" />
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: What HMO sees */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm text-primary border-b pb-2">📋 מה ראתה הקופה</h3>
          {result.domains.map(d => (
            <div key={d.domain} className="bg-white border border-gray-200 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-gray-600">{d.domainLabel}</span>
              </div>
              <p className="text-sm text-right">{d.sourceValue}</p>
            </div>
          ))}
        </div>

        {/* CENTER: BTL Translation */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm text-primary border-b pb-2">🏛️ מה יראה בט"ל</h3>

          {result.domains.map(d => (
            <DomainCard key={d.domain} domain={d} highlight={presentationMode} />
          ))}

          {/* Supervision */}
          <div className={`border-2 border-purple-200 rounded-lg p-3 bg-purple-50 ${presentationMode ? 'shadow-md ring-2 ring-purple-200' : ''}`}>
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm text-purple-800">👁️ השגחה</span>
              <ConfidenceBadge level={result.supervisionConfidence} />
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-purple-700">{result.supervisionPoints}</span>
              <span className="text-xs text-purple-600">נקודות</span>
            </div>
            <p className="text-xs text-purple-700 mt-1">{result.supervisionLabel}</p>
            <p className="text-[10px] text-purple-500 mt-1">⚠️ מודול השגחה תמיד דורש בקרה אנושית</p>
          </div>

          {/* Total & Eligibility */}
          <ConfidenceBox level={result.overallConfidence}>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">סה"כ ADL</span>
                <span className="text-lg font-bold">{result.totalAdlPoints} נק'</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">+ השגחה</span>
                <span className="text-lg font-bold">{result.supervisionPoints} נק'</span>
              </div>
              <hr className="border-gray-300" />
              <div className="flex items-center justify-between">
                <span className="font-semibold">סה"כ נקודות</span>
                <span className="text-2xl font-bold text-primary">{result.totalPoints}</span>
              </div>
              <div className="bg-white rounded-lg p-3 text-center mt-2">
                <p className="text-xs text-gray-500 mb-1">רמת זכאות משוערת</p>
                <p className={`font-bold text-primary ${presentationMode ? 'text-2xl' : 'text-xl'}`}>{result.eligibilityLabel}</p>
                {result.hoursPerWeek !== null && result.hoursPerWeek > 0 && (
                  <p className="text-sm text-gray-600">~{result.hoursPerWeek} שעות/שבוע</p>
                )}
              </div>
              <div className="flex items-center justify-center gap-2 mt-2">
                <span className="text-xs">רמת אמינות:</span>
                <ConfidenceBadge level={result.overallConfidence} size="md" />
              </div>
            </div>
          </ConfidenceBox>
        </div>

        {/* RIGHT: Gaps */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm text-primary border-b pb-2">⚠️ פערים ואזהרות</h3>
          {result.gaps.map((gap, i) => (
            <GapItem key={i} gap={gap} />
          ))}

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mt-4">
            <p className="text-xs text-gray-600 text-center">
              הערכה זו אינה מחליפה הערכת בט"ל רשמית
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
