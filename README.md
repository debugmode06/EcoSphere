# EcoSphere 🌍

An ESG (Environmental, Social, Governance) Management Platform built with **Node.js + Express + MongoDB Atlas + React (Vite) + Tailwind CSS**.

---

## Quick Start (5 minutes)

### 1. Set up MongoDB Atlas
1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) → create a free account
2. Create a **free M0 cluster** (any region)
3. **Database Access** → Add a database user with a password
4. **Network Access** → Add IP `0.0.0.0/0` (allow from anywhere, convenient for team dev)
5. Click **Connect** → **Connect your application** → copy the `mongodb+srv://...` connection string

### 2. Clone & configure
```bash
git clone <your-repo-url>
cd ecosphere
```

**Backend:**
```bash
cd backend
cp .env.example .env
# Edit .env — paste your Atlas URI and set a JWT_SECRET
npm install
```

**Frontend:**
```bash
cd ../frontend
npm install
```

### 3. Seed the database (run once, all teammates use the same Atlas DB)
```bash
cd backend
node seed.js
```
You should see: `✅ Seeding complete!`

### 4. Run both servers
```bash
# Terminal 1 — backend on http://localhost:5000
cd backend && npm run dev

# Terminal 2 — frontend on http://localhost:5173
cd frontend && npm run dev
```

### 5. Default login credentials (from seed)
| Email | Password | Role |
|---|---|---|
| admin@ecosphere.com | Admin@123 | ADMIN |
| manager1@ecosphere.com | Manager@123 | MANAGER |
| emp1@ecosphere.com | Emp@123 | EMPLOYEE |
| emp2@ecosphere.com | Emp@123 | EMPLOYEE |
| emp3@ecosphere.com | Emp@123 | EMPLOYEE |

---

## Team Module Ownership

| Person | Backend | Frontend |
|---|---|---|
| Person 1 | `backend/src/modules/environmental/` | `frontend/src/modules/environmental/` |
| Person 2 | `backend/src/modules/social/` | `frontend/src/modules/social/` |
| Person 3 | `backend/src/modules/governance/` | `frontend/src/modules/governance/` |
| Person 4 | `backend/src/modules/gamification/` + `core/` | `frontend/src/modules/gamification/` + `core/` |

> See `docs/team-split.md` for the full breakdown.

---

## API Overview

| Module | Base Path |
|---|---|
| Auth | `POST /api/auth/register`, `POST /api/auth/login` |
| Environmental | `/api/environmental/emission-factors`, `/carbon-transactions`, `/goals` |
| Social | `/api/social/csr-activities`, `/participations` |
| Governance | `/api/governance/policies`, `/audits`, `/compliance-issues` |
| Gamification | `/api/gamification/challenges`, `/badges`, `/rewards` |
| Core | `/api/core/dashboard`, `/scores`, `/departments`, `/reports` |

---

## Tech Stack
- **Database:** MongoDB Atlas (free M0 — replica set = transactions supported)
- **Backend:** Node.js 18+, Express 5, Mongoose 8, bcryptjs, jsonwebtoken, node-cron
- **Frontend:** React 18, Vite 5, Tailwind CSS 3, React Router 6, Axios, Recharts, Lucide React
