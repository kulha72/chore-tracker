import { LEVEL_TITLES } from "../constants";
import { getLevel, getLevelProgress, isToday } from "../utils";
import SpeakBtn from "../components/SpeakBtn";
import { useGame } from "../context/GameContext";

export default function KidView({ nav }) {
  const { state, redeemReward } = useGame();
  const { selectedMember, setView } = nav;

  const kid = state.members.find((m) => m.id === selectedMember);
  if (!kid) return null;

  const kidCompletionsToday = state.completions.filter(
    (c) => c.memberId === kid.id && isToday(c.completedAt) && c.status === "approved"
  );

  return (
    <div style={{ padding: "20px 24px", maxWidth: 600, margin: "0 auto" }}>
      <button
        onClick={() => setView("board")}
        style={{ background: "none", border: "none", color: "#00ffcc", fontSize: 14, cursor: "pointer", fontFamily: "'Exo 2', sans-serif", marginBottom: 16 }}
      >← Back to Board</button>

      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{ fontSize: 64 }}>{kid.avatar}</div>
        <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 22, color: "#fff", fontWeight: 700, marginTop: 8 }}>
          {kid.name}
          <span style={{ marginLeft: 10, verticalAlign: "middle" }}>
            <SpeakBtn
              text={`${kid.name}. Level ${getLevel(kid.xp) + 1}, ${LEVEL_TITLES[getLevel(kid.xp)]}. You have ${kid.xp} X P and ${kid.tokens} tokens. You completed ${kidCompletionsToday.length} quests today.`}
              size={28}
            />
          </span>
        </div>
        <div style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 14, color: "#00ffcc", marginTop: 4 }}>
          Level {getLevel(kid.xp) + 1} · {LEVEL_TITLES[getLevel(kid.xp)]}
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
        {state.rewards.filter((r) => r.isAvailable).map((reward) => {
          const isPending = (state.pendingRewards || []).some(
            (pr) => pr.rewardId === reward.id && pr.memberId === kid.id && pr.status === "pending_approval"
          );
          const canAfford = kid.tokens >= reward.tokenCost;
          return (
            <div key={reward.id} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              background: "rgba(255,215,0,0.05)", border: "1px solid rgba(255,215,0,0.15)", borderRadius: 10, padding: "10px 14px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <SpeakBtn
                  text={`${reward.title}. Costs ${reward.tokenCost} tokens.${canAfford ? " You can afford this!" : " You need " + (reward.tokenCost - kid.tokens) + " more tokens."}`}
                  size={26}
                />
                <div>
                  <div style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 14, color: "#eee" }}>{reward.title}</div>
                  <div style={{ fontSize: 12, color: "#ffd700" }}>{reward.tokenCost} 🪙</div>
                </div>
              </div>
              <button
                onClick={() => !isPending && redeemReward(reward.id, kid.id)}
                disabled={!canAfford || isPending}
                style={{
                  background: isPending ? "rgba(255,215,0,0.15)" : canAfford ? "linear-gradient(135deg, #ffd700, #ff6bff)" : "rgba(255,255,255,0.05)",
                  border: isPending ? "1px solid rgba(255,215,0,0.4)" : "none",
                  borderRadius: 8, padding: "6px 16px",
                  cursor: canAfford && !isPending ? "pointer" : "default",
                  color: isPending ? "#ffd700" : canAfford ? "#000" : "#555",
                  fontFamily: "'Orbitron', sans-serif", fontSize: 11, fontWeight: 700,
                }}
              >
                {isPending ? "Requested ⏳" : "Redeem"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
