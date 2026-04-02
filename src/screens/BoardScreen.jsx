import { LEVEL_TITLES } from "../constants";
import { isToday, isThisWeek, daysUntilSunday } from "../utils";
import SpeakBtn from "../components/SpeakBtn";
import { useGame } from "../context/GameContext";

function toggleFullscreen() {
  const el = document.documentElement;
  const req = el.requestFullscreen || el.webkitRequestFullscreen || el.mozRequestFullScreen || el.msRequestFullscreen;
  const exit = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen || document.msExitFullscreen;
  const isFs = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
  if (isFs) { exit.call(document); } else { req.call(el); }
}

export default function BoardScreen({ nav }) {
  const { state, allQuests, isQuestDone, getQuestMembers, completeQuest } = useGame();
  const { activeUser, setActiveUser, setView, setSelectedMember } = nav;

  const me = state.members.find((m) => m.id === activeUser);
  if (!me) { setView("select"); return null; }

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
          <button
            onClick={toggleFullscreen}
            style={{
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 8, padding: "5px 12px", cursor: "pointer",
              color: "#888", fontSize: 11, fontFamily: "'Orbitron', sans-serif",
            }}
          >⛶</button>
        </div>
      </div>

      {/* Co-op missions */}
      {!isAdultUser ? (
        <>
          {/* Kids Co-op Mission */}
          <div style={{
            background: "linear-gradient(135deg, rgba(255,107,255,0.12), rgba(0,170,255,0.12))",
            border: "1px solid rgba(255,107,255,0.3)", borderRadius: 16, padding: "16px 20px", marginBottom: 16,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <SpeakBtn text={`Co-op mission: ${state.coopMission.title}. ${state.coopMission.description}. Reward: ${state.coopMission.reward}. Progress: ${state.coopMission.currentXp} out of ${state.coopMission.targetXp} X P.`} size={26} />
                <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 13, color: "#ff6bff", fontWeight: 700 }}>🤝 KIDS CO-OP</span>
                <span style={{ fontSize: 13, color: "#ccc", marginLeft: 4, fontFamily: "'Exo 2', sans-serif" }}>{state.coopMission.title}</span>
              </div>
              <span style={{ fontSize: 12, color: "#ffd700", fontFamily: "'Exo 2', sans-serif" }}>Reward: {state.coopMission.reward}</span>
            </div>
            <div style={{ fontSize: 12, color: "#aaa", fontFamily: "'Exo 2', sans-serif", marginBottom: 8 }}>{state.coopMission.description}</div>
            <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 6, height: 12, overflow: "hidden" }}>
              <div style={{
                background: state.coopMission.currentXp >= state.coopMission.targetXp ? "linear-gradient(90deg, #ffd700, #ff6bff)" : "linear-gradient(90deg, #ff6bff, #00aaff)",
                height: "100%", width: `${Math.min(100, (state.coopMission.currentXp / state.coopMission.targetXp) * 100)}%`, borderRadius: 6, transition: "width 0.5s",
              }} />
            </div>
            <div style={{ textAlign: "right", fontSize: 12, color: "#ddd", marginTop: 4, fontFamily: "'Exo 2', sans-serif" }}>
              {state.coopMission.currentXp} / {state.coopMission.targetXp} XP
              {state.coopMission.currentXp >= state.coopMission.targetXp && " ✅ COMPLETE!"}
            </div>
          </div>

          {/* Long-Term Mission */}
          <div style={{
            background: "linear-gradient(135deg, rgba(255,215,0,0.10), rgba(255,107,255,0.10))",
            border: "1px solid rgba(255,215,0,0.35)", borderRadius: 16, padding: "16px 20px", marginBottom: 24,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <SpeakBtn text={`Long-term mission: ${state.longTermMission.title}. ${state.longTermMission.description}. Progress: ${state.longTermMission.currentXp} out of ${state.longTermMission.targetXp} X P.`} size={26} />
                <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 13, color: "#ffd700", fontWeight: 700 }}>⭐ LONG-TERM MISSION</span>
                <span style={{ fontSize: 13, color: "#ccc", marginLeft: 4, fontFamily: "'Exo 2', sans-serif" }}>{state.longTermMission.title}</span>
              </div>
              <span style={{ fontSize: 12, color: "#ff6bff", fontFamily: "'Exo 2', sans-serif" }}>Reward: {state.longTermMission.reward}</span>
            </div>
            <div style={{ fontSize: 12, color: "#aaa", fontFamily: "'Exo 2', sans-serif", marginBottom: 8 }}>{state.longTermMission.description}</div>
            <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 6, height: 12, overflow: "hidden" }}>
              <div style={{
                background: state.longTermMission.currentXp >= state.longTermMission.targetXp ? "linear-gradient(90deg, #ffd700, #ff6bff)" : "linear-gradient(90deg, #ffd700, #ff9900)",
                height: "100%", width: `${Math.min(100, (state.longTermMission.currentXp / state.longTermMission.targetXp) * 100)}%`, borderRadius: 6, transition: "width 0.5s",
              }} />
            </div>
            <div style={{ textAlign: "right", fontSize: 12, color: "#ddd", marginTop: 4, fontFamily: "'Exo 2', sans-serif" }}>
              {state.longTermMission.currentXp} / {state.longTermMission.targetXp} XP
              {state.longTermMission.currentXp >= state.longTermMission.targetXp && " ✅ UNLOCKED!"}
            </div>
          </div>
        </>
      ) : (
        /* Adult Co-op Mission */
        <div style={{
          background: "linear-gradient(135deg, rgba(120,80,255,0.12), rgba(255,107,255,0.12))",
          border: "1px solid rgba(120,80,255,0.3)", borderRadius: 16, padding: "16px 20px", marginBottom: 24,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 13, color: "#7850ff", fontWeight: 700 }}>🤝 ADULT CO-OP</span>
              <span style={{ fontSize: 13, color: "#ccc", marginLeft: 4, fontFamily: "'Exo 2', sans-serif" }}>{state.adultCoopMission.title}</span>
            </div>
            <span style={{ fontSize: 12, color: "#ffd700", fontFamily: "'Exo 2', sans-serif" }}>Reward: {state.adultCoopMission.reward}</span>
          </div>
          <div style={{ fontSize: 12, color: "#aaa", fontFamily: "'Exo 2', sans-serif", marginBottom: 8 }}>{state.adultCoopMission.description}</div>
          <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 6, height: 12, overflow: "hidden" }}>
            <div style={{
              background: state.adultCoopMission.currentXp >= state.adultCoopMission.targetXp ? "linear-gradient(90deg, #ffd700, #7850ff)" : "linear-gradient(90deg, #7850ff, #ff6bff)",
              height: "100%", width: `${Math.min(100, (state.adultCoopMission.currentXp / state.adultCoopMission.targetXp) * 100)}%`, borderRadius: 6, transition: "width 0.5s",
            }} />
          </div>
          <div style={{ textAlign: "right", fontSize: 12, color: "#ddd", marginTop: 4, fontFamily: "'Exo 2', sans-serif" }}>
            {state.adultCoopMission.currentXp} / {state.adultCoopMission.targetXp} XP
            {state.adultCoopMission.currentXp >= state.adultCoopMission.targetXp && " ✅ COMPLETE!"}
          </div>
        </div>
      )}

      {/* Weekly countdown */}
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <span style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 13, color: "#7850ff" }}>
          ⏱ {daysUntilSunday()} days until weekly reset
        </span>
      </div>

      {/* Quest sections */}
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
                    border: `1px solid ${borderColor}`, borderRadius: 12, padding: "12px 16px",
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
                            onClick={() => isSelf && !done && completeQuest(quest.id, member.id)}
                            disabled={done || !isSelf}
                            style={{
                              background: done ? (pending ? "rgba(255,215,0,0.15)" : "rgba(0,255,204,0.15)") : isSelf ? (memberIsAdult ? "rgba(120,80,255,0.25)" : "rgba(0,255,204,0.2)") : "rgba(255,255,255,0.03)",
                              border: `2px solid ${done ? (pending ? "rgba(255,215,0,0.4)" : "rgba(0,255,204,0.4)") : isSelf ? (memberIsAdult ? "rgba(120,80,255,0.8)" : "rgba(0,255,204,0.7)") : "rgba(255,255,255,0.08)"}`,
                              borderRadius: 8,
                              padding: isSelf && !done ? "8px 18px" : "6px 14px",
                              cursor: isSelf && !done ? "pointer" : "default",
                              color: done ? (pending ? "#ffd700" : "#00ffcc") : isSelf ? "#fff" : "#555",
                              fontSize: isSelf && !done ? 13 : 12,
                              fontFamily: "'Exo 2', sans-serif",
                              fontWeight: isSelf ? 700 : 500,
                              transition: "all 0.2s",
                              opacity: done ? 0.7 : isSelf ? 1 : 0.4,
                              boxShadow: isSelf && !done ? (memberIsAdult ? "0 0 10px rgba(120,80,255,0.35)" : "0 0 10px rgba(0,255,204,0.3)") : "none",
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
}
