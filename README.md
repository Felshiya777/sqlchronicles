# 🐍 Noa — AI-Powered Python Learning Platform

> *"Master Python through interactive lessons, coding challenges, and personalized guidance"*

A galaxy-themed, game-style Python learning platform with AI tutor Noa, 
10 progressive levels, coding exercises, quizzes, and progress tracking.

## 🌐 Live Demo
> https://charm-nix-65041137.figma.site/welcome

## ✨ Features
- 🤖 Noa AI Chatbot — friendly Python tutor assistant
- 🎮 10 Progressive Levels — Basics to OOP
- 💻 425 Learning Items — 225 exercises + 200 quizzes
- 📝 Personal Notes — per level note taking
- 🏆 Progress Tracking — level unlocking system
- 🎉 Confetti Animations — celebrate achievements
- 🌌 Galaxy UI — dark purple/pink gradient theme
- 📱 Responsive Design — works on all devices

## 📊 Curriculum

| Level | Topic | Exercises | Quizzes |
|---|---|---|---|
| 1 | Python Fundamentals | 20 | 20 |
| 2 | Control Flow & Logic | 25 | 20 |
| 3 | Loops & Iteration | 25 | 20 |
| 4 | Functions & Modularity | 25 | 20 |
| 5 | Lists & Collections | 25 | 20 |
| 6 | Dictionaries & Sets | 25 | 20 |
| 7 | String Manipulation | 20 | 20 |
| 8 | File Handling & I/O | 20 | 20 |
| 9 | Error Handling | 20 | 20 |
| 10 | Object-Oriented Programming | 20 | 20 |

## 🛠️ Tech Stack
- React, TypeScript, Vite
- Tailwind CSS + shadcn/ui
- Monaco Code Editor
- localStorage for progress

## 📁 Project Structure

```
src/
├── main.tsx                      # App entry point
├── app/
│   ├── App.tsx                   # Root component
│   ├── routes.tsx                # App routing
│   ├── components/
│   │   ├── AIHelper.tsx          # Noa AI chatbot
│   │   ├── CodeEditor.tsx        # Interactive code editor
│   │   ├── QuizSection.tsx       # Quiz component
│   │   ├── NotesSection.tsx      # Personal notes
│   │   └── ui/                   # shadcn/ui components
│   ├── data/
│   │   └── pythonCurriculum.ts   # All 10 levels content
│   ├── pages/
│   │   ├── Root.tsx              # Welcome/onboarding page
│   │   ├── Dashboard.tsx         # Level selection dashboard
│   │   ├── LevelPage.tsx         # Learn/Practice/Quiz/Notes
│   │   └── NotFound.tsx          # 404 page
│   └── utils/
│       └── storage.ts            # localStorage progress
└── styles/
    ├── index.css                 # Global styles
    ├── theme.css                 # Galaxy theme
    ├── tailwind.css              # Tailwind config
    └── fonts.css                 # Font definitions
```

## 🚀 Run Locally
```bash
npm install
npm run dev
```
Open http://localhost:5173

---
*Built with React · TypeScript · Vite · Tailwind CSS · Figma Make*
