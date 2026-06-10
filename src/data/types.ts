import type { ConfidenceLevel, HMO } from './constants';

// --- Assessment Input State ---
export interface AssessmentInput {
  // Patient context
  hmo: HMO;
  assessmentDate: string;
  assessorType: string;
  assessmentContext: string;
  patientId: string;

  // ADL
  barthelMode: 'total' | 'subitems';
  barthelTotal: number;
  barthelSubItems: Record<string, number>;
  katzIndex: number | null;

  // Cognition
  cognitionTool: 'mmse' | 'moca';
  mmseScore: number | null;
  mocaScore: number | null;
  miniCogScore: number | null;
  sweet16Score: number | null;

  // IADL
  lawtonTotal: number | null;
  lawtonSubItems: Record<string, number>;

  // Emotional
  emotionalTool: 'gds' | 'phq2';
  gdsScore: number | null;
  phq2Score: number | null;
  phq9Score: number | null;

  // Falls/Frailty
  fallsLastYear: 'none' | '1' | '2plus';
  tugScore: number | null;
  bergScore: number | null;
  mefiLevel: 'low' | 'medium' | 'high' | null;

  // Supervision
  dementiaDiagnosis: boolean;
  dementiaSeverity: 'mild' | 'moderate' | 'severe' | 'advanced' | null;
  bpsd: boolean;
  safetyRiskAlone: boolean;
  orientation: 'intact' | 'impaired' | 'severely_impaired';
}

// --- BTL Translation Output ---
export interface DomainResult {
  domain: string;
  domainLabel: string;
  sourceValue: string;
  btlScore: number;
  maxScore: number;
  confidence: ConfidenceLevel;
  label: string;
  note?: string;
  humanReview: boolean;
}

export interface GapFlag {
  type: 'red' | 'yellow' | 'green';
  message: string;
  domain?: string;
}

export interface TranslationResult {
  domains: DomainResult[];
  supervisionPoints: number;
  supervisionLabel: string;
  supervisionConfidence: ConfidenceLevel;
  totalAdlPoints: number;
  totalPoints: number;
  eligibilityLevel: number;
  eligibilityLabel: string;
  hoursPerWeek: number | null;
  overallConfidence: ConfidenceLevel;
  gaps: GapFlag[];
}

// --- Initial State ---
export const INITIAL_ASSESSMENT: AssessmentInput = {
  hmo: 'clalit',
  assessmentDate: new Date().toISOString().split('T')[0],
  assessorType: 'nurse',
  assessmentContext: 'community',
  patientId: '',

  barthelMode: 'total',
  barthelTotal: 100,
  barthelSubItems: {
    feeding: 10, bathing: 5, grooming: 5, dressing: 10,
    bowels: 10, bladder: 10, toilet_use: 10, transfers: 15,
    mobility: 15, stairs: 10
  },
  katzIndex: null,

  cognitionTool: 'mmse',
  mmseScore: null,
  mocaScore: null,
  miniCogScore: null,
  sweet16Score: null,

  lawtonTotal: null,
  lawtonSubItems: {
    phone: 1, shopping: 1, cooking: 1, housekeeping: 1,
    laundry: 1, transport: 1, medications: 1, finances: 1
  },

  emotionalTool: 'gds',
  gdsScore: null,
  phq2Score: null,
  phq9Score: null,

  fallsLastYear: 'none',
  tugScore: null,
  bergScore: null,
  mefiLevel: null,

  dementiaDiagnosis: false,
  dementiaSeverity: null,
  bpsd: false,
  safetyRiskAlone: false,
  orientation: 'intact',
};
