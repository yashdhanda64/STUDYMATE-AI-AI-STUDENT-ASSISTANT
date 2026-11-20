# 🎓 StudyMate AI – Your Smart Learning Partner

[![Vercel Deployment](https://img.shields.io/badge/Deploy-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com)
[![Google Gemini API](https://img.shields.io/badge/AI-Google%20Gemini%202.5-4285F4?style=for-the-badge&logo=google)](https://aistudio.google.com)
[![Supabase Database](https://img.shields.io/badge/Database-Supabase%20PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com)
[![React Vite](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-61DAFB?style=for-the-badge&logo=react)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Design-Tailwind%20CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com)

**StudyMate AI** is a production-grade, AI-powered student productivity and exam acceleration platform crafted specifically for university engineering and technology students (2nd-year B.Tech CSE/IT portfolio). 

It combines **Google Gemini 2.5 Flash** for conceptual reasoning with a **Supabase PostgreSQL database** protected by Row Level Security (RLS) to deliver an all-in-one academic operating system.

---

## 🌟 Key Application Modules

### 1. 🤖 AI Study Chatbot
- **University Subject Specialization:** Dedicated models and prompts for DSA, Operating Systems, DBMS, Computer Networks, and Engineering Mathematics.
- **Markdown & Math Formatting:** Beautiful display of algorithms, formulas, KaTeX mathematical notation, and syntax-highlighted code.
- **Context-Aware History:** Persisted conversations linked directly to your authenticated Supabase user profile.
- **Starter Exam Queries:** Pre-configured prompts for high-yield university topics like Dijkstra’s algorithm, Deadlock conditions, and Bayes’ Theorem.

### 2. 📄 PDF Notes Summarizer
- **Client-Side Text Extraction:** Extracts selectable text from lecture slides and PDFs page-by-page using PDF.js without uploading raw files to external storage.
- **Chunked Token Analysis:** Intelligent text partitioning to respect AI model token limits while maintaining conceptual context.
- **Multi-View Synthesis:**
  - Executive Conceptual Summary
  - High-Yield Key Points & Formulas
  - Important Viva & Semester Exam Questions with Model Answers
- **Export & Actionable Study:** Copy to clipboard, export as Markdown (`.md`), or instantly convert the extracted summary into a Quiz or Flashcard deck with 1 click.

### 3. 🎯 AI Quiz Generator
- **Multi-Choice Question (MCQ) Engine:** Custom quiz formulation calibrated by difficulty (**Easy**, **Medium**, **Hard**) and question count (5, 10, 15).
- **Interactive Exam Experience:** Timed questions, progress bar, 4-option selector with review before submission.
- **Instant Scoring & Explanations:** Real-time percentage score, celebratory confetti for passing scores, and question-by-question breakdown explaining why options are correct or incorrect.
- **Quiz History:** Automatically saves attempted quizzes and scores to the `quiz_history` Supabase table.

### 4. 📅 Smart Study Planner
- **Targeted Task Scheduling:** Organize syllabus tasks with subjects, scheduled dates, and times.
- **Priority Matrix:** Mark tasks with High, Medium, or Low priority badges.
- **Multi-View Management:** Filter by Today, Upcoming, Completed, or view the 7-day **Weekly Schedule Board**.
- **Real-Time Completion:** Toggle task completion with instant visual feedback and database persistence.

### 5. 📝 Notes Manager
- **Markdown Rich Notes:** Draft academic notes with headers, lists, code snippets, and math.
- **Live Markdown Preview:** Toggle between editor and rendered preview mode.
- **Subject Categorization & Tagging:** Tag notes with custom keywords (e.g. `#viva`, `#midsem`, `#algorithms`).
- **Pinning & Direct Shortcuts:** Pin critical notes to the top of the board or push notes directly into the AI Summarizer or Flashcard generator.

### 6. 🗂️ AI Flashcard Generator & Spaced Revision
- **Automated AI Generation:** Generate active-recall flashcard decks from any topic or raw lecture notes.
- **3D Flip Card Animation:** Realistic CSS 3D perspective flip card simulation with Question on the front and Model Answer on the back.
- **Mastery Tracker:** Mark cards as *Mastered* vs *Needs Review* with dynamic recall readiness percentages.
- **Deck Controls:** Shuffle cards, flip on click, and navigate with next/previous controls.

### 7. ⏱️ Focus Study Timer & Pomodoro
- **Integrated Timer:** Preset 25-minute Pomodoro, 50-minute Deep Focus, or 15-minute quick sprint.
- **Visual Circular Progress Ring:** Real-time countdown with audio notification on completion.
- **1-Click Session Logger:** Automatically records focus time, subject, and notes into your `study_sessions` database table.

### 8. 📊 Progress Tracker & Analytics
- **Total Study Hours:** Aggregated focus time and daily averages.
- **Weekly Focus Time Bar Chart:** Visual distribution of study time across the last 7 days.
- **Subject-Wise Time Allocation:** Percentage breakdown of effort invested across different semester courses.
- **Daily Goal Setter:** Benchmark your daily study habit against a custom target (e.g. 4.0 hrs/day).
- **Session Audit Log:** Comprehensive tabular record of past study sessions with focus notes.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
|---|---|
| **Frontend** | React 18, Vite 6, JavaScript (ESM), Tailwind CSS, Lucide React Icons |
| **Backend** | Vercel Serverless Functions (`/api/*`), Node.js |
| **Artificial Intelligence** | Google Gemini API via official `@google/genai` SDK (`gemini-2.5-flash`) |
| **Database & Auth** | Supabase PostgreSQL, Supabase Auth, Row Level Security (RLS) |
| **PDF Processing** | PDF.js client-side text extractor |
| **Visuals & Effects** | Canvas Confetti, CSS 3D Perspective Transforms |

---

## 📁 Project Directory Structure

```
ai-student-assistant/
│
├── api/                             # Vercel Serverless Backend Functions
│   ├── chat.js                      # AI Chatbot endpoint (Gemini API)
│   ├── summarize.js                 # PDF Notes summarizer endpoint
│   ├── generate-quiz.js             # MCQ Quiz generator endpoint
│   └── generate-flashcards.js       # Flashcard deck generator endpoint
│
├── public/
│   └── logo.svg                     # StudyMate AI branded logo
│
├── src/
│   ├── components/
│   │   ├── Navbar.jsx               # Navigation bar with study timer & profile
│   │   ├── Sidebar.jsx              # Collapsible dark navy sidebar
│   │   ├── DashboardCard.jsx        # Reusable metric card with glow states
│   │   ├── ProtectedRoute.jsx       # Route guard for authenticated users
│   │   └── StudyTimerModal.jsx      # Pomodoro focus timer with session logging
│   │
│   ├── context/
│   │   └── AuthContext.jsx          # Supabase auth state & demo mode provider
│   │
│   ├── pages/
│   │   ├── Landing.jsx              # Marketing landing page with hero & features
│   │   ├── Login.jsx                # User login & 1-click Demo Student access
│   │   ├── Signup.jsx               # Student registration with degree selector
│   │   ├── Dashboard.jsx            # Main dashboard & academic command center
│   │   ├── Chatbot.jsx              # Academic Q&A AI tutor interface
│   │   ├── PDFSummarizer.jsx        # PDF drag-and-drop & AI summarizer
│   │   ├── QuizGenerator.jsx        # Interactive MCQ quiz generator & scoring
│   │   ├── StudyPlanner.jsx         # Study tasks, deadlines & weekly schedule board
│   │   ├── Notes.jsx                # Markdown notes manager with pin & tag support
│   │   ├── Flashcards.jsx           # 3D flip card active recall revision
│   │   └── Progress.jsx             # Analytics, weekly charts & study logger
│   │
│   ├── services/
│   │   ├── supabase.js              # Supabase client, RLS queries & offline demo store
│   │   └── api.js                   # Client HTTP fetch wrappers for /api endpoints
│   │
│   ├── utils/
│   │   └── pdfExtractor.js          # PDF.js page-by-page text extraction utility
│   │
│   ├── App.jsx                      # Main routing & layout structure
│   ├── main.jsx                     # Vite entry point
│   └── index.css                    # Tailwind CSS directives & 3D flip animations
│
├── supabase/
│   └── schema.sql                   # Complete PostgreSQL schema with RLS & triggers
│
├── .env.example                     # Environment variables template
├── .gitignore                       # Git ignore configuration
├── index.html                       # HTML entry point with Inter font
├── package.json                     # NPM dependencies and scripts
├── vercel.json                      # Vercel deployment & rewrite configuration
├── vite.config.js                   # Vite config with embedded /api dev server
└── README.md                        # Documentation
```

---

## ⚡ Quick Start Guide (Local Development)

### Prerequisites
- **Node.js** v18+ or v20+
- **npm** v9+ or v10+

### 1. Clone or Open the Repository
```bash
git clone https://github.com/your-username/studymate-ai.git
cd studymate-ai
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the project root by copying the template:
```bash
cp .env.example .env
```

Open `.env` and fill in your keys:
```env
# Google Gemini API Key (Server-side)
# Get a free API key at: https://aistudio.google.com/app/apikey
GEMINI_API_KEY=AIzaSy...

# Supabase Configuration (Frontend Client)
# Get from your Supabase Dashboard > Project Settings > API
VITE_SUPABASE_URL=https://xyzcompany.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1Ni...
```

> **Note on Demo Mode:** If you do not have Supabase credentials immediately available, StudyMate AI automatically provides a built-in LocalStorage Demo Store with pre-populated notes, tasks, and flashcards so you can test all 7 modules instantly!

### 4. Start Local Development Server
```bash
npm run dev
```

Visit `http://localhost:5173` in your browser. 
*(Vite includes a custom built-in serverless proxy in `vite.config.js` that executes all `/api/*` handlers locally without requiring any extra terminal or process!)*

---

## 🗄️ Supabase Database Setup

1. Log into your [Supabase Dashboard](https://supabase.com).
2. Create a new project (e.g. `studymate-ai`).
3. In the left sidebar, navigate to the **SQL Editor**.
4. Click **New Query**, then open and copy the entire contents of [`supabase/schema.sql`](supabase/schema.sql).
5. Paste the SQL script into the query editor and click **Run**.

### What this SQL script creates:
- **7 PostgreSQL Tables:**
  1. `profiles`: Linked to `auth.users`, holds university, degree, study goals.
  2. `notes`: Markdown academic notes with subjects and tags.
  3. `study_tasks`: Tasks with priorities and scheduled deadlines.
  4. `chat_history`: Conversation logs with role and subject.
  5. `quiz_history`: Scored quizzes and questions data.
  6. `flashcards`: Spaced repetition cards with mastery flags.
  7. `study_sessions`: Logged focus blocks with duration in minutes.
- **Row Level Security (RLS):** Enabled on all 7 tables with strict user ownership policies (`auth.uid() = user_id`).
- **Postgres Trigger:** `on_auth_user_created` trigger that automatically provisions a row in `profiles` whenever a student registers.

---

## 🚀 Deployment Guide

### Deploying to Vercel (Recommended)

1. Push your code to a GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "feat: initial commit of StudyMate AI"
   git branch -M main
   git remote add origin https://github.com/your-username/studymate-ai.git
   git push -u origin main
   ```

2. Go to [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New > Project**.
3. Import your `studymate-ai` repository.
4. Framework Preset will auto-detect **Vite**.
5. In **Environment Variables**, add:
   - `GEMINI_API_KEY` = *your Gemini API key*
   - `VITE_SUPABASE_URL` = *your Supabase project URL*
   - `VITE_SUPABASE_ANON_KEY` = *your Supabase anon key*
6. Click **Deploy**. Vercel will build the frontend and deploy the serverless functions in `/api` automatically!

---

## 🛡️ Security & Best Practices

- **Zero Secret Leakage:** The `GEMINI_API_KEY` is strictly accessed within server-side functions in `/api/*.js` and is never bundled into frontend client JavaScript.
- **Row Level Security:** Only the authenticated student can read, insert, update, or delete their own academic records.
- **Token Limit Protection:** Client-side text chunking prevents massive payloads from overflowing Gemini model token boundaries.

---

## 👨‍💻 Author & Portfolio Details

- **Project:** StudyMate AI – Your Smart Learning Partner
- **Target Audience:** University Students, B.Tech CSE & IT Engineers
- **Purpose:** Full-Stack & AI Engineering Portfolio Showcase

*Designed and engineered with passion for student productivity.*
