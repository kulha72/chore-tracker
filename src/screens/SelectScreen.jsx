import { LEVEL_TITLES } from "../constants";
import { isToday, isThisWeek } from "../utils";
import SpeakBtn from "../components/SpeakBtn";
import { useGame } from "../context/GameContext";

function toggleFullscreen() {
  const el = document.documentElement;
  const req = el.requestFullscreen || el.webkitRequestFullscreen || el.mozRequestFullScreen || el.msRequestFullscreen;
  const exit = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen || document.msExitFullscreen;
  const isFs = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
  if (isFs) { exit.call(document); } else { req.call(el); }
}

function MissionProgress({ label, labelColor, mission, barGradient, completedGradient, completedLabel }) {
  const pct = Math.min(100, (mission.currentXp / mission.targetXp) * 100);
  const done = mission.currentXp >= mission.targetXp;
  return (
    <div style={{
      background: "linear-gradient(135deg, rgba(255,107,255,0.12), rgba(0,170,255,0.12))",
      border: `1px solid ${labelColor}4d`,
      borderRadius: 16,
      padding: "14px 18px",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 12, color: labelColor, fontWeight: 700 }}>{label}</span>
        <span style={{ fontSize: 11, color: "#ffd700", fontFamily: "'Exo 2', sans-serif" }}>Reward: {mission.reward}</span>
      </div>
      <div style={{ fontSize: 13, color: "#eee", fontFamily: "'Exo 2', sans-serif", fontWeight: 600, marginBottom: 2 }}>{mission.title}</div>
      <div style={{ fontSize: 11, color: "#aaa", fontFamily: "'Exo 2', sans-serif", marginBottom: 8 }}>{mission.description}</div>
      <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 6, height: 10, overflow: "hidden" }}>
        <div style={{
          background: done ? completedGradient : barGradient,
          height: "100%", width: `${pct}%`, borderRadius: 6, transition: "width 0.5s",
        }} />
      </div>
      <div style={{ textAlign: "right", fontSize: 11, color: "#ddd", marginTop: 4, fontFamily: "'Exo 2', sans-serif" }}>
        {mission.currentXp} / {mission.targetXp} XP
        {done && ` ${completedLabel}`}
      </div>
    </div>
  );
}

export default function SelectScreen({ nav }) {
  const { state, kids, adults, allQuests, isQuestDone, getQuestMembers } = useGame();
  const { setActiveUser, setView } = nav;

  const teamQuests = allQuests.filter((q) => (q.audience || "kids") === "all");

  return (
    <div style={{ padding: "24px", maxWidth: 1000, margin: "0 auto", position: "relative" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ fontSize: 36 }}>⚡</div>
          <div>
            <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 20, color: "#fff", fontWeight: 900, letterSpacing: 2 }}>QUEST BOARD</div>
            <div style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 13, color: "#666" }}>Who's checking in?</div>
          </div>
        </div>
        <button
          onClick={toggleFullscreen}
          style={{
            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 8, padding: "5px 12px", cursor: "pointer",
            color: "#888", fontSize: 11, fontFamily: "'Orbitron', sans-serif",
          }}
        >⛶</button>
      </div>

      {/* Two-column landscape layout */}
      <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>

        {/* Left column — crew sign-in */}
        <div style={{ flex: "0 0 340px", display: "flex", flexDirection: "column", gap: 0 }}>
          <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 11, color: "#00ffcc", letterSpacing: 1, marginBottom: 10 }}>👾 CREW</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
            {kids.map((kid) => (
              <button
                key={kid.id}
                onClick={() => { setActiveUser(kid.id); setView("board"); }}
                style={{
                  background: "linear-gradient(135deg, rgba(0,255,204,0.08), rgba(120,80,255,0.08))",
                  border: "1px solid rgba(0,255,204,0.25)",
                  borderRadius: 14, padding: "14px 18px", cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 12,
                  transition: "all 0.2s", textAlign: "left",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#00ffcc"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(0,255,204,0.25)"; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                <div style={{ fontSize: 32 }}>{kid.avatar}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 15, color: "#fff", fontWeight: 700 }}>{kid.name}</div>
                  <div style={{ fontSize: 12, color: "#00ffcc", fontFamily: "'Exo 2', sans-serif", marginTop: 2 }}>
                    {LEVEL_TITLES[kid.level]} · {kid.xp} XP · {kid.tokens} 🪙
                  </div>
                </div>
                <SpeakBtn text={`${kid.name}. ${LEVEL_TITLES[kid.level]}. ${kid.xp} X P. ${kid.tokens} tokens. Tap to sign in.`} size={26} />
              </button>
            ))}
          </div>

          <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 11, color: "#7850ff", letterSpacing: 1, marginBottom: 10 }}>👨‍🚀 ADULTS</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {adults.map((adult) => (
              <button
                key={adult.id}
                onClick={() => { setActiveUser(adult.id); setView("board"); }}
                style={{
                  background: "linear-gradient(135deg, rgba(120,80,255,0.08), rgba(255,107,255,0.08))",
                  border: "1px solid rgba(120,80,255,0.25)",
                  borderRadius: 14, padding: "14px 18px", cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 12,
                  transition: "all 0.2s", textAlign: "left",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#7850ff"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(120,80,255,0.25)"; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                <div style={{ fontSize: 32 }}>{adult.avatar}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 15, color: "#fff", fontWeight: 700 }}>{adult.name}</div>
                  <div style={{ fontSize: 12, color: "#7850ff", fontFamily: "'Exo 2', sans-serif", marginTop: 2 }}>
                    {adult.xp} XP · {adult.tokens} 🪙
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right column — team progress */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>

          <MissionProgress
            label="🤝 KIDS CO-OP"
            labelColor="#ff6bff"
            mission={state.coopMission}
            barGradient="linear-gradient(90deg, #ff6bff, #00aaff)"
            completedGradient="linear-gradient(90deg, #ffd700, #ff6bff)"
            completedLabel="✅ COMPLETE!"
          />

          <MissionProgress
            label="🤝 ADULT CO-OP"
            labelColor="#7850ff"
            mission={state.adultCoopMission}
            barGradient="linear-gradient(90deg, #7850ff, #ff6bff)"
            completedGradient="linear-gradient(90deg, #ffd700, #7850ff)"
            completedLabel="✅ COMPLETE!"
          />

          <MissionProgress
            label="⭐ LONG-TERM"
            labelColor="#ffd700"
            mission={state.longTermMission}
            barGradient="linear-gradient(90deg, #ffd700, #ff9900)"
            completedGradient="linear-gradient(90deg, #ffd700, #ff6bff)"
            completedLabel="✅ UNLOCKED!"
          />

          {/* Team Chores */}
          {teamQuests.length > 0 && (
            <div style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 16, padding: "14px 18px",
            }}>
              <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 12, color: "#00ffcc", letterSpacing: 1, marginBottom: 10 }}>👨‍👩‍👧‍👦 TEAM CHORES</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {teamQuests.map((quest) => {
                  const members = getQuestMembers(quest);
                  const allDone = members.every((m) => isQuestDone(quest.id, m.id, quest.type));
                  return (
                    <div key={quest.id} style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "8px 12px",
                      background: allDone ? "rgba(0,255,204,0.06)" : "rgba(255,255,255,0.03)",
                      border: `1px solid ${allDone ? "rgba(0,255,204,0.25)" : "rgba(255,255,255,0.07)"}`,
                      borderRadius: 10,
                    }}>
                      <div>
                        <div style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 13, color: allDone ? "#00ffcc" : "#ddd", fontWeight: 600 }}>
                          {quest.title}
                        </div>
                        <div style={{ fontSize: 11, color: "#555", fontFamily: "'Exo 2', sans-serif", marginTop: 1 }}>
                          {quest.type === "weekly" ? "weekly" : "daily"} · +{quest.xpReward} XP
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 4, flexShrink: 0, marginLeft: 12 }}>
                        {members.map((m) => {
                          const done = isQuestDone(quest.id, m.id, quest.type);
                          const pending = state.completions.some(
                            (c) => c.questId === quest.id && c.memberId === m.id && c.status === "pending_approval" &&
                              ((quest.type === "daily" || quest.type === "mystery") ? isToday(c.completedAt) : isThisWeek(c.completedAt, state.weekStart))
                          );
                          return (
                            <div key={m.id} title={m.name + (done ? (pending ? " (pending)" : " (done)") : "")} style={{
                              fontSize: 18, opacity: done ? 1 : 0.3, position: "relative",
                            }}>
                              {m.avatar}
                              {done && (
                                <span style={{ position: "absolute", bottom: -2, right: -4, fontSize: 9 }}>
                                  {pending ? "⏳" : "✅"}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
