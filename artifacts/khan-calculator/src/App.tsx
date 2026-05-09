import { useState } from "react";

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
  { value: 225, label: "$75/hr", sub: "3hr" },
  { value: 300, label: "$300",   sub: "full session" },
];

const fmt = (n: number) => "$" + Math.round(n).toLocaleString();

const mono = "'SF Mono','Fira Code','Cascadia Code',monospace";

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
  const val = amount * acct.pct;
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
        <div style={{ fontSize: 20, fontWeight: 700, color: acct.color }}>{fmt(val)}</div>
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

function Stepper({ value, onChange, min = 0 }: { value: number; onChange: (v: number) => void; min?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <button onClick={() => onChange(Math.max(min, value - 1))} style={{ width: 34, height: 34, background: "#1E1E1E", border: "1px solid #333", color: "#C9A84C", fontSize: 20, cursor: "pointer", borderRadius: 4 }}>−</button>
      <div style={{ flex: 1, textAlign: "center", fontSize: 30, fontWeight: 700, color: "#FFF" }}>{value}</div>
      <button onClick={() => onChange(value + 1)} style={{ width: 34, height: 34, background: "#1E1E1E", border: "1px solid #333", color: "#C9A84C", fontSize: 20, cursor: "pointer", borderRadius: 4 }}>+</button>
    </div>
  );
}

function PickerBtn({ active, onClick, label, sub, accentColor = "#C9A84C" }: { active: boolean; onClick: () => void; label: string; sub?: string; accentColor?: string }) {
  return (
    <button onClick={onClick} style={{
      flex: 1, padding: "8px 4px", border: "1px solid", cursor: "pointer",
      borderColor: active ? accentColor : "#222",
      background: active ? "#2A2A1A" : "#1E1E1E",
      color: active ? accentColor : "#555",
      fontFamily: mono, fontWeight: 700, fontSize: 10, borderRadius: 4, lineHeight: 1.5,
    }}>
      <div>{label}</div>
      {sub && <div style={{ fontSize: 9, fontWeight: 400, opacity: 0.7 }}>{sub}</div>}
    </button>
  );
}

type Submission = {
  sessions: number;
  rate: number;
  memberships: number;
  membershipPay: string;
  totalIncome: number;
  note: string;
  date: string;
};

function HelperView({ onSubmit, lastSubmission }: { onSubmit: (d: Submission) => void; lastSubmission: Submission | null }) {
  const [sessions, setSessions]           = useState(0);
  const [rate, setRate]                   = useState(300);
  const [useCustom, setUseCustom]         = useState(false);
  const [customRate, setCustomRate]       = useState("");
  const [memberships, setMemberships]     = useState(0);
  const [membershipPay, setMembershipPay] = useState("weekly");
  const [note, setNote]                   = useState("");
  const [submitted, setSubmitted]         = useState(false);

  const effectiveRate    = useCustom ? (Number(customRate) || 0) : rate;
  const membershipIncome = memberships * 300;
  const totalIncome      = sessions * effectiveRate + membershipIncome;

  const handleSubmit = () => {
    if (totalIncome === 0) return;
    onSubmit({ sessions, rate: effectiveRate, memberships, membershipPay, totalIncome, note, date: new Date().toLocaleDateString() });
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setNote("");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0A", fontFamily: mono, color: "#DDD" }}>
      <div style={{ background: "#111", borderBottom: "2px solid #5BC4A0", padding: "20px 20px 16px" }}>
        <div style={{ fontSize: 10, color: "#5BC4A0", letterSpacing: 3, fontWeight: 700, marginBottom: 4 }}>KHAN MONEY OS</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: "#FFF" }}>Helper View</div>
        <div style={{ fontSize: 10, color: "#444", marginTop: 2 }}>Enter this week's numbers — splits are handled automatically</div>
      </div>

      <div style={{ padding: 20 }}>
        {lastSubmission && (
          <div style={{ background: "#161616", border: "1px solid #333", borderRadius: 6, padding: "10px 14px", marginBottom: 16, fontSize: 10, color: "#555" }}>
            Last submitted: <span style={{ color: "#C9A84C" }}>{fmt(lastSubmission.totalIncome)}</span> · {lastSubmission.date}
          </div>
        )}

        <div style={{ fontSize: 10, color: "#5BC4A0", letterSpacing: 2, marginBottom: 8, fontWeight: 700 }}>SESSIONS THIS WEEK</div>
        <div style={{ background: "#161616", border: "1px solid #222", borderRadius: 6, padding: 14, marginBottom: 10 }}>
          <Stepper value={sessions} onChange={setSessions} />
          <div style={{ fontSize: 10, color: "#555", marginTop: 8, marginBottom: 6 }}>SESSION RATE</div>
          <div style={{ display: "flex", gap: 5, marginBottom: useCustom ? 8 : 0 }}>
            {RATE_PRESETS.map(r => (
              <PickerBtn key={r.value} active={!useCustom && rate === r.value} onClick={() => { setRate(r.value); setUseCustom(false); }} label={r.label} sub={r.sub} />
            ))}
            <PickerBtn active={useCustom} onClick={() => setUseCustom(true)} label="CUSTOM" />
          </div>
          {useCustom && (
            <input type="number" placeholder="Enter rate $" value={customRate} onChange={e => setCustomRate(e.target.value)}
              style={{ width: "100%", background: "#0A0A0A", border: "1px solid #333", borderRadius: 4, padding: "8px 12px", color: "#FFF", fontFamily: mono, fontSize: 16, fontWeight: 700, boxSizing: "border-box" }} />
          )}
        </div>

        <div style={{ fontSize: 10, color: "#5BC4A0", letterSpacing: 2, marginBottom: 8, fontWeight: 700 }}>MEMBERSHIPS</div>
        <div style={{ background: "#161616", border: "1px solid #222", borderRadius: 6, padding: 14, marginBottom: 10 }}>
          <Stepper value={memberships} onChange={setMemberships} />
          <div style={{ fontSize: 10, color: "#555", marginTop: 8, marginBottom: 6 }}>HOW THEY'RE PAYING</div>
          <div style={{ display: "flex", gap: 5 }}>
            <PickerBtn active={membershipPay === "weekly"}  onClick={() => setMembershipPay("weekly")}  label="Weekly"  sub="$300/wk" />
            <PickerBtn active={membershipPay === "monthly"} onClick={() => setMembershipPay("monthly")} label="Monthly" sub="$1,200 upfront" />
          </div>
          {memberships > 0 && (
            <div style={{ fontSize: 10, color: "#555", marginTop: 8, textAlign: "center" }}>
              Adding {fmt(membershipIncome)}/wk from memberships
            </div>
          )}
        </div>

        <input placeholder="Add a note (optional)..." value={note} onChange={e => setNote(e.target.value)}
          style={{ width: "100%", background: "#161616", border: "1px solid #222", borderRadius: 6, padding: "10px 14px", color: "#888", fontFamily: mono, fontSize: 12, boxSizing: "border-box", marginBottom: 16 }} />

        <div style={{ background: "#161616", border: "1px solid #C9A84C", borderRadius: 6, padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ fontSize: 10, color: "#C9A84C", fontWeight: 700, letterSpacing: 2 }}>TOTAL THIS WEEK</div>
          <div style={{ fontSize: 34, fontWeight: 700, color: "#C9A84C" }}>{fmt(totalIncome)}</div>
        </div>

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

type WeekRecord = { week: number; income: number; sessions: number; memberships: number; date: string };

function AdminView({ pendingSubmission, onClearPending }: { pendingSubmission: Submission | null; onClearPending: () => void }) {
  const [tab, setTab]                     = useState("studio");
  const [sessions, setSessions]           = useState(5);
  const [rate, setRate]                   = useState(300);
  const [useCustom, setUseCustom]         = useState(false);
  const [customRate, setCustomRate]       = useState("");
  const [memberships, setMemberships]     = useState(0);
  const [membershipPay, setMembershipPay] = useState("monthly");
  const [windfall, setWindfall]           = useState(112000);
  const [weekHistory, setWeekHistory]     = useState<WeekRecord[]>([]);
  const [weekNum, setWeekNum]             = useState(1);
  const [showBanner, setShowBanner]       = useState(true);

  const effectiveRate    = useCustom ? (Number(customRate) || 0) : rate;
  const membershipIncome = memberships * 300;
  const studioIncome     = sessions * effectiveRate + membershipIncome;

  const logWeek = (override?: number) => {
    const income = override ?? studioIncome;
    setWeekHistory(h => [{ week: weekNum, income, sessions, memberships, date: new Date().toLocaleDateString() }, ...h].slice(0, 24));
    setWeekNum(n => n + 1);
  };

  const acceptPending = () => {
    if (!pendingSubmission) return;
    setSessions(pendingSubmission.sessions);
    setRate(pendingSubmission.rate);
    setMemberships(pendingSubmission.memberships);
    logWeek(pendingSubmission.totalIncome);
    onClearPending();
    setShowBanner(false);
  };

  const compoundRunning = weekHistory.reduce<Record<string, number>>((acc, w) => ({
    son:       (acc.son       || 0) + w.income * 0.083,
    emergency: (acc.emergency || 0) + w.income * 0.10,
    travel:    (acc.travel    || 0) + w.income * 0.033,
  }), {});

  const rateLabel = useCustom ? `$${customRate || 0} custom` : RATE_PRESETS.find(r => r.value === rate)?.sub ?? "";

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0A", fontFamily: mono, color: "#DDD" }}>

      {pendingSubmission && showBanner && (
        <div style={{ background: "#0D1F0D", borderBottom: "2px solid #5BC4A0", padding: "14px 20px" }}>
          <div style={{ fontSize: 10, color: "#5BC4A0", fontWeight: 700, letterSpacing: 2, marginBottom: 6 }}>📥 HELPER SUBMITTED A WEEK</div>
          <div style={{ fontSize: 12, color: "#AAA", marginBottom: 10 }}>
            {pendingSubmission.sessions} sessions · {pendingSubmission.memberships} memberships · <span style={{ color: "#C9A84C", fontWeight: 700 }}>{fmt(pendingSubmission.totalIncome)}</span>
            {pendingSubmission.note ? ` · "${pendingSubmission.note}"` : ""}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={acceptPending} style={{ flex: 1, padding: 8, background: "#5BC4A0", border: "none", borderRadius: 4, color: "#0A0A0A", fontFamily: mono, fontWeight: 700, fontSize: 11, cursor: "pointer" }}>✓ ACCEPT & LOG</button>
            <button onClick={() => { setShowBanner(false); onClearPending(); }} style={{ padding: "8px 16px", background: "#1E1E1E", border: "1px solid #333", borderRadius: 4, color: "#555", fontFamily: mono, fontWeight: 700, fontSize: 11, cursor: "pointer" }}>DISMISS</button>
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
          <div style={{ padding: "20px 20px 0" }}>
            <div style={{ fontSize: 10, color: "#C9A84C", letterSpacing: 2, marginBottom: 12, fontWeight: 700 }}>THIS WEEK'S INCOME</div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
              <div style={{ background: "#161616", border: "1px solid #222", borderRadius: 6, padding: "12px 14px" }}>
                <div style={{ fontSize: 10, color: "#555", marginBottom: 6 }}>SESSIONS</div>
                <Stepper value={sessions} onChange={setSessions} />
                <div style={{ fontSize: 10, color: "#444", textAlign: "center", marginTop: 4 }}>{rateLabel}</div>
              </div>
              <div style={{ background: "#161616", border: "1px solid #222", borderRadius: 6, padding: "12px 14px" }}>
                <div style={{ fontSize: 10, color: "#555", marginBottom: 6 }}>MEMBERSHIPS</div>
                <Stepper value={memberships} onChange={setMemberships} />
                <div style={{ fontSize: 10, color: "#444", textAlign: "center", marginTop: 4 }}>@ $300/wk each</div>
              </div>
            </div>

            <div style={{ background: "#161616", border: "1px solid #222", borderRadius: 6, padding: "12px 14px", marginBottom: 10 }}>
              <div style={{ fontSize: 10, color: "#555", marginBottom: 6 }}>MEMBERSHIP PAYMENT TYPE</div>
              <div style={{ display: "flex", gap: 5 }}>
                <PickerBtn active={membershipPay === "weekly"}  onClick={() => setMembershipPay("weekly")}  label="Weekly"  sub="$300/wk" />
                <PickerBtn active={membershipPay === "monthly"} onClick={() => setMembershipPay("monthly")} label="Monthly" sub="$1,200 upfront" />
              </div>
            </div>

            <div style={{ background: "#161616", border: "1px solid #222", borderRadius: 6, padding: "12px 14px", marginBottom: 16 }}>
              <div style={{ fontSize: 10, color: "#555", marginBottom: 8 }}>SESSION RATE</div>
              <div style={{ display: "flex", gap: 5, marginBottom: useCustom ? 8 : 0 }}>
                {RATE_PRESETS.map(r => (
                  <PickerBtn key={r.value} active={!useCustom && rate === r.value} onClick={() => { setRate(r.value); setUseCustom(false); }} label={r.label} sub={r.sub} />
                ))}
                <PickerBtn active={useCustom} onClick={() => setUseCustom(true)} label="CUSTOM" />
              </div>
              {useCustom && (
                <input type="number" placeholder="Enter custom rate $" value={customRate} onChange={e => setCustomRate(e.target.value)}
                  style={{ width: "100%", background: "#0A0A0A", border: "1px solid #333", borderRadius: 4, padding: "8px 12px", color: "#FFF", fontFamily: mono, fontSize: 16, fontWeight: 700, boxSizing: "border-box" }} />
              )}
            </div>

            <div style={{ background: "#161616", border: "1px solid #C9A84C", borderRadius: 6, padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 10, color: "#C9A84C", letterSpacing: 2, fontWeight: 700 }}>TOTAL THIS WEEK</div>
                <div style={{ fontSize: 11, color: "#444", marginTop: 2 }}>{sessions} sessions · {memberships} memberships</div>
              </div>
              <div style={{ fontSize: 36, fontWeight: 700, color: "#C9A84C" }}>{fmt(studioIncome)}</div>
            </div>
          </div>

          <div style={{ borderTop: "1px solid #1E1E1E" }}>
            <div style={{ padding: "14px 20px 8px", fontSize: 10, color: "#C9A84C", letterSpacing: 2, fontWeight: 700 }}>YOUR SPLIT</div>
            {ACCOUNTS.map(a => <SplitRow key={a.key} acct={a} amount={studioIncome} />)}
          </div>

          <div style={{ padding: 20 }}>
            <div style={{ background: "#0D1F0D", border: "1px solid #2A5A2A", borderLeft: "4px solid #5BC4A0", borderRadius: 6, padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#5BC4A0" }}>🎉 THIS WEEKEND</div>
                <div style={{ fontSize: 10, color: "#3A7A5A", marginTop: 2 }}>Your family memory budget</div>
              </div>
              <div style={{ fontSize: 32, fontWeight: 700, color: "#5BC4A0" }}>{fmt(studioIncome * 0.083)}</div>
            </div>
            <button onClick={() => logWeek()} style={{ width: "100%", padding: "14px 0", border: "none", background: "#C9A84C", color: "#0A0A0A", fontFamily: mono, fontWeight: 700, fontSize: 13, letterSpacing: 1, cursor: "pointer", borderRadius: 6 }}>
              LOG THIS WEEK →
            </button>
          </div>
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
          <div style={{ fontSize: 10, color: "#C9A84C", letterSpacing: 2, marginBottom: 16, fontWeight: 700 }}>COMPOUNDING ACCOUNTS</div>
          {[
            { label: "🧒 Son's Savings", key: "son",       color: "#6BA3E8", target: 6000 },
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
                <div style={{ fontSize: 10, color: "#444", marginTop: 2 }}>{w.sessions} sessions · {w.memberships} memberships · {w.date}</div>
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

      <div style={{ padding: "16px 20px", borderTop: "1px solid #1E1E1E", display: "flex", justifyContent: "space-between" }}>
        <div style={{ fontSize: 9, color: "#333", letterSpacing: 1 }}>KHAN MONEY OS · ADMIN</div>
        <div style={{ fontSize: 9, color: "#333" }}>Every dollar has a job.</div>
      </div>
    </div>
  );
}

export default function App() {
  const [mode, setMode]                 = useState<"admin" | "helper" | null>(null);
  const [pendingSubmission, setPending] = useState<Submission | null>(null);

  if (mode === null) {
    return (
      <div style={{ minHeight: "100vh", background: "#0A0A0A", fontFamily: mono, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 30 }}>
        <div style={{ fontSize: 11, color: "#C9A84C", letterSpacing: 4, fontWeight: 700, marginBottom: 6 }}>KHAN</div>
        <div style={{ fontSize: 26, fontWeight: 700, color: "#FFF", marginBottom: 4 }}>Money OS</div>
        <div style={{ fontSize: 11, color: "#444", marginBottom: 50 }}>Studio · Tax Deeds · Personal</div>

        <div style={{ width: "100%", maxWidth: 340 }}>
          <button onClick={() => setMode("admin")} style={{ width: "100%", padding: 20, marginBottom: 12, border: "2px solid #C9A84C", background: "#161616", borderRadius: 8, cursor: "pointer", fontFamily: mono, textAlign: "left" }}>
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
  }

  if (mode === "helper") {
    return (
      <div>
        <button onClick={() => setMode(null)} style={{ position: "fixed", top: 12, right: 12, background: "#161616", border: "1px solid #333", color: "#555", padding: "6px 12px", borderRadius: 4, cursor: "pointer", fontFamily: mono, fontSize: 10, zIndex: 100 }}>← BACK</button>
        <HelperView onSubmit={(data) => { setPending(data); setMode("admin"); }} lastSubmission={pendingSubmission} />
      </div>
    );
  }

  return (
    <div>
      <button onClick={() => setMode(null)} style={{ position: "fixed", top: 12, right: 12, background: "#161616", border: "1px solid #333", color: "#555", padding: "6px 12px", borderRadius: 4, cursor: "pointer", fontFamily: mono, fontSize: 10, zIndex: 100 }}>⇄ SWITCH</button>
      <AdminView pendingSubmission={pendingSubmission} onClearPending={() => setPending(null)} />
    </div>
  );
}
