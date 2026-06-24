# MedProof inventory

Architecture:

```text
React frontend
↓ HTTP/API requests
Python FastAPI backend
↓
PostgreSQL database
```

## Backend setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload
```

## Frontend setup

```bash
cd frontend
npm install
npm run dev
```

## PostgreSQL

Create a database named `medtrack` and update `backend/.env`:

```env
DATABASE_URL=postgresql+psycopg://postgres:password@localhost:5432/medtrack
```

The backend creates MVP tables automatically on startup.
