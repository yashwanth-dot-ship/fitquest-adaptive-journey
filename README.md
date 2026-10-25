# 🏋️ FitQuest — Adaptive Fitness Journey

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

An intelligent, constraint-based workout recommendation and progress tracking web application engineered for college students and busy young adults.

Unlike rigid fitness apps that enforce static routine calendars, **FitQuest** captures real-time daily constraints (sleep, energy, available time, location, and equipment) to prescribe a safe, optimal, and achievable workout on the fly.

---

## 🌐 Live Demo & Preview

- **Live Application:** [https://your-project.vercel.app](https://fitquest-adaptive-journey.vercel.app/) 
- **Demo Mode:** Click **"Explore with a demo account"** on the login screen to test the full application instantly with 3 weeks of pre-loaded workout history.

---

## 📌 Problem Statement

Traditional fitness apps suffer from high drop-off rates because they force users into rigid, predetermined schedules. For college students and working professionals, real-world constraints fluctuate daily:
- Irregular sleep cycles during exam weeks or project deadlines.
- Fluctuating energy levels.
- Variable time windows (sometimes 20 minutes between classes, sometimes 60 minutes).
- Inconsistent access to equipment (dorm room vs. college gym vs. home).

When users miss a workout in a rigid plan, they feel defeated and quit. **FitQuest solves this by adapting the workout to the user's current reality instead of demanding perfection.**

---

## ✨ Key Features

### 1. 🎯 Dynamic Constraint-Based Engine
- Daily 30-second check-in captures:
  - **Available Duration:** 20, 30, 45, 60, or 90 minutes.
  - **Energy Level:** Low, Medium, High.
  - **Sleep Duration:** <5 hours, 5–7 hours, 7+ hours.
  - **Workout Location:** Home, Gym, or Outdoor.
  - **Available Equipment:** Bodyweight, Dumbbells, Bands, Pull-up Bar, Barbell, Machines.
- Computes intensity, volume, and exercise selection via a deterministic heuristic scoring engine.
- Generates a transparent **"Why this workout?"** rationale explaining the science behind each selection.

### 2. 📱 Interactive Workout Session
- Step-by-step exercise execution guide with target muscle groups and instructions.
- Real-time set logging: tracks completed sets, reps performed, weight lifted (kg/lbs), and timed exercises.
- Live progress bar tracking completion percentage.

### 3. 📊 Analytics & Progress Dashboard
- **Streak Calculation:** Forgiving streak algorithm that respects biological recovery days.
- **Weekly Consistency:** Visual bar chart tracking workouts per week over an 8-week window.
- **28-Day Consistency Heatmap:** Visual calendar matrix showing workout frequency.
- **Personal Records (PRs):** Automatic tracking of maximum weight lifted per exercise.

### 4. 🎨 Design System
- High-contrast, typography-driven athletic poster aesthetic.
- Full responsive design built mobile-first for smartphone use in the gym.
- Accessible form controls, high-legibility badges, and smooth state transitions.

---

## 🏗️ System Architecture

```text
┌────────────────────────────────────────────────────────┐
│                   PRESENTATION LAYER                   │
│  React 19 + TypeScript  |  Tailwind CSS v4  |  Lucide  │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│                    APPLICATION LOGIC                   │
│  ┌───────────────────────┐   ┌───────────────────────┐ │
│  │ Recommendation Engine │   │   Analytics Engine    │ │
│  │ (src/lib/recommend.ts)│   │ (src/lib/analytics.ts)│ │
│  └───────────────────────┘   └───────────────────────┘ │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│                  DATA PERSISTENCE                      │
│   Unified Client Store (src/lib/store.ts)              │
│   - LocalStorage synchronization (fitquest:v1)         │
│   - Service-oriented layer (ready for cloud database)  │
└────────────────────────────────────────────────────────┘
