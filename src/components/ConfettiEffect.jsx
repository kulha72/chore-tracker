import { useRef } from "react";

export default function ConfettiEffect() {
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
