import { useState, useEffect } from "react";

const ACCOUNTS = [
  { key: "bills",     label: "Bills",         emoji: "🏠", pct: 0.40,  type: "resets",    color: "#C9A84C" },
  { key: "mom",       label: "Mom",           emoji: "👩", pct: 0.067, type: "resets",    color: "#A0A0A0" },
  { key: "partner",   label: "Partner",       emoji: "💑", pct: 0.067, type: "resets",    color: "#A0A0A0" },
  { key: "leisure",   label: "Leisure",       emoji: "🎉", pct: 0.083, type: "resets",    color: "#5BC4A0" },
  { key: "son",       label: "Son's Savings", emoji: "🧒", pct: 0.083, type: "compounds", color: "#6BA3E8" },
  { key: "emergency", label: "Emergency",     emoji: "🚨", pct: 0.10,  type: "compounds", color: "#E87070" },
  { key: "travel",    label: "Travel",        emoji: "✈️", pct: 0.033, type: "compounds", color: "#B57BEB" },
  { key: "buffer",    label: "Buffer",        emoji: "💰", pct: 0.10,  type: "flex",      color: "#888888" },
];

const WINDFALL_ACCOUNTS = [
  { key: "tax",        label: "Tax Reserve",     emoji: "🧾", pct: 0.15, color: "#E87070" },
  { key: "recycle",    label: "Next Deal",        emoji: "🔄", pct: 0.25, color: "#C9A84C" },
  { key: "wemergency", label: "Emergency Boost",  emoji: "🚨", pct: 0.15, color: "#E87070" },
  { key: "wson",       label: "Son Boost",        emoji: "🧒", pct: 0.15, color: "#6BA3E8" },
  { key: "wtravel",    label: "Travel",           emoji: "✈️", pct: 0.10, color: "#B57BEB" },
  { key: "wcelebrate", label: "Family Celebrate", emoji: "🎉", pct: 0.10, color: "#5BC4A0" },
  { key: "wpartner",   label: "Partner Bonus",    emoji: "💑", pct: 0.05, color: "#A0A0A0" },
  { key: "wmom",       label: "Mom Bonus",        emoji: "👩", pct: 0.05, color: "#A0A0A0" },
];

const RATE_PRESETS = [
  { value: 150, label: "$75/hr", sub: "2hr min" },
  { value: 225, label: "$75/hr", sub: "3hr"     },
  { value: 300, label: "$300",   sub: "full"     },
];

const mono = "'SF Mono','Fira Code','Cascadia Code',monospace";
const fmt  = (n: number) => "$" + Math.round(n).toLocaleString();
let   uid  = 0;

// ── SHARED COMPONENTS ────────────────────────────────────────────────────────

function Badge({ type }: { type: string }) {
  const map: Record<string, { label: string; bg: string; color: string }> = {
    resets:    { label: "RESETS",    bg: "#2A2A1A", color: "#C9A84C" },
    compounds: { label: "COMPOUNDS", bg: "#1A2230", color: "#6BA3E8" },
    flex:      { label: "FLEX",      bg: "#1E1E1E", color: "#888888" },
  };
  const s = map[type] || map.flex;
  return <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1, padding: "2px 7px", borderRadius: 3, background: s.bg, color: s.color }}>{s.label}</span>;
}

function SplitRow({ acct, amount }: { acct: typeof ACCOUNTS[0]; amount: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 16px", borderBottom: "1px solid #1E1E1E", background: "#111" }}>
      <span style={{ fontSize: 20, width: 28, textAlign: "center" }}>{acct.emoji}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#DDD" }}>{acct.label}</div>
        <div style={{ marginTop: 3, display: "flex", alignItems: "center", gap: 6 }}>
          <Badge type={acct.type} />
          <span style={{ fontSize: 10, color: "#555" }}>{Math.round(acct.pct * 100)}%</span>
        </div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: acct.color }}>{fmt(amount * acct.pct)}</div>
        <div style={{ fontSize: 10, color: "#444", marginTop: 1 }}>per week</div>
      </div>
    </div>
  );
}

function WindfallRow({ acct, amount }: { acct: typeof WINDFALL_ACCOUNTS[0]; amount: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 16px", borderBottom: "1px solid #1E1E1E", background: "#111" }}>
      <span style={{ fontSize: 20, width: 28, textAlign: "center" }}>{acct.emoji}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#DDD" }}>{acct.label}</div>
        <div style={{ fontSize: 10, color: "#555", marginTop: 2 }}>{Math.round(acct.pct * 100)}%</div>
      </div>
      <div style={{ fontSize: 20, fontWeight: 700, color: acct.color }}>{fmt(amount * acct.pct)}</div>
    </div>
  );
}

function Stepper({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <button onClick={() => onChange(Math.max(0, value - 1))} style={{ width: 34, height: 34, background: "#1E1E1E", border: "1px solid #333", color: "#C9A84C", fontSize: 20, cursor: "pointer", borderRadius: 4 }}>−</button>
      <div style={{ flex: 1, textAlign: "center", fontSize: 30, fontWeight: 700, color: "#FFF" }}>{value}</div>
      <button onClick={() => onChange(value + 1)} style={{ width: 34, height: 34, background: "#1E1E1E", border: "1px solid #333", color: "#C9A84C", fontSize: 20, cursor: "pointer", borderRadius: 4 }}>+</button>
    </div>
  );
}

type RatePickerProps = {
  rate: number; setRate: (v: number) => void;
  useCustom: boolean; setUseCustom: (v: boolean) => void;
  customRate: string; setCustomRate: (v: string) => void;
};

function RatePicker({ rate, setRate, useCustom, setUseCustom, customRate, setCustomRate }: RatePickerProps) {
  return (
    <div>
      <div style={{ display: "flex", gap: 5, marginBottom: useCustom ? 8 : 0 }}>
        {RATE_PRESETS.map(r => (
          <button key={r.value} onClick={() => { setRate(r.value); setUseCustom(false); }} style={{
            flex: 1, padding: "8px 4px", border: "1px solid", cursor: "pointer",
            borderColor: !useCustom && rate === r.value ? "#C9A84C" : "#222",
            background: !useCustom && rate === r.value ? "#2A2A1A" : "#1E1E1E",
            color: !useCustom && rate === r.value ? "#C9A84C" : "#555",
            fontFamily: mono, fontWeight: 700, fontSize: 10, borderRadius: 4, lineHeight: 1.5,
          }}>
            <div>{r.label}</div>
            <div style={{ fontSize: 9, fontWeight: 400, opacity: 0.7 }}>{r.sub}</div>
          </button>
        ))}
        <button onClick={() => setUseCustom(true)} style={{
          flex: 1, padding: "8px 4px", border: "1px solid", cursor: "pointer",
          borderColor: useCustom ? "#C9A84C" : "#222",
          background: useCustom ? "#2A2A1A" : "#1E1E1E",
          color: useCustom ? "#C9A84C" : "#555",
          fontFamily: mono, fontWeight: 700, fontSize: 10, borderRadius: 4,
        }}>CUSTOM</button>
      </div>
      {useCustom && (
        <input type="number" placeholder="Enter rate $" value={customRate} onChange={e => setCustomRate(e.target.value)}
          style={{ width: "100%", background: "#0A0A0A", border: "1px solid #333", borderRadius: 4, padding: "8px 12px", color: "#FFF", fontFamily: mono, fontSize: 16, fontWeight: 700, boxSizing: "border-box", marginTop: 2 }} />
      )}
    </div>
  );
}

// ── SESSION INPUT — simple mode + mix mode toggle ────────────────────────────

type MixItem = { id: number; value: number; sub: string };

function SessionInput({ onTotalChange }: { sessionTotal: number; onTotalChange: (v: number) => void }) {
  const [sessions, setSessions]         = useState(0);
  const [rate, setRate]                 = useState(300);
  const [useCustom, setUseCustom]       = useState(false);
  const [customRate, setCustomRate]     = useState("");
  const [mixMode, setMixMode]           = useState(false);
  const [mixList, setMixList]           = useState<MixItem[]>([]);
  const [pickRate, setPickRate]         = useState(300);
  const [pickCustom, setPickCustom]     = useState(false);
  const [pickCustomVal, setPickCustomVal] = useState("");

  const simpleEffective = useCustom ? (Number(customRate) || 0) : rate;
  const simpleTotal     = sessions * simpleEffective;
  const mixTotal        = mixList.reduce((s, x) => s + x.value, 0);
  const currentTotal    = mixMode ? mixTotal : simpleTotal;

  onTotalChange(currentTotal);

  const addToMix = () => {
    const val = pickCustom ? Number(pickCustomVal) : pickRate;
    if (!val || val <= 0) return;
    const preset = RATE_PRESETS.find(r => r.value === pickRate);
    const sub    = pickCustom ? `$${val} custom` : preset?.sub ?? "";
    setMixList(l => [...l, { id: ++uid, value: val, sub }]);
    if (pickCustom) setPickCustomVal("");
  };

  const removeFromMix = (id: number) => setMixList(l => l.filter(x => x.id !== id));

  const switchToMix = () => {
    if (mixList.length === 0 && sessions > 0) {
      const preset = RATE_PRESETS.find(r => r.value === rate);
      const sub    = useCustom ? `$${customRate} custom` : preset?.sub ?? "";
      const val    = useCustom ? Number(customRate) : rate;
      const seeded = Array.from({ length: sessions }, () => ({ id: ++uid, value: val, sub }));
      setMixList(seeded);
    }
    setMixMode(true);
  };

  const switchToSimple = () => setMixMode(false);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <div style={{ fontSize: 10, color: "#C9A84C", letterSpacing: 2, fontWeight: 700 }}>SESSIONS</div>
        <button onClick={mixMode ? switchToSimple : switchToMix} style={{
          background: "none", border: "none", cursor: "pointer",
          fontSize: 10, fontFamily: mono, fontWeight: 700,
          color: mixMode ? "#888" : "#5BC4A0",
          letterSpacing: 0.5, padding: 0,
        }}>
          {mixMode ? "← SIMPLE MODE" : "MIXED WEEK? →"}
        </button>
      </div>

      {/* ── SIMPLE MODE ── */}
      {!mixMode && (
        <div style={{ background: "#161616", border: "1px solid #222", borderRadius: 6, padding: "12px 14px", marginBottom: 10 }}>
          <Stepper value={sessions} onChange={setSessions} />
          <div style={{ fontSize: 10, color: "#555", margin: "10px 0 6px" }}>SESSION RATE</div>
          <RatePicker rate={rate} setRate={setRate} useCustom={useCustom} setUseCustom={setUseCustom} customRate={customRate} setCustomRate={setCustomRate} />
          {sessions > 0 && (
            <div style={{ fontSize: 10, color: "#444", textAlign: "center", marginTop: 8 }}>
              {sessions} × {fmt(simpleEffective)} = <span style={{ color: "#C9A84C" }}>{fmt(simpleTotal)}</span>
            </div>
          )}
        </div>
      )}

      {/* ── MIX MODE ── */}
      {mixMode && (
        <div style={{ background: "#161616", border: "1px solid #2A5A3A", borderRadius: 6, overflow: "hidden", marginBottom: 10 }}>
          <div style={{ padding: "12px 14px", borderBottom: "1px solid #1E1E1E" }}>
            <div style={{ fontSize: 10, color: "#5BC4A0", marginBottom: 6 }}>PICK RATE & ADD</div>
            <RatePicker rate={pickRate} setRate={setPickRate} useCustom={pickCustom} setUseCustom={setPickCustom} customRate={pickCustomVal} setCustomRate={setPickCustomVal} />
            <button onClick={addToMix} style={{
              width: "100%", marginTop: 10, padding: "9px 0",
              background: "#1A3A2A", border: "1px dashed #2A6A4A",
              color: "#5BC4A0", fontFamily: mono, fontWeight: 700, fontSize: 11,
              cursor: "pointer", borderRadius: 4, letterSpacing: 0.5,
            }}>+ ADD SESSION</button>
          </div>

          {mixList.length === 0 ? (
            <div style={{ padding: "18px", textAlign: "center", fontSize: 11, color: "#333" }}>
              No sessions added yet
            </div>
          ) : (
            <div>
              {mixList.map((s, i) => (
                <div key={s.id} style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "9px 14px",
                  borderBottom: i < mixList.length - 1 ? "1px solid #1A1A1A" : "none",
                  background: i % 2 === 0 ? "#161616" : "#131313",
                }}>
                  <div style={{ fontSize: 10, color: "#555", width: 18 }}>{i + 1}</div>
                  <div style={{ flex: 1, fontSize: 11, color: "#AAA" }}>Session · {s.sub}</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#C9A84C", marginRight: 6 }}>{fmt(s.value)}</div>
                  <button onClick={() => removeFromMix(s.id)} style={{ width: 22, height: 22, background: "#1E1E1E", border: "1px solid #2A2A2A", color: "#555", fontSize: 14, cursor: "pointer", borderRadius: 3, padding: 0, lineHeight: 1 }}>×</button>
                </div>
              ))}
              <div style={{ padding: "10px 14px", background: "#111", borderTop: "1px solid #333", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: 10, color: "#555" }}>{mixList.length} SESSION{mixList.length !== 1 ? "S" : ""} SUBTOTAL</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#C9A84C" }}>{fmt(mixTotal)}</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── MEMBERSHIP BLOCK ─────────────────────────────────────────────────────────

type MembershipBlockProps = {
  memberships: number; setMemberships: (v: number) => void;
  membershipPay: string; setMembershipPay: (v: string) => void;
};

function MembershipBlock({ memberships, setMemberships, membershipPay, setMembershipPay }: MembershipBlockProps) {
  return (
    <div style={{ background: "#161616", border: "1px solid #222", borderRadius: 6, padding: "12px 14px", marginBottom: 10 }}>
      <div style={{ fontSize: 10, color: "#C9A84C", letterSpacing: 2, marginBottom: 8, fontWeight: 700 }}>MEMBERSHIPS</div>
      <Stepper value={memberships} onChange={setMemberships} />
      <div style={{ fontSize: 10, color: "#555", margin: "10px 0 6px" }}>HOW THEY'RE PAYING</div>
      <div style={{ display: "flex", gap: 5 }}>
        {[{ k: "weekly", l: "Weekly", s: "$300/wk" }, { k: "monthly", l: "Monthly", s: "$1,200 upfront" }].map(p => (
          <button key={p.k} onClick={() => setMembershipPay(p.k)} style={{
            flex: 1, padding: "8px 4px", border: "1px solid", cursor: "pointer",
            borderColor: membershipPay === p.k ? "#C9A84C" : "#222",
            background: membershipPay === p.k ? "#2A2A1A" : "#1E1E1E",
            color: membershipPay === p.k ? "#C9A84C" : "#555",
            fontFamily: mono, fontWeight: 700, fontSize: 10, borderRadius: 4, lineHeight: 1.5,
          }}>
            <div>{p.l}</div>
            <div style={{ fontSize: 9, fontWeight: 400, opacity: 0.7 }}>{p.s}</div>
          </button>
        ))}
      </div>
      {memberships > 0 && (
        <div style={{ fontSize: 10, color: "#444", textAlign: "center", marginTop: 8 }}>
          {memberships} × $300/wk = <span style={{ color: "#C9A84C" }}>{fmt(memberships * 300)}</span>
        </div>
      )}
    </div>
  );
}

// ── INCOME TOTAL BOX ─────────────────────────────────────────────────────────

function TotalBox({ sessionTotal, membershipIncome, goal }: { sessionTotal: number; membershipIncome: number; goal?: number }) {
  const total   = sessionTotal + membershipIncome;
  const target  = goal ?? 1500;
  const pct     = Math.min(100, (total / target) * 100);
  const hit     = total >= target;
  const barColor = hit ? "#5BC4A0" : "#C9A84C";
  const remaining = target - total;

  return (
    <div style={{ background: "#161616", border: `1px solid ${hit ? "#2A5A3A" : "#C9A84C"}`, borderRadius: 6, padding: "16px 20px", marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        <div>
          <div style={{ fontSize: 10, color: hit ? "#5BC4A0" : "#C9A84C", letterSpacing: 2, fontWeight: 700 }}>TOTAL THIS WEEK</div>
          {membershipIncome > 0 && (
            <div style={{ display: "flex", gap: 10, fontSize: 9, color: "#555", marginTop: 2 }}>
              <span>Sessions {fmt(sessionTotal)}</span>
              <span>·</span>
              <span>Members {fmt(membershipIncome)}</span>
            </div>
          )}
        </div>
        <div style={{ fontSize: 36, fontWeight: 700, color: hit ? "#5BC4A0" : "#C9A84C" }}>{fmt(total)}</div>
      </div>

      {/* Progress bar */}
      <div style={{ background: "#0A0A0A", borderRadius: 3, height: 6, overflow: "hidden", marginBottom: 6 }}>
        <div style={{ height: "100%", width: pct + "%", background: barColor, borderRadius: 3, transition: "width 0.4s ease" }} />
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "#444" }}>
        <span style={{ color: hit ? "#5BC4A0" : "#555" }}>
          {hit ? "🎉 GOAL HIT" : `${fmt(remaining)} to goal`}
        </span>
        <span>{Math.round(pct)}% of {fmt(target)}</span>
      </div>
    </div>
  );
}

// ── HELPER VIEW ──────────────────────────────────────────────────────────────

type Submission = {
  memberships: number;
  membershipPay: string;
  totalIncome: number;
  note: string;
  date: string;
};

function HelperView({ onSubmit, lastSubmission }: { onSubmit: (d: Submission) => void; lastSubmission: Submission | null }) {
  const [sessionTotal, setSessionTotal]   = useState(0);
  const [memberships, setMemberships]     = useState(0);
  const [membershipPay, setMembershipPay] = useState("weekly");
  const [note, setNote]                   = useState("");
  const [submitted, setSubmitted]         = useState(false);

  const membershipIncome = memberships * 300;
  const totalIncome      = sessionTotal + membershipIncome;

  const handleSubmit = () => {
    if (totalIncome === 0) return;
    onSubmit({ memberships, membershipPay, totalIncome, note, date: new Date().toLocaleDateString() });
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setNote("");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0A", fontFamily: mono, color: "#DDD" }}>
      <div style={{ background: "#111", borderBottom: "2px solid #5BC4A0", padding: "20px 20px 16px" }}>
        <div style={{ fontSize: 10, color: "#5BC4A0", letterSpacing: 3, fontWeight: 700, marginBottom: 4 }}>KHAN MONEY OS</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: "#FFF" }}>Helper View</div>
        <div style={{ fontSize: 10, color: "#444", marginTop: 2 }}>Enter this week's numbers — splits handled automatically</div>
      </div>

      <div style={{ padding: 20 }}>
        {lastSubmission && (
          <div style={{ background: "#161616", border: "1px solid #333", borderRadius: 6, padding: "10px 14px", marginBottom: 16, fontSize: 10, color: "#555" }}>
            Last submitted: <span style={{ color: "#C9A84C" }}>{fmt(lastSubmission.totalIncome)}</span> · {lastSubmission.date}
          </div>
        )}

        <SessionInput sessionTotal={sessionTotal} onTotalChange={setSessionTotal} />
        <MembershipBlock memberships={memberships} setMemberships={setMemberships} membershipPay={membershipPay} setMembershipPay={setMembershipPay} />

        <input placeholder="Add a note (optional)..." value={note} onChange={e => setNote(e.target.value)}
          style={{ width: "100%", background: "#161616", border: "1px solid #222", borderRadius: 6, padding: "10px 14px", color: "#888", fontFamily: mono, fontSize: 12, boxSizing: "border-box", marginBottom: 16 }} />

        <TotalBox sessionTotal={sessionTotal} membershipIncome={membershipIncome} goal={getStoredGoal()} />

        <button onClick={handleSubmit} disabled={totalIncome === 0} style={{
          width: "100%", padding: "16px 0", border: "none",
          background: submitted ? "#2A5A2A" : totalIncome === 0 ? "#1A1A1A" : "#5BC4A0",
          color: submitted ? "#5BC4A0" : totalIncome === 0 ? "#333" : "#0A0A0A",
          fontFamily: mono, fontWeight: 700, fontSize: 13, letterSpacing: 1,
          cursor: totalIncome === 0 ? "not-allowed" : "pointer", borderRadius: 6, transition: "all 0.3s",
        }}>
          {submitted ? "✓ SUBMITTED TO KHAN" : "SUBMIT THIS WEEK →"}
        </button>
      </div>
    </div>
  );
}

// ── ADMIN VIEW ───────────────────────────────────────────────────────────────

type WeekRecord = { week: number; income: number; memberships: number; date: string };
type DayEntry   = { id: number; date: string; sessionTotal: number; memberships: number; membershipIncome: number; total: number; note: string };

function AdminView({ pendingSubmission, onClearPending, onChangePin }: { pendingSubmission: Submission | null; onClearPending: () => void; onChangePin: () => void }) {
  const [tab, setTab]                     = useState("studio");
  const [stagingKey, setStagingKey]       = useState(0);
  const [sessionTotal, setSessionTotal]   = useState(0);
  const [memberships, setMemberships]     = useState(0);
  const [membershipPay, setMembershipPay] = useState("monthly");
  const [stagingNote, setStagingNote]     = useState("");
  const [dayEntries, setDayEntries]       = useState<DayEntry[]>(getStoredDays);
  const [windfall, setWindfall]           = useState(112000);
  const [weekHistory, setWeekHistory]     = useState<WeekRecord[]>(getStoredHistory);
  const [weekNum, setWeekNum]             = useState(getStoredWeekNum);
  const [showBanner, setShowBanner]       = useState(true);
  const [weeklyGoal, setWeeklyGoal]       = useState(getStoredGoal);
  const [editingGoal, setEditingGoal]     = useState(false);
  const [goalInput, setGoalInput]         = useState("");

  const stagingMembershipIncome = memberships * 300;
  const stagingTotal            = sessionTotal + stagingMembershipIncome;
  const weekRunningTotal        = dayEntries.reduce((s, e) => s + e.total, 0);
  const studioIncome            = weekRunningTotal; // used for splits & log

  useEffect(() => { localStorage.setItem(DAYENTRY_KEY, JSON.stringify(dayEntries)); }, [dayEntries]);
  useEffect(() => { localStorage.setItem(HISTORY_KEY,  JSON.stringify(weekHistory)); }, [weekHistory]);
  useEffect(() => { localStorage.setItem(WEEKNUM_KEY,  String(weekNum)); }, [weekNum]);

  const resetStaging = () => {
    setStagingKey(k => k + 1);
    setMemberships(0);
    setStagingNote("");
  };

  const addDay = () => {
    if (stagingTotal === 0) return;
    const entry: DayEntry = {
      id: ++uid,
      date: new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
      sessionTotal,
      memberships,
      membershipIncome: stagingMembershipIncome,
      total: stagingTotal,
      note: stagingNote.trim(),
    };
    setDayEntries(prev => [...prev, entry]);
    resetStaging();
  };

  const removeDay = (id: number) => setDayEntries(prev => prev.filter(e => e.id !== id));

  const logWeek = (override?: number) => {
    const income = override ?? weekRunningTotal;
    const totalMemberships = dayEntries.reduce((s, e) => s + e.memberships, 0);
    setWeekHistory(h => [{ week: weekNum, income, memberships: totalMemberships, date: new Date().toLocaleDateString() }, ...h].slice(0, 24));
    setWeekNum(n => n + 1);
    setDayEntries([]);
    resetStaging();
  };

  const acceptPending = () => {
    if (!pendingSubmission) return;
    logWeek(pendingSubmission.totalIncome);
    onClearPending();
    setShowBanner(false);
  };

  const compoundRunning = weekHistory.reduce<Record<string, number>>((acc, w) => ({
    son:       (acc.son       || 0) + w.income * 0.083,
    emergency: (acc.emergency || 0) + w.income * 0.10,
    travel:    (acc.travel    || 0) + w.income * 0.033,
  }), {});

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0A", fontFamily: mono, color: "#DDD" }}>

      {pendingSubmission && showBanner && (
        <div style={{ background: "#0D1F0D", borderBottom: "2px solid #5BC4A0", padding: "14px 20px" }}>
          <div style={{ fontSize: 10, color: "#5BC4A0", fontWeight: 700, letterSpacing: 2, marginBottom: 6 }}>📥 HELPER SUBMITTED A WEEK</div>
          <div style={{ fontSize: 14, color: "#C9A84C", fontWeight: 700, marginBottom: 4 }}>{fmt(pendingSubmission.totalIncome)}</div>
          <div style={{ fontSize: 11, color: "#555", marginBottom: 10 }}>
            {pendingSubmission.memberships} memberships · {pendingSubmission.date}
            {pendingSubmission.note ? ` · "${pendingSubmission.note}"` : ""}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={acceptPending} style={{ flex: 1, padding: 10, background: "#5BC4A0", border: "none", borderRadius: 4, color: "#0A0A0A", fontFamily: mono, fontWeight: 700, fontSize: 11, cursor: "pointer" }}>✓ ACCEPT & LOG</button>
            <button onClick={() => { setShowBanner(false); onClearPending(); }} style={{ padding: "10px 16px", background: "#1E1E1E", border: "1px solid #333", borderRadius: 4, color: "#555", fontFamily: mono, fontWeight: 700, fontSize: 11, cursor: "pointer" }}>DISMISS</button>
          </div>
        </div>
      )}

      <div style={{ background: "#111", borderBottom: "1px solid #1E1E1E", padding: "20px 20px 0" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 11, color: "#C9A84C", letterSpacing: 3, fontWeight: 700, marginBottom: 4 }}>KHAN</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#FFF", letterSpacing: -0.5 }}>Money OS</div>
            <div style={{ fontSize: 10, color: "#444", marginTop: 2 }}>Studio · Tax Deeds · Personal</div>
          </div>
          <div style={{ textAlign: "right", paddingBottom: 4 }}>
            <div style={{ fontSize: 10, color: "#444" }}>Week</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#C9A84C" }}>#{weekNum}</div>
          </div>
        </div>
        <div style={{ display: "flex", marginTop: 20, gap: 1 }}>
          {[["🎙 STUDIO", "studio"], ["🏠 WINDFALL", "windfall"], ["📊 TRACKER", "tracker"]].map(([l, k]) => (
            <button key={k} onClick={() => setTab(k)} style={{
              flex: 1, padding: "12px 0", border: "none", cursor: "pointer",
              fontFamily: mono, fontWeight: 700, fontSize: 11, letterSpacing: 1,
              background: tab === k ? "#C9A84C" : "#161616",
              color: tab === k ? "#0A0A0A" : "#555",
            }}>{l}</button>
          ))}
        </div>
      </div>

      {tab === "studio" && (
        <div>
          {/* ── ADD TODAY'S SESSIONS ── */}
          <div style={{ padding: "20px 20px 0" }}>
            <div style={{ fontSize: 10, color: "#5BC4A0", letterSpacing: 2, marginBottom: 12, fontWeight: 700 }}>ADD TODAY'S SESSIONS</div>
            <SessionInput key={stagingKey} sessionTotal={sessionTotal} onTotalChange={setSessionTotal} />
            <MembershipBlock memberships={memberships} setMemberships={setMemberships} membershipPay={membershipPay} setMembershipPay={setMembershipPay} />

            {/* Day note */}
            <textarea
              value={stagingNote}
              onChange={e => setStagingNote(e.target.value)}
              placeholder="Notes for today — clients, vibe, anything worth remembering..."
              rows={2}
              style={{
                width: "100%", boxSizing: "border-box", resize: "none",
                background: "#111", border: "1px solid #1E1E1E", borderRadius: 6,
                padding: "10px 12px", color: "#AAA", fontFamily: mono, fontSize: 11,
                lineHeight: 1.5, marginBottom: 10, outline: "none",
              }}
            />

            {/* Staging preview + Add button */}
            {stagingTotal > 0 && (
              <div style={{ background: "#161616", border: "1px dashed #333", borderRadius: 6, padding: "12px 16px", marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: 9, color: "#555", letterSpacing: 1 }}>TODAY'S TOTAL</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: "#DDD", marginTop: 2 }}>{fmt(stagingTotal)}</div>
                </div>
                <button onClick={addDay} style={{
                  padding: "12px 20px", background: "#5BC4A0", border: "none", borderRadius: 6,
                  color: "#0A0A0A", fontFamily: mono, fontWeight: 700, fontSize: 12,
                  letterSpacing: 1, cursor: "pointer",
                }}>ADD TO WEEK →</button>
              </div>
            )}
            {stagingTotal === 0 && (
              <div style={{ fontSize: 10, color: "#2A2A2A", textAlign: "center", marginBottom: 14, letterSpacing: 1 }}>
                Enter sessions above, then add to your week
              </div>
            )}
          </div>

          {/* ── WEEK SO FAR ── */}
          <div style={{ padding: "0 20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <div style={{ fontSize: 10, color: "#C9A84C", letterSpacing: 2, fontWeight: 700 }}>
                THIS WEEK · {dayEntries.length} DAY{dayEntries.length !== 1 ? "S" : ""}
              </div>
            </div>

            {dayEntries.length === 0 ? (
              <div style={{ background: "#111", border: "1px solid #1A1A1A", borderRadius: 6, padding: "22px 16px", textAlign: "center", color: "#2A2A2A", fontSize: 11, marginBottom: 12 }}>
                No days added yet this week
              </div>
            ) : (
              <div style={{ marginBottom: 10 }}>
                {dayEntries.map((e, i) => (
                  <div key={e.id} style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "10px 14px",
                    background: i % 2 === 0 ? "#111" : "#0F0F0F",
                    borderTop: i === 0 ? "1px solid #1E1E1E" : "none",
                    borderBottom: "1px solid #1A1A1A",
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#DDD" }}>{e.date}</div>
                      <div style={{ fontSize: 9, color: "#444", marginTop: 2 }}>
                        Sessions {fmt(e.sessionTotal)}
                        {e.memberships > 0 ? ` · ${e.memberships} membership${e.memberships > 1 ? "s" : ""} ${fmt(e.membershipIncome)}` : ""}
                      </div>
                      {e.note ? <div style={{ fontSize: 9, color: "#555", marginTop: 4, fontStyle: "italic" }}>"{e.note}"</div> : null}
                    </div>
                    <div style={{ fontSize: 17, fontWeight: 700, color: "#C9A84C" }}>{fmt(e.total)}</div>
                    <button onClick={() => removeDay(e.id)} style={{
                      width: 22, height: 22, background: "#1E1E1E", border: "1px solid #2A2A2A",
                      color: "#555", fontSize: 14, cursor: "pointer", borderRadius: 3, padding: 0, lineHeight: 1,
                    }}>×</button>
                  </div>
                ))}
              </div>
            )}

            {/* Running total + goal bar */}
            <TotalBox sessionTotal={weekRunningTotal} membershipIncome={0} goal={weeklyGoal} />

            {/* Goal editor */}
            <div style={{ marginTop: -12, marginBottom: 20 }}>
              {editingGoal ? (
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <input type="number" autoFocus value={goalInput} onChange={e => setGoalInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === "Enter") { const g = Number(goalInput); if (g > 0) { setWeeklyGoal(g); setStoredGoal(g); } setEditingGoal(false); }
                      if (e.key === "Escape") setEditingGoal(false);
                    }}
                    placeholder="Weekly goal $"
                    style={{ flex: 1, background: "#161616", border: "1px solid #333", borderRadius: 4, padding: "7px 10px", color: "#FFF", fontFamily: mono, fontSize: 13, fontWeight: 700, boxSizing: "border-box" }}
                  />
                  <button onClick={() => { const g = Number(goalInput); if (g > 0) { setWeeklyGoal(g); setStoredGoal(g); } setEditingGoal(false); }}
                    style={{ padding: "7px 14px", background: "#C9A84C", border: "none", borderRadius: 4, color: "#0A0A0A", fontFamily: mono, fontWeight: 700, fontSize: 11, cursor: "pointer" }}>SET</button>
                  <button onClick={() => setEditingGoal(false)} style={{ padding: "7px 10px", background: "#1E1E1E", border: "1px solid #333", borderRadius: 4, color: "#555", fontFamily: mono, fontSize: 11, cursor: "pointer" }}>✕</button>
                </div>
              ) : (
                <button onClick={() => { setGoalInput(String(weeklyGoal)); setEditingGoal(true); }} style={{
                  background: "none", border: "none", fontFamily: mono, fontSize: 9,
                  color: "#333", cursor: "pointer", letterSpacing: 1, padding: 0,
                }}>✎ EDIT GOAL ({fmt(weeklyGoal)}/wk)</button>
              )}
            </div>
          </div>

          {/* ── SPLITS (always visible, real-time) ── */}
          {(() => { const liveTotal = weekRunningTotal + stagingTotal; return (
            <>
              <div style={{ borderTop: "1px solid #1E1E1E" }}>
                <div style={{ padding: "14px 20px 4px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ fontSize: 10, color: "#C9A84C", letterSpacing: 2, fontWeight: 700 }}>YOUR SPLIT</div>
                  {stagingTotal > 0 && weekRunningTotal > 0 && (
                    <div style={{ fontSize: 9, color: "#444", letterSpacing: 1 }}>week {fmt(weekRunningTotal)} + today {fmt(stagingTotal)}</div>
                  )}
                </div>
                {ACCOUNTS.map(a => <SplitRow key={a.key} acct={a} amount={liveTotal} />)}
              </div>
              <div style={{ padding: 20 }}>
                <div style={{ background: "#0D1F0D", border: "1px solid #2A5A2A", borderLeft: "4px solid #5BC4A0", borderRadius: 6, padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#5BC4A0" }}>🎉 THIS WEEKEND</div>
                    <div style={{ fontSize: 10, color: "#3A7A5A", marginTop: 2 }}>Your family memory budget</div>
                  </div>
                  <div style={{ fontSize: 32, fontWeight: 700, color: "#5BC4A0" }}>{fmt(liveTotal * 0.083)}</div>
                </div>
                <button onClick={() => logWeek()} disabled={weekRunningTotal === 0} style={{
                  width: "100%", padding: "14px 0", border: "none", borderRadius: 6,
                  fontFamily: mono, fontWeight: 700, fontSize: 13, letterSpacing: 1,
                  background: weekRunningTotal === 0 ? "#1A1A1A" : "#C9A84C",
                  color: weekRunningTotal === 0 ? "#333" : "#0A0A0A",
                  cursor: weekRunningTotal === 0 ? "not-allowed" : "pointer",
                }}>LOG THIS WEEK →</button>
              </div>
            </>
          ); })()}
        </div>
      )}

      {tab === "windfall" && (
        <div>
          <div style={{ padding: "20px 20px 16px" }}>
            <div style={{ fontSize: 10, color: "#C9A84C", letterSpacing: 2, marginBottom: 12, fontWeight: 700 }}>DEAL PROFIT</div>
            <div style={{ background: "#161616", border: "1px solid #222", borderRadius: 6, padding: "14px 16px", marginBottom: 8 }}>
              <div style={{ fontSize: 10, color: "#555", marginBottom: 8 }}>ENTER NET SALE AMOUNT</div>
              <input type="number" value={windfall} onChange={e => setWindfall(Number(e.target.value))}
                style={{ width: "100%", background: "#0A0A0A", border: "1px solid #333", borderRadius: 4, padding: "10px 12px", color: "#FFF", fontFamily: mono, fontSize: 22, fontWeight: 700, boxSizing: "border-box" }} />
              <div style={{ fontSize: 10, color: "#444", marginTop: 6 }}>After agent 6% commission deducted</div>
            </div>
            <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
              {[50000, 112000, 175000, 250000].map(v => (
                <button key={v} onClick={() => setWindfall(v)} style={{ flex: 1, padding: "8px 0", border: "1px solid #222", background: windfall === v ? "#2A2A1A" : "#161616", color: windfall === v ? "#C9A84C" : "#444", fontFamily: mono, fontSize: 10, fontWeight: 700, cursor: "pointer", borderRadius: 4 }}>
                  ${(v / 1000).toFixed(0)}k
                </button>
              ))}
            </div>
            <div style={{ background: "#1A1500", border: "1px solid #C9A84C", borderRadius: 6, padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
              <div style={{ fontSize: 11, color: "#C9A84C", fontWeight: 700 }}>SPLITTING</div>
              <div style={{ fontSize: 30, fontWeight: 700, color: "#C9A84C" }}>{fmt(windfall)}</div>
            </div>
            <div style={{ fontSize: 10, color: "#555", marginBottom: 4, textAlign: "right" }}>⚠️ Always consult your CPA before moving windfall money</div>
          </div>
          <div style={{ borderTop: "1px solid #1E1E1E" }}>
            <div style={{ padding: "14px 20px 8px", fontSize: 10, color: "#C9A84C", letterSpacing: 2, fontWeight: 700 }}>WINDFALL SPLIT</div>
            {WINDFALL_ACCOUNTS.map(a => <WindfallRow key={a.key} acct={a} amount={windfall} />)}
          </div>
          <div style={{ padding: 20 }}>
            <div style={{ background: "#161616", border: "1px solid #1E1E1E", borderRadius: 6, padding: "14px 16px" }}>
              <div style={{ fontSize: 10, color: "#555", marginBottom: 8 }}>DEAL MATH CHECK</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {[{ l: "Back taxes paid", v: "$1,500" }, { l: "Title insurance", v: "$1,500" }, { l: "Total invested", v: "$3,000" }, { l: "Your profit", v: fmt(windfall) }].map(r => (
                  <div key={r.l} style={{ background: "#111", borderRadius: 4, padding: "10px 12px" }}>
                    <div style={{ fontSize: 9, color: "#444" }}>{r.l}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#DDD", marginTop: 2 }}>{r.v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "tracker" && (
        <div style={{ padding: 20 }}>

          {/* ── ALL-TIME SUMMARY ── */}
          {weekHistory.length > 0 && (() => {
            const total     = weekHistory.reduce((s, w) => s + w.income, 0);
            const avg       = total / weekHistory.length;
            const best      = Math.max(...weekHistory.map(w => w.income));
            const bestWeek  = weekHistory.find(w => w.income === best);
            const goalsHit  = weekHistory.filter(w => w.income >= weeklyGoal).length;
            const hitRate   = Math.round((goalsHit / weekHistory.length) * 100);

            // current streak: consecutive most-recent weeks at or above goal
            let streak = 0;
            for (const w of weekHistory) {
              if (w.income >= weeklyGoal) streak++;
              else break;
            }

            return (
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 10, color: "#C9A84C", letterSpacing: 2, marginBottom: 12, fontWeight: 700 }}>ALL-TIME SUMMARY</div>

                {/* Top row: total + best */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                  <div style={{ background: "#161616", border: "1px solid #2A2A1A", borderRadius: 6, padding: "14px 16px" }}>
                    <div style={{ fontSize: 9, color: "#555", letterSpacing: 1, marginBottom: 6 }}>TOTAL EARNED</div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: "#C9A84C" }}>{fmt(total)}</div>
                    <div style={{ fontSize: 9, color: "#444", marginTop: 3 }}>{weekHistory.length} week{weekHistory.length !== 1 ? "s" : ""} logged</div>
                  </div>
                  <div style={{ background: "#161616", border: "1px solid #2A2A1A", borderRadius: 6, padding: "14px 16px" }}>
                    <div style={{ fontSize: 9, color: "#555", letterSpacing: 1, marginBottom: 6 }}>BEST WEEK</div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: "#C9A84C" }}>{fmt(best)}</div>
                    <div style={{ fontSize: 9, color: "#444", marginTop: 3 }}>Week #{bestWeek?.week} · {bestWeek?.date}</div>
                  </div>
                </div>

                {/* Bottom row: avg + hit rate */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                  <div style={{ background: "#161616", border: "1px solid #1E1E1E", borderRadius: 6, padding: "14px 16px" }}>
                    <div style={{ fontSize: 9, color: "#555", letterSpacing: 1, marginBottom: 6 }}>AVG / WEEK</div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: avg >= weeklyGoal ? "#5BC4A0" : "#DDD" }}>{fmt(avg)}</div>
                    <div style={{ fontSize: 9, color: "#444", marginTop: 3 }}>{avg >= weeklyGoal ? "above goal" : fmt(weeklyGoal - avg) + " below goal"}</div>
                  </div>
                  <div style={{ background: "#161616", border: "1px solid #1E1E1E", borderRadius: 6, padding: "14px 16px" }}>
                    <div style={{ fontSize: 9, color: "#555", letterSpacing: 1, marginBottom: 6 }}>GOAL HIT RATE</div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: hitRate >= 80 ? "#5BC4A0" : hitRate >= 50 ? "#C9A84C" : "#E87070" }}>{hitRate}%</div>
                    <div style={{ fontSize: 9, color: "#444", marginTop: 3 }}>{goalsHit} of {weekHistory.length} weeks</div>
                  </div>
                </div>

                {/* Streak bar */}
                {streak > 0 && (
                  <div style={{ background: "#0D1F0D", border: "1px solid #2A5A2A", borderLeft: "4px solid #5BC4A0", borderRadius: 6, padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#5BC4A0" }}>🔥 GOAL STREAK</div>
                      <div style={{ fontSize: 9, color: "#3A7A5A", marginTop: 2 }}>Consecutive weeks at or above {fmt(weeklyGoal)}</div>
                    </div>
                    <div style={{ fontSize: 28, fontWeight: 700, color: "#5BC4A0" }}>{streak}</div>
                  </div>
                )}
              </div>
            );
          })()}

          <div style={{ fontSize: 10, color: "#C9A84C", letterSpacing: 2, marginBottom: 16, fontWeight: 700 }}>COMPOUNDING ACCOUNTS</div>
          {[
            { label: "🧒 Son's Savings",  key: "son",       color: "#6BA3E8", target: 6000 },
            { label: "🚨 Emergency Fund", key: "emergency", color: "#E87070", target: 7200 },
            { label: "✈️ Travel Fund",    key: "travel",    color: "#B57BEB", target: 2400 },
          ].map(a => {
            const val = compoundRunning[a.key] || 0;
            const pct = Math.min(100, Math.round((val / a.target) * 100));
            return (
              <div key={a.key} style={{ background: "#161616", border: "1px solid #1E1E1E", borderRadius: 6, padding: "14px 16px", marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#DDD" }}>{a.label}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: a.color }}>{fmt(val)}</div>
                </div>
                <div style={{ background: "#0A0A0A", borderRadius: 3, height: 6, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: pct + "%", background: a.color, borderRadius: 3, transition: "width 0.6s ease" }} />
                </div>
                <div style={{ fontSize: 9, color: "#444", marginTop: 4 }}>{pct}% toward 12-month target of {fmt(a.target)}</div>
              </div>
            );
          })}

          <div style={{ fontSize: 10, color: "#C9A84C", letterSpacing: 2, margin: "20px 0 12px", fontWeight: 700 }}>WEEK LOG</div>
          {weekHistory.length === 0 ? (
            <div style={{ background: "#161616", border: "1px solid #1E1E1E", borderRadius: 6, padding: "30px 20px", textAlign: "center", color: "#333", fontSize: 12 }}>
              No weeks logged yet.<br />Go to Studio tab and hit LOG THIS WEEK.
            </div>
          ) : weekHistory.map((w, i) => (
            <div key={i} style={{ background: "#161616", border: "1px solid #1E1E1E", borderRadius: 6, padding: "12px 16px", marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#DDD" }}>Week #{w.week}</div>
                <div style={{ fontSize: 10, color: "#444", marginTop: 2 }}>{w.memberships} memberships · {w.date}</div>
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#C9A84C" }}>{fmt(w.income)}</div>
            </div>
          ))}
          {weekHistory.length > 0 && (
            <div style={{ background: "#161616", border: "1px solid #1E1E1E", borderRadius: 6, padding: "14px 16px", marginTop: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 11, color: "#555" }}>TOTAL EARNED ({weekHistory.length} weeks)</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#C9A84C" }}>{fmt(weekHistory.reduce((s, w) => s + w.income, 0))}</div>
            </div>
          )}
        </div>
      )}

      <div style={{ padding: "16px 20px", borderTop: "1px solid #1E1E1E", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 9, color: "#333", letterSpacing: 1 }}>KHAN MONEY OS · ADMIN</div>
        <button onClick={onChangePin} style={{ background: "none", border: "none", fontFamily: mono, fontSize: 9, color: "#333", cursor: "pointer", letterSpacing: 1, padding: 0 }}>🔑 CHANGE PIN</button>
      </div>
    </div>
  );
}

// ── PIN SCREEN ────────────────────────────────────────────────────────────────

const PIN_KEY      = "khan_admin_pin";
const GOAL_KEY     = "khan_weekly_goal";
const HISTORY_KEY  = "khan_week_history";
const WEEKNUM_KEY  = "khan_week_num";
const DAYENTRY_KEY = "khan_day_entries";

const getStoredPin     = () => localStorage.getItem(PIN_KEY) ?? "1234";
const setStoredPin     = (p: string) => localStorage.setItem(PIN_KEY, p);
const getStoredGoal    = () => Number(localStorage.getItem(GOAL_KEY) || 1500);
const setStoredGoal    = (g: number) => localStorage.setItem(GOAL_KEY, String(g));
const getStoredHistory = (): WeekRecord[] => { try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"); } catch { return []; } };
const getStoredWeekNum = () => Number(localStorage.getItem(WEEKNUM_KEY) || 1);
const getStoredDays    = (): DayEntry[] => { try { return JSON.parse(localStorage.getItem(DAYENTRY_KEY) || "[]"); } catch { return []; } };

type PinScreenProps = {
  title: string;
  subtitle: string;
  onSuccess: (pin: string) => void;
  onBack: () => void;
  validatePin?: (pin: string) => boolean;
  accentColor?: string;
  errorMsg?: string;
};

function PinScreen({ title, subtitle, onSuccess, onBack, validatePin, accentColor = "#C9A84C", errorMsg }: PinScreenProps) {
  const [digits, setDigits] = useState<string[]>([]);
  const [shake, setShake]   = useState(false);
  const [err, setErr]       = useState("");

  const add = (d: string) => {
    if (digits.length >= 4) return;
    const next = [...digits, d];
    setDigits(next);
    if (next.length === 4) {
      const pin = next.join("");
      const valid = validatePin ? validatePin(pin) : pin === getStoredPin();
      if (valid) {
        setTimeout(() => onSuccess(pin), 120);
      } else {
        setShake(true);
        setErr(errorMsg ?? "Wrong PIN");
        setTimeout(() => { setShake(false); setDigits([]); setErr(""); }, 700);
      }
    }
  };

  const del = () => setDigits(d => d.slice(0, -1));

  const keys = ["1","2","3","4","5","6","7","8","9","","0","⌫"];

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0A", fontFamily: mono, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 30 }}>
      <button onClick={onBack} style={{ position: "fixed", top: 12, left: 16, background: "none", border: "none", color: "#555", fontFamily: mono, fontSize: 10, cursor: "pointer", letterSpacing: 1 }}>← BACK</button>

      <div style={{ fontSize: 10, color: accentColor, letterSpacing: 3, fontWeight: 700, marginBottom: 6 }}>KHAN MONEY OS</div>
      <div style={{ fontSize: 20, fontWeight: 700, color: "#FFF", marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 10, color: "#444", marginBottom: 40 }}>{subtitle}</div>

      {/* Dots */}
      <div style={{ display: "flex", gap: 16, marginBottom: 8 }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{
            width: 14, height: 14, borderRadius: "50%",
            background: i < digits.length ? accentColor : "#222",
            border: `2px solid ${i < digits.length ? accentColor : "#333"}`,
            transition: "background 0.1s",
            transform: shake ? "translateX(0)" : "none",
          }} />
        ))}
      </div>

      {err && <div style={{ fontSize: 10, color: "#E87070", marginBottom: 16, letterSpacing: 1 }}>{err}</div>}
      {!err && <div style={{ height: 26 }} />}

      {/* Numpad */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 72px)", gap: 10 }}>
        {keys.map((k, i) => (
          k === "" ? <div key={i} /> :
          k === "⌫" ? (
            <button key={i} onClick={del} style={{ height: 64, background: "#161616", border: "1px solid #2A2A2A", borderRadius: 8, color: "#666", fontFamily: mono, fontSize: 18, cursor: "pointer" }}>{k}</button>
          ) : (
            <button key={i} onClick={() => add(k)} style={{ height: 64, background: "#161616", border: `1px solid #2A2A2A`, borderRadius: 8, color: "#DDD", fontFamily: mono, fontSize: 22, fontWeight: 700, cursor: "pointer", transition: "background 0.1s" }}
              onMouseDown={e => (e.currentTarget.style.background = "#222")}
              onMouseUp={e => (e.currentTarget.style.background = "#161616")}
            >{k}</button>
          )
        ))}
      </div>

      <div style={{ fontSize: 9, color: "#222", marginTop: 40, letterSpacing: 1 }}>Every dollar has a job.</div>
    </div>
  );
}

// ── CHANGE PIN FLOW ───────────────────────────────────────────────────────────

function ChangePinFlow({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState<"verify" | "new" | "confirm">("verify");
  const [newPin, setNewPin]   = useState("");
  const [success, setSuccess] = useState(false);

  if (success) {
    return (
      <div style={{ minHeight: "100vh", background: "#0A0A0A", fontFamily: mono, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>✓</div>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#5BC4A0" }}>PIN updated</div>
        <button onClick={onDone} style={{ marginTop: 30, background: "none", border: "none", color: "#555", fontFamily: mono, fontSize: 10, cursor: "pointer", letterSpacing: 1 }}>← BACK TO ADMIN</button>
      </div>
    );
  }

  if (step === "verify") {
    return (
      <PinScreen
        title="Verify Identity"
        subtitle="Enter your current PIN"
        onSuccess={() => setStep("new")}
        onBack={onDone}
        accentColor="#C9A84C"
        errorMsg="Current PIN incorrect"
      />
    );
  }

  if (step === "new") {
    return (
      <PinScreen
        title="New PIN"
        subtitle="Choose a 4-digit PIN"
        onSuccess={(p) => { setNewPin(p); setStep("confirm"); }}
        onBack={() => setStep("verify")}
        validatePin={() => true}
        accentColor="#5BC4A0"
      />
    );
  }

  return (
    <PinScreen
      title="Confirm PIN"
      subtitle="Re-enter your new PIN"
      onSuccess={() => { setStoredPin(newPin); setSuccess(true); }}
      onBack={() => setStep("new")}
      validatePin={(p) => p === newPin}
      accentColor="#5BC4A0"
      errorMsg="PINs don't match"
    />
  );
}

// ── SPLASH SCREEN ─────────────────────────────────────────────────────────────

function SplashScreen({ onDone }: { onDone: () => void }) {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setFading(true), 1400);
    const t2 = setTimeout(() => onDone(), 1900);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "#0A0A0A", fontFamily: mono,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      transition: "opacity 0.5s ease",
      opacity: fading ? 0 : 1,
      pointerEvents: "none",
    }}>
      <div style={{ fontSize: 13, color: "#C9A84C", letterSpacing: 6, fontWeight: 700, marginBottom: 10 }}>KHAN</div>
      <div style={{ fontSize: 36, fontWeight: 700, color: "#FFF", letterSpacing: -1 }}>Money OS</div>
      <div style={{ fontSize: 11, color: "#444", marginTop: 8, letterSpacing: 1 }}>Studio · Tax Deeds · Personal</div>

      <div style={{ marginTop: 64, width: 120, height: 2, background: "#1A1A1A", borderRadius: 1, overflow: "hidden" }}>
        <div style={{
          height: "100%", background: "#C9A84C", borderRadius: 1,
          animation: "splash-bar 1.4s cubic-bezier(0.4, 0, 0.2, 1) forwards",
        }} />
      </div>

      <div style={{ marginTop: 16, fontSize: 9, color: "#2A2A2A", letterSpacing: 2, animation: "splash-pulse 1.4s ease infinite" }}>
        LOADING
      </div>
    </div>
  );
}

// ── ROOT ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [splash, setSplash]             = useState(true);
  const [mode, setMode]                 = useState<"admin" | "helper" | "pin" | "changePin" | null>(null);
  const [pendingSubmission, setPending] = useState<Submission | null>(null);

  const content = (() => {
    if (mode === null) return (
      <div style={{ minHeight: "100vh", background: "#0A0A0A", fontFamily: mono, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 30 }}>
        <div style={{ fontSize: 11, color: "#C9A84C", letterSpacing: 4, fontWeight: 700, marginBottom: 6 }}>KHAN</div>
        <div style={{ fontSize: 26, fontWeight: 700, color: "#FFF", marginBottom: 4 }}>Money OS</div>
        <div style={{ fontSize: 11, color: "#444", marginBottom: 50 }}>Studio · Tax Deeds · Personal</div>
        <div style={{ width: "100%", maxWidth: 340 }}>
          <button onClick={() => setMode("pin")} style={{ width: "100%", padding: 20, marginBottom: 12, border: "2px solid #C9A84C", background: "#161616", borderRadius: 8, cursor: "pointer", fontFamily: mono, textAlign: "left" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#C9A84C", marginBottom: 4 }}>👑  ADMIN VIEW</div>
            <div style={{ fontSize: 10, color: "#555" }}>Full splits, tracker, all accounts. This is your view.</div>
          </button>
          <button onClick={() => setMode("helper")} style={{ width: "100%", padding: 20, border: "1px solid #2A5A2A", background: "#0D1F0D", borderRadius: 8, cursor: "pointer", fontFamily: mono, textAlign: "left" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#5BC4A0", marginBottom: 4 }}>🤝  HELPER VIEW</div>
            <div style={{ fontSize: 10, color: "#3A6A4A" }}>Input sessions and income only. Submits to admin. No splits visible.</div>
          </button>
        </div>
        <div style={{ fontSize: 9, color: "#222", marginTop: 40, letterSpacing: 1 }}>Every dollar has a job.</div>
      </div>
    );

    if (mode === "pin") return (
      <PinScreen
        title="Admin Access"
        subtitle="Enter your PIN to continue"
        onSuccess={() => setMode("admin")}
        onBack={() => setMode(null)}
      />
    );

    if (mode === "changePin") return <ChangePinFlow onDone={() => setMode("admin")} />;

    if (mode === "helper") return (
      <div>
        <button onClick={() => setMode(null)} style={{ position: "fixed", top: 12, right: 12, background: "#161616", border: "1px solid #333", color: "#555", padding: "6px 12px", borderRadius: 4, cursor: "pointer", fontFamily: mono, fontSize: 10, zIndex: 100 }}>← BACK</button>
        <HelperView onSubmit={(data) => { setPending(data); setMode("pin"); }} lastSubmission={pendingSubmission} />
      </div>
    );

    return (
      <div>
        <button onClick={() => setMode(null)} style={{ position: "fixed", top: 12, right: 12, background: "#161616", border: "1px solid #333", color: "#555", padding: "6px 12px", borderRadius: 4, cursor: "pointer", fontFamily: mono, fontSize: 10, zIndex: 100 }}>⇄ SWITCH</button>
        <AdminView pendingSubmission={pendingSubmission} onClearPending={() => setPending(null)} onChangePin={() => setMode("changePin")} />
      </div>
    );
  })();

  return (
    <>
      {splash && <SplashScreen onDone={() => setSplash(false)} />}
      {content}
    </>
  );
}
