# מערכת גשר קופה↔בט"ל — תרגום מדדי תפקוד

## HMO ↔ BTL Bridge — Functional Assessment Translation System

---

## תיאור

מערכת קלינית (עברית RTL) המתרגמת הערכות תפקוד של קופות החולים (Barthel, MoCA, MMSE, Lawton, GDS/PHQ-2) לניקוד זכאות סיעודית של ביטוח לאומי — ומראה לראשונה מה בט"ל יראה מנתוני הקופה.

---

## הפעלה מקומית

```bash
# שלב 1: התקנת חבילות
npm install

# שלב 2: הפעלת שרת פיתוח
npm run dev

# שלב 3: פתח בדפדפן
# http://localhost:5173/btl-crosswalk/
```

---

## דפלוי ל-GitHub Pages

### אפשרות א': GitHub Actions (אוטומטי)

1. צור ריפו חדש ב-GitHub (למשל `btl-crosswalk`)
2. דחוף את הקוד ל-`main`:
   ```bash
   git init
   git add .
   git commit -m "initial commit"
   git remote add origin https://github.com/YOUR-USERNAME/btl-crosswalk.git
   git push -u origin main
   ```
3. בהגדרות הריפו → Pages → Source → בחר "GitHub Actions"
4. הדפלוי יתבצע אוטומטית בכל push ל-main

### אפשרות ב': gh-pages (ידני)

```bash
# בנייה ודפלוי ידני
npm run deploy
```

### לאחר דפלוי

עדכן את שדה `homepage` ב-`package.json` לכתובת שלך:
```json
"homepage": "https://YOUR-USERNAME.github.io/btl-crosswalk"
```

ובדוק שה-`base` ב-`vite.config.ts` תואם:
```ts
base: '/btl-crosswalk/'
```

---

## שימוש

| טאב | תפקיד |
|------|--------|
| 📋 הערכת מצב | הזנת נתוני הערכה תפקודית מהקופה |
| 🏛️ תרגום לשפת בט"ל | תרגום אוטומטי + רמות אמינות + פערים |
| 📄 דוח מסכם | מסמך להדפסה / העתקה לתיק מטופל |

### קיצורי מקלדת

| קיצור | פעולה |
|--------|--------|
| `Ctrl+Shift+V` | פאנל ולידציה פנימי (4 מקרי בדיקה) |

### מצב הצגה

לחצן "מצב הצגה" בכותרת — מגדיל גופנים, מדגיש שדות תרגום, ומציג באנר עם סיכום הזכאות.

---

## מבנה טכני

```
src/
├── data/
│   ├── constants.ts    ← טבלאות ניקוד, הגדרות קופות
│   └── types.ts        ← TypeScript types + initial state
├── utils/
│   └── scoringEngine.ts ← מנוע תרגום BTL (pure functions)
├── components/
│   ├── Tab1Assessment.tsx  ← טופס הזנה
│   ├── Tab2Translation.tsx ← תצוגת תרגום 3 עמודות
│   ├── Tab3Report.tsx      ← דוח מסכם להדפסה
│   ├── ConfidenceBadge.tsx ← תגיות אמינות
│   ├── ValidationPanel.tsx ← פאנל בדיקות (Ctrl+Shift+V)
│   └── FeedbackModal.tsx   ← משוב פיילוט
└── App.tsx
```

---

## הצהרה קלינית

⚠️ **מסמך זה מבוסס על מתודולוגיית Crosswalk לאומי גרסה 1.0. אינו מחליף הערכת בט"ל רשמית. כל פלט מסומן ברמת ביטחון ודורש השגחה אנושית.**

---

## ייחוס

- **פורום בר"ק** — Forum Bar"K
- **צוות תפקוד** — Tzevet Tafkud
- **יוני 2026**

מבוסס על: חוזר 1539 (בט"ל), מתודולוגיית Crosswalk לאומי, מיפוי מדדי תפקוד פורום ברק.
