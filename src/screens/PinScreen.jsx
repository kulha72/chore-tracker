import { PARENT_PIN } from "../constants";

export default function PinScreen({ nav }) {
  const { pinInput, setPinInput, pinError, setPinError, setView } = nav;

  const handleKey = (key) => {
    if (key === "⌫") {
      setPinInput((p) => p.slice(0, -1));
      return;
    }
    if (key === "") return;
    const newPin = pinInput + key;
    setPinInput(newPin);
    if (newPin.length === 4) {
      if (newPin === PARENT_PIN) {
        setView("parent");
        setPinInput("");
        setPinError(false);
      } else {
        setPinError(true);
        setPinInput("");
      }
    }
  };

  return (
    <div style={{ padding: "40px 24px", maxWidth: 400, margin: "0 auto", textAlign: "center" }}>
      <button
        onClick={() => setView("board")}
        style={{ background: "none", border: "none", color: "#00ffcc", fontSize: 14, cursor: "pointer", fontFamily: "'Exo 2', sans-serif", marginBottom: 24, display: "block" }}
      >← Back</button>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
      <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 18, color: "#fff", marginBottom: 20 }}>Quest Master Access</div>

      <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, "", 0, "⌫"].map((key, i) => (
          <button
            key={i}
            onClick={() => handleKey(String(key))}
            style={{
              width: 56, height: 56,
              background: key === "" ? "transparent" : "rgba(255,255,255,0.05)",
              border: key === "" ? "none" : "1px solid rgba(255,255,255,0.1)",
              borderRadius: 12,
              color: "#fff", fontSize: 20,
              cursor: key === "" ? "default" : "pointer",
              fontFamily: "'Exo 2', sans-serif",
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
}
