import { speak } from "../utils";

export default function SpeakBtn({ text, size }) {
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
