// ======================================================================
// BTL Crosswalk - Data Constants
// Based on: חוזר 1539, Crosswalk methodology document, Forum Bar"K mapping
// ======================================================================

export type ConfidenceLevel = 'high' | 'medium' | 'low' | 'research_required';
export type PopulationMatch = 'israeli_validated' | 'international_only' | 'expert_consensus' | 'none';

export interface Confidence {
  level: ConfidenceLevel;
  evidence: string;
  population_match: PopulationMatch;
  human_review_recommended: boolean;
}

// --- HMO Tool Presets ---
export type HMO = 'clalit' | 'maccabi' | 'meuhedet' | 'other';

export const HMO_OPTIONS: { value: HMO; label: string }[] = [
  { value: 'clalit', label: 'כללית' },
  { value: 'maccabi', label: 'מכבי' },
  { value: 'meuhedet', label: 'מאוחדת' },
  { value: 'other', label: 'אחר' },
];

export const HMO_TOOLS: Record<HMO, string[]> = {
  clalit: ['mmse', 'moca', 'iadl', 'phq2', 'gds'],
  maccabi: ['barthel', 'fim', 'mmse', 'moca', 'lawton', 'tug', 'berg', 'sweet16'],
  meuhedet: ['barthel', 'fim', 'mmse', 'moca', 'lawton', 'minicog', 'mefi'],
  other: ['barthel', 'mmse', 'moca', 'lawton', 'gds'],
};

export const ASSESSOR_OPTIONS = [
  { value: 'nurse', label: 'אחות' },
  { value: 'physio', label: 'פיזיותרפיסט' },
  { value: 'geriatrician', label: 'גריאטר' },
  { value: 'social_worker', label: 'עו"ס' },
  { value: 'other', label: 'אחר' },
];

export const CONTEXT_OPTIONS = [
  { value: 'community', label: 'קהילה' },
  { value: 'discharge', label: 'שחרור מאשפוז' },
  { value: 'clinic', label: 'מרפאה' },
  { value: 'home_visit', label: 'ביקור בית' },
];

// --- Barthel Sub-Items ---
export interface BarthelSubItem {
  id: string;
  label: string;
  maxScore: number;
  options: { value: number; label: string }[];
}

export const BARTHEL_ITEMS: BarthelSubItem[] = [
  {
    id: 'feeding', label: 'אכילה', maxScore: 10,
    options: [
      { value: 10, label: 'עצמאי' },
      { value: 5, label: 'זקוק לעזרה (חיתוך וכו\')' },
      { value: 0, label: 'תלוי' },
    ]
  },
  {
    id: 'bathing', label: 'רחצה', maxScore: 5,
    options: [
      { value: 5, label: 'עצמאי' },
      { value: 0, label: 'תלוי' },
    ]
  },
  {
    id: 'grooming', label: 'טיפוח', maxScore: 5,
    options: [
      { value: 5, label: 'עצמאי' },
      { value: 0, label: 'תלוי' },
    ]
  },
  {
    id: 'dressing', label: 'הלבשה', maxScore: 10,
    options: [
      { value: 10, label: 'עצמאי' },
      { value: 5, label: 'זקוק לעזרה עם חצי' },
      { value: 0, label: 'תלוי' },
    ]
  },
  {
    id: 'bowels', label: 'שליטה על מעיים', maxScore: 10,
    options: [
      { value: 10, label: 'שליטה מלאה' },
      { value: 5, label: 'אי-שליטה חלקית' },
      { value: 0, label: 'אי-שליטה מלאה' },
    ]
  },
  {
    id: 'bladder', label: 'שליטה על שלפוחית', maxScore: 10,
    options: [
      { value: 10, label: 'שליטה מלאה' },
      { value: 5, label: 'אי-שליטה חלקית' },
      { value: 0, label: 'אי-שליטה מלאה' },
    ]
  },
  {
    id: 'toilet_use', label: 'שימוש בשירותים', maxScore: 10,
    options: [
      { value: 10, label: 'עצמאי' },
      { value: 5, label: 'זקוק לעזרה חלקית' },
      { value: 0, label: 'תלוי' },
    ]
  },
  {
    id: 'transfers', label: 'העברות (מיטה↔כיסא)', maxScore: 15,
    options: [
      { value: 15, label: 'עצמאי' },
      { value: 10, label: 'עזרה מינימלית' },
      { value: 5, label: 'יושב אך זקוק לעזרה רבה' },
      { value: 0, label: 'לא מסוגל' },
    ]
  },
  {
    id: 'mobility', label: 'ניידות', maxScore: 15,
    options: [
      { value: 15, label: 'עצמאי (יכול להשתמש בעזר)' },
      { value: 10, label: 'הולך עם עזרה של אדם' },
      { value: 5, label: 'עצמאי בכיסא גלגלים' },
      { value: 0, label: 'משותק / לא נייד' },
    ]
  },
  {
    id: 'stairs', label: 'מדרגות', maxScore: 10,
    options: [
      { value: 10, label: 'עצמאי' },
      { value: 5, label: 'זקוק לעזרה' },
      { value: 0, label: 'לא מסוגל' },
    ]
  },
];

// --- Lawton Sub-Items ---
export interface LawtonSubItem {
  id: string;
  label: string;
  options: { value: number; label: string }[];
}

export const LAWTON_ITEMS: LawtonSubItem[] = [
  { id: 'phone', label: 'שימוש בטלפון', options: [{ value: 1, label: 'עצמאי' }, { value: 0, label: 'לא מסוגל' }] },
  { id: 'shopping', label: 'קניות', options: [{ value: 1, label: 'עצמאי' }, { value: 0, label: 'לא מסוגל' }] },
  { id: 'cooking', label: 'הכנת אוכל', options: [{ value: 1, label: 'עצמאי' }, { value: 0, label: 'לא מסוגל' }] },
  { id: 'housekeeping', label: 'ניקיון הבית', options: [{ value: 1, label: 'עצמאי' }, { value: 0, label: 'לא מסוגל' }] },
  { id: 'laundry', label: 'כביסה', options: [{ value: 1, label: 'עצמאי' }, { value: 0, label: 'לא מסוגל' }] },
  { id: 'transport', label: 'תחבורה', options: [{ value: 1, label: 'עצמאי' }, { value: 0, label: 'לא מסוגל' }] },
  { id: 'medications', label: 'ניהול תרופות', options: [{ value: 1, label: 'עצמאי' }, { value: 0, label: 'לא מסוגל' }] },
  { id: 'finances', label: 'ניהול כספים', options: [{ value: 1, label: 'עצמאי' }, { value: 0, label: 'לא מסוגל' }] },
];

// --- BTL ADL Translation Tables (per חוזר 1539) ---
export interface BtlTranslationRule {
  barthelRange: [number, number];
  btlScore: number;
  label: string;
  confidence: ConfidenceLevel;
  note?: string;
}

export const BARTHEL_TO_BTL_MOBILITY: BtlTranslationRule[] = [
  { barthelRange: [15, 15], btlScore: 0, label: 'עצמאי', confidence: 'high' },
  { barthelRange: [10, 10], btlScore: 1, label: 'עזרה חלקית', confidence: 'high' },
  { barthelRange: [5, 5], btlScore: 0.5, label: 'כיסא גלגלים עצמאי', confidence: 'medium', note: 'תלוי בסיכון נפילות' },
  { barthelRange: [0, 0], btlScore: 2, label: 'תלוי מלא', confidence: 'high' },
];

export const BARTHEL_TO_BTL_DRESSING: BtlTranslationRule[] = [
  { barthelRange: [10, 10], btlScore: 0, label: 'עצמאי', confidence: 'high' },
  { barthelRange: [5, 5], btlScore: 1, label: 'זקוק לעזרה חלקית', confidence: 'high' },
  { barthelRange: [0, 0], btlScore: 1.5, label: 'תלוי מלא', confidence: 'high' },
];

export const BARTHEL_TO_BTL_BATHING: BtlTranslationRule[] = [
  { barthelRange: [5, 5], btlScore: 0, label: 'עצמאי', confidence: 'high' },
  { barthelRange: [0, 0], btlScore: 1.5, label: 'תלוי', confidence: 'medium', note: 'לא ניתן להבחין חלקי/מלא מ-Barthel' },
];

export const BARTHEL_TO_BTL_EATING: BtlTranslationRule[] = [
  { barthelRange: [10, 10], btlScore: 0, label: 'עצמאי', confidence: 'high' },
  { barthelRange: [5, 5], btlScore: 0.5, label: 'זקוק לעזרה בחיתוך', confidence: 'high' },
  { barthelRange: [0, 0], btlScore: 2, label: 'תלוי מלא', confidence: 'high' },
];

// Hygiene combines bowel + bladder + toilet_use
export interface BtlHygieneRule {
  condition: string;
  btlScore: number;
  label: string;
  confidence: ConfidenceLevel;
}

export const BTL_HYGIENE_RULES: BtlHygieneRule[] = [
  { condition: 'all_continent_independent', btlScore: 0, label: 'עצמאי — שליטה מלאה', confidence: 'high' },
  { condition: 'partial_incontinence', btlScore: 1, label: 'אי-שליטה חלקית', confidence: 'medium' },
  { condition: 'full_incontinence_mobile', btlScore: 1.5, label: 'אי-שליטה — נייד', confidence: 'medium' },
  { condition: 'full_incontinence_immobile', btlScore: 2, label: 'אי-שליטה — לא נייד', confidence: 'high' },
];

// --- Supervision Module ---
export interface SupervisionLevel {
  code: number;
  points: number;
  label: string;
  trigger: string;
  description: string;
}

export const SUPERVISION_LEVELS: SupervisionLevel[] = [
  { code: 0, points: 0, label: 'אין זכאות להשגחה', trigger: 'no_cognitive_diagnosis', description: 'ללא אבחנה קוגניטיבית / פסיכיאטרית' },
  { code: 4, points: 4, label: 'השגחה חלקית', trigger: 'mild_moderate_dementia_or_psychiatric', description: 'דמנציה קלה-בינונית עם BPSD, או מצב פסיכיאטרי דורש השגחה' },
  { code: 9, points: 9, label: 'השגחה מתמדת', trigger: 'severe_dementia_safety_risk', description: 'דמנציה חמורה, סיכון בטיחותי, שוטטות' },
  { code: 10, points: 10, label: 'השגחה מתמדת מורכבת', trigger: 'severe_dementia_plus_full_ADL_dependence', description: 'דמנציה חמורה + תלות ADL מלאה (רמה 4)' },
];

// --- Eligibility Levels ---
export interface EligibilityLevel {
  minPoints: number;
  maxPoints: number;
  level: number;
  hoursPerWeek: number | null;
  label: string;
}

export const ELIGIBILITY_LEVELS: EligibilityLevel[] = [
  { minPoints: 0, maxPoints: 1.49, level: 0, hoursPerWeek: 0, label: 'אינו זכאי' },
  { minPoints: 1.5, maxPoints: 2.49, level: 1, hoursPerWeek: 5, label: 'רמה א\'' },
  { minPoints: 2.5, maxPoints: 3.49, level: 2, hoursPerWeek: 10, label: 'רמה ב\'' },
  { minPoints: 3.5, maxPoints: 4.49, level: 3, hoursPerWeek: 16, label: 'רמה ג\'' },
  { minPoints: 4.5, maxPoints: 5.49, level: 4, hoursPerWeek: 22, label: 'רמה ד\'' },
  { minPoints: 5.5, maxPoints: 6.99, level: 5, hoursPerWeek: 30, label: 'רמה ה\'' },
  { minPoints: 7.0, maxPoints: 99, level: 6, hoursPerWeek: null, label: 'סיעוד מלא' },
];

// --- MMSE ↔ MoCA Translation ---
export interface CognitiveTranslation {
  mmseRange: [number, number];
  mocaRange: [number, number];
  label: string;
  confidence: ConfidenceLevel;
}

export const MMSE_MOCA_TABLE: CognitiveTranslation[] = [
  { mmseRange: [28, 30], mocaRange: [26, 30], label: 'תקין', confidence: 'high' },
  { mmseRange: [26, 27], mocaRange: [23, 25], label: 'MCI אפשרי', confidence: 'high' },
  { mmseRange: [22, 25], mocaRange: [18, 22], label: 'MCI / דמנציה קלה', confidence: 'high' },
  { mmseRange: [17, 21], mocaRange: [13, 17], label: 'דמנציה בינונית', confidence: 'medium' },
  { mmseRange: [11, 16], mocaRange: [8, 12], label: 'דמנציה בינונית-קשה', confidence: 'low' },
  { mmseRange: [0, 10], mocaRange: [0, 7], label: 'דמנציה קשה', confidence: 'low' },
];
