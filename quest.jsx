import { useState } from "react";
import { GameProvider, useGame } from "./src/context/GameContext";
import Stars from "./src/components/Stars";
import XpPopup from "./src/components/XpPopup";
import ConfettiEffect from "./src/components/ConfettiEffect";
import SelectScreen from "./src/screens/SelectScreen";
import BoardScreen from "./src/screens/BoardScreen";
import KidView from "./src/screens/KidView";
import AdultView from "./src/screens/AdultView";
import PinScreen from "./src/screens/PinScreen";
import ParentHQ from "./src/screens/ParentHQ";

function AppShell() {
  const { toast, xpPopup, showConfetti, totalPending } = useGame();

  const [view, setView] = useState("select");
  const [activeUser, setActiveUser] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);
  const [hqTab, setHqTab] = useState("manage");
  const [editingQuest, setEditingQuest] = useState(null);
  const [editingReward, setEditingReward] = useState(null);
  const [editingMember, setEditingMember] = useState(null);
  const [editCoopOpen, setEditCoopOpen] = useState(false);
  const [editAdultCoopOpen, setEditAdultCoopOpen] = useState(false);
  const [editLongTermOpen, setEditLongTermOpen] = useState(false);

  const nav = {
    view, setView,
    activeUser, setActiveUser,
    selectedMember, setSelectedMember,
    pinInput, setPinInput,
    pinError, setPinError,
    hqTab, setHqTab,
    editingQuest, setEditingQuest,
    editingReward, setEditingReward,
    editingMember, setEditingMember,
    editCoopOpen, setEditCoopOpen,
    editAdultCoopOpen, setEditAdultCoopOpen,
    editLongTermOpen, setEditLongTermOpen,
  };

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
        height: "100vh",
        background: "linear-gradient(135deg, #0a0a1a 0%, #0d1b2a 40%, #1a0a2e 100%)",
        color: "#fff",
        fontFamily: "'Exo 2', sans-serif",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}>
        <Stars />
        {xpPopup && <XpPopup amount={xpPopup} />}
        {showConfetti && <ConfettiEffect />}

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
          position: "relative", zIndex: 1, flexShrink: 0,
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
              background: totalPending > 0 ? "rgba(255,215,0,0.15)" : "rgba(255,255,255,0.05)",
              border: `1px solid ${totalPending > 0 ? "rgba(255,215,0,0.4)" : "rgba(255,255,255,0.1)"}`,
              borderRadius: 10, padding: "6px 14px",
              color: totalPending > 0 ? "#ffd700" : "#888",
              cursor: "pointer",
              fontFamily: "'Orbitron', sans-serif", fontSize: 11,
              position: "relative",
              display: view === "select" ? "none" : "block",
            }}
          >
            {view === "parent" ? "🔓 HQ" : "🔒 Quest Master"}
            {totalPending > 0 && view !== "parent" && (
              <span style={{
                position: "absolute", top: -6, right: -6,
                background: "#ff4444", color: "#fff", fontSize: 10,
                width: 18, height: 18, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "'Exo 2', sans-serif", fontWeight: 700,
              }}>{totalPending}</span>
            )}
          </button>
        </div>

        <div style={{ position: "relative", zIndex: 1, flex: 1, overflowY: "auto" }}>
          {view === "select" && <SelectScreen nav={nav} />}
          {view === "board" && <BoardScreen nav={nav} />}
          {view === "kid" && <KidView nav={nav} />}
          {view === "adult" && <AdultView nav={nav} />}
          {view === "pin" && <PinScreen nav={nav} />}
          {view === "parent" && <ParentHQ nav={nav} />}
        </div>
      </div>
    </>
  );
}

export default function FamilyQuestBoard() {
  return (
    <GameProvider>
      <AppShell />
    </GameProvider>
  );
}
