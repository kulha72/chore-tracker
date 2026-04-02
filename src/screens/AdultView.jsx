import { LEVEL_TITLES } from "../constants";
import { getLevel, getLevelProgress, isToday, isThisWeek } from "../utils";
import { useGame } from "../context/GameContext";

export default function AdultView({ nav }) {
  const { state, redeemAdultReward } = useGame();
  const { selectedMember, setView } = nav;

  const adult = state.members.find((m) => m.id === selectedMember);
  if (!adult) return null;

  const adultCompletionsToday = state.completions.filter(
    (c) => c.memberId === adult.id && isToday(c.completedAt) && (c.status === "approved" || c.status === "done")
  );
  const adultCompletionsWeek = state.completions.filter(
    (c) => c.memberId === adult.id && isThisWeek(c.completedAt, state.weekStart) && (c.status === "approved" || c.status === "done")
  );

  return (
    <div style={{ padding: "20px 24px", maxWidth: 600, margin: "0 auto" }}>
      <button
        onClick={() => setView("board")}
        style={{ background: "none", border: "none", color: "#7850ff", fontSize: 14, cursor: "pointer", fontFamily: "'Exo 2', sans-serif", marginBottom: 16 }}
      >← Back to Board</button>

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
              onClick={() => redeemAdultReward(adult.id, reward)}
              disabled={adult.tokens < reward.tokenCost}
              style={{
                background: adult.tokens >= reward.tokenCost ? "linear-gradient(135deg, #7850ff, #ff6bff)" : "rgba(255,255,255,0.05)",
                border: "none", borderRadius: 8, padding: "6px 16px",
                cursor: adult.tokens >= reward.tokenCost ? "pointer" : "default",
                color: adult.tokens >= reward.tokenCost ? "#fff" : "#555",
                fontFamily: "'Orbitron', sans-serif", fontSize: 11, fontWeight: 700,
              }}
            >
              Redeem
            </button>
          </div>
        ))}
      </div>

      {/* Recent Completions */}
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
}
