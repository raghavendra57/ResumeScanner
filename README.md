# Smart Resume Screener

AI-powered resume screening and ATS scoring app for recruiters and hiring teams.

This project combines a React frontend with an Express backend to analyze uploaded PDF resumes against a job description, score compatibility, extract candidate details, and store shortlisted candidates in MongoDB.

---

## Overview

The app evaluates resumes in two ways:

- Rule-based matching using technical keywords and skill dictionaries
- AI-based semantic analysis using Google Gemini for better contextual match scoring

It then returns:

- ATS-style compatibility score
- overall match score
- extracted candidate details
- matched and missing skills
- strengths and gaps
- shortlist justification
- persisted candidate history in MongoDB

---

## Features

- Resume upload in PDF format
- Job description input via text or PDF upload
- Candidate details extraction: name, email, phone, education, experience, certifications
- ATS score calculation with explainable breakdown
- AI semantic scoring for better relevance matching
- Candidate history dashboard
- Shortlist toggle and delete actions
- Search and filter by shortlisted status
- Graceful fallback when Gemini or MongoDB is unavailable

---

## Tech Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MongoDB + Mongoose
- PDF parsing: pdf-parse
- AI: Google Gemini via @google/genai
- File handling: Multer

---

## Project Structure

```text
ResumeScreener/
├── backend/
│   ├── app.js
│   ├── db.js
│   ├── server.js
│   ├── package.json
│   ├── .env
│   ├── .env.example
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   └── tests/
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
├── README.md
└── .gitignore
```

---

## Prerequisites

Before running the app, install:

- Node.js 18 or later
- MongoDB running locally or a MongoDB Atlas connection string
- Gemini API key from Google AI Studio

---

## Environment Setup

Create a `.env` file inside the backend folder:

```env
PORT=5000
GEMINI_API_KEY=your_gemini_api_key_here
MONGODB_URI=mongodb://localhost:27017/resume_screener
```

You can copy the example file if available:

```bash
cd backend
copy .env.example .env
```

Then update the values with your own credentials.

---

## Run the App

### 1) Start the backend

```bash
cd backend
npm install
npm start
```

The backend runs on:

```text
http://localhost:5000
```

### 2) Start the frontend

Open a new terminal and run:

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on:

```text
http://localhost:5173
```

---

## Deployment Guide

### Option 1: Full-Stack Vercel Deployment (Recommended)

This repository includes `vercel.json` configured for a unified deployment (Frontend + Serverless Express API):

1. Go to [Vercel Dashboard](https://vercel.com/new).
2. Connect your GitHub account and import the repository: **`raghavendra57/ResumeScanner`**.
3. In the project configuration:
   - **Framework Preset**: Vite / Other
   - **Root Directory**: `./` (leave default)
4. Add the following **Environment Variables** in Vercel:
   - `GEMINI_API_KEY`: Your Google Gemini API Key
   - `MONGODB_URI`: Your MongoDB Atlas Connection String
5. Click **Deploy**. Vercel will automatically build the React frontend and deploy the Express API routes under `/api/*`.

---

### Option 2: Render (Backend) + Vercel (Frontend)

#### Backend on Render:
1. Go to [Render Dashboard](https://dashboard.render.com/) -> **New Web Service**.
2. Connect **`raghavendra57/ResumeScanner`**.
3. Settings:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Add Environment Variables:
   - `PORT`: `5000`
   - `GEMINI_API_KEY`: `your_gemini_api_key`
   - `MONGODB_URI`: `your_mongodb_uri`
5. Copy your Render Backend URL (e.g. `https://resume-scanner-api.onrender.com`).

#### Frontend on Vercel:
1. Import **`raghavendra57/ResumeScanner`** into Vercel.
2. Set **Root Directory** to `frontend`.
3. Add Environment Variable:
   - `VITE_API_URL`: `https://resume-scanner-api.onrender.com`
4. Deploy!

---

## API Endpoints

### Resume analysis

```http
POST /api/analyze
```

Body: multipart/form-data with:

- `resume` - candidate resume PDF
- `jobDescriptionText` - raw job description text (optional)
- `jobDescriptionFile` - JD PDF (optional)

### Candidate history

```http
GET /api/candidates
GET /api/candidates/:id
PATCH /api/candidates/:id/shortlist
DELETE /api/candidates/:id
```

### Health check

```http
GET /api/health
```

---

## ATS Scoring Logic

The ATS score combines several weighted components:

- Skills: 40%
- Semantic matching: 30%
- Experience alignment: 15%
- Education alignment: 10%
- Resume structure: 5%

This gives a final ATS score from 0 to 100.

---

## Troubleshooting

### Node cannot find the server file

Run the command from the backend folder, not the repository root:

```bash
cd backend
node server.js
```

### Git push rejected

This happens when the remote branch has newer commits than your local copy.

```bash
git pull --rebase origin main
git push origin main
```

### Gemini key missing

The app will still run in fallback mode, but AI features will be unavailable until `GEMINI_API_KEY` is set.

### MongoDB not connected

The app continues in standalone mode and still performs rule-based scoring, but candidate history may not persist.

---

## Notes

- Uploaded PDFs are processed in memory and not stored on disk.
- The app is designed to be safe for local development and demo use.
- Sensitive values should stay in `.env` and not be committed to version control.

---

## License

This project is for educational and portfolio/demo purposes.

