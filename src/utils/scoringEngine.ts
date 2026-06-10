// ======================================================================
// BTL Scoring Engine
// Translates HMO assessment inputs into BTL scoring per חוזר 1539
// ======================================================================

import {
  BARTHEL_TO_BTL_MOBILITY,
  BARTHEL_TO_BTL_DRESSING,
  BARTHEL_TO_BTL_BATHING,
  BARTHEL_TO_BTL_EATING,
  SUPERVISION_LEVELS,
  ELIGIBILITY_LEVELS,
  MMSE_MOCA_TABLE,
  type ConfidenceLevel,
} from '../data/constants';
import type { AssessmentInput, DomainResult, GapFlag, TranslationResult } from '../data/types';

// --- Helper: find matching rule ---
function findRule<T extends { barthelRange: [number, number] }>(
  rules: T[],
  score: number
): T | undefined {
  return rules.find(r => score >= r.barthelRange[0] && score <= r.barthelRange[1]);
}

// --- Get Barthel sub-item score ---
function getBarthelSub(input: AssessmentInput, item: string): number {
  if (input.barthelMode === 'subitems') {
    return input.barthelSubItems[item] ?? 0;
  }
  // Estimate from total — rough proportional distribution
  return estimateSubFromTotal(input.barthelTotal, item);
}

function estimateSubFromTotal(total: number, item: string): number {
  // Proportion-based estimation when only total is available
  const maxScores: Record<string, number> = {
    feeding: 10, bathing: 5, grooming: 5, dressing: 10,
    bowels: 10, bladder: 10, toilet_use: 10, transfers: 15,
    mobility: 15, stairs: 10
  };
  const max = maxScores[item] || 10;
  const ratio = total / 100;

  if (ratio >= 0.9) return max;
  if (ratio >= 0.6) return max > 5 ? Math.round(max * 0.5 / 5) * 5 : 0;
  if (ratio >= 0.3) return max > 10 ? 5 : 0;
  return 0;
}

// --- Domain: Mobility ---
function scoreMobility(input: AssessmentInput): DomainResult {
  const barthelMobility = getBarthelSub(input, 'mobility');
  const rule = findRule(BARTHEL_TO_BTL_MOBILITY, barthelMobility);

  let score = rule?.btlScore ?? 0;
  let confidence = rule?.confidence ?? 'low' as ConfidenceLevel;
  let note = rule?.note;

  // Falls modifier: if 2+ falls AND TUG ≥ 12 → add 0.5
  if (input.fallsLastYear === '2plus' && input.tugScore && input.tugScore >= 12) {
    score = Math.min(2, score + 0.5);
    note = (note ? note + '. ' : '') + 'תוספת 0.5 בגין נפילות חוזרות + TUG ≥ 12';
  }

  // If only total Barthel, lower confidence
  if (input.barthelMode === 'total') {
    confidence = lowerConfidence(confidence);
    note = (note ? note + '. ' : '') + 'הערכה מתוך ציון כולל — מומלץ פירוט סעיפים';
  }

  return {
    domain: 'mobility',
    domainLabel: 'ניידות',
    sourceValue: `Barthel ניידות = ${barthelMobility}`,
    btlScore: score,
    maxScore: 2,
    confidence,
    label: rule?.label ?? 'לא ידוע',
    note,
    humanReview: confidence !== 'high',
  };
}

// --- Domain: Dressing ---
function scoreDressing(input: AssessmentInput): DomainResult {
  const barthelDressing = getBarthelSub(input, 'dressing');
  const rule = findRule(BARTHEL_TO_BTL_DRESSING, barthelDressing);
  let confidence = rule?.confidence ?? 'low' as ConfidenceLevel;

  if (input.barthelMode === 'total') confidence = lowerConfidence(confidence);

  return {
    domain: 'dressing',
    domainLabel: 'הלבשה',
    sourceValue: `Barthel הלבשה = ${barthelDressing}`,
    btlScore: rule?.btlScore ?? 0,
    maxScore: 1.5,
    confidence,
    label: rule?.label ?? 'לא ידוע',
    note: input.barthelMode === 'total' ? 'הערכה מתוך ציון כולל' : undefined,
    humanReview: confidence !== 'high',
  };
}

// --- Domain: Bathing ---
function scoreBathing(input: AssessmentInput): DomainResult {
  const barthelBathing = getBarthelSub(input, 'bathing');
  const rule = findRule(BARTHEL_TO_BTL_BATHING, barthelBathing);
  let confidence = rule?.confidence ?? 'low' as ConfidenceLevel;

  if (input.barthelMode === 'total') confidence = lowerConfidence(confidence);

  return {
    domain: 'bathing',
    domainLabel: 'רחצה',
    sourceValue: `Barthel רחצה = ${barthelBathing}`,
    btlScore: rule?.btlScore ?? 0,
    maxScore: 1.5,
    confidence,
    label: rule?.label ?? 'לא ידוע',
    note: rule?.note,
    humanReview: confidence !== 'high',
  };
}

// --- Domain: Eating ---
function scoreEating(input: AssessmentInput): DomainResult {
  const barthelEating = getBarthelSub(input, 'feeding');
  const rule = findRule(BARTHEL_TO_BTL_EATING, barthelEating);
  let confidence = rule?.confidence ?? 'low' as ConfidenceLevel;

  if (input.barthelMode === 'total') confidence = lowerConfidence(confidence);

  return {
    domain: 'eating',
    domainLabel: 'אכילה',
    sourceValue: `Barthel אכילה = ${barthelEating}`,
    btlScore: rule?.btlScore ?? 0,
    maxScore: 2,
    confidence,
    label: rule?.label ?? 'לא ידוע',
    humanReview: confidence !== 'high',
  };
}

// --- Domain: Hygiene/Excretion ---
function scoreHygiene(input: AssessmentInput): DomainResult {
  const bowels = getBarthelSub(input, 'bowels');
  const bladder = getBarthelSub(input, 'bladder');
  const toilet = getBarthelSub(input, 'toilet_use');
  const mobility = getBarthelSub(input, 'mobility');

  let score = 0;
  let label = 'עצמאי — שליטה מלאה';
  let confidence: ConfidenceLevel = 'high';

  if (bowels === 10 && bladder === 10 && toilet === 10) {
    score = 0;
    label = 'עצמאי — שליטה מלאה';
  } else if ((bowels === 5 || bladder === 5) && toilet >= 5) {
    score = 1;
    label = 'אי-שליטה חלקית';
    confidence = 'medium';
  } else if ((bowels === 0 || bladder === 0) && mobility >= 5) {
    score = 1.5;
    label = 'אי-שליטה — נייד';
    confidence = 'medium';
  } else if ((bowels === 0 || bladder === 0) && mobility < 5) {
    score = 2;
    label = 'אי-שליטה — לא נייד';
  } else if (toilet === 0) {
    score = 2;
    label = 'תלוי מלא בטיפול הפרשות';
  }

  if (input.barthelMode === 'total') confidence = lowerConfidence(confidence);

  return {
    domain: 'hygiene',
    domainLabel: 'היגיינה / הפרשות',
    sourceValue: `מעיים=${bowels}, שלפוחית=${bladder}, שירותים=${toilet}`,
    btlScore: score,
    maxScore: 2,
    confidence,
    label,
    note: input.barthelMode === 'total' ? 'הערכה מתוך ציון כולל — דיוק נמוך' : undefined,
    humanReview: confidence !== 'high',
  };
}

// --- Supervision ---
function scoreSupervision(input: AssessmentInput): {
  points: number; label: string; confidence: ConfidenceLevel;
} {
  if (!input.dementiaDiagnosis) {
    return { points: 0, label: SUPERVISION_LEVELS[0].label, confidence: 'high' };
  }

  // Severe dementia + full ADL dependence → 10
  if (
    (input.dementiaSeverity === 'severe' || input.dementiaSeverity === 'advanced') &&
    input.barthelTotal <= 20
  ) {
    return { points: 10, label: SUPERVISION_LEVELS[3].label, confidence: 'medium' };
  }

  // Severe dementia + safety risk → 9
  if (
    (input.dementiaSeverity === 'severe' || input.dementiaSeverity === 'advanced') &&
    input.safetyRiskAlone
  ) {
    return { points: 9, label: SUPERVISION_LEVELS[2].label, confidence: 'medium' };
  }

  // Mild/moderate with BPSD → 4
  if (input.dementiaDiagnosis && (input.bpsd || input.dementiaSeverity === 'moderate')) {
    return { points: 4, label: SUPERVISION_LEVELS[1].label, confidence: 'medium' };
  }

  // Mild dementia without BPSD — may not qualify
  return { points: 0, label: 'דמנציה קלה — ייתכן שאין זכאות להשגחה', confidence: 'low' };
}

// --- Gap Analysis ---
function analyzeGaps(input: AssessmentInput, domains: DomainResult[]): GapFlag[] {
  const gaps: GapFlag[] = [];

  // Red: missing supervision data when cognition suggests issue
  const cogScore = input.cognitionTool === 'mmse' ? input.mmseScore : input.mocaScore;
  if (cogScore !== null) {
    const threshold = input.cognitionTool === 'mmse' ? 24 : 22;
    if (cogScore < threshold && !input.dementiaDiagnosis) {
      gaps.push({
        type: 'red',
        message: 'ציון קוגניטיבי נמוך אך לא סומנה אבחנת דמנציה — השגחה עשויה להשפיע על +4-10 נקודות',
        domain: 'supervision',
      });
    }
  }

  // Red: no cognition assessed at all
  if (input.mmseScore === null && input.mocaScore === null) {
    gaps.push({
      type: 'red',
      message: 'לא הוזן ציון קוגניטיבי — לא ניתן להעריך זכאות להשגחה',
      domain: 'cognition',
    });
  }

  // Yellow: Barthel total only
  if (input.barthelMode === 'total') {
    gaps.push({
      type: 'yellow',
      message: 'ציון Barthel כולל בלבד — פירוט סעיפים ישפר דיוק ב-1-2 רמות',
      domain: 'adl',
    });
  }

  // Yellow: IADL not assessed
  if (input.lawtonTotal === null) {
    gaps.push({
      type: 'yellow',
      message: 'IADL (Lawton) לא הוערך — חשוב לתמונה תפקודית מלאה',
      domain: 'iadl',
    });
  }

  // Yellow: no falls data with low mobility
  const mobilityDomain = domains.find(d => d.domain === 'mobility');
  if (mobilityDomain && mobilityDomain.btlScore >= 1 && input.fallsLastYear === 'none' && !input.tugScore) {
    gaps.push({
      type: 'yellow',
      message: 'ניידות מוגבלת ללא נתוני נפילות/TUG — עשוי להשפיע על ניקוד',
      domain: 'mobility',
    });
  }

  // Green: sufficient data
  if (gaps.filter(g => g.type === 'red').length === 0 && input.barthelMode === 'subitems') {
    gaps.push({
      type: 'green',
      message: 'נתונים מספיקים להערכה אמינה',
    });
  }

  return gaps;
}

// --- Overall Confidence ---
function getOverallConfidence(domains: DomainResult[], supervisionConf: ConfidenceLevel): ConfidenceLevel {
  const allLevels = [...domains.map(d => d.confidence), supervisionConf];
  if (allLevels.includes('research_required')) return 'research_required';
  if (allLevels.includes('low')) return 'low';
  if (allLevels.includes('medium')) return 'medium';
  return 'high';
}

// --- Utility ---
function lowerConfidence(c: ConfidenceLevel): ConfidenceLevel {
  if (c === 'high') return 'medium';
  if (c === 'medium') return 'low';
  return c;
}

// ======================================================================
// MAIN EXPORT: Calculate full translation
// ======================================================================
export function calculateTranslation(input: AssessmentInput): TranslationResult {
  const domains: DomainResult[] = [
    scoreMobility(input),
    scoreDressing(input),
    scoreBathing(input),
    scoreEating(input),
    scoreHygiene(input),
  ];

  const supervision = scoreSupervision(input);
  const totalAdlPoints = Number(domains.reduce((sum, d) => sum + d.btlScore, 0).toFixed(1));
  const totalPoints = Number((totalAdlPoints + supervision.points).toFixed(1));

  const eligibility = ELIGIBILITY_LEVELS.find(
    e => totalPoints >= e.minPoints && totalPoints <= e.maxPoints
  ) ?? ELIGIBILITY_LEVELS[0];

  const gaps = analyzeGaps(input, domains);
  const overallConfidence = getOverallConfidence(domains, supervision.confidence);

  return {
    domains,
    supervisionPoints: supervision.points,
    supervisionLabel: supervision.label,
    supervisionConfidence: supervision.confidence,
    totalAdlPoints,
    totalPoints,
    eligibilityLevel: eligibility.level,
    eligibilityLabel: eligibility.label,
    hoursPerWeek: eligibility.hoursPerWeek,
    overallConfidence,
    gaps,
  };
}

// --- Cognitive translation helper ---
export function translateCognition(
  tool: 'mmse' | 'moca',
  score: number
): { equivalentRange: string; label: string; confidence: ConfidenceLevel } | null {
  const row = MMSE_MOCA_TABLE.find(r => {
    const range = tool === 'mmse' ? r.mmseRange : r.mocaRange;
    return score >= range[0] && score <= range[1];
  });

  if (!row) return null;

  const targetRange = tool === 'mmse' ? row.mocaRange : row.mmseRange;
  const targetName = tool === 'mmse' ? 'MoCA' : 'MMSE';

  return {
    equivalentRange: `${targetName} ${targetRange[0]}–${targetRange[1]}`,
    label: row.label,
    confidence: row.confidence,
  };
}
