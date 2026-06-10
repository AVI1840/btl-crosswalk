import { useState, useEffect } from "react";

interface FeedbackModalProps { open: boolean; onClose: () => void; }

const STORAGE_KEY = "btl-crosswalk-bridge-feedback";
const APP_NAME = "גשר קופה↔בט\"ל";
const SHEET_URL = "https://script.google.com/macros/s/AKfycbwD8CMFoP5XoOwRLwK_OxMMOFKF8fS2CRpbJkNdOHjbnJIepkOLzlGrg3GQNGRqbwB6bA/exec";
const NAME_KEY = "btl-crosswalk-bridge-feedback-user-name";

type Category = "🐛 באג" | "💡 שיפור" | "📊 נתונים" | "🎨 עיצוב";
type Severity = "קריטי" | "שיפור" | "קטן";

interface FeedbackEntry {
  id: number; name: string; category: Category | ""; severity: Severity | "";
  text: string; timestamp: string; sent: boolean;
}

async function sendToSheet(entry: FeedbackEntry, page: string): Promise<boolean> {
  try {
    await fetch(SHEET_URL, {
      method: "POST", mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        app: APP_NAME, name: entry.name || "אנונימי",
        category: entry.category || "כללי", severity: entry.severity || "—",
        text: entry.text, page,
      }),
    });
    return true;
  } catch { return false; }
}

const sevColor = (s: Severity | "") =>
  s === "קריטי" ? "border-red-500 bg-red-50 text-red-700" :
  s === "שיפור" ? "border-orange-400 bg-orange-50 text-orange-700" :
  s === "קטן" ? "border-green-500 bg-green-50 text-green-700" : "";

export function FeedbackModal({ open, onClose }: FeedbackModalProps) {
  const [name, setName] = useState(() => localStorage.getItem(NAME_KEY) || "");
  const [category, setCategory] = useState<Category | "">("");
  const [severity, setSeverity] = useState<Severity | "">("");
  const [text, setText] = useState("");
  const [items, setItems] = useState<FeedbackEntry[]>([]);
  const [sending, setSending] = useState(false);
  const [lastStatus, setLastStatus] = useState<"" | "ok" | "offline">("");

  useEffect(() => { const s = localStorage.getItem(STORAGE_KEY); if (s) setItems(JSON.parse(s)); }, [open]);

  useEffect(() => {
    if (!open) return;
    const unsent = items.filter((i) => !i.sent);
    if (!unsent.length) return;
    Promise.all(unsent.map((i) => sendToSheet(i, window.location.pathname))).then((r) => {
      save(items.map((item) => {
        const idx = unsent.findIndex((u) => u.id === item.id);
        return idx >= 0 && r[idx] ? { ...item, sent: true } : item;
      }));
    });
  }, [open]);

  const save = (u: FeedbackEntry[]) => { setItems(u); localStorage.setItem(STORAGE_KEY, JSON.stringify(u)); };

  const handleSubmit = async () => {
    if (!text.trim() || !name.trim()) return;
    localStorage.setItem(NAME_KEY, name.trim());
    setSending(true); setLastStatus("");
    const entry: FeedbackEntry = {
      id: Date.now(), name: name.trim(), category, severity,
      text: text.trim(), timestamp: new Date().toISOString(), sent: false,
    };
    const ok = await sendToSheet(entry, window.location.pathname);
    entry.sent = ok;
    save([entry, ...items]);
    setCategory(""); setSeverity(""); setText("");
    setSending(false); setLastStatus(ok ? "ok" : "offline");
    setTimeout(() => setLastStatus(""), 3000);
  };

  const handleExport = () => {
    if (!items.length) return;
    const lines = items.map((fb) =>
      `[${new Date(fb.timestamp).toLocaleString("he-IL")}] [${fb.name}] [${fb.category || "—"}] [${fb.severity || "—"}] ${fb.text}`
    );
    navigator.clipboard.writeText(`משובי פיילוט — ${APP_NAME}\n${"=".repeat(50)}\n\n${lines.join("\n\n")}`);
  };

  const handleClear = () => { save([]); };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto p-6"
        dir="rtl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">💬 משוב פיילוט</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-2 text-right">שם</p>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="השם שלך"
              className="w-full p-2 border border-gray-300 rounded-lg text-right text-sm" dir="rtl" />
          </div>
          <div>
            <p className="text-sm font-medium mb-2 text-right">קטגוריה</p>
            <div className="flex gap-2 flex-wrap justify-end">
              {(["🐛 באג", "💡 שיפור", "📊 נתונים", "🎨 עיצוב"] as Category[]).map((c) => (
                <button key={c} onClick={() => setCategory(category === c ? "" : c)}
                  className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${category === c ? "border-[#1B3A5C] bg-[#1B3A5C] text-white" : "border-gray-300 bg-white text-gray-700 hover:border-[#1B3A5C]"}`}>{c}</button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium mb-2 text-right">חומרה</p>
            <div className="flex gap-2 flex-wrap justify-end">
              {(["קריטי", "שיפור", "קטן"] as Severity[]).map((s) => (
                <button key={s} onClick={() => setSeverity(severity === s ? "" : s)}
                  className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${severity === s ? `${sevColor(s)} border-2` : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"}`}>{s}</button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium mb-2 text-right">תיאור</p>
            <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="תאר את המשוב..."
              className="w-full min-h-[80px] p-2 border border-gray-300 rounded-lg text-right text-sm" dir="rtl" />
          </div>
          <div className="relative">
            <button onClick={handleSubmit} disabled={!text.trim() || !name.trim() || sending}
              className="w-full py-2.5 rounded-lg text-white text-sm font-medium disabled:opacity-50"
              style={{ backgroundColor: "#1B3A5C" }}>
              {sending ? "שולח..." : "שלח משוב"}
            </button>
            {lastStatus === "ok" && <p className="text-xs text-green-600 text-center mt-1">✅ נשלח בהצלחה</p>}
            {lastStatus === "offline" && <p className="text-xs text-orange-500 text-center mt-1">📱 נשמר מקומית — יישלח כשיהיה חיבור</p>}
          </div>
          {items.length > 0 && (
            <div className="border-t pt-3 space-y-2">
              <div className="flex items-center justify-between">
                <button onClick={handleClear} className="text-xs text-red-500 hover:underline">מחק הכל</button>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">{items.length} משובים</span>
                  <button onClick={handleExport} className="text-xs px-2 py-1 rounded border border-gray-300 hover:bg-gray-50">📋 ייצוא</button>
                </div>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {items.map((fb) => (
                  <div key={fb.id} className="bg-gray-50 rounded-lg p-3 text-right border border-gray-200">
                    <div className="flex items-center gap-2 mb-1 flex-wrap justify-end">
                      {fb.category && <span className="text-xs px-2 py-0.5 rounded-full bg-[#1B3A5C]/10 text-[#1B3A5C] font-medium">{fb.category}</span>}
                      {fb.severity && <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${sevColor(fb.severity as Severity)}`}>{fb.severity}</span>}
                      {!fb.sent && <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-600">⏳</span>}
                      {fb.sent && <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-600">✅</span>}
                      <span className="text-xs text-gray-400">{fb.name} · {new Date(fb.timestamp).toLocaleString("he-IL")}</span>
                    </div>
                    <p className="text-sm text-gray-800">{fb.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
