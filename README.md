# 🎯 PathCraft AI - Personalized Learning Path Recommender

> **Reverse-engineered job roles, AI-driven code gatekeepers, and burnout-aware adaptive micro-learning for modern developers.**

---

## 🚀 Elevator Pitch

Traditional online learning paths are static, generic, and uninspiring. **PathCraft AI** transforms developer skill acquisition into a dynamic, target-driven experience. By analyzing raw LinkedIn job descriptions, PathCraft AI reverse-engineers target job roles into sequential, high-yield skill trees. Every module step equips learners with curated study materials and requires passing a strict **Senior AI Gatekeeper Code Reviewer** before unlocking the next milestone. Built-in **Empathy Engine** real-time sentiment analysis detects learner burnout, dynamically shifting overwhelming courses into bite-sized **10-minute micro-tasks**.

---

## ✨ Key Features & Unique Selling Propositions (USPs)

### 1. 💼 LinkedIn Job Description Parser (Reverse-Engineered Mastery)
- Paste any raw, unformatted LinkedIn or job board position description.
- Extracts `role_title`, `seniority_level`, `core_skills`, and `tech_stack`.
- Synthesizes a structured, sequential skill-tree roadmap matching exact industry expectations.

### 2. 🛡️ Senior AI Gatekeeper Code Reviewer (Focus Mode Challenge Modal)
- Dedicated centered **Focus Mode Modal** with blurred backdrop.
- Evaluates submitted TypeScript/JavaScript code snippets for syntax, correctness, edge-case handling, and best practices.
- Features interactive **"💡 Get a Hint"** toggle button for guided problem solving.
- Returns detailed scorecards (`/100`), status badges (🟢 PASS / 🔴 FAIL), specific AI reasoning, and actionable code critiques.
- Enforces learning integrity: next roadmap modules remain locked until the current challenge passes.

### 3. 🌿 Empathy Engine (Burnout & Fatigue Detection)
- Real-time natural language sentiment analysis detects fatigue triggers (e.g., *"burnt out"*, *"overwhelmed"*, *"no time"*, *"exams"*).
- Automatically toggles **Micro-Task Mode**, converting long 45–90 minute deep-dives into digestible **10-minute micro-challenges**.
- Manual toggle available via the Empathy Engine status banner.

### 4. 📚 Recommended Study Materials Hub
- Each module provides pill-shaped, interactive study resource links before the code challenge.
- Formats 3 key learning formats per step:
  - 📖 **Official Technical Documentation**
  - ▶️ **Video Crash Courses (YouTube)**
  - 📝 **GitHub Reference Starter Repos**

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **Frontend & UI**: [React 19](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/), [Lucide React Icons](https://lucide.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **AI Core**: [Google Gemini 1.5 Flash API](https://ai.google.dev/) (with OpenAI REST fallback option)
- **State Management**: Centralized master state with real-time module unlock handlers
- **Build & Quality Tooling**: Turbopack, strict `tsc` compilation

---

## 📁 Repository Architecture

```text
src/
├── app/
│   ├── api/
│   │   ├── generate-roadmap/   # Live AI roadmap synthesis with mock fallback
│   │   ├── parse-jd/           # LinkedIn JD parsing endpoint
│   │   └── review-code/        # Senior AI Gatekeeper evaluator endpoint
│   ├── globals.css             # Tailwind base styles & dark theme utilities
│   ├── layout.tsx              # Root HTML & metadata layout
│   └── page.tsx                # Master orchestration dashboard
├── components/
│   ├── ChallengeModal.tsx      # Focus Mode code challenge overlay & hint system
│   ├── ChatInterface.tsx       # Dual-mode input (Skill Goal vs LinkedIn JD)
│   ├── CodeSubmitter.tsx       # ChallengeModal re-export wrapper
│   ├── Dashboard.tsx           # Progress statistics bar & metric summary
│   ├── EmpathyBanner.tsx       # Real-time burnout mode banner & toggle
│   └── RoadmapVisualizer.tsx   # Interactive vertical skill-tree UI & resource hub
└── lib/
    ├── llm.ts                  # Centralized Gemini REST API client & JSON parser
    ├── types.ts                # Core TypeScript interfaces (Roadmap, Module, Challenge)
    └── prompts/
        ├── codeReviewPrompt.ts # Senior Gatekeeper system prompt & user formatter
        ├── empathyPrompt.ts    # Burnout & fatigue keyword rules
        ├── jdParserPrompt.ts   # LinkedIn JD parsing system prompt & schema
        └── roadmapPrompt.ts    # Custom learning path system prompt
```

---

## 📦 Local Installation & Setup Guide

Follow these steps to run **PathCraft AI** locally on your machine:

### 1. Clone the Repository
```bash
git clone https://github.com/muskan2719/ai-path-recommender.git
cd ai-path-recommender
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env.local` file in the root directory:
```bash
# Create .env.local file
cp .env.example .env.local
```

Add your **Gemini API Key**:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```
> ℹ️ **Note on Safe Mock Fallback**: If no `GEMINI_API_KEY` is provided, PathCraft AI automatically detects this and gracefully falls back to pre-structured, high-fidelity mock data. The application remains 100% functional for offline demos!

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## ⚡ Verification & Production Build

To build the production bundle and verify all TypeScript types:

```bash
# Verify TypeScript type safety
npx tsc --noEmit

# Build production bundle
npm run build

# Start production server
npm run start
```

---

## 🏆 Hackathon Submission Highlights

- **Dual-USP Integration**: Combines reverse-engineered career matching with active gatekeeper evaluation.
- **Human-Centric AI**: Empathy Engine prioritizes learner well-being, mitigating cognitive fatigue.
- **Production Ready**: Fully typed TypeScript codebase with safe fallback handling, dark mode UI, and zero-warning production build.
