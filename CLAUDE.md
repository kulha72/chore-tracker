# Chore Tracker - Claude Agent Instructions

## What This App Is
A gamified family chore management app built with React + Vite. Chores are "quests", rewards are earned via XP and tokens, and parents manage everything through a PIN-protected HQ panel. Deployed to GitHub Pages from the `main` branch.

## Repository Structure
```
chore-tracker/
├── quest.jsx                      # Root component — thin orchestrator (~115 lines)
├── src/
│   ├── main.jsx                   # React entry point (mounts quest.jsx)
│   ├── constants.js               # INITIAL_STATE, LEVEL_TITLES, LEVEL_THRESHOLDS, PARENT_PIN
│   ├── utils.js                   # Pure utilities: getLevel, getLevelProgress, isToday, isThisWeek, daysUntilSunday, speak
│   ├── context/
│   │   └── GameContext.jsx        # React Context: all game state, handlers, derived values
│   ├── components/
│   │   ├── SpeakBtn.jsx           # Text-to-speech button
│   │   ├── Stars.jsx              # Animated background stars
│   │   ├── XpPopup.jsx            # Floating XP animation
│   │   └── ConfettiEffect.jsx     # Confetti celebration animation
│   └── screens/
│       ├── SelectScreen.jsx       # Member selection / home screen
│       ├── BoardScreen.jsx        # Active user quest board
│       ├── KidView.jsx            # Kid profile + loot shop
│       ├── AdultView.jsx          # Adult profile + loot shop
│       ├── PinScreen.jsx          # PIN entry for HQ access
│       └── ParentHQ.jsx           # Quest Master HQ (manage + checklist tabs)
├── index.html                     # HTML shell
├── vite.config.js                 # Vite config (base: /chore-tracker/)
├── package.json
└── .github/workflows/deploy.yml   # Deploy to GitHub Pages on push to main
```

## Architecture

### State Management
- **Game state** lives in `GameContext` (`src/context/GameContext.jsx`) — all quest/member/reward data, persistence, and action handlers are provided via `useGame()`.
- **Navigation state** lives in `quest.jsx` — view routing, active user, PIN input, HQ edit toggles. Passed to screen components as a `nav` prop object.
- No Redux. React Context is used only for game state; nav state is prop-drilled via `nav`.
- Game state is persisted to `localStorage` via `saveState()` after every mutation.
- State shape: `{ members[], quests[], completions[], rewards[], adultRewards[], coopMission, adultCoopMission, longTermMission, mysteryPool[], pendingRewards[], todayMystery, activityLog[], weekStart }`

### Component Pattern
Each screen component:
1. Calls `useGame()` to access game state and handlers
2. Receives a `nav` prop with navigation state and setters
3. Is a standalone `.jsx` file in `src/screens/`

### `nav` Prop Shape
The `nav` object passed to screens contains:
```
view, setView, activeUser, setActiveUser, selectedMember, setSelectedMember,
pinInput, setPinInput, pinError, setPinError, hqTab, setHqTab,
editingQuest, setEditingQuest, editingReward, setEditingReward,
editingMember, setEditingMember, editCoopOpen, setEditCoopOpen,
editAdultCoopOpen, setEditAdultCoopOpen, editLongTermOpen, setEditLongTermOpen
```

## Key Rules & Business Logic

### Approval Logic
- **Kids** (`role: "kid"`): ALL chore submissions require parent approval, regardless of the quest's `requiresApproval` flag.
- **Adults/Parents** (`role: "parent"`): NEVER require approval — always auto-approved.
- Approval condition in `GameContext.jsx` `completeQuest`: `const needsApproval = member?.role === "kid";`

### Roles
- `role: "parent"` — manages the app via HQ, auto-approves their own chores
- `role: "kid"` — submits chores for approval, earns XP/tokens, redeems rewards

### Parent PIN
- Hardcoded as `"1234"` in `src/constants.js` (`PARENT_PIN` constant)
- Guards access to the "parent" view (Quest Master HQ), checked in `src/screens/PinScreen.jsx`

### Quest Types
- `daily` — resets each day
- `weekly` — resets each week (based on `weekStart`)
- `mystery` — one random quest per day drawn from `mysteryPool`

### Quest Audience
- `"kids"` — only shown to kid members
- `"adults"` — only shown to parent members
- `"all"` — shown to everyone

### Adult Reward Redemption
- Adult rewards (`adultRewards`) are redeemed directly via `redeemAdultReward(memberId, reward)` in GameContext — no approval flow.
- Kid rewards (`rewards`) go through `redeemReward(rewardId, memberId)` which creates a pending request requiring parent approval.

## Tech Stack
| | |
|---|---|
| Framework | React 19 |
| Build | Vite 8 |
| Styling | Inline CSS objects (no external CSS) |
| Persistence | `localStorage` |
| Accessibility | Web Speech API (text-to-speech via `speak()` in `utils.js`) |
| Deployment | GitHub Pages via GitHub Actions |

## Development

```bash
npm install
npm run dev      # local dev server
npm run build    # production build to dist/
```

Deployment happens automatically when changes are merged to `main`.

## Important Conventions
- **Do not consolidate back into a single file.** The modular structure is intentional.
- Styles are inline CSS objects — do not introduce CSS files or CSS-in-JS libraries.
- Do not add error handling for internal invariants — only validate at system boundaries.
- The `requiresApproval` field on quests is kept for UI display in the HQ editor but does NOT control the approval flow (kids always need approval).
- When adding new game actions, add them to `GameContext.jsx` and expose via context value.
- When adding new screens, add them to `src/screens/`, wire up a new `view` state value in `quest.jsx`, and consume `useGame()` + `nav` prop.
