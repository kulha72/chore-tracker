import { useState, useEffect, useCallback, useRef } from "react";

const INITIAL_STATE = {
  members: [
    { id: "p1", name: "Mom", avatar: "👩‍🚀", role: "parent", xp: 0, tokens: 0, level: 1, streak: 0 },
    { id: "p2", name: "Dad", avatar: "🧑‍🚀", role: "parent", xp: 0, tokens: 0, level: 1, streak: 0 },
    { id: "k1", name: "Kid 1", avatar: "🚀", role: "kid", xp: 0, tokens: 0, level: 1, streak: 0 },
    { id: "k2", name: "Kid 2", avatar: "🛸", role: "kid", xp: 0, tokens: 0, level: 1, streak: 0 },
  ],
  quests: [
    { id: "d1", title: "Make Your Bed", description: "Sheets pulled up, pillow in place", type: "daily", xpReward: 5, tokenReward: 2, requiresApproval: true, assignedTo: null, isActive: true, audience: "kids" },
    { id: "d2", title: "Brush Teeth (Morning)", description: "2 full minutes!", type: "daily", xpReward: 5, tokenReward: 2, requiresApproval: false, assignedTo: null, isActive: true, audience: "kids" },
    { id: "d3", title: "Brush Teeth (Night)", description: "Don't forget to floss", type: "daily", xpReward: 5, tokenReward: 2, requiresApproval: false, assignedTo: null, isActive: true, audience: "kids" },
    { id: "d4", title: "Pick Up Toys", description: "Everything back where it belongs", type: "daily", xpReward: 8, tokenReward: 3, requiresApproval: true, assignedTo: null, isActive: true, audience: "kids" },
    { id: "d5", title: "Feed the Pet", description: "Fresh food and water", type: "daily", xpReward: 5, tokenReward: 2, requiresApproval: false, assignedTo: null, isActive: true, audience: "all" },
    { id: "d6", title: "Tidy the Living Room", description: "Pillows straight, blankets folded, floor clear", type: "daily", xpReward: 8, tokenReward: 3, requiresApproval: true, assignedTo: null, isActive: true, audience: "all" },
    { id: "d7", title: "Tidy the Family Room", description: "Put away games, remotes in place, no clutter", type: "daily", xpReward: 8, tokenReward: 3, requiresApproval: true, assignedTo: null, isActive: true, audience: "all" },
    { id: "d8", title: "Wipe Kitchen Table", description: "After a meal — spray and wipe, no crumbs", type: "daily", xpReward: 5, tokenReward: 2, requiresApproval: false, assignedTo: null, isActive: true, audience: "all" },
    { id: "d9", title: "Take Out Trash", description: "Kitchen trash to the bin outside", type: "daily", xpReward: 5, tokenReward: 2, requiresApproval: false, assignedTo: null, isActive: true, audience: "all" },
    { id: "d10", title: "Put Away Dishes", description: "Unload the dishwasher or dry rack", type: "daily", xpReward: 8, tokenReward: 3, requiresApproval: true, assignedTo: null, isActive: true, audience: "all" },
    { id: "w1", title: "Clean Your Room", description: "Full deep clean — floor, desk, closet", type: "weekly", xpReward: 20, tokenReward: 10, requiresApproval: true, assignedTo: null, isActive: true, audience: "kids" },
    { id: "w2", title: "Help With Yard Work", description: "30 minutes of outdoor help", type: "weekly", xpReward: 25, tokenReward: 12, requiresApproval: true, assignedTo: null, isActive: true, audience: "all" },
    { id: "w3", title: "Read for 1 Hour", description: "Any book, total across the week", type: "weekly", xpReward: 15, tokenReward: 8, requiresApproval: true, assignedTo: null, isActive: true, audience: "kids" },
    { id: "w4", title: "Clean a Bathroom", description: "Toilet, sink, mirror, floor — the whole deal", type: "weekly", xpReward: 25, tokenReward: 12, requiresApproval: true, assignedTo: null, isActive: true, audience: "all" },
    { id: "w5", title: "Vacuum a Room", description: "Pick a room, move furniture, get the edges", type: "weekly", xpReward: 15, tokenReward: 8, requiresApproval: true, assignedTo: null, isActive: true, audience: "all" },
    { id: "w6", title: "Mop the Kitchen Floor", description: "Sweep first, then mop the whole floor", type: "weekly", xpReward: 20, tokenReward: 10, requiresApproval: true, assignedTo: null, isActive: true, audience: "all" },
    { id: "w7", title: "Do a Load of Laundry", description: "Wash, dry, fold, AND put away", type: "weekly", xpReward: 25, tokenReward: 12, requiresApproval: true, assignedTo: null, isActive: true, audience: "all" },
    { id: "w8", title: "Dust the House", description: "Shelves, windowsills, and surfaces in 2+ rooms", type: "weekly", xpReward: 15, tokenReward: 8, requiresApproval: true, assignedTo: null, isActive: true, audience: "all" },
    { id: "ad1", title: "Cook Dinner", description: "Plan, prep, cook, and serve a full meal", type: "daily", xpReward: 15, tokenReward: 5, requiresApproval: false, assignedTo: null, isActive: true, audience: "adults" },
    { id: "ad2", title: "Pack Lunches", description: "Lunches prepped and packed for tomorrow", type: "daily", xpReward: 8, tokenReward: 3, requiresApproval: false, assignedTo: null, isActive: true, audience: "adults" },
    { id: "ad3", title: "Run the Dishwasher", description: "Load it up, run it, put away when done", type: "daily", xpReward: 8, tokenReward: 3, requiresApproval: false, assignedTo: null, isActive: true, audience: "adults" },
    { id: "ad4", title: "Wipe Down Kitchen", description: "Counters, stovetop, and sink — full wipe", type: "daily", xpReward: 8, tokenReward: 3, requiresApproval: false, assignedTo: null, isActive: true, audience: "adults" },
    { id: "ad5", title: "Sort the Mail", description: "Open, file, recycle — no pile-ups", type: "daily", xpReward: 5, tokenReward: 2, requiresApproval: false, assignedTo: null, isActive: true, audience: "adults" },
    { id: "aw1", title: "Mow the Lawn", description: "Full mow, trim edges, blow off driveway", type: "weekly", xpReward: 30, tokenReward: 15, requiresApproval: false, assignedTo: null, isActive: true, audience: "adults" },
    { id: "aw2", title: "Grocery Shopping", description: "Plan the list, shop, and put everything away", type: "weekly", xpReward: 25, tokenReward: 12, requiresApproval: false, assignedTo: null, isActive: true, audience: "adults" },
    { id: "aw3", title: "Deep Clean Kitchen", description: "Appliances, inside fridge, scrub sink", type: "weekly", xpReward: 30, tokenReward: 15, requiresApproval: false, assignedTo: null, isActive: true, audience: "adults" },
    { id: "aw4", title: "Meal Prep Sunday", description: "Prep ingredients or full meals for the week", type: "weekly", xpReward: 30, tokenReward: 15, requiresApproval: false, assignedTo: null, isActive: true, audience: "adults" },
    { id: "aw5", title: "Pay Bills / Budget Check", description: "Review finances, pay due bills, update budget", type: "weekly", xpReward: 20, tokenReward: 10, requiresApproval: false, assignedTo: null, isActive: true, audience: "adults" },
    { id: "aw6", title: "Organize a Closet or Drawer", description: "Pick one, purge, reorganize", type: "weekly", xpReward: 20, tokenReward: 10, requiresApproval: false, assignedTo: null, isActive: true, audience: "adults" },
    { id: "aw7", title: "Car Maintenance", description: "Wash, vacuum, check fluids, or tire pressure", type: "weekly", xpReward: 20, tokenReward: 10, requiresApproval: false, assignedTo: null, isActive: true, audience: "adults" },
  ],
  mysteryPool: [
    { title: "Surprise Sweep", description: "Sweep the kitchen floor without being asked", xpReward: 12, tokenReward: 6 },
    { title: "Kindness Mission", description: "Do something nice for your sibling", xpReward: 10, tokenReward: 5 },
    { title: "Laundry Cadet", description: "Help fold one load of laundry", xpReward: 15, tokenReward: 7 },
    { title: "Dish Duty", description: "Help load or unload the dishwasher", xpReward: 12, tokenReward: 6 },
    { title: "Weed Warrior", description: "Pull 20 weeds from the garden", xpReward: 15, tokenReward: 8 },
  ],
  rewards: [
    { id: "r1", title: "Pick Tonight's Dessert", tokenCost: 10, isAvailable: true },
    { id: "r2", title: "30 Min Extra Screen Time", tokenCost: 20, isAvailable: true },
    { id: "r3", title: "Pick Family Movie", tokenCost: 50, isAvailable: true },
    { id: "r4", title: "Skip One Chore (Free Pass)", tokenCost: 35, isAvailable: true },
    { id: "r5", title: "Special Outing of Your Choice", tokenCost: 100, isAvailable: true },
  ],
  adultRewards: [
    { id: "ar1", title: "Sleep In Saturday", tokenCost: 30, isAvailable: true },
    { id: "ar2", title: "Solo Coffee Shop Trip", tokenCost: 20, isAvailable: true },
    { id: "ar3", title: "Pick the Takeout Restaurant", tokenCost: 15, isAvailable: true },
    { id: "ar4", title: "Guilt-Free Gaming/Hobby Hour", tokenCost: 25, isAvailable: true },
    { id: "ar5", title: "Skip Cooking — Order In", tokenCost: 40, isAvailable: true },
    { id: "ar6", title: "Date Night Out", tokenCost: 80, isAvailable: true },
  ],
  coopMission: {
    title: "Asteroid Belt Challenge",
    description: "The whole crew needs to earn 80 XP combined this week!",
    targetXp: 80,
    currentXp: 0,
    reward: "Family Ice Cream Trip 🍦",
    weekStart: new Date().toISOString(),
  },
  completions: [],
  todayMystery: null,
  activityLog: [],
  weekStart: new Date().toISOString(),
};

const LEVEL_TITLES = ["Cadet", "Ensign", "Pilot", "Captain", "Commander", "Admiral", "Star Lord", "Galaxy Hero", "Cosmic Legend", "Supreme Explorer"];
const LEVEL_THRESHOLDS = [0, 30, 75, 140, 230, 350, 500, 700, 950, 1250];
const PARENT_PIN = "1234";

function getLevel(xp) {
  let lvl = 0;
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) { lvl = i; break; }
  }
  return lvl;
}

function getLevelProgress(xp) {
  const lvl = getLevel(xp);
  if (lvl >= LEVEL_THRESHOLDS.length - 1) return 100;
  const cur = xp - LEVEL_THRESHOLDS[lvl];
  const needed = LEVEL_THRESHOLDS[lvl + 1] - LEVEL_THRESHOLDS[lvl];
  return Math.round((cur / needed) * 100);
}

function isToday(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  return d.toDateString() === now.toDateString();
}

function isThisWeek(dateStr, weekStart) {
  if (!dateStr || !weekStart) return false;
  const d = new Date(dateStr);
  const ws = new Date(weekStart);
  const now = new Date();
  return d >= ws && d <= now;
}

function daysUntilSunday() {
  const now = new Date();
  const day = now.getDay();
  return day === 0 ? 7 : 7 - day;
}

function speak(text) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text.replace(/[🔮⚡🏆🌟🤝🪙🎁📡🛒]/g, ""));
  utter.rate = 0.9;
  utter.pitch = 1.1;
  window.speechSynthesis.speak(utter);
}

function SpeakBtn({ text, size }) {
  const sz = size || 28;
  return (
    <button
      onClick={(e) => { e.stopPropagation(); speak(text); }}
      aria-label={`Read aloud: ${text}`}
      style={{
        background: "rgba(0,255,204,0.1)",
        border: "1px solid rgba(0,255,204,0.25)",
        borderRadius: "50%",
        width: sz,
        height: sz,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        flexShrink: 0,
        fontSize: sz * 0.46,
        lineHeight: 1,
        padding: 0,
        transition: "all 0.2s",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(0,255,204,0.25)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(0,255,204,0.1)"; }}
    >🔊</button>
  );
}

function Stars() {
  const stars = useRef(
    Array.from({ length: 80 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 2.5 + 0.5,
      delay: Math.random() * 4,
      duration: Math.random() * 3 + 2,
    }))
  );
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
      {stars.current.map((s) => (
        <div
          key={s.id}
          style={{
            position: "absolute",
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: s.size,
            height: s.size,
            borderRadius: "50%",
            background: "#fff",
            opacity: 0.6,
            animation: `twinkle ${s.duration}s ease-in-out ${s.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

function XpPopup({ amount, position }) {
  return (
    <div
      style={{
        position: "fixed",
        left: position?.x || "50%",
        top: position?.y || "40%",
        transform: "translate(-50%, -50%)",
        fontSize: 48,
        fontFamily: "'Orbitron', sans-serif",
        fontWeight: 900,
        color: "#00ffcc",
        textShadow: "0 0 20px #00ffcc, 0 0 40px #00ffcc88",
        animation: "xpFloat 1.5s ease-out forwards",
        zIndex: 9999,
        pointerEvents: "none",
      }}
    >
      +{amount} XP
    </div>
  );
}

function ConfettiEffect() {
  const particles = useRef(
    Array.from({ length: 40 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      color: ["#00ffcc", "#ff6bff", "#ffd700", "#00aaff", "#ff4444"][Math.floor(Math.random() * 5)],
      delay: Math.random() * 0.5,
      size: Math.random() * 6 + 4,
    }))
  );
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 9998 }}>
      {particles.current.map((p) => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            left: `${p.left}%`,
            top: -20,
            width: p.size,
            height: p.size,
            background: p.color,
            borderRadius: Math.random() > 0.5 ? "50%" : "2px",
            animation: `confettiFall 2s ease-in ${p.delay}s forwards`,
          }}
        />
      ))}
    </div>
  );
}

export default function FamilyQuestBoard() {
  const [state, setState] = useState(INITIAL_STATE);
  const [view, setView] = useState("select");
  const [selectedMember, setSelectedMember] = useState(null);
  const [activeUser, setActiveUser] = useState(null);
  const [xpPopup, setXpPopup] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);
  const [editingQuest, setEditingQuest] = useState(null);
  const [editingReward, setEditingReward] = useState(null);
  const [editingMember, setEditingMember] = useState(null);
  const [editCoopOpen, setEditCoopOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const [hasLoaded, setHasLoaded] = useState(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem("questboard-state");
      if (raw) {
        const saved = JSON.parse(raw);
        setState((prev) => ({ ...prev, ...saved }));
      }
    } catch (e) { /* first run */ }
    setHasLoaded(true);
  }, []);

  const saveState = useCallback((newState) => {
    setState(newState);
    try {
      localStorage.setItem("questboard-state", JSON.stringify(newState));
    } catch (e) { /* silent */ }
  }, []);

  useEffect(() => {
    if (!hasLoaded) return;
    if (!state.todayMystery || !isToday(state.todayMystery?.createdAt)) {
      if (state.mysteryPool.length > 0) {
        const pick = state.mysteryPool[Math.floor(Math.random() * state.mysteryPool.length)];
        const mystery = {
          id: "mystery-" + Date.now(),
          title: "🔮 " + pick.title,
          description: pick.description,
          type: "mystery",
          xpReward: pick.xpReward,
          tokenReward: pick.tokenReward,
          requiresApproval: true,
          assignedTo: null,
          isActive: true,
        };
        const newState = { ...state, todayMystery: { ...mystery, createdAt: new Date().toISOString() } };
        saveState(newState);
      }
    }
  }, [hasLoaded]);

  const showToast = (msg) => {
    setToast(msg);
    speak(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const triggerXp = (amount) => {
    setXpPopup(amount);
    setTimeout(() => setXpPopup(null), 1600);
  };

  const triggerConfetti = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 2500);
  };

  const completeQuest = (questId, memberId) => {
    const quest = [...state.quests, state.todayMystery].find((q) => q?.id === questId);
    if (!quest) return;
    const already = state.completions.find(
      (c) => c.questId === questId && c.memberId === memberId &&
        ((quest.type === "daily" || quest.type === "mystery") ? isToday(c.completedAt) : isThisWeek(c.completedAt, state.weekStart))
    );
    if (already) { showToast("Already completed!"); return; }
    const member = state.members.find((m) => m.id === memberId);
    const needsApproval = quest.requiresApproval && member?.role !== "parent";
    const completion = {
      id: "c-" + Date.now(),
      questId,
      memberId,
      completedAt: new Date().toISOString(),
      status: needsApproval ? "pending_approval" : "approved",
    };
    let members = [...state.members];
    if (!needsApproval) {
      members = members.map((m) =>
        m.id === memberId
          ? { ...m, xp: m.xp + quest.xpReward, tokens: m.tokens + quest.tokenReward, level: getLevel(m.xp + quest.xpReward) }
          : m
      );
      triggerXp(quest.xpReward);
    }
    const coopMission = { ...state.coopMission };
    if (!needsApproval) {
      coopMission.currentXp = (coopMission.currentXp || 0) + quest.xpReward;
      if (coopMission.currentXp >= coopMission.targetXp && (coopMission.currentXp - quest.xpReward) < coopMission.targetXp) {
        triggerConfetti();
        showToast("🎉 CO-OP MISSION COMPLETE! " + coopMission.reward);
      }
    }
    const memberName = member?.name;
    const log = [
      { text: `${memberName} completed "${quest.title}"${needsApproval ? " (pending approval)" : ""}`, time: new Date().toISOString() },
      ...state.activityLog.slice(0, 19),
    ];
    saveState({ ...state, completions: [...state.completions, completion], members, coopMission, activityLog: log });
    if (needsApproval) showToast("Submitted for approval! ⏳");
    else showToast(`+${quest.xpReward} XP, +${quest.tokenReward} tokens! ⚡`);
  };

  const approveCompletion = (completionId, approved) => {
    let members = [...state.members];
    let coopMission = { ...state.coopMission };
    const completions = state.completions.map((c) => {
      if (c.id === completionId) {
        if (approved) {
          const quest = [...state.quests, state.todayMystery].find((q) => q?.id === c.questId);
          if (quest) {
            members = members.map((m) =>
              m.id === c.memberId
                ? { ...m, xp: m.xp + quest.xpReward, tokens: m.tokens + quest.tokenReward, level: getLevel(m.xp + quest.xpReward) }
                : m
            );
            coopMission.currentXp = (coopMission.currentXp || 0) + quest.xpReward;
          }
        }
        return { ...c, status: approved ? "approved" : "rejected" };
      }
      return c;
    });
    saveState({ ...state, completions, members, coopMission });
    showToast(approved ? "Quest approved! ✅" : "Quest rejected ❌");
  };

  const redeemReward = (rewardId, memberId) => {
    const reward = state.rewards.find((r) => r.id === rewardId);
    const member = state.members.find((m) => m.id === memberId);
    if (!reward || !member || member.tokens < reward.tokenCost) {
      showToast("Not enough tokens!");
      return;
    }
    const members = state.members.map((m) =>
      m.id === memberId ? { ...m, tokens: m.tokens - reward.tokenCost } : m
    );
    const log = [
      { text: `${member.name} redeemed "${reward.title}"!`, time: new Date().toISOString() },
      ...state.activityLog.slice(0, 19),
    ];
    saveState({ ...state, members, activityLog: log });
    triggerConfetti();
    showToast(`🎁 ${reward.title} redeemed!`);
  };

  const isQuestDone = (questId, memberId, type) => {
    return state.completions.some(
      (c) => c.questId === questId && c.memberId === memberId && c.status !== "rejected" &&
        ((type === "daily" || type === "mystery") ? isToday(c.completedAt) : isThisWeek(c.completedAt, state.weekStart))
    );
  };

  const pendingApprovals = state.completions.filter((c) => c.status === "pending_approval");

  const kids = state.members.filter((m) => m.role === "kid");
  const adults = state.members.filter((m) => m.role === "parent");
  const allQuests = [...state.quests.filter((q) => q.isActive), state.todayMystery].filter(Boolean);

  const getQuestMembers = (quest) => {
    const aud = quest.audience || "kids";
    if (aud === "adults") return adults;
    if (aud === "all") return [...kids, ...adults];
    return kids;
  };

  const renderSelectScreen = () => (
    <div style={{ padding: "40px 24px", maxWidth: 500, margin: "0 auto", textAlign: "center" }}>
      <div style={{ fontSize: 48, marginBottom: 8 }}>⚡</div>
      <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 22, color: "#fff", fontWeight: 900, letterSpacing: 2, marginBottom: 6 }}>QUEST BOARD</div>
      <div style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 14, color: "#666", marginBottom: 36 }}>Who's checking in?</div>

      <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 11, color: "#00ffcc", letterSpacing: 1, marginBottom: 12 }}>👾 CREW</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
        {kids.map((kid) => (
          <button
            key={kid.id}
            onClick={() => { setActiveUser(kid.id); setView("board"); }}
            style={{
              background: "linear-gradient(135deg, rgba(0,255,204,0.08), rgba(120,80,255,0.08))",
              border: "1px solid rgba(0,255,204,0.25)",
              borderRadius: 14,
              padding: "16px 20px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 14,
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#00ffcc"; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(0,255,204,0.25)"; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            <div style={{ fontSize: 36 }}>{kid.avatar}</div>
            <div style={{ textAlign: "left", flex: 1 }}>
              <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 16, color: "#fff", fontWeight: 700 }}>{kid.name}</div>
              <div style={{ fontSize: 12, color: "#00ffcc", fontFamily: "'Exo 2', sans-serif", marginTop: 2 }}>
                {LEVEL_TITLES[kid.level]} · {kid.xp} XP · {kid.tokens} 🪙
              </div>
            </div>
            <SpeakBtn text={`${kid.name}. ${LEVEL_TITLES[kid.level]}. ${kid.xp} X P. ${kid.tokens} tokens. Tap to sign in.`} size={28} />
          </button>
        ))}
      </div>

      <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 11, color: "#7850ff", letterSpacing: 1, marginBottom: 12 }}>👨‍🚀 ADULTS</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {adults.map((adult) => (
          <button
            key={adult.id}
            onClick={() => { setActiveUser(adult.id); setView("board"); }}
            style={{
              background: "linear-gradient(135deg, rgba(120,80,255,0.08), rgba(255,107,255,0.08))",
              border: "1px solid rgba(120,80,255,0.25)",
              borderRadius: 14,
              padding: "16px 20px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 14,
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#7850ff"; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(120,80,255,0.25)"; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            <div style={{ fontSize: 36 }}>{adult.avatar}</div>
            <div style={{ textAlign: "left", flex: 1 }}>
              <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 16, color: "#fff", fontWeight: 700 }}>{adult.name}</div>
              <div style={{ fontSize: 12, color: "#7850ff", fontFamily: "'Exo 2', sans-serif", marginTop: 2 }}>
                {adult.xp} XP · {adult.tokens} 🪙
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderBoard = () => {
    const me = state.members.find((m) => m.id === activeUser);
    if (!me) return renderSelectScreen();
    const isAdultUser = me.role === "parent";
    const myAudiences = isAdultUser ? ["adults", "all"] : ["kids", "all"];
    const myQuests = allQuests.filter((q) => myAudiences.includes(q.audience || "kids"));

    return (
    <div style={{ padding: "20px 24px", maxWidth: 900, margin: "0 auto" }}>
      {/* Signed-in user bar */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        marginBottom: 20, padding: "10px 16px",
        background: isAdultUser ? "rgba(120,80,255,0.08)" : "rgba(0,255,204,0.08)",
        border: `1px solid ${isAdultUser ? "rgba(120,80,255,0.2)" : "rgba(0,255,204,0.2)"}`,
        borderRadius: 12,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ fontSize: 28 }}>{me.avatar}</div>
          <div>
            <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 14, color: "#fff", fontWeight: 700 }}>{me.name}</div>
            <div style={{ fontSize: 11, color: isAdultUser ? "#7850ff" : "#00ffcc", fontFamily: "'Exo 2', sans-serif" }}>
              {isAdultUser ? "" : (LEVEL_TITLES[me.level] + " · ")}{me.xp} XP · {me.tokens} 🪙
            </div>
          </div>
          {!isAdultUser && <SpeakBtn text={`${me.name}. ${LEVEL_TITLES[me.level]}. ${me.xp} X P. ${me.tokens} tokens.`} size={22} />}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => { setSelectedMember(me.id); setView(isAdultUser ? "adult" : "kid"); }}
            style={{
              background: "rgba(255,215,0,0.1)", border: "1px solid rgba(255,215,0,0.3)",
              borderRadius: 8, padding: "5px 12px", cursor: "pointer",
              color: "#ffd700", fontSize: 11, fontFamily: "'Orbitron', sans-serif",
            }}
          >🛒 Shop</button>
          <button
            onClick={() => { setActiveUser(null); setView("select"); }}
            style={{
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 8, padding: "5px 12px", cursor: "pointer",
              color: "#888", fontSize: 11, fontFamily: "'Orbitron', sans-serif",
            }}
          >Switch</button>
        </div>
      </div>

      {/* Co-op Mission */}
      <div style={{
        background: "linear-gradient(135deg, rgba(255,107,255,0.12), rgba(0,170,255,0.12))",
        border: "1px solid rgba(255,107,255,0.3)",
        borderRadius: 16,
        padding: "16px 20px",
        marginBottom: 24,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <SpeakBtn text={`Co-op mission: ${state.coopMission.title}. ${state.coopMission.description}. Reward: ${state.coopMission.reward}. Progress: ${state.coopMission.currentXp} out of ${state.coopMission.targetXp} X P.`} size={26} />
            <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 13, color: "#ff6bff", fontWeight: 700 }}>🤝 CO-OP MISSION</span>
            <span style={{ fontSize: 13, color: "#ccc", marginLeft: 4, fontFamily: "'Exo 2', sans-serif" }}>{state.coopMission.title}</span>
          </div>
          <span style={{ fontSize: 12, color: "#ffd700", fontFamily: "'Exo 2', sans-serif" }}>Reward: {state.coopMission.reward}</span>
        </div>
        <div style={{ fontSize: 12, color: "#aaa", fontFamily: "'Exo 2', sans-serif", marginBottom: 8 }}>{state.coopMission.description}</div>
        <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 6, height: 12, overflow: "hidden", position: "relative" }}>
          <div style={{
            background: state.coopMission.currentXp >= state.coopMission.targetXp
              ? "linear-gradient(90deg, #ffd700, #ff6bff)"
              : "linear-gradient(90deg, #ff6bff, #00aaff)",
            height: "100%",
            width: `${Math.min(100, (state.coopMission.currentXp / state.coopMission.targetXp) * 100)}%`,
            borderRadius: 6,
            transition: "width 0.5s",
          }} />
        </div>
        <div style={{ textAlign: "right", fontSize: 12, color: "#ddd", marginTop: 4, fontFamily: "'Exo 2', sans-serif" }}>
          {state.coopMission.currentXp} / {state.coopMission.targetXp} XP
          {state.coopMission.currentXp >= state.coopMission.targetXp && " ✅ COMPLETE!"}
        </div>
      </div>

      {/* Weekly countdown */}
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <span style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 13, color: "#7850ff" }}>
          ⏱ {daysUntilSunday()} days until weekly reset
        </span>
      </div>

      {/* Quest Sections - filtered by signed-in user */}
      {["daily", "mystery", "weekly"].map((type) => {
        const quests = myQuests.filter((q) => q.type === type);
        if (quests.length === 0) return null;
        const label = type === "daily" ? "🌟 Daily Missions" : type === "mystery" ? "🔮 Mystery Quest" : "🏆 Weekly Missions";
        const borderColor = type === "daily" ? "rgba(0,255,204,0.2)" : type === "mystery" ? "rgba(255,215,0,0.3)" : "rgba(120,80,255,0.2)";
        return (
          <div key={type} style={{ marginBottom: 20 }}>
            <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 13, color: type === "mystery" ? "#ffd700" : "#888", marginBottom: 10, letterSpacing: 1 }}>{label}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {quests.map((quest) => {
                const audienceTag = (quest.audience || "kids") === "all" ? "👨‍👩‍👧‍👦" : null;
                return (
                <div key={quest.id} style={{
                  background: type === "mystery" ? "linear-gradient(135deg, rgba(255,215,0,0.08), rgba(255,107,255,0.08))" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${borderColor}`,
                  borderRadius: 12,
                  padding: "12px 16px",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <SpeakBtn text={quest.title + (quest.description ? ". " + quest.description : "") + ". Worth " + quest.xpReward + " X P and " + quest.tokenReward + " tokens"} size={30} />
                      <div>
                        <div style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 15, color: "#eee", fontWeight: 600 }}>
                          {quest.title}
                          {audienceTag && <span style={{ marginLeft: 6, fontSize: 12 }} title="Crew quest">{audienceTag}</span>}
                        </div>
                        {quest.description && <div style={{ fontSize: 12, color: "#888", marginTop: 2, fontFamily: "'Exo 2', sans-serif" }}>{quest.description}</div>}
                      </div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 16 }}>
                      <div style={{ fontSize: 13, color: "#00ffcc", fontFamily: "'Orbitron', sans-serif", fontWeight: 700 }}>+{quest.xpReward} XP</div>
                      <div style={{ fontSize: 11, color: "#ffd700" }}>+{quest.tokenReward} 🪙</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                    {getQuestMembers(quest).map((member) => {
                      const done = isQuestDone(quest.id, member.id, quest.type);
                      const pending = state.completions.some(
                        (c) => c.questId === quest.id && c.memberId === member.id && c.status === "pending_approval" &&
                          ((quest.type === "daily" || quest.type === "mystery") ? isToday(c.completedAt) : isThisWeek(c.completedAt, state.weekStart))
                      );
                      const isSelf = member.id === activeUser;
                      const memberIsAdult = member.role === "parent";
                      return (
                        <button
                          key={member.id}
                          onClick={() => !done && completeQuest(quest.id, member.id)}
                          disabled={done}
                          style={{
                            background: done ? (pending ? "rgba(255,215,0,0.15)" : "rgba(0,255,204,0.15)") : isSelf ? (memberIsAdult ? "rgba(120,80,255,0.15)" : "rgba(0,255,204,0.1)") : "rgba(255,255,255,0.05)",
                            border: `1px solid ${done ? (pending ? "rgba(255,215,0,0.4)" : "rgba(0,255,204,0.4)") : isSelf ? (memberIsAdult ? "rgba(120,80,255,0.4)" : "rgba(0,255,204,0.3)") : "rgba(255,255,255,0.1)"}`,
                            borderRadius: 8,
                            padding: "6px 14px",
                            cursor: done ? "default" : "pointer",
                            color: done ? (pending ? "#ffd700" : "#00ffcc") : isSelf ? "#fff" : "#aaa",
                            fontSize: 12,
                            fontFamily: "'Exo 2', sans-serif",
                            fontWeight: isSelf ? 700 : 600,
                            transition: "all 0.2s",
                            opacity: done ? 0.7 : 1,
                          }}
                        >
                          {member.avatar} {member.name} {done ? (pending ? "⏳" : "✅") : ""}
                        </button>
                      );
                    })}
                  </div>
                </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Activity Log */}
      {state.activityLog.length > 0 && (
        <div style={{ marginTop: 24, padding: "12px 16px", background: "rgba(255,255,255,0.02)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 11, color: "#555", marginBottom: 8, letterSpacing: 1 }}>📡 MISSION LOG</div>
          {state.activityLog.slice(0, 5).map((entry, i) => (
            <div key={i} style={{ fontSize: 12, color: "#777", fontFamily: "'Exo 2', sans-serif", padding: "3px 0" }}>
              {entry.text}
            </div>
          ))}
        </div>
      )}
    </div>
    );
  };

  const renderAdultView = () => {
    const adult = state.members.find((m) => m.id === selectedMember);
    if (!adult) return null;
    const adultCompletionsToday = state.completions.filter((c) => c.memberId === adult.id && isToday(c.completedAt) && (c.status === "approved" || c.status === "done"));
    const adultCompletionsWeek = state.completions.filter((c) => c.memberId === adult.id && isThisWeek(c.completedAt, state.weekStart) && (c.status === "approved" || c.status === "done"));
    return (
      <div style={{ padding: "20px 24px", maxWidth: 600, margin: "0 auto" }}>
        <button onClick={() => setView("board")} style={{ background: "none", border: "none", color: "#7850ff", fontSize: 14, cursor: "pointer", fontFamily: "'Exo 2', sans-serif", marginBottom: 16 }}>← Back to Board</button>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 64 }}>{adult.avatar}</div>
          <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 22, color: "#fff", fontWeight: 700, marginTop: 8 }}>{adult.name}</div>
          <div style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 14, color: "#7850ff", marginTop: 4 }}>
            {LEVEL_TITLES[getLevel(adult.xp)]} · Level {getLevel(adult.xp) + 1}
          </div>
          <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 6, height: 10, margin: "12px auto", maxWidth: 300, overflow: "hidden" }}>
            <div style={{ background: "linear-gradient(90deg, #7850ff, #ff6bff)", height: "100%", width: `${getLevelProgress(adult.xp)}%`, borderRadius: 6 }} />
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 32, marginTop: 16 }}>
            <div>
              <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 28, color: "#7850ff", fontWeight: 900 }}>{adult.xp}</div>
              <div style={{ fontSize: 11, color: "#888", fontFamily: "'Exo 2', sans-serif" }}>Total XP</div>
            </div>
            <div>
              <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 28, color: "#ffd700", fontWeight: 900 }}>{adult.tokens}</div>
              <div style={{ fontSize: 11, color: "#888", fontFamily: "'Exo 2', sans-serif" }}>Tokens 🪙</div>
            </div>
            <div>
              <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 28, color: "#00ffcc", fontWeight: 900 }}>{adultCompletionsToday.length}</div>
              <div style={{ fontSize: 11, color: "#888", fontFamily: "'Exo 2', sans-serif" }}>Today</div>
            </div>
            <div>
              <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 28, color: "#ff6bff", fontWeight: 900 }}>{adultCompletionsWeek.length}</div>
              <div style={{ fontSize: 11, color: "#888", fontFamily: "'Exo 2', sans-serif" }}>This Week</div>
            </div>
          </div>
        </div>

        {/* Adult Loot Shop */}
        <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 13, color: "#7850ff", marginBottom: 12, letterSpacing: 1 }}>🛒 ADULT LOOT SHOP</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
          {(state.adultRewards || []).filter((r) => r.isAvailable).map((reward) => (
            <div key={reward.id} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              background: "rgba(120,80,255,0.06)", border: "1px solid rgba(120,80,255,0.2)", borderRadius: 10, padding: "10px 14px",
            }}>
              <div>
                <div style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 14, color: "#eee" }}>{reward.title}</div>
                <div style={{ fontSize: 12, color: "#ffd700" }}>{reward.tokenCost} 🪙</div>
              </div>
              <button
                onClick={() => {
                  if (adult.tokens < reward.tokenCost) { showToast("Not enough tokens!"); return; }
                  const members = state.members.map((m) => m.id === adult.id ? { ...m, tokens: m.tokens - reward.tokenCost } : m);
                  const log = [{ text: `${adult.name} redeemed "${reward.title}"!`, time: new Date().toISOString() }, ...state.activityLog.slice(0, 19)];
                  saveState({ ...state, members, activityLog: log });
                  triggerConfetti();
                  showToast(`🎁 ${reward.title} redeemed!`);
                }}
                disabled={adult.tokens < reward.tokenCost}
                style={{
                  background: adult.tokens >= reward.tokenCost ? "linear-gradient(135deg, #7850ff, #ff6bff)" : "rgba(255,255,255,0.05)",
                  border: "none", borderRadius: 8, padding: "6px 16px", cursor: adult.tokens >= reward.tokenCost ? "pointer" : "default",
                  color: adult.tokens >= reward.tokenCost ? "#fff" : "#555", fontFamily: "'Orbitron', sans-serif", fontSize: 11, fontWeight: 700,
                }}
              >
                Redeem
              </button>
            </div>
          ))}
        </div>

        {/* Quick Stats */}
        <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 11, color: "#555", marginBottom: 8, letterSpacing: 1 }}>📊 RECENT COMPLETIONS</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {state.completions
            .filter((c) => c.memberId === adult.id && (c.status === "approved" || c.status === "done"))
            .slice(-10).reverse()
            .map((c) => {
              const quest = [...state.quests, state.todayMystery].find((q) => q?.id === c.questId);
              return (
                <div key={c.id} style={{ fontSize: 12, color: "#777", fontFamily: "'Exo 2', sans-serif", padding: "3px 0" }}>
                  ✅ {quest?.title || "Unknown"} · {new Date(c.completedAt).toLocaleDateString()}
                </div>
              );
            })
          }
          {state.completions.filter((c) => c.memberId === adult.id).length === 0 && (
            <div style={{ fontSize: 12, color: "#555", fontFamily: "'Exo 2', sans-serif" }}>No completions yet — get started!</div>
          )}
        </div>
      </div>
    );
  };

  const renderKidView = () => {
    const kid = state.members.find((m) => m.id === selectedMember);
    if (!kid) return null;
    const kidCompletionsToday = state.completions.filter((c) => c.memberId === kid.id && isToday(c.completedAt) && c.status === "approved");
    return (
      <div style={{ padding: "20px 24px", maxWidth: 600, margin: "0 auto" }}>
        <button onClick={() => setView("board")} style={{ background: "none", border: "none", color: "#00ffcc", fontSize: 14, cursor: "pointer", fontFamily: "'Exo 2', sans-serif", marginBottom: 16 }}>← Back to Board</button>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 64 }}>{kid.avatar}</div>
          <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 22, color: "#fff", fontWeight: 700, marginTop: 8 }}>
            {kid.name}
            <span style={{ marginLeft: 10, verticalAlign: "middle" }}><SpeakBtn text={`${kid.name}. Level ${kid.level + 1}, ${LEVEL_TITLES[kid.level]}. You have ${kid.xp} X P and ${kid.tokens} tokens. You completed ${kidCompletionsToday.length} quests today.`} size={28} /></span>
          </div>
          <div style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 14, color: "#00ffcc", marginTop: 4 }}>
            Level {kid.level + 1} · {LEVEL_TITLES[kid.level]}
          </div>
          <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 6, height: 10, margin: "12px auto", maxWidth: 300, overflow: "hidden" }}>
            <div style={{ background: "linear-gradient(90deg, #00ffcc, #7850ff)", height: "100%", width: `${getLevelProgress(kid.xp)}%`, borderRadius: 6 }} />
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 32, marginTop: 16 }}>
            <div>
              <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 28, color: "#00ffcc", fontWeight: 900 }}>{kid.xp}</div>
              <div style={{ fontSize: 11, color: "#888", fontFamily: "'Exo 2', sans-serif" }}>Total XP</div>
            </div>
            <div>
              <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 28, color: "#ffd700", fontWeight: 900 }}>{kid.tokens}</div>
              <div style={{ fontSize: 11, color: "#888", fontFamily: "'Exo 2', sans-serif" }}>Tokens 🪙</div>
            </div>
            <div>
              <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 28, color: "#ff6bff", fontWeight: 900 }}>{kidCompletionsToday.length}</div>
              <div style={{ fontSize: 11, color: "#888", fontFamily: "'Exo 2', sans-serif" }}>Today</div>
            </div>
          </div>
        </div>

        {/* Loot Shop */}
        <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 13, color: "#ffd700", marginBottom: 12, letterSpacing: 1 }}>🛒 LOOT SHOP</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
          {state.rewards.filter((r) => r.isAvailable).map((reward) => (
            <div key={reward.id} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              background: "rgba(255,215,0,0.05)", border: "1px solid rgba(255,215,0,0.15)", borderRadius: 10, padding: "10px 14px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <SpeakBtn text={`${reward.title}. Costs ${reward.tokenCost} tokens.${kid.tokens >= reward.tokenCost ? " You can afford this!" : " You need " + (reward.tokenCost - kid.tokens) + " more tokens."}`} size={26} />
                <div>
                  <div style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 14, color: "#eee" }}>{reward.title}</div>
                  <div style={{ fontSize: 12, color: "#ffd700" }}>{reward.tokenCost} 🪙</div>
                </div>
              </div>
              <button
                onClick={() => redeemReward(reward.id, kid.id)}
                disabled={kid.tokens < reward.tokenCost}
                style={{
                  background: kid.tokens >= reward.tokenCost ? "linear-gradient(135deg, #ffd700, #ff6bff)" : "rgba(255,255,255,0.05)",
                  border: "none", borderRadius: 8, padding: "6px 16px", cursor: kid.tokens >= reward.tokenCost ? "pointer" : "default",
                  color: kid.tokens >= reward.tokenCost ? "#000" : "#555", fontFamily: "'Orbitron', sans-serif", fontSize: 11, fontWeight: 700,
                }}
              >
                Redeem
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderPinScreen = () => (
    <div style={{ padding: "40px 24px", maxWidth: 400, margin: "0 auto", textAlign: "center" }}>
      <button onClick={() => setView("board")} style={{ background: "none", border: "none", color: "#00ffcc", fontSize: 14, cursor: "pointer", fontFamily: "'Exo 2', sans-serif", marginBottom: 24, display: "block" }}>← Back</button>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
      <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 18, color: "#fff", marginBottom: 20 }}>Quest Master Access</div>
      <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 16 }}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, "", 0, "⌫"].map((key, i) => (
          <button
            key={i}
            onClick={() => {
              if (key === "⌫") setPinInput((p) => p.slice(0, -1));
              else if (key !== "") {
                const newPin = pinInput + key;
                setPinInput(newPin);
                if (newPin.length === 4) {
                  if (newPin === PARENT_PIN) { setView("parent"); setPinInput(""); setPinError(false); }
                  else { setPinError(true); setPinInput(""); }
                }
              }
            }}
            style={{
              width: key === "" ? 56 : 56, height: 56, background: key === "" ? "transparent" : "rgba(255,255,255,0.05)",
              border: key === "" ? "none" : "1px solid rgba(255,255,255,0.1)", borderRadius: 12,
              color: "#fff", fontSize: 20, cursor: key === "" ? "default" : "pointer",
              fontFamily: "'Exo 2', sans-serif",
              ...(i % 3 === 0 ? {} : {}),
            }}
          >
            {key}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 12 }}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={{
            width: 14, height: 14, borderRadius: "50%",
            background: i < pinInput.length ? "#00ffcc" : "rgba(255,255,255,0.1)",
            border: "1px solid rgba(0,255,204,0.3)",
          }} />
        ))}
      </div>
      {pinError && <div style={{ color: "#ff4444", fontSize: 13, fontFamily: "'Exo 2', sans-serif" }}>Wrong PIN. Try again.</div>}
      <div style={{ color: "#555", fontSize: 11, fontFamily: "'Exo 2', sans-serif", marginTop: 8 }}>Default PIN: 1234</div>
    </div>
  );

  const renderParent = () => (
    <div style={{ padding: "20px 24px", maxWidth: 700, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <button onClick={() => setView("board")} style={{ background: "none", border: "none", color: "#00ffcc", fontSize: 14, cursor: "pointer", fontFamily: "'Exo 2', sans-serif" }}>← Back to Board</button>
        <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 16, color: "#fff" }}>👨‍🚀 Quest Master HQ</div>
      </div>

      {/* Pending Approvals */}
      {pendingApprovals.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 13, color: "#ffd700", marginBottom: 10, letterSpacing: 1 }}>⏳ PENDING APPROVAL ({pendingApprovals.length})</div>
          {pendingApprovals.map((c) => {
            const quest = [...state.quests, state.todayMystery].find((q) => q?.id === c.questId);
            const member = state.members.find((m) => m.id === c.memberId);
            return (
              <div key={c.id} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                background: "rgba(255,215,0,0.06)", border: "1px solid rgba(255,215,0,0.2)", borderRadius: 10, padding: "10px 14px", marginBottom: 6,
              }}>
                <div>
                  <span style={{ color: "#fff", fontFamily: "'Exo 2', sans-serif", fontSize: 14 }}>{member?.avatar} {member?.name}</span>
                  <span style={{ color: "#888", fontSize: 13, marginLeft: 8 }}>→ {quest?.title}</span>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => approveCompletion(c.id, true)} style={{ background: "rgba(0,255,204,0.15)", border: "1px solid #00ffcc", borderRadius: 6, padding: "4px 12px", color: "#00ffcc", cursor: "pointer", fontSize: 12, fontFamily: "'Exo 2', sans-serif" }}>✓</button>
                  <button onClick={() => approveCompletion(c.id, false)} style={{ background: "rgba(255,68,68,0.15)", border: "1px solid #ff4444", borderRadius: 6, padding: "4px 12px", color: "#ff4444", cursor: "pointer", fontSize: 12, fontFamily: "'Exo 2', sans-serif" }}>✗</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Manage Family Members */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 13, color: "#888", marginBottom: 10, letterSpacing: 1 }}>👥 CREW MEMBERS</div>
        {state.members.map((m) => (
          <div key={m.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <span style={{ color: "#ddd", fontFamily: "'Exo 2', sans-serif" }}>{m.avatar} {m.name} ({m.role}) · {m.xp} XP · {m.tokens} 🪙</span>
            <button onClick={() => setEditingMember(editingMember === m.id ? null : m.id)} style={{ background: "none", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 6, padding: "3px 10px", color: "#aaa", cursor: "pointer", fontSize: 11 }}>Edit</button>
          </div>
        ))}
        {editingMember && (() => {
          const m = state.members.find((x) => x.id === editingMember);
          return (
            <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: 14, marginTop: 8, display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", gap: 8 }}>
                <input value={m.name} onChange={(e) => saveState({ ...state, members: state.members.map((x) => x.id === editingMember ? { ...x, name: e.target.value } : x) })} style={{ flex: 1, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 6, padding: "6px 10px", color: "#fff", fontFamily: "'Exo 2', sans-serif", fontSize: 13 }} placeholder="Name" />
                <input value={m.avatar} onChange={(e) => saveState({ ...state, members: state.members.map((x) => x.id === editingMember ? { ...x, avatar: e.target.value } : x) })} style={{ width: 60, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 6, padding: "6px 10px", color: "#fff", fontSize: 18, textAlign: "center" }} />
              </div>
              <button onClick={() => setEditingMember(null)} style={{ background: "rgba(0,255,204,0.1)", border: "1px solid #00ffcc", borderRadius: 6, padding: "5px 12px", color: "#00ffcc", cursor: "pointer", fontSize: 12, fontFamily: "'Exo 2', sans-serif", alignSelf: "flex-end" }}>Done</button>
            </div>
          );
        })()}
      </div>

      {/* Manage Quests */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 13, color: "#888", letterSpacing: 1 }}>📋 QUEST ROSTER</div>
          <button onClick={() => {
            const newQ = { id: "q-" + Date.now(), title: "New Quest", description: "", type: "daily", xpReward: 5, tokenReward: 2, requiresApproval: true, assignedTo: null, isActive: true, audience: "kids" };
            saveState({ ...state, quests: [...state.quests, newQ] });
            setEditingQuest(newQ.id);
          }} style={{ background: "rgba(0,255,204,0.1)", border: "1px solid #00ffcc", borderRadius: 6, padding: "4px 12px", color: "#00ffcc", cursor: "pointer", fontSize: 11, fontFamily: "'Orbitron', sans-serif" }}>+ Add Quest</button>
        </div>
        {state.quests.map((q) => (
          <div key={q.id}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <span style={{ color: q.isActive ? "#ddd" : "#555", fontFamily: "'Exo 2', sans-serif", fontSize: 13 }}>
                {q.title} <span style={{ color: "#666", fontSize: 11 }}>({q.type} · {q.audience || "kids"} · {q.xpReward}XP · {q.tokenReward}🪙{q.requiresApproval ? " · approval" : ""})</span>
              </span>
              <div style={{ display: "flex", gap: 4 }}>
                <button onClick={() => setEditingQuest(editingQuest === q.id ? null : q.id)} style={{ background: "none", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 6, padding: "3px 8px", color: "#aaa", cursor: "pointer", fontSize: 11 }}>Edit</button>
                <button onClick={() => saveState({ ...state, quests: state.quests.filter((x) => x.id !== q.id) })} style={{ background: "none", border: "1px solid rgba(255,68,68,0.3)", borderRadius: 6, padding: "3px 8px", color: "#ff4444", cursor: "pointer", fontSize: 11 }}>×</button>
              </div>
            </div>
            {editingQuest === q.id && (
              <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: 14, marginTop: 4, marginBottom: 4, display: "flex", flexDirection: "column", gap: 8 }}>
                <input value={q.title} onChange={(e) => saveState({ ...state, quests: state.quests.map((x) => x.id === q.id ? { ...x, title: e.target.value } : x) })} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 6, padding: "6px 10px", color: "#fff", fontFamily: "'Exo 2', sans-serif", fontSize: 13 }} placeholder="Quest title" />
                <input value={q.description || ""} onChange={(e) => saveState({ ...state, quests: state.quests.map((x) => x.id === q.id ? { ...x, description: e.target.value } : x) })} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 6, padding: "6px 10px", color: "#fff", fontFamily: "'Exo 2', sans-serif", fontSize: 13 }} placeholder="Description (optional)" />
                <div style={{ display: "flex", gap: 8 }}>
                  <select value={q.type} onChange={(e) => saveState({ ...state, quests: state.quests.map((x) => x.id === q.id ? { ...x, type: e.target.value } : x) })} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 6, padding: "6px 10px", color: "#fff", fontFamily: "'Exo 2', sans-serif", fontSize: 13 }}>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                  <select value={q.audience || "kids"} onChange={(e) => saveState({ ...state, quests: state.quests.map((x) => x.id === q.id ? { ...x, audience: e.target.value } : x) })} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 6, padding: "6px 10px", color: "#fff", fontFamily: "'Exo 2', sans-serif", fontSize: 13 }}>
                    <option value="kids">Kids Only</option>
                    <option value="adults">Adults Only</option>
                    <option value="all">Everyone</option>
                  </select>
                  <input type="number" value={q.xpReward} onChange={(e) => saveState({ ...state, quests: state.quests.map((x) => x.id === q.id ? { ...x, xpReward: parseInt(e.target.value) || 0 } : x) })} style={{ width: 70, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 6, padding: "6px 10px", color: "#00ffcc", fontFamily: "'Exo 2', sans-serif", fontSize: 13 }} />
                  <span style={{ color: "#888", alignSelf: "center", fontSize: 11 }}>XP</span>
                  <input type="number" value={q.tokenReward} onChange={(e) => saveState({ ...state, quests: state.quests.map((x) => x.id === q.id ? { ...x, tokenReward: parseInt(e.target.value) || 0 } : x) })} style={{ width: 70, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 6, padding: "6px 10px", color: "#ffd700", fontFamily: "'Exo 2', sans-serif", fontSize: 13 }} />
                  <span style={{ color: "#888", alignSelf: "center", fontSize: 11 }}>🪙</span>
                </div>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 6, color: "#aaa", fontSize: 12, fontFamily: "'Exo 2', sans-serif", cursor: "pointer" }}>
                    <input type="checkbox" checked={q.requiresApproval} onChange={(e) => saveState({ ...state, quests: state.quests.map((x) => x.id === q.id ? { ...x, requiresApproval: e.target.checked } : x) })} />
                    Requires approval
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: 6, color: "#aaa", fontSize: 12, fontFamily: "'Exo 2', sans-serif", cursor: "pointer" }}>
                    <input type="checkbox" checked={q.isActive} onChange={(e) => saveState({ ...state, quests: state.quests.map((x) => x.id === q.id ? { ...x, isActive: e.target.checked } : x) })} />
                    Active
                  </label>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Manage Kid Rewards */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 13, color: "#888", letterSpacing: 1 }}>🎁 KID LOOT SHOP</div>
          <button onClick={() => {
            const newR = { id: "r-" + Date.now(), title: "New Reward", tokenCost: 10, isAvailable: true };
            saveState({ ...state, rewards: [...state.rewards, newR] });
            setEditingReward(newR.id);
          }} style={{ background: "rgba(255,215,0,0.1)", border: "1px solid #ffd700", borderRadius: 6, padding: "4px 12px", color: "#ffd700", cursor: "pointer", fontSize: 11, fontFamily: "'Orbitron', sans-serif" }}>+ Add Reward</button>
        </div>
        {state.rewards.map((r) => (
          <div key={r.id}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <span style={{ color: "#ddd", fontFamily: "'Exo 2', sans-serif", fontSize: 13 }}>{r.title} <span style={{ color: "#ffd700", fontSize: 11 }}>({r.tokenCost} 🪙)</span></span>
              <div style={{ display: "flex", gap: 4 }}>
                <button onClick={() => setEditingReward(editingReward === r.id ? null : r.id)} style={{ background: "none", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 6, padding: "3px 8px", color: "#aaa", cursor: "pointer", fontSize: 11 }}>Edit</button>
                <button onClick={() => saveState({ ...state, rewards: state.rewards.filter((x) => x.id !== r.id) })} style={{ background: "none", border: "1px solid rgba(255,68,68,0.3)", borderRadius: 6, padding: "3px 8px", color: "#ff4444", cursor: "pointer", fontSize: 11 }}>×</button>
              </div>
            </div>
            {editingReward === r.id && (
              <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: 14, marginTop: 4, marginBottom: 4, display: "flex", gap: 8, alignItems: "center" }}>
                <input value={r.title} onChange={(e) => saveState({ ...state, rewards: state.rewards.map((x) => x.id === r.id ? { ...x, title: e.target.value } : x) })} style={{ flex: 1, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 6, padding: "6px 10px", color: "#fff", fontFamily: "'Exo 2', sans-serif", fontSize: 13 }} />
                <input type="number" value={r.tokenCost} onChange={(e) => saveState({ ...state, rewards: state.rewards.map((x) => x.id === r.id ? { ...x, tokenCost: parseInt(e.target.value) || 0 } : x) })} style={{ width: 70, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 6, padding: "6px 10px", color: "#ffd700", fontFamily: "'Exo 2', sans-serif", fontSize: 13 }} />
                <span style={{ color: "#888", fontSize: 11 }}>🪙</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Manage Adult Rewards */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 13, color: "#7850ff", letterSpacing: 1 }}>🎁 ADULT LOOT SHOP</div>
          <button onClick={() => {
            const newR = { id: "ar-" + Date.now(), title: "New Adult Reward", tokenCost: 20, isAvailable: true };
            saveState({ ...state, adultRewards: [...(state.adultRewards || []), newR] });
            setEditingReward(newR.id);
          }} style={{ background: "rgba(120,80,255,0.1)", border: "1px solid #7850ff", borderRadius: 6, padding: "4px 12px", color: "#7850ff", cursor: "pointer", fontSize: 11, fontFamily: "'Orbitron', sans-serif" }}>+ Add Reward</button>
        </div>
        {(state.adultRewards || []).map((r) => (
          <div key={r.id}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <span style={{ color: "#ddd", fontFamily: "'Exo 2', sans-serif", fontSize: 13 }}>{r.title} <span style={{ color: "#7850ff", fontSize: 11 }}>({r.tokenCost} 🪙)</span></span>
              <div style={{ display: "flex", gap: 4 }}>
                <button onClick={() => setEditingReward(editingReward === r.id ? null : r.id)} style={{ background: "none", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 6, padding: "3px 8px", color: "#aaa", cursor: "pointer", fontSize: 11 }}>Edit</button>
                <button onClick={() => saveState({ ...state, adultRewards: (state.adultRewards || []).filter((x) => x.id !== r.id) })} style={{ background: "none", border: "1px solid rgba(255,68,68,0.3)", borderRadius: 6, padding: "3px 8px", color: "#ff4444", cursor: "pointer", fontSize: 11 }}>×</button>
              </div>
            </div>
            {editingReward === r.id && (
              <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: 14, marginTop: 4, marginBottom: 4, display: "flex", gap: 8, alignItems: "center" }}>
                <input value={r.title} onChange={(e) => saveState({ ...state, adultRewards: (state.adultRewards || []).map((x) => x.id === r.id ? { ...x, title: e.target.value } : x) })} style={{ flex: 1, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 6, padding: "6px 10px", color: "#fff", fontFamily: "'Exo 2', sans-serif", fontSize: 13 }} />
                <input type="number" value={r.tokenCost} onChange={(e) => saveState({ ...state, adultRewards: (state.adultRewards || []).map((x) => x.id === r.id ? { ...x, tokenCost: parseInt(e.target.value) || 0 } : x) })} style={{ width: 70, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 6, padding: "6px 10px", color: "#7850ff", fontFamily: "'Exo 2', sans-serif", fontSize: 13 }} />
                <span style={{ color: "#888", fontSize: 11 }}>🪙</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Co-op Mission Editor */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 13, color: "#888", letterSpacing: 1 }}>🤝 CO-OP MISSION</div>
          <button onClick={() => setEditCoopOpen(!editCoopOpen)} style={{ background: "none", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 6, padding: "3px 10px", color: "#aaa", cursor: "pointer", fontSize: 11 }}>Edit</button>
        </div>
        {editCoopOpen && (
          <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
            <input value={state.coopMission.title} onChange={(e) => saveState({ ...state, coopMission: { ...state.coopMission, title: e.target.value } })} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 6, padding: "6px 10px", color: "#fff", fontFamily: "'Exo 2', sans-serif", fontSize: 13 }} placeholder="Mission name" />
            <input value={state.coopMission.description} onChange={(e) => saveState({ ...state, coopMission: { ...state.coopMission, description: e.target.value } })} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 6, padding: "6px 10px", color: "#fff", fontFamily: "'Exo 2', sans-serif", fontSize: 13 }} placeholder="Description" />
            <div style={{ display: "flex", gap: 8 }}>
              <input type="number" value={state.coopMission.targetXp} onChange={(e) => saveState({ ...state, coopMission: { ...state.coopMission, targetXp: parseInt(e.target.value) || 0 } })} style={{ width: 80, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 6, padding: "6px 10px", color: "#ff6bff", fontFamily: "'Exo 2', sans-serif", fontSize: 13 }} />
              <span style={{ color: "#888", alignSelf: "center", fontSize: 11 }}>Target XP</span>
            </div>
            <input value={state.coopMission.reward} onChange={(e) => saveState({ ...state, coopMission: { ...state.coopMission, reward: e.target.value } })} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 6, padding: "6px 10px", color: "#ffd700", fontFamily: "'Exo 2', sans-serif", fontSize: 13 }} placeholder="Reward" />
            <button onClick={() => saveState({ ...state, coopMission: { ...state.coopMission, currentXp: 0 } })} style={{ background: "rgba(255,68,68,0.1)", border: "1px solid rgba(255,68,68,0.3)", borderRadius: 6, padding: "5px 12px", color: "#ff4444", cursor: "pointer", fontSize: 11, fontFamily: "'Exo 2', sans-serif", alignSelf: "flex-start" }}>Reset Progress</button>
          </div>
        )}
      </div>

      {/* Reset */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 16 }}>
        <button onClick={() => {
          if (confirm("Reset ALL data? This can't be undone.")) saveState(INITIAL_STATE);
        }} style={{ background: "rgba(255,68,68,0.1)", border: "1px solid rgba(255,68,68,0.3)", borderRadius: 8, padding: "8px 16px", color: "#ff4444", cursor: "pointer", fontSize: 12, fontFamily: "'Orbitron', sans-serif" }}>🗑 Factory Reset</button>
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Exo+2:wght@300;400;600;700&display=swap');
        @keyframes twinkle { 0%, 100% { opacity: 0.2; } 50% { opacity: 0.9; } }
        @keyframes xpFloat { 0% { opacity: 1; transform: translate(-50%, -50%) scale(0.5); } 30% { opacity: 1; transform: translate(-50%, -80%) scale(1.2); } 100% { opacity: 0; transform: translate(-50%, -150%) scale(0.8); } }
        @keyframes confettiFall { 0% { transform: translateY(0) rotate(0deg); opacity: 1; } 100% { transform: translateY(100vh) rotate(720deg); opacity: 0; } }
        @keyframes slideIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        select option { background: #1a1a2e; color: #fff; }
      `}</style>
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0a0a1a 0%, #0d1b2a 40%, #1a0a2e 100%)",
        color: "#fff",
        fontFamily: "'Exo 2', sans-serif",
        position: "relative",
        overflow: "hidden",
      }}>
        <Stars />
        {xpPopup && <XpPopup amount={xpPopup} />}
        {showConfetti && <ConfettiEffect />}

        {/* Toast */}
        {toast && (
          <div style={{
            position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)",
            background: "rgba(0,0,0,0.85)", border: "1px solid rgba(0,255,204,0.3)",
            borderRadius: 12, padding: "10px 20px", zIndex: 9999,
            fontFamily: "'Exo 2', sans-serif", fontSize: 14, color: "#00ffcc",
            animation: "slideIn 0.3s ease-out",
            backdropFilter: "blur(10px)",
          }}>{toast}</div>
        )}

        {/* Header */}
        <div style={{
          position: "relative", zIndex: 1,
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "16px 24px",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        }}>
          <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 18, fontWeight: 900, letterSpacing: 2 }}>
            <span style={{ color: "#00ffcc" }}>⚡</span> QUEST BOARD
          </div>
          <button
            onClick={() => view === "parent" ? setView("board") : setView("pin")}
            style={{
              background: pendingApprovals.length > 0 ? "rgba(255,215,0,0.15)" : "rgba(255,255,255,0.05)",
              border: `1px solid ${pendingApprovals.length > 0 ? "rgba(255,215,0,0.4)" : "rgba(255,255,255,0.1)"}`,
              borderRadius: 10,
              padding: "6px 14px",
              color: pendingApprovals.length > 0 ? "#ffd700" : "#888",
              cursor: "pointer",
              fontFamily: "'Orbitron', sans-serif",
              fontSize: 11,
              position: "relative",
              display: view === "select" ? "none" : "block",
            }}
          >
            {view === "parent" ? "🔓 HQ" : "🔒 Quest Master"}
            {pendingApprovals.length > 0 && view !== "parent" && (
              <span style={{
                position: "absolute", top: -6, right: -6,
                background: "#ff4444", color: "#fff", fontSize: 10,
                width: 18, height: 18, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "'Exo 2', sans-serif", fontWeight: 700,
              }}>{pendingApprovals.length}</span>
            )}
          </button>
        </div>

        <div style={{ position: "relative", zIndex: 1 }}>
          {view === "select" && renderSelectScreen()}
          {view === "board" && renderBoard()}
          {view === "kid" && renderKidView()}
          {view === "adult" && renderAdultView()}
          {view === "pin" && renderPinScreen()}
          {view === "parent" && renderParent()}
        </div>
      </div>
    </>
  );
}
