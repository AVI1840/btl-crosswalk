import { useState } from 'react';
import type { AssessmentInput } from '../data/types';
import {
  HMO_OPTIONS,
  HMO_TOOLS,
  ASSESSOR_OPTIONS,
  CONTEXT_OPTIONS,
  BARTHEL_ITEMS,
  LAWTON_ITEMS,
  type HMO,
} from '../data/constants';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  data: AssessmentInput;
  onChange: (data: AssessmentInput) => void;
  onNavigateToResults?: () => void;
}

function Section({ title, open, onToggle, children, show = true }: {
  title: string; open: boolean; onToggle: () => void; children: React.ReactNode; show?: boolean;
}) {
  if (!show) return null;
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden mb-3">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-right"
      >
        <span className="font-medium text-sm text-gray-800">{title}</span>
        {open ? <ChevronUp className="h-4 w-4 text-gray-500" /> : <ChevronDown className="h-4 w-4 text-gray-500" />}
      </button>
      {open && <div className="px-4 py-4 space-y-4">{children}</div>}
    </div>
  );
}

export function Tab1Assessment({ data, onChange, onNavigateToResults }: Props) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    adl: true, cognition: true, iadl: false, emotional: false, falls: false, supervision: true,
  });

  const toggle = (key: string) => setOpenSections(s => ({ ...s, [key]: !s[key] }));
  const set = (partial: Partial<AssessmentInput>) => onChange({ ...data, ...partial });

  const hmoTools = HMO_TOOLS[data.hmo];
  const hasBarth = hmoTools.includes('barthel');
  const hasMmse = hmoTools.includes('mmse');
  const hasMoca = hmoTools.includes('moca');
  const hasLawton = hmoTools.includes('lawton');
  const hasGds = hmoTools.includes('gds');
  const hasPhq = hmoTools.includes('phq2');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Left panel - Patient context */}
      <div className="lg:col-span-1 space-y-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-4">
          <h3 className="font-semibold text-sm text-primary">פרטי הערכה</h3>

          <div>
            <label className="block text-xs text-gray-600 mb-1">קופת חולים</label>
            <select
              value={data.hmo}
              onChange={e => set({ hmo: e.target.value as HMO })}
              className="w-full p-2 border border-gray-300 rounded-lg text-sm"
            >
              {HMO_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">תאריך הערכה</label>
            <input
              type="date"
              value={data.assessmentDate}
              onChange={e => set({ assessmentDate: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">סוג מעריך</label>
            <select
              value={data.assessorType}
              onChange={e => set({ assessorType: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg text-sm"
            >
              {ASSESSOR_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">הקשר הערכה</label>
            <select
              value={data.assessmentContext}
              onChange={e => set({ assessmentContext: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg text-sm"
            >
              {CONTEXT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">מזהה מטופל (אופציונלי)</label>
            <input
              type="text"
              value={data.patientId}
              onChange={e => set({ patientId: e.target.value })}
              placeholder="שם / מספר"
              className="w-full p-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
        </div>
      </div>

      {/* Center - Tool inputs */}
      <div className="lg:col-span-3 space-y-3">
        {/* ADL Section */}
        <Section title="📋 ADL — מדדי תפקוד יומיומי (Barthel)" open={openSections.adl} onToggle={() => toggle('adl')} show={hasBarth}>
          <div className="flex items-center gap-4 mb-4">
            <label className="text-sm font-medium">מצב הזנה:</label>
            <button
              onClick={() => set({ barthelMode: 'total' })}
              className={`px-3 py-1.5 rounded-lg text-sm ${data.barthelMode === 'total' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'}`}
            >ציון כולל</button>
            <button
              onClick={() => set({ barthelMode: 'subitems' })}
              className={`px-3 py-1.5 rounded-lg text-sm ${data.barthelMode === 'subitems' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'}`}
            >פירוט סעיפים</button>
          </div>

          {data.barthelMode === 'total' ? (
            <div>
              <label className="block text-sm mb-2">ציון Barthel כולל (0–100)</label>
              <div className="flex items-center gap-4">
                <input
                  type="range" min={0} max={100} step={5}
                  value={data.barthelTotal}
                  onChange={e => set({ barthelTotal: Number(e.target.value) })}
                  className="flex-1"
                />
                <span className="text-xl font-semibold min-w-[3rem] text-center">{data.barthelTotal}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">⚠️ פירוט סעיפים ישפר את דיוק התרגום ל-בט"ל</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {BARTHEL_ITEMS.map(item => (
                <div key={item.id} className="border border-gray-100 rounded-lg p-3">
                  <label className="block text-sm font-medium mb-1">{item.label}</label>
                  <select
                    value={data.barthelSubItems[item.id] ?? item.options[0].value}
                    onChange={e => set({
                      barthelSubItems: { ...data.barthelSubItems, [item.id]: Number(e.target.value) }
                    })}
                    className="w-full p-1.5 border border-gray-200 rounded text-sm"
                  >
                    {item.options.map(o => (
                      <option key={o.value} value={o.value}>{o.label} ({o.value})</option>
                    ))}
                  </select>
                </div>
              ))}
              <div className="col-span-full bg-blue-50 rounded-lg p-3 text-center">
                <span className="text-sm font-medium">סה"כ Barthel: </span>
                <span className="text-lg font-bold text-primary">
                  {Object.values(data.barthelSubItems).reduce((a, b) => a + b, 0)}
                </span>
                <span className="text-sm text-gray-500"> / 100</span>
              </div>
            </div>
          )}
        </Section>

        {/* Cognition Section */}
        <Section title="🧠 קוגניציה (MMSE / MoCA)" open={openSections.cognition} onToggle={() => toggle('cognition')} show={hasMmse || hasMoca}>
          <div className="flex items-center gap-4 mb-4">
            <label className="text-sm font-medium">כלי מדידה:</label>
            {hasMmse && (
              <button
                onClick={() => set({ cognitionTool: 'mmse' })}
                className={`px-3 py-1.5 rounded-lg text-sm ${data.cognitionTool === 'mmse' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'}`}
              >MMSE</button>
            )}
            {hasMoca && (
              <button
                onClick={() => set({ cognitionTool: 'moca' })}
                className={`px-3 py-1.5 rounded-lg text-sm ${data.cognitionTool === 'moca' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'}`}
              >MoCA</button>
            )}
          </div>

          {data.cognitionTool === 'mmse' ? (
            <div>
              <label className="block text-sm mb-2">ציון MMSE (0–30)</label>
              <div className="flex items-center gap-4">
                <input
                  type="range" min={0} max={30} step={1}
                  value={data.mmseScore ?? 30}
                  onChange={e => set({ mmseScore: Number(e.target.value) })}
                  className="flex-1"
                />
                <span className="text-xl font-semibold min-w-[3rem] text-center">{data.mmseScore ?? '—'}</span>
              </div>
              <button
                onClick={() => set({ mmseScore: null })}
                className="text-xs text-gray-500 hover:text-red-500 mt-1"
              >נקה ציון</button>
            </div>
          ) : (
            <div>
              <label className="block text-sm mb-2">ציון MoCA (0–30)</label>
              <div className="flex items-center gap-4">
                <input
                  type="range" min={0} max={30} step={1}
                  value={data.mocaScore ?? 30}
                  onChange={e => set({ mocaScore: Number(e.target.value) })}
                  className="flex-1"
                />
                <span className="text-xl font-semibold min-w-[3rem] text-center">{data.mocaScore ?? '—'}</span>
              </div>
              <p className="text-xs text-amber-600 mt-1">⚠️ הטיית Fasnacht: MoCA נוטה להיות נמוך מ-MMSE באותה רמה קוגניטיבית</p>
              <button
                onClick={() => set({ mocaScore: null })}
                className="text-xs text-gray-500 hover:text-red-500 mt-1"
              >נקה ציון</button>
            </div>
          )}
        </Section>

        {/* IADL Section */}
        <Section title="🏠 IADL — תפקוד מכשירני (Lawton)" open={openSections.iadl} onToggle={() => toggle('iadl')} show={hasLawton}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {LAWTON_ITEMS.map(item => (
              <div key={item.id} className="border border-gray-100 rounded-lg p-2">
                <label className="block text-xs font-medium mb-1">{item.label}</label>
                <select
                  value={data.lawtonSubItems[item.id] ?? 1}
                  onChange={e => {
                    const newItems = { ...data.lawtonSubItems, [item.id]: Number(e.target.value) };
                    const total = Object.values(newItems).reduce((a, b) => a + b, 0);
                    set({ lawtonSubItems: newItems, lawtonTotal: total });
                  }}
                  className="w-full p-1 border border-gray-200 rounded text-xs"
                >
                  {item.options.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          <div className="bg-blue-50 rounded-lg p-2 text-center mt-2">
            <span className="text-sm">סה"כ Lawton: </span>
            <span className="text-lg font-bold text-primary">
              {data.lawtonTotal ?? Object.values(data.lawtonSubItems).reduce((a, b) => a + b, 0)}
            </span>
            <span className="text-sm text-gray-500"> / 8</span>
          </div>
        </Section>

        {/* Emotional Section */}
        <Section title="💭 מצב רגשי (GDS / PHQ)" open={openSections.emotional} onToggle={() => toggle('emotional')} show={hasGds || hasPhq}>
          <div className="flex items-center gap-4 mb-4">
            {hasGds && (
              <button
                onClick={() => set({ emotionalTool: 'gds' })}
                className={`px-3 py-1.5 rounded-lg text-sm ${data.emotionalTool === 'gds' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'}`}
              >GDS-15</button>
            )}
            {hasPhq && (
              <button
                onClick={() => set({ emotionalTool: 'phq2' })}
                className={`px-3 py-1.5 rounded-lg text-sm ${data.emotionalTool === 'phq2' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'}`}
              >PHQ-2</button>
            )}
          </div>

          {data.emotionalTool === 'gds' ? (
            <div>
              <label className="block text-sm mb-2">ציון GDS-15 (0–15)</label>
              <div className="flex items-center gap-4">
                <input type="range" min={0} max={15} step={1}
                  value={data.gdsScore ?? 0}
                  onChange={e => set({ gdsScore: Number(e.target.value) })}
                  className="flex-1"
                />
                <span className="text-xl font-semibold min-w-[3rem] text-center">{data.gdsScore ?? '—'}</span>
              </div>
              <p className="text-xs text-green-700 mt-1">✓ GDS מומלץ לאוכלוסייה מעל גיל 65</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-sm mb-2">ציון PHQ-2 (0–6)</label>
                <div className="flex items-center gap-4">
                  <input type="range" min={0} max={6} step={1}
                    value={data.phq2Score ?? 0}
                    onChange={e => set({ phq2Score: Number(e.target.value) })}
                    className="flex-1"
                  />
                  <span className="text-xl font-semibold min-w-[3rem] text-center">{data.phq2Score ?? '—'}</span>
                </div>
                <p className="text-xs text-amber-600 mt-1">⚠️ הערה קלינית: GDS מדויק יותר לאוכלוסייה מעל גיל 65</p>
              </div>
              {(data.phq2Score ?? 0) >= 3 && (
                <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                  <label className="block text-sm mb-2">PHQ-2 ≥ 3 — הרחבה ל-PHQ-9 (0–27)</label>
                  <div className="flex items-center gap-4">
                    <input type="range" min={0} max={27} step={1}
                      value={data.phq9Score ?? 0}
                      onChange={e => set({ phq9Score: Number(e.target.value) })}
                      className="flex-1"
                    />
                    <span className="text-lg font-semibold min-w-[3rem] text-center">{data.phq9Score ?? '—'}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </Section>

        {/* Falls/Frailty */}
        <Section title="🦴 נפילות ושבריריות" open={openSections.falls} onToggle={() => toggle('falls')}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">נפילות בשנה האחרונה</label>
              <div className="flex gap-3">
                {([['none', 'ללא'], ['1', 'נפילה אחת'], ['2plus', '2+ נפילות']] as const).map(([val, lbl]) => (
                  <button
                    key={val}
                    onClick={() => set({ fallsLastYear: val })}
                    className={`px-3 py-1.5 rounded-lg text-sm ${data.fallsLastYear === val ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'}`}
                  >{lbl}</button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">TUG (שניות) — אופציונלי</label>
                <input type="number" min={0} max={60}
                  value={data.tugScore ?? ''}
                  onChange={e => set({ tugScore: e.target.value ? Number(e.target.value) : null })}
                  placeholder="—"
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Berg Balance (0–56) — אופציונלי</label>
                <input type="number" min={0} max={56}
                  value={data.bergScore ?? ''}
                  onChange={e => set({ bergScore: e.target.value ? Number(e.target.value) : null })}
                  placeholder="—"
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </div>
          </div>
        </Section>

        {/* Supervision */}
        <Section title="👁️ השגחה / מצב קוגניטיבי-קליני" open={openSections.supervision} onToggle={() => toggle('supervision')}>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium">אבחנת דמנציה:</label>
              <button
                onClick={() => set({ dementiaDiagnosis: true })}
                className={`px-3 py-1.5 rounded-lg text-sm ${data.dementiaDiagnosis ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700'}`}
              >כן</button>
              <button
                onClick={() => set({ dementiaDiagnosis: false, dementiaSeverity: null, bpsd: false, safetyRiskAlone: false })}
                className={`px-3 py-1.5 rounded-lg text-sm ${!data.dementiaDiagnosis ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'}`}
              >לא</button>
            </div>

            {data.dementiaDiagnosis && (
              <>
                <div>
                  <label className="block text-sm mb-2">חומרה</label>
                  <div className="flex gap-2 flex-wrap">
                    {([['mild', 'קלה'], ['moderate', 'בינונית'], ['severe', 'חמורה'], ['advanced', 'מתקדמת']] as const).map(([val, lbl]) => (
                      <button
                        key={val}
                        onClick={() => set({ dementiaSeverity: val })}
                        className={`px-3 py-1.5 rounded-lg text-sm ${data.dementiaSeverity === val ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'}`}
                      >{lbl}</button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={data.bpsd} onChange={e => set({ bpsd: e.target.checked })}
                      className="rounded" />
                    תסמיני התנהגות (BPSD)
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={data.safetyRiskAlone} onChange={e => set({ safetyRiskAlone: e.target.checked })}
                      className="rounded" />
                    סיכון בטיחותי לבד
                  </label>
                </div>

                <div>
                  <label className="block text-sm mb-2">התמצאות</label>
                  <div className="flex gap-2">
                    {([['intact', 'שמורה'], ['impaired', 'לקויה'], ['severely_impaired', 'פגועה קשות']] as const).map(([val, lbl]) => (
                      <button
                        key={val}
                        onClick={() => set({ orientation: val })}
                        className={`px-3 py-1.5 rounded-lg text-sm ${data.orientation === val ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'}`}
                      >{lbl}</button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </Section>

        {/* CTA Button — navigate to results */}
        {onNavigateToResults && (
          <button
            onClick={onNavigateToResults}
            className="w-full mt-6 py-4 rounded-xl text-white text-lg font-bold shadow-lg hover:opacity-90 transition-all hover:scale-[1.01] active:scale-[0.99]"
            style={{ backgroundColor: '#1F3864' }}
          >
            ראה תוצאת תרגום לבט"ל ←
          </button>
        )}
      </div>
    </div>
  );
}
