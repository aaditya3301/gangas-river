# AquaGuardians

AquaGuardians is a river risk intelligence platform built for flood monitoring, emergency coordination, and community reporting. It provides role-based experiences for citizens, officials, NGOs, and researchers on top of a shared geospatial and analytics backend.

## Core Modules

- Citizen safety and incident reporting workflows
- Official command center for alerts, verification, evacuation, and coordination
- NGO operations portal with activity reporting and leaderboard metrics
- Researcher workspace for datasets, models, and insights
- Central API layer with geospatial and prediction services

## Tech Stack

- Frontend: Next.js (App Router), TypeScript, Tailwind CSS, TanStack Query
- Backend: FastAPI, async SQLAlchemy, Pydantic
- Data: PostgreSQL/PostGIS
- Integrations: SMS and voice alert services

## Quick Start

### Prerequisites

- Node.js 18+
- Python 3.11+
- PostgreSQL (PostGIS recommended)

### 1. Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend API: http://localhost:8000
API docs: http://localhost:8000/docs

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend app: http://localhost:3000

## Environment Variables

Create environment files in each app:

- Backend: backend/.env
- Frontend: frontend/.env.local

Typical values:

- Backend: DATABASE_URL, SECRET_KEY, TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER, FAST2SMS_API_KEY, BACKEND_PUBLIC_URL
- Frontend: NEXT_PUBLIC_API_URL

## Project Structure

```text
gangas-river/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── db/
│   │   ├── schemas/
│   │   └── services/
│   └── requirements.txt
├── frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── public/
└── docs/
```

## Selected API Routes

- Official dashboard: GET /api/official/command-center
- NGO reporting: POST /api/ngo/activity-report
- NGO leaderboard: GET /api/ngo/leaderboard-detailed
- Alerts: POST /api/alerts/send-sms

## Contributing

1. Create a feature branch.
2. Keep changes focused and test locally.
3. Open a pull request with a clear summary.

## License

Project usage and data licensing follow repository and event guidelines.
