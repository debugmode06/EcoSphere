# EcoSphere — Team Split

## Team of 4 — Module Ownership

| Person | Focus | Backend Folder | Frontend Folder | Key Files |
|---|---|---|---|---|
| **Person 1** | Environmental | `backend/src/modules/environmental/` | `frontend/src/modules/environmental/pages/` | `environmental.service.js` — emission calc, goal tracking |
| **Person 2** | Social | `backend/src/modules/social/` | `frontend/src/modules/social/pages/` | `social.service.js` — participation + evidence rule |
| **Person 3** | Governance | `backend/src/modules/governance/` | `frontend/src/modules/governance/pages/` | `governance.service.js` — overdue compliance check |
| **Person 4** | Gamification + Core | `backend/src/modules/gamification/` + `core/` | `frontend/src/modules/gamification/pages/` + `core/pages/` | `gamification.service.js` — XP, badges, rewards; `scoringEngine.js` |

---

## Conflict-Free Working Rules

1. **Never edit another person's module folder** — all merge conflicts stay near zero.
2. **Shared files** (auth, middleware, utils) → coordinate via PR comments, not direct edits.
3. **Models are final** — the Mongoose models in each module folder are fixed. If you need a field, add to your own model only; don't modify another module's model.
4. **Core module depends on everyone** — Person 4 should merge last (after P1/P2/P3 have seeded real data) so the scoring engine and dashboard have actual data to aggregate.

---

## Person 1 — Environmental

### Backend: `backend/src/modules/environmental/`
```
environmental.routes.js        — GET/POST /emission-factors, /carbon-transactions, /goals
environmental.controller.js    — thin controller delegating to service
environmental.service.js       — emission calc (quantity × factorValue), goal progress
environmental.validation.js    — express-validator rules
models/
  EmissionFactor.model.js
  CarbonTransaction.model.js
  EnvironmentalGoal.model.js
```

### Frontend: `frontend/src/modules/environmental/pages/`
```
EmissionsPage.jsx   — list + chart + add-emission form
GoalsPage.jsx       — goal cards with progress bars + add-goal form
```

### API: `frontend/src/api/environmentalApi.js`

---

## Person 2 — Social

### Backend: `backend/src/modules/social/`
```
social.routes.js        — GET/POST /csr-activities, /participations, PATCH approve
social.controller.js
social.service.js       — participation join, evidence rule, points award
social.validation.js
models/
  CsrActivity.model.js
  EmployeeParticipation.model.js
```

### Frontend: `frontend/src/modules/social/pages/`
```
ActivitiesPage.jsx      — activity cards with join modal
ParticipationPage.jsx   — table with approve/reject (manager/admin only)
```

### API: `frontend/src/api/socialApi.js`

---

## Person 3 — Governance

### Backend: `backend/src/modules/governance/`
```
governance.routes.js        — GET/POST /policies, /audits, /compliance-issues
governance.controller.js
governance.service.js       — overdue detection on-read, policy acknowledge, resolve
governance.validation.js
models/
  EsgPolicy.model.js
  PolicyAcknowledgement.model.js
  Audit.model.js
  ComplianceIssue.model.js
```

### Frontend: `frontend/src/modules/governance/pages/`
```
PoliciesPage.jsx    — policy cards with acknowledge button
AuditsPage.jsx      — audit table + create modal
CompliancePage.jsx  — issues table with overdue flag + resolve button
```

### API: `frontend/src/api/governanceApi.js`

---

## Person 4 — Gamification + Core

### Backend: `backend/src/modules/gamification/`
```
gamification.routes.js        — /challenges, /badges, /rewards/redeem
gamification.controller.js
gamification.service.js       — XP award, badge auto-unlock, atomic reward redemption
gamification.validation.js
models/
  Challenge.model.js
  ChallengeParticipation.model.js
  Badge.model.js
  Reward.model.js
```

### Backend: `backend/src/modules/core/`
```
core.routes.js          — /dashboard, /scores, /departments, /reports, /leaderboard
core.controller.js
scoringEngine.js        — E×0.4 + S×0.3 + G×0.3 → totalScore → orgScore
notificationService.js  — console log stub (wire email/Slack here)
reportService.js        — cross-module aggregation with filters
models/
  Department.model.js
  Category.model.js
  DepartmentScore.model.js
```

### Frontend: `frontend/src/modules/gamification/pages/`
```
ChallengesPage.jsx   — challenge cards, join modal
BadgesPage.jsx       — badge emoji cards
RewardsPage.jsx      — point balance, redeem button, stock indicator
```

### Frontend: `frontend/src/modules/core/pages/`
```
OrgDashboard.jsx    — ESG score hero, radar chart, leaderboard
Reports.jsx         — filter form + tabular results
Settings.jsx        — weight sliders + recalculate
```

### API: `frontend/src/api/gamificationApi.js`, `frontend/src/api/coreApi.js`

---

## Seed & Onboarding Sequence

```
Step 1  One teammate sets up Atlas (5 min), shares MONGO_URI
Step 2  Everyone: cp .env.example .env && paste MONGO_URI
Step 3  One teammate: cd backend && node seed.js
Step 4  All: npm run dev (backend + frontend)
Step 5  Split off to your module folder
Step 6  Person 4 merges last
```
