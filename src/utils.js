import { LEVEL_THRESHOLDS } from "./constants";

export function getLevel(xp) {
  let lvl = 0;
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) { lvl = i; break; }
  }
  return lvl;
}

export function getLevelProgress(xp) {
  const lvl = getLevel(xp);
  if (lvl >= LEVEL_THRESHOLDS.length - 1) return 100;
  const cur = xp - LEVEL_THRESHOLDS[lvl];
  const needed = LEVEL_THRESHOLDS[lvl + 1] - LEVEL_THRESHOLDS[lvl];
  return Math.round((cur / needed) * 100);
}

export function isToday(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  return d.toDateString() === now.toDateString();
}

export function isThisWeek(dateStr, weekStart) {
  if (!dateStr || !weekStart) return false;
  const d = new Date(dateStr);
  const ws = new Date(weekStart);
  const now = new Date();
  return d >= ws && d <= now;
}

export function daysUntilSunday() {
  const now = new Date();
  const day = now.getDay();
  return day === 0 ? 7 : 7 - day;
}

export function speak(text) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const cleaned = text.replace(/[🔮⚡🏆🌟🤝🪙🎁📡🛒]/g, "");

  const doSpeak = () => {
    const utter = new SpeechSynthesisUtterance(cleaned);
    utter.rate = 0.9;
    utter.pitch = 1.1;
    // Explicitly assign a voice — required on Android Chrome/Silk
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => v.lang.startsWith("en")) || voices[0];
    if (voice) utter.voice = voice;
    // Small delay needed on Android Chrome after cancel()
    setTimeout(() => window.speechSynthesis.speak(utter), 50);
  };

  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) {
    doSpeak();
  } else {
    // Voices not yet loaded (common first-load on Android Chrome/Silk)
    window.speechSynthesis.addEventListener("voiceschanged", doSpeak, { once: true });
  }
}
