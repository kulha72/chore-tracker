# Chore Tracker - Claude Agent Instructions

## What This App Is
A gamified family chore management app built with React + Vite. Chores are "quests", rewards are earned via XP and tokens, and parents manage everything through a PIN-protected HQ panel. Deployed to GitHub Pages from the `main` branch.

## Repository Structure
```
chore-tracker/
├── quest.jsx          # Entire app — single 1300+ line React component
├── src/main.jsx       # React entry point (mounts quest.jsx)
├── index.html         # HTML shell
├── vite.config.js     # Vite config (base: /chore-tracker/)
├── package.json
└── .github/workflows/deploy.yml  # Deploy to GitHub Pages on push to main
```

## Key Rules & Business Logic

### Approval Logic
- **Kids** (`role: "kid"`): ALL chore submissions require parent approval, regardless of the quest's `requiresApproval` flag.
- **Adults/Parents** (`role: "parent"`): NEVER require approval — always auto-approved.
- Approval condition lives at `quest.jsx:358`: `const needsApproval = member?.role === "kid";`

### Roles
- `role: "parent"` — manages the app via HQ, auto-approves their own chores
- `role: "kid"` — submits chores for approval, earns XP/tokens, redeems rewards

### Parent PIN
- Hardcoded as `"1234"` at the top of `quest.jsx` (`PARENT_PIN` constant)
- Guards access to the "parent" view (Quest Master HQ)

### State
- Single `useState` object persisted to `localStorage` after every mutation via `saveState()`
- No Redux, no Context — all state flows through one component
- Shape: `{ members[], quests[], completions[], rewards[], adultRewards[], coopMission, activityLog[], todayMystery, weekStart }`

### Quest Types
- `daily` — resets each day
- `weekly` — resets each week (based on `weekStart`)
- `mystery` — one random quest per day drawn from a pool

### Quest Audience
- `"kids"` — only shown to kid members
- `"adults"` — only shown to parent members
- `"all"` — shown to everyone

## Tech Stack
| | |
|---|---|
| Framework | React 19 |
| Build | Vite 8 |
| Styling | Inline CSS objects (no external CSS) |
| Persistence | `localStorage` |
| Accessibility | Web Speech API (text-to-speech via `speak()`) |
| Deployment | GitHub Pages via GitHub Actions |

## Development

```bash
npm install
npm run dev      # local dev server
npm run build    # production build to dist/
```

Deployment happens automatically when changes are merged to `main`.

## Important Conventions
- All UI, state, and logic lives in `quest.jsx` — do not split into separate files unless explicitly asked.
- Styles are inline CSS objects — do not introduce CSS files or CSS-in-JS libraries.
- Do not add error handling for internal invariants — only validate at system boundaries.
- The `requiresApproval` field on quests is kept for UI display in the HQ editor but does NOT control the approval flow (kids always need approval).
