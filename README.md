# Travel CRM

A modern CRM system for travel agencies — manage leads, trips, quotes, and follow-ups.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, TypeScript, React 19 |
| Backend | Django 5.2, Django REST Framework |
| Database | PostgreSQL (Neon) / SQLite (local) |
| Frontend Hosting | Vercel |
| Backend Hosting | Render |
| CI/CD | GitHub Actions |

## Project Structure

```
travelcrm/
├── frontend/          # Next.js app
│   ├── app/           # App router pages
│   ├── public/        # Static assets
│   └── package.json
├── backend/           # Django app
│   ├── crm/           # CRM Django app (models, views, tests)
│   ├── travel_crm/    # Django project config
│   ├── requirements.txt
│   └── Procfile
└── .github/workflows/ # CI/CD pipelines
```

## Local Development

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux
pip install -r requirements.txt
cp .env.example .env         # Edit with your settings
python manage.py migrate
python manage.py runserver
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Backend runs on `http://localhost:8000`, frontend on `http://localhost:3000`.

## Environment Variables

See `backend/.env.example` for all required backend configuration.

## Deployment

- **Frontend**: Auto-deploys to Vercel on push to `main`
- **Backend**: Auto-deploys to Render on push to `main`
- **Database**: Neon PostgreSQL (set `DATABASE_URL` in Render env vars)

## License

Private — All rights reserved.
