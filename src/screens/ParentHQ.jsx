import { useState } from "react";
import { INITIAL_STATE } from "../constants";
import { isToday, isThisWeek } from "../utils";
import { useGame } from "../context/GameContext";

function QuestRow({ quest, nav }) {
  const { state, isQuestDone, getQuestMembers, parentMarkComplete, parentUnmarkComplete } = useGame();
  const members = getQuestMembers(quest);

  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "10px 14px", marginBottom: 6,
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 10,
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 13, color: "#ddd", fontWeight: 600 }}>{quest.title}</div>
        <div style={{ fontSize: 11, color: "#555", fontFamily: "'Exo 2', sans-serif", marginTop: 1 }}>+{quest.xpReward} XP · +{quest.tokenReward} 🪙</div>
      </div>
      <div style={{ display: "flex", gap: 6, flexShrink: 0, marginLeft: 12 }}>
        {members.map((m) => {
          const completion = state.completions.find(
            (c) => c.questId === quest.id && c.memberId === m.id && c.status !== "rejected" &&
              ((quest.type === "daily" || quest.type === "mystery") ? isToday(c.completedAt) : isThisWeek(c.completedAt, state.weekStart))
          );
          const isDone = !!completion;
          const isPending = completion?.status === "pending_approval";
          return (
            <button
              key={m.id}
              title={`${m.name} — ${isDone ? (isPending ? "pending approval (click to remove)" : "done (click to undo)") : "not done (click to mark complete)"}`}
              onClick={() => isDone ? parentUnmarkComplete(quest.id, m.id) : parentMarkComplete(quest.id, m.id)}
              style={{
                background: isDone ? (isPending ? "rgba(255,215,0,0.15)" : "rgba(0,255,204,0.15)") : "rgba(255,255,255,0.05)",
                border: `1px solid ${isDone ? (isPending ? "rgba(255,215,0,0.5)" : "rgba(0,255,204,0.5)") : "rgba(255,255,255,0.15)"}`,
                borderRadius: 8, padding: "4px 8px", cursor: "pointer",
                display: "flex", alignItems: "center", gap: 4,
                fontSize: 16, transition: "all 0.15s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.75"; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
            >
              {m.avatar}
              <span style={{ fontSize: 10 }}>{isDone ? (isPending ? "⏳" : "✅") : "○"}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function QuestChecklist({ nav }) {
  const { allQuests } = useGame();
  const checklistQuests = allQuests.filter((q) => q.isActive !== false);
  const dailyQuests = checklistQuests.filter((q) => q.type === "daily" || q.type === "mystery");
  const weeklyQuests = checklistQuests.filter((q) => q.type === "weekly");

  return (
    <div>
      {dailyQuests.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 12, color: "#00ffcc", letterSpacing: 1, marginBottom: 10 }}>☀️ DAILY QUESTS</div>
          {dailyQuests.map((q) => <QuestRow key={q.id} quest={q} nav={nav} />)}
        </div>
      )}
      {weeklyQuests.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 12, color: "#7850ff", letterSpacing: 1, marginBottom: 10 }}>📅 WEEKLY QUESTS</div>
          {weeklyQuests.map((q) => <QuestRow key={q.id} quest={q} nav={nav} />)}
        </div>
      )}
      <div style={{ fontSize: 11, color: "#555", fontFamily: "'Exo 2', sans-serif", textAlign: "center", marginTop: 8 }}>
        Tap a member to mark complete · Tap again to undo · ⏳ = pending approval
      </div>
    </div>
  );
}

export default function ParentHQ({ nav }) {
  const {
    state, saveState,
    pendingApprovals, pendingRewardRequests, totalPending,
    approveCompletion, approveRewardRedemption,
    exportState, importState, fileInputRef,
    resetWeek,
  } = useGame();

  const [pinChangeOpen, setPinChangeOpen] = useState(false);
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [pinChangeError, setPinChangeError] = useState("");

  const {
    hqTab, setHqTab, setView,
    editingQuest, setEditingQuest,
    editingReward, setEditingReward,
    editingMember, setEditingMember,
    editCoopOpen, setEditCoopOpen,
    editAdultCoopOpen, setEditAdultCoopOpen,
    editLongTermOpen, setEditLongTermOpen,
  } = nav;

  return (
    <div style={{ padding: "20px 24px", maxWidth: 700, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <button
          onClick={() => setView("board")}
          style={{ background: "none", border: "none", color: "#00ffcc", fontSize: 14, cursor: "pointer", fontFamily: "'Exo 2', sans-serif" }}
        >← Back to Board</button>
        <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 16, color: "#fff" }}>👨‍🚀 Quest Master HQ</div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {[{ id: "manage", label: "⚙️ Manage" }, { id: "checklist", label: "✅ Quest Checklist" }].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setHqTab(tab.id)}
            style={{
              background: hqTab === tab.id ? "rgba(0,255,204,0.15)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${hqTab === tab.id ? "rgba(0,255,204,0.5)" : "rgba(255,255,255,0.1)"}`,
              borderRadius: 8, padding: "7px 16px", cursor: "pointer",
              color: hqTab === tab.id ? "#00ffcc" : "#888",
              fontSize: 12, fontFamily: "'Orbitron', sans-serif", letterSpacing: 0.5, transition: "all 0.15s",
            }}
          >{tab.label}</button>
        ))}
      </div>

      {hqTab === "checklist" && <QuestChecklist nav={nav} />}

      {hqTab === "manage" && (
        <div>
          {/* Pending Approvals */}
          {totalPending > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 13, color: "#ffd700", marginBottom: 10, letterSpacing: 1 }}>
                ⏳ PENDING APPROVAL ({totalPending})
              </div>
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
              {pendingRewardRequests.map((pr) => {
                const reward = state.rewards.find((r) => r.id === pr.rewardId);
                const member = state.members.find((m) => m.id === pr.memberId);
                return (
                  <div key={pr.id} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    background: "rgba(255,215,0,0.06)", border: "1px solid rgba(255,215,0,0.2)", borderRadius: 10, padding: "10px 14px", marginBottom: 6,
                  }}>
                    <div>
                      <span style={{ color: "#fff", fontFamily: "'Exo 2', sans-serif", fontSize: 14 }}>{member?.avatar} {member?.name}</span>
                      <span style={{ color: "#888", fontSize: 13, marginLeft: 8 }}>→ 🎁 {reward?.title}</span>
                      <span style={{ color: "#ffd700", fontSize: 12, marginLeft: 8 }}>({reward?.tokenCost} 🪙)</span>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => approveRewardRedemption(pr.id, true)} style={{ background: "rgba(0,255,204,0.15)", border: "1px solid #00ffcc", borderRadius: 6, padding: "4px 12px", color: "#00ffcc", cursor: "pointer", fontSize: 12, fontFamily: "'Exo 2', sans-serif" }}>✓</button>
                      <button onClick={() => approveRewardRedemption(pr.id, false)} style={{ background: "rgba(255,68,68,0.15)", border: "1px solid #ff4444", borderRadius: 6, padding: "4px 12px", color: "#ff4444", cursor: "pointer", fontSize: 12, fontFamily: "'Exo 2', sans-serif" }}>✗</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Crew Members */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 13, color: "#888", marginBottom: 10, letterSpacing: 1 }}>👥 CREW MEMBERS</div>
            {state.members.map((m) => (
              <div key={m.id}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <span style={{ color: "#ddd", fontFamily: "'Exo 2', sans-serif" }}>{m.avatar} {m.name} ({m.role}) · {m.xp} XP · {m.tokens} 🪙</span>
                  <button onClick={() => setEditingMember(editingMember === m.id ? null : m.id)} style={{ background: "none", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 6, padding: "3px 10px", color: "#aaa", cursor: "pointer", fontSize: 11 }}>Edit</button>
                </div>
                {editingMember === m.id && (
                  <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: 14, marginTop: 8, display: "flex", flexDirection: "column", gap: 8 }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <input value={m.name} onChange={(e) => saveState({ ...state, members: state.members.map((x) => x.id === m.id ? { ...x, name: e.target.value } : x) })} style={{ flex: 1, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 6, padding: "6px 10px", color: "#fff", fontFamily: "'Exo 2', sans-serif", fontSize: 13 }} placeholder="Name" />
                      <input value={m.avatar} onChange={(e) => saveState({ ...state, members: state.members.map((x) => x.id === m.id ? { ...x, avatar: e.target.value } : x) })} style={{ width: 60, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 6, padding: "6px 10px", color: "#fff", fontSize: 18, textAlign: "center" }} />
                    </div>
                    <button onClick={() => setEditingMember(null)} style={{ background: "rgba(0,255,204,0.1)", border: "1px solid #00ffcc", borderRadius: 6, padding: "5px 12px", color: "#00ffcc", cursor: "pointer", fontSize: 12, fontFamily: "'Exo 2', sans-serif", alignSelf: "flex-end" }}>Done</button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Quest Roster */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 13, color: "#888", letterSpacing: 1 }}>📋 QUEST ROSTER</div>
              <button
                onClick={() => {
                  const newQ = { id: "q-" + Date.now(), title: "New Quest", description: "", type: "daily", xpReward: 5, tokenReward: 2, requiresApproval: true, assignedTo: null, isActive: true, audience: "kids" };
                  saveState({ ...state, quests: [...state.quests, newQ] });
                  setEditingQuest(newQ.id);
                }}
                style={{ background: "rgba(0,255,204,0.1)", border: "1px solid #00ffcc", borderRadius: 6, padding: "4px 12px", color: "#00ffcc", cursor: "pointer", fontSize: 11, fontFamily: "'Orbitron', sans-serif" }}
              >+ Add Quest</button>
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

          {/* Kid Rewards */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 13, color: "#888", letterSpacing: 1 }}>🎁 KID LOOT SHOP</div>
              <button
                onClick={() => {
                  const newR = { id: "r-" + Date.now(), title: "New Reward", tokenCost: 10, isAvailable: true };
                  saveState({ ...state, rewards: [...state.rewards, newR] });
                  setEditingReward(newR.id);
                }}
                style={{ background: "rgba(255,215,0,0.1)", border: "1px solid #ffd700", borderRadius: 6, padding: "4px 12px", color: "#ffd700", cursor: "pointer", fontSize: 11, fontFamily: "'Orbitron', sans-serif" }}
              >+ Add Reward</button>
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

          {/* Adult Rewards */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 13, color: "#7850ff", letterSpacing: 1 }}>🎁 ADULT LOOT SHOP</div>
              <button
                onClick={() => {
                  const newR = { id: "ar-" + Date.now(), title: "New Adult Reward", tokenCost: 20, isAvailable: true };
                  saveState({ ...state, adultRewards: [...(state.adultRewards || []), newR] });
                  setEditingReward(newR.id);
                }}
                style={{ background: "rgba(120,80,255,0.1)", border: "1px solid #7850ff", borderRadius: 6, padding: "4px 12px", color: "#7850ff", cursor: "pointer", fontSize: 11, fontFamily: "'Orbitron', sans-serif" }}
              >+ Add Reward</button>
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

          {/* Kids Co-op Mission Editor */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 13, color: "#ff6bff", letterSpacing: 1 }}>🤝 KIDS CO-OP MISSION</div>
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

          {/* Adult Co-op Mission Editor */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 13, color: "#7850ff", letterSpacing: 1 }}>🤝 ADULT CO-OP MISSION</div>
              <button onClick={() => setEditAdultCoopOpen(!editAdultCoopOpen)} style={{ background: "none", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 6, padding: "3px 10px", color: "#aaa", cursor: "pointer", fontSize: 11 }}>Edit</button>
            </div>
            {editAdultCoopOpen && (
              <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
                <input value={state.adultCoopMission.title} onChange={(e) => saveState({ ...state, adultCoopMission: { ...state.adultCoopMission, title: e.target.value } })} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 6, padding: "6px 10px", color: "#fff", fontFamily: "'Exo 2', sans-serif", fontSize: 13 }} placeholder="Mission name" />
                <input value={state.adultCoopMission.description} onChange={(e) => saveState({ ...state, adultCoopMission: { ...state.adultCoopMission, description: e.target.value } })} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 6, padding: "6px 10px", color: "#fff", fontFamily: "'Exo 2', sans-serif", fontSize: 13 }} placeholder="Description" />
                <div style={{ display: "flex", gap: 8 }}>
                  <input type="number" value={state.adultCoopMission.targetXp} onChange={(e) => saveState({ ...state, adultCoopMission: { ...state.adultCoopMission, targetXp: parseInt(e.target.value) || 0 } })} style={{ width: 80, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 6, padding: "6px 10px", color: "#7850ff", fontFamily: "'Exo 2', sans-serif", fontSize: 13 }} />
                  <span style={{ color: "#888", alignSelf: "center", fontSize: 11 }}>Target XP</span>
                </div>
                <input value={state.adultCoopMission.reward} onChange={(e) => saveState({ ...state, adultCoopMission: { ...state.adultCoopMission, reward: e.target.value } })} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 6, padding: "6px 10px", color: "#ffd700", fontFamily: "'Exo 2', sans-serif", fontSize: 13 }} placeholder="Reward" />
                <button onClick={() => saveState({ ...state, adultCoopMission: { ...state.adultCoopMission, currentXp: 0 } })} style={{ background: "rgba(255,68,68,0.1)", border: "1px solid rgba(255,68,68,0.3)", borderRadius: 6, padding: "5px 12px", color: "#ff4444", cursor: "pointer", fontSize: 11, fontFamily: "'Exo 2', sans-serif", alignSelf: "flex-start" }}>Reset Progress</button>
              </div>
            )}
          </div>

          {/* Long-Term Mission Editor */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 13, color: "#ffd700", letterSpacing: 1 }}>⭐ LONG-TERM MISSION</div>
              <button onClick={() => setEditLongTermOpen(!editLongTermOpen)} style={{ background: "none", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 6, padding: "3px 10px", color: "#aaa", cursor: "pointer", fontSize: 11 }}>Edit</button>
            </div>
            {editLongTermOpen && (
              <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
                <input value={state.longTermMission.title} onChange={(e) => saveState({ ...state, longTermMission: { ...state.longTermMission, title: e.target.value } })} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 6, padding: "6px 10px", color: "#fff", fontFamily: "'Exo 2', sans-serif", fontSize: 13 }} placeholder="Mission name" />
                <input value={state.longTermMission.description} onChange={(e) => saveState({ ...state, longTermMission: { ...state.longTermMission, description: e.target.value } })} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 6, padding: "6px 10px", color: "#fff", fontFamily: "'Exo 2', sans-serif", fontSize: 13 }} placeholder="Description" />
                <div style={{ display: "flex", gap: 8 }}>
                  <input type="number" value={state.longTermMission.targetXp} onChange={(e) => saveState({ ...state, longTermMission: { ...state.longTermMission, targetXp: parseInt(e.target.value) || 0 } })} style={{ width: 80, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 6, padding: "6px 10px", color: "#ffd700", fontFamily: "'Exo 2', sans-serif", fontSize: 13 }} />
                  <span style={{ color: "#888", alignSelf: "center", fontSize: 11 }}>Target XP</span>
                </div>
                <input value={state.longTermMission.reward} onChange={(e) => saveState({ ...state, longTermMission: { ...state.longTermMission, reward: e.target.value } })} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 6, padding: "6px 10px", color: "#ff6bff", fontFamily: "'Exo 2', sans-serif", fontSize: 13 }} placeholder="Reward" />
                <button onClick={() => saveState({ ...state, longTermMission: { ...state.longTermMission, currentXp: 0 } })} style={{ background: "rgba(255,68,68,0.1)", border: "1px solid rgba(255,68,68,0.3)", borderRadius: 6, padding: "5px 12px", color: "#ff4444", cursor: "pointer", fontSize: 11, fontFamily: "'Exo 2', sans-serif", alignSelf: "flex-start" }}>Reset Progress</button>
              </div>
            )}
          </div>

          {/* Change Passcode */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 13, color: "#00aaff", letterSpacing: 1 }}>🔒 PASSCODE</div>
              <button
                onClick={() => { setPinChangeOpen(!pinChangeOpen); setNewPin(""); setConfirmPin(""); setPinChangeError(""); }}
                style={{ background: "none", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 6, padding: "3px 10px", color: "#aaa", cursor: "pointer", fontSize: 11 }}
              >Change</button>
            </div>
            {pinChangeOpen && (
              <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={newPin}
                  onChange={(e) => { setNewPin(e.target.value.replace(/\D/g, "")); setPinChangeError(""); }}
                  placeholder="New 4-digit PIN"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 6, padding: "6px 10px", color: "#fff", fontFamily: "'Exo 2', sans-serif", fontSize: 13 }}
                />
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={confirmPin}
                  onChange={(e) => { setConfirmPin(e.target.value.replace(/\D/g, "")); setPinChangeError(""); }}
                  placeholder="Confirm new PIN"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 6, padding: "6px 10px", color: "#fff", fontFamily: "'Exo 2', sans-serif", fontSize: 13 }}
                />
                {pinChangeError && <div style={{ color: "#ff4444", fontSize: 12, fontFamily: "'Exo 2', sans-serif" }}>{pinChangeError}</div>}
                <button
                  onClick={() => {
                    if (newPin.length !== 4) { setPinChangeError("PIN must be exactly 4 digits."); return; }
                    if (newPin !== confirmPin) { setPinChangeError("PINs don't match."); return; }
                    saveState({ ...state, parentPin: newPin });
                    setPinChangeOpen(false);
                    setNewPin("");
                    setConfirmPin("");
                  }}
                  style={{ background: "rgba(0,170,255,0.15)", border: "1px solid #00aaff", borderRadius: 6, padding: "7px 16px", color: "#00aaff", cursor: "pointer", fontSize: 12, fontFamily: "'Orbitron', sans-serif", alignSelf: "flex-start" }}
                >Save PIN</button>
              </div>
            )}
          </div>

          {/* Export / Import / Reset */}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button onClick={exportState} style={{ background: "rgba(0,255,204,0.1)", border: "1px solid #00ffcc", borderRadius: 8, padding: "8px 16px", color: "#00ffcc", cursor: "pointer", fontSize: 12, fontFamily: "'Orbitron', sans-serif" }}>📤 Export Save</button>
            <button onClick={() => fileInputRef.current?.click()} style={{ background: "rgba(120,80,255,0.1)", border: "1px solid #7850ff", borderRadius: 8, padding: "8px 16px", color: "#7850ff", cursor: "pointer", fontSize: 12, fontFamily: "'Orbitron', sans-serif" }}>📥 Import Save</button>
            <input ref={fileInputRef} type="file" accept=".json" onChange={importState} style={{ display: "none" }} />
            <button
              onClick={() => { if (confirm("Reset the week? All weekly quest completions will be cleared for everyone.")) resetWeek(); }}
              style={{ background: "rgba(120,80,255,0.1)", border: "1px solid rgba(120,80,255,0.4)", borderRadius: 8, padding: "8px 16px", color: "#7850ff", cursor: "pointer", fontSize: 12, fontFamily: "'Orbitron', sans-serif" }}
            >🔄 Reset Week</button>
            <button
              onClick={() => { if (confirm("Reset ALL data? This can't be undone.")) saveState(INITIAL_STATE); }}
              style={{ background: "rgba(255,68,68,0.1)", border: "1px solid rgba(255,68,68,0.3)", borderRadius: 8, padding: "8px 16px", color: "#ff4444", cursor: "pointer", fontSize: 12, fontFamily: "'Orbitron', sans-serif" }}
            >🗑 Factory Reset</button>
          </div>
        </div>
      )}
    </div>
  );
}
