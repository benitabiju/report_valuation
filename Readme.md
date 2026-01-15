# Report Valuation – Full Stack Application

Backend: FastAPI  
Frontend: React (Vite)  
Database: MongoDB  
Docker is used for local setup.

---

## Project Structure

report_valuation/
- api/        (Backend)
- web_app/    (Frontend)
- docker-compose.yml
- Readme.md

---

## Run Project (Docker – Recommended)

From project root:

```docker compose up --build```

Services:
- Frontend: http://localhost:5173
- Backend: http://localhost:8000/docs
- MongoDB: localhost:27017

---

## Frontend Only (Local)

cd web_app
npm install
npm run dev

Open:
http://localhost:5173

---

## Backend Only (Local)

```cd api```
pip install -r requirements.txt
uvicorn app.main:app --reload

Backend runs on:
http://localhost:8000

---

## Running Seeds (IMPORTANT)

Seeds are used to insert initial data into MongoDB.

Step 1: Make sure MongoDB is running

docker compose up mongodb

Step 2: Run seed file

cd api
python app/seeds.py

Notes:
- Seed file: api/app/seeds.py
- Run seeds only once
- MongoDB must be running before running seeds
