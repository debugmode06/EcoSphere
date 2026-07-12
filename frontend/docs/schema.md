# EcoSphere — Mongoose Schema Reference

All collections use **ObjectId refs** (not embedded docs) so each module owns its data cleanly. Use `.populate()` on reads.

---

## `employees` — `auth/models/Employee.model.js`

| Field | Type | Notes |
|---|---|---|
| name | String | required |
| email | String | required, unique |
| passwordHash | String | bcrypt-hashed, never expose |
| role | String enum | `ADMIN`, `MANAGER`, `EMPLOYEE` |
| department | ObjectId → Department | required |
| xp | Number | default 0; incremented by gamification service |
| points | Number | default 0; decremented on reward redemption |
| badges | [ObjectId] → Badge | array; auto-populated by badge service |
| timestamps | createdAt, updatedAt | |

---

## `departments` — `core/models/Department.model.js`

| Field | Type | Notes |
|---|---|---|
| name | String | required |
| code | String | required, unique (e.g. `ENG`) |
| head | String | optional manager name |
| parentDepartment | ObjectId → Department | self-ref, null = root dept |
| employeeCount | Number | maintained by auth service |
| status | String | default `Active` |

---

## `categories` — `core/models/Category.model.js`

| Field | Type | Notes |
|---|---|---|
| name | String | required |
| type | String enum | `CSR_ACTIVITY` or `CHALLENGE` |
| status | String | default `Active` |

---

## `departmentscores` — `core/models/DepartmentScore.model.js`

| Field | Type | Notes |
|---|---|---|
| department | ObjectId → Department | required, **unique** (1 score doc per dept) |
| environmentalScore | Number | 0–100 |
| socialScore | Number | 0–100 |
| governanceScore | Number | 0–100 |
| totalScore | Number | weighted average via scoring engine |

---

## `emissionfactors` — `environmental/models/EmissionFactor.model.js`

| Field | Type | Notes |
|---|---|---|
| name | String | required (e.g. "Grid Electricity") |
| unit | String | required (e.g. "kWh") |
| factorValue | Number | kg CO₂ per unit |
| source | String | optional citation |

---

## `carbontransactions` — `environmental/models/CarbonTransaction.model.js`

| Field | Type | Notes |
|---|---|---|
| department | ObjectId → Department | required |
| emissionFactor | ObjectId → EmissionFactor | required |
| quantity | Number | required |
| calculatedEmission | Number | **auto-computed** server-side: `quantity × factorValue` |
| source | String enum | `Purchase`, `Manufacturing`, `Expense`, `Fleet` |
| date | Date | default now |

---

## `environmentalgoals` — `environmental/models/EnvironmentalGoal.model.js`

| Field | Type | Notes |
|---|---|---|
| title | String | required |
| targetValue | Number | required |
| currentValue | Number | updated via PATCH progress endpoint |
| deadline | Date | required |
| department | ObjectId → Department | optional |

---

## `csractivities` — `social/models/CsrActivity.model.js`

| Field | Type | Notes |
|---|---|---|
| title | String | required |
| category | ObjectId → Category | optional |
| description | String | optional |
| department | ObjectId → Department | optional |
| date | Date | required |
| status | String | `Planned`, `Active`, `Completed` |
| evidenceRequired | Boolean | drives approval rule |
| pointsOnCompletion | Number | default 10 |

---

## `employeeparticipations` — `social/models/EmployeeParticipation.model.js`

| Field | Type | Notes |
|---|---|---|
| employee | ObjectId → Employee | required |
| activity | ObjectId → CsrActivity | required |
| proofUrl | String | required if `activity.evidenceRequired` |
| approvalStatus | String enum | `PENDING`, `APPROVED`, `REJECTED` |
| pointsEarned | Number | set on approval |
| completionDate | Date | set on approval |

**Business rule:** `APPROVED` blocked if `proofUrl` empty and `activity.evidenceRequired = true`.

---

## `esgpolicies` — `governance/models/EsgPolicy.model.js`

| Field | Type | Notes |
|---|---|---|
| title | String | required |
| description | String | optional |
| version | String | default `1.0` |
| status | String | `Draft`, `Published`, `Archived` |
| publishedDate | Date | optional |

---

## `policyacknowledgements` — `governance/models/PolicyAcknowledgement.model.js`

| Field | Type | Notes |
|---|---|---|
| policy | ObjectId → EsgPolicy | required |
| employee | ObjectId → Employee | required |
| acknowledgedDate | Date | default now |

**Compound unique index** on `{ policy, employee }` — prevents duplicate acks.

---

## `audits` — `governance/models/Audit.model.js`

| Field | Type | Notes |
|---|---|---|
| title | String | required |
| department | ObjectId → Department | optional |
| date | Date | required |
| findings | String | optional |
| status | String | `Scheduled`, `In Progress`, `Completed`, `Cancelled` |

---

## `complianceissues` — `governance/models/ComplianceIssue.model.js`

| Field | Type | Notes |
|---|---|---|
| audit | ObjectId → Audit | optional |
| severity | String enum | `Low`, `Medium`, `High`, `Critical` |
| description | String | required |
| owner | String | required |
| dueDate | Date | required |
| status | String enum | `OPEN`, `RESOLVED` |
| isOverdue | Boolean | set by service on read if `OPEN && dueDate < now` |

---

## `challenges` — `gamification/models/Challenge.model.js`

| Field | Type | Notes |
|---|---|---|
| title | String | required |
| category | ObjectId → Category | optional |
| description | String | optional |
| xp | Number | XP awarded on completion |
| difficulty | String | `Easy`, `Medium`, `Hard` |
| evidenceRequired | Boolean | default false |
| deadline | Date | optional |
| status | String enum | `DRAFT`, `ACTIVE`, `UNDER_REVIEW`, `COMPLETED`, `ARCHIVED` |

---

## `challengeparticipations` — `gamification/models/ChallengeParticipation.model.js`

| Field | Type | Notes |
|---|---|---|
| challenge | ObjectId → Challenge | required |
| employee | ObjectId → Employee | required |
| progress | Number | 0–100 |
| proofUrl | String | optional |
| approval | String enum | `PENDING`, `APPROVED`, `REJECTED` |
| xpAwarded | Number | set on approval; triggers badge check |

---

## `badges` — `gamification/models/Badge.model.js`

| Field | Type | Notes |
|---|---|---|
| name | String | required |
| description | String | optional |
| unlockType | String enum | `xp` or `challengeCount` |
| threshold | Number | required |
| icon | String | emoji or icon key |

**Auto-award logic:** after XP update, service checks all badges and pushes newly qualifying ones into `employee.badges`.

---

## `rewards` — `gamification/models/Reward.model.js`

| Field | Type | Notes |
|---|---|---|
| name | String | required |
| description | String | optional |
| pointsRequired | Number | required |
| stock | Number | decremented atomically via Mongoose transaction |
| status | String | `Active`, `Inactive` |

**Redemption:** uses `mongoose.startSession()` / `session.startTransaction()` to atomically decrement both `employee.points` and `reward.stock`.
