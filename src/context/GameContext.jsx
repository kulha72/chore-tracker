import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { INITIAL_STATE } from "../constants";
import { getLevel, isToday, isThisWeek, speak } from "../utils";

const GameContext = createContext(null);

export function useGame() {
  return useContext(GameContext);
}

export function GameProvider({ children }) {
  const [state, setState] = useState(INITIAL_STATE);
  const [xpPopup, setXpPopup] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [toast, setToast] = useState(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("questboard-state");
      if (raw) {
        const saved = JSON.parse(raw);
        setState((prev) => ({ ...prev, ...saved }));
      }
    } catch (e) { /* first run */ }
    setHasLoaded(true);
  }, []);

  const saveState = useCallback((newState) => {
    setState(newState);
    try {
      localStorage.setItem("questboard-state", JSON.stringify(newState));
    } catch (e) { /* silent */ }
  }, []);

  useEffect(() => {
    if (!hasLoaded) return;
    if (!state.todayMystery || !isToday(state.todayMystery?.createdAt)) {
      if (state.mysteryPool.length > 0) {
        const pick = state.mysteryPool[Math.floor(Math.random() * state.mysteryPool.length)];
        const mystery = {
          id: "mystery-" + Date.now(),
          title: "🔮 " + pick.title,
          description: pick.description,
          type: "mystery",
          xpReward: pick.xpReward,
          tokenReward: pick.tokenReward,
          requiresApproval: true,
          assignedTo: null,
          isActive: true,
        };
        saveState({ ...state, todayMystery: { ...mystery, createdAt: new Date().toISOString() } });
      }
    }
  }, [hasLoaded]);

  const showToast = (msg) => {
    setToast(msg);
    speak(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const triggerXp = (amount) => {
    setXpPopup(amount);
    setTimeout(() => setXpPopup(null), 1600);
  };

  const triggerConfetti = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 2500);
  };

  // Derived values
  const kids = state.members.filter((m) => m.role === "kid");
  const adults = state.members.filter((m) => m.role === "parent");
  const allQuests = [...state.quests.filter((q) => q.isActive), state.todayMystery].filter(Boolean);
  const pendingApprovals = state.completions.filter((c) => c.status === "pending_approval");
  const pendingRewardRequests = (state.pendingRewards || []).filter((pr) => pr.status === "pending_approval");
  const totalPending = pendingApprovals.length + pendingRewardRequests.length;

  const getQuestMembers = (quest) => {
    const aud = quest.audience || "kids";
    if (aud === "adults") return adults;
    if (aud === "all") return [...kids, ...adults];
    return kids;
  };

  const isQuestDone = (questId, memberId, type) => {
    return state.completions.some(
      (c) => c.questId === questId && c.memberId === memberId && c.status !== "rejected" &&
        ((type === "daily" || type === "mystery") ? isToday(c.completedAt) : isThisWeek(c.completedAt, state.weekStart))
    );
  };

  const completeQuest = (questId, memberId) => {
    const quest = [...state.quests, state.todayMystery].find((q) => q?.id === questId);
    if (!quest) return;
    const already = state.completions.find(
      (c) => c.questId === questId && c.memberId === memberId &&
        ((quest.type === "daily" || quest.type === "mystery") ? isToday(c.completedAt) : isThisWeek(c.completedAt, state.weekStart))
    );
    if (already) { showToast("Already completed!"); return; }
    const member = state.members.find((m) => m.id === memberId);
    const needsApproval = member?.role === "kid";
    const completion = {
      id: "c-" + Date.now(),
      questId,
      memberId,
      completedAt: new Date().toISOString(),
      status: needsApproval ? "pending_approval" : "approved",
    };
    let members = [...state.members];
    if (!needsApproval) {
      members = members.map((m) =>
        m.id === memberId
          ? { ...m, xp: m.xp + quest.xpReward, tokens: m.tokens + quest.tokenReward, level: getLevel(m.xp + quest.xpReward) }
          : m
      );
      triggerXp(quest.xpReward);
    }
    const isKid = member?.role === "kid";
    const coopMission = { ...state.coopMission };
    const adultCoopMission = { ...state.adultCoopMission };
    const longTermMission = { ...state.longTermMission };
    if (!needsApproval) {
      if (isKid) {
        coopMission.currentXp = (coopMission.currentXp || 0) + quest.xpReward;
        if (coopMission.currentXp >= coopMission.targetXp && (coopMission.currentXp - quest.xpReward) < coopMission.targetXp) {
          triggerConfetti();
          showToast("🎉 KIDS CO-OP COMPLETE! " + coopMission.reward);
        }
        longTermMission.currentXp = (longTermMission.currentXp || 0) + quest.xpReward;
        if (longTermMission.currentXp >= longTermMission.targetXp && (longTermMission.currentXp - quest.xpReward) < longTermMission.targetXp) {
          triggerConfetti();
          showToast("🎉 YES DAY UNLOCKED! " + longTermMission.reward);
        }
      } else {
        adultCoopMission.currentXp = (adultCoopMission.currentXp || 0) + quest.xpReward;
        if (adultCoopMission.currentXp >= adultCoopMission.targetXp && (adultCoopMission.currentXp - quest.xpReward) < adultCoopMission.targetXp) {
          triggerConfetti();
          showToast("🎉 ADULT CO-OP COMPLETE! " + adultCoopMission.reward);
        }
      }
    }
    const log = [
      { text: `${member?.name} completed "${quest.title}"${needsApproval ? " (pending approval)" : ""}`, time: new Date().toISOString() },
      ...state.activityLog.slice(0, 19),
    ];
    saveState({ ...state, completions: [...state.completions, completion], members, coopMission, adultCoopMission, longTermMission, activityLog: log });
    if (needsApproval) showToast("Submitted for approval! ⏳");
    else showToast(`+${quest.xpReward} XP, +${quest.tokenReward} tokens! ⚡`);
  };

  const approveCompletion = (completionId, approved) => {
    let members = [...state.members];
    let coopMission = { ...state.coopMission };
    let longTermMission = { ...state.longTermMission };
    const completions = state.completions.map((c) => {
      if (c.id === completionId) {
        if (approved) {
          const quest = [...state.quests, state.todayMystery].find((q) => q?.id === c.questId);
          if (quest) {
            members = members.map((m) =>
              m.id === c.memberId
                ? { ...m, xp: m.xp + quest.xpReward, tokens: m.tokens + quest.tokenReward, level: getLevel(m.xp + quest.xpReward) }
                : m
            );
            coopMission.currentXp = (coopMission.currentXp || 0) + quest.xpReward;
            longTermMission.currentXp = (longTermMission.currentXp || 0) + quest.xpReward;
            if (longTermMission.currentXp >= longTermMission.targetXp && (longTermMission.currentXp - quest.xpReward) < longTermMission.targetXp) {
              triggerConfetti();
              showToast("🎉 YES DAY UNLOCKED! " + longTermMission.reward);
            }
          }
        }
        return { ...c, status: approved ? "approved" : "rejected" };
      }
      return c;
    });
    saveState({ ...state, completions, members, coopMission, longTermMission });
    showToast(approved ? "Quest approved! ✅" : "Quest rejected ❌");
  };

  const redeemReward = (rewardId, memberId) => {
    const reward = state.rewards.find((r) => r.id === rewardId);
    const member = state.members.find((m) => m.id === memberId);
    if (!reward || !member || member.tokens < reward.tokenCost) {
      showToast("Not enough tokens!");
      return;
    }
    if (member.role === "kid") {
      const pendingRewards = [
        { id: "pr-" + Date.now(), rewardId, memberId, requestedAt: new Date().toISOString(), status: "pending_approval" },
        ...(state.pendingRewards || []),
      ];
      const log = [
        { text: `${member.name} requested "${reward.title}" (pending approval)`, time: new Date().toISOString() },
        ...state.activityLog.slice(0, 19),
      ];
      saveState({ ...state, pendingRewards, activityLog: log });
      triggerConfetti();
      showToast(`🎁 ${reward.title} requested! ⏳`);
      return;
    }
    const members = state.members.map((m) =>
      m.id === memberId ? { ...m, tokens: m.tokens - reward.tokenCost } : m
    );
    const log = [
      { text: `${member.name} redeemed "${reward.title}"!`, time: new Date().toISOString() },
      ...state.activityLog.slice(0, 19),
    ];
    saveState({ ...state, members, activityLog: log });
    triggerConfetti();
    showToast(`🎁 ${reward.title} redeemed!`);
  };

  const redeemAdultReward = (memberId, reward) => {
    const member = state.members.find((m) => m.id === memberId);
    if (!member || member.tokens < reward.tokenCost) { showToast("Not enough tokens!"); return; }
    const members = state.members.map((m) =>
      m.id === memberId ? { ...m, tokens: m.tokens - reward.tokenCost } : m
    );
    const log = [
      { text: `${member.name} redeemed "${reward.title}"!`, time: new Date().toISOString() },
      ...state.activityLog.slice(0, 19),
    ];
    saveState({ ...state, members, activityLog: log });
    triggerConfetti();
    showToast(`🎁 ${reward.title} redeemed!`);
  };

  const approveRewardRedemption = (pendingRewardId, approved) => {
    const pending = (state.pendingRewards || []).find((pr) => pr.id === pendingRewardId);
    if (!pending) return;
    const reward = state.rewards.find((r) => r.id === pending.rewardId);
    const member = state.members.find((m) => m.id === pending.memberId);
    const pendingRewards = (state.pendingRewards || []).filter((pr) => pr.id !== pendingRewardId);
    if (approved && reward && member) {
      const members = state.members.map((m) =>
        m.id === pending.memberId ? { ...m, tokens: m.tokens - reward.tokenCost } : m
      );
      const log = [
        { text: `${member.name} redeemed "${reward.title}"! (approved)`, time: new Date().toISOString() },
        ...state.activityLog.slice(0, 19),
      ];
      saveState({ ...state, pendingRewards, members, activityLog: log });
      showToast("Reward approved! ✅");
    } else {
      const log = [
        { text: `${member?.name}'s request for "${reward?.title}" was denied.`, time: new Date().toISOString() },
        ...state.activityLog.slice(0, 19),
      ];
      saveState({ ...state, pendingRewards, activityLog: log });
      showToast("Reward request denied ❌");
    }
  };

  const parentMarkComplete = (questId, memberId) => {
    const quest = [...state.quests, state.todayMystery].find((q) => q?.id === questId);
    if (!quest) return;
    const already = state.completions.find(
      (c) => c.questId === questId && c.memberId === memberId && c.status !== "rejected" &&
        ((quest.type === "daily" || quest.type === "mystery") ? isToday(c.completedAt) : isThisWeek(c.completedAt, state.weekStart))
    );
    if (already) { showToast("Already completed!"); return; }
    const member = state.members.find((m) => m.id === memberId);
    const completion = { id: "c-" + Date.now(), questId, memberId, completedAt: new Date().toISOString(), status: "approved" };
    let members = state.members.map((m) =>
      m.id === memberId
        ? { ...m, xp: m.xp + quest.xpReward, tokens: m.tokens + quest.tokenReward, level: getLevel(m.xp + quest.xpReward) }
        : m
    );
    const isKid = member?.role === "kid";
    const coopMission = { ...state.coopMission };
    const adultCoopMission = { ...state.adultCoopMission };
    const longTermMission = { ...state.longTermMission };
    if (isKid) {
      coopMission.currentXp = (coopMission.currentXp || 0) + quest.xpReward;
      longTermMission.currentXp = (longTermMission.currentXp || 0) + quest.xpReward;
    } else {
      adultCoopMission.currentXp = (adultCoopMission.currentXp || 0) + quest.xpReward;
    }
    const log = [
      { text: `${member?.name} completed "${quest.title}" (marked by HQ)`, time: new Date().toISOString() },
      ...state.activityLog.slice(0, 19),
    ];
    saveState({ ...state, completions: [...state.completions, completion], members, coopMission, adultCoopMission, longTermMission, activityLog: log });
    showToast(`Marked complete! +${quest.xpReward} XP`);
  };

  const parentUnmarkComplete = (questId, memberId) => {
    const quest = [...state.quests, state.todayMystery].find((q) => q?.id === questId);
    if (!quest) return;
    const completion = state.completions.find(
      (c) => c.questId === questId && c.memberId === memberId && c.status !== "rejected" &&
        ((quest.type === "daily" || quest.type === "mystery") ? isToday(c.completedAt) : isThisWeek(c.completedAt, state.weekStart))
    );
    if (!completion) return;
    let members = [...state.members];
    const coopMission = { ...state.coopMission };
    const adultCoopMission = { ...state.adultCoopMission };
    const longTermMission = { ...state.longTermMission };
    if (completion.status === "approved") {
      const member = state.members.find((m) => m.id === memberId);
      members = members.map((m) =>
        m.id === memberId
          ? { ...m, xp: Math.max(0, m.xp - quest.xpReward), tokens: Math.max(0, m.tokens - quest.tokenReward), level: getLevel(Math.max(0, m.xp - quest.xpReward)) }
          : m
      );
      if (member?.role === "kid") {
        coopMission.currentXp = Math.max(0, (coopMission.currentXp || 0) - quest.xpReward);
        longTermMission.currentXp = Math.max(0, (longTermMission.currentXp || 0) - quest.xpReward);
      } else {
        adultCoopMission.currentXp = Math.max(0, (adultCoopMission.currentXp || 0) - quest.xpReward);
      }
    }
    const completions = state.completions.filter((c) => c.id !== completion.id);
    const member = state.members.find((m) => m.id === memberId);
    const log = [
      { text: `${member?.name}'s completion of "${quest.title}" was removed`, time: new Date().toISOString() },
      ...state.activityLog.slice(0, 19),
    ];
    saveState({ ...state, completions, members, coopMission, adultCoopMission, longTermMission, activityLog: log });
    showToast("Completion removed");
  };

  const resetWeek = useCallback(() => {
    saveState({ ...state, weekStart: new Date().toISOString() });
    showToast("Weekly quests reset! New week started.");
  }, [state, saveState]);

  const exportState = useCallback(() => {
    const data = JSON.stringify(state, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `quest-board-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Game exported!");
  }, [state]);

  const importState = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const imported = JSON.parse(ev.target.result);
        if (!imported.members || !imported.quests) {
          showToast("Invalid save file.");
          return;
        }
        saveState({ ...INITIAL_STATE, ...imported });
        showToast("Game imported!");
      } catch {
        showToast("Failed to read file.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }, [saveState]);

  const value = {
    state, saveState,
    xpPopup, showConfetti, toast,
    showToast, triggerXp, triggerConfetti,
    kids, adults, allQuests,
    pendingApprovals, pendingRewardRequests, totalPending,
    isQuestDone, getQuestMembers,
    completeQuest, approveCompletion,
    redeemReward, redeemAdultReward,
    approveRewardRedemption,
    parentMarkComplete, parentUnmarkComplete,
    resetWeek,
    exportState, importState, fileInputRef,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}
