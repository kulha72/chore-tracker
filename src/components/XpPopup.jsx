export default function XpPopup({ amount, position }) {
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
