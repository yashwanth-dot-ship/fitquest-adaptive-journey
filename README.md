# Fitquest Adaptive Journey

Build a modern, production-quality fitness web application called "FitQuest".

IMPORTANT:

This is NOT a generic workout tracker and NOT just an AI chatbot.

The core idea is an adaptive fitness journey platform that creates a workout recommendation based on the user's real-life constraints for that particular day.

TARGET USERS:

College students and young adults who want to improve their fitness but have limited time, equipment, budget, and inconsistent schedules.

CORE DIFFERENTIATOR:

Instead of forcing users to follow a rigid workout plan, FitQuest asks the user about their current situation and adapts today's workout accordingly.

For example:

- Fitness goal

- Fitness experience

- Available time today

- Energy level

- Sleep duration

- Location (gym/home/outdoor)

- Available equipment

- Previous workout

- Recent workout history

The system should use these inputs to recommend an appropriate workout session.

DESIGN:

Create a premium, modern fitness SaaS interface.

Avoid the typical generic "fitness app" look.

The UI should feel clean, professional, motivating and suitable for a real startup product.

Use:

- Responsive design

- Mobile-first thinking

- Clean typography

- Modern cards

- Clear information hierarchy

- Smooth but subtle animations

- Accessible buttons and forms

- Professional dashboard

- Light/dark theme support if practical

MAIN PAGES:

1. LANDING PAGE

- FitQuest branding

- Hero section

- Explain the "adaptive fitness" concept

- CTA: Start Your Fitness Journey

- How it works

- Key features

- Progress/analytics preview

- Footer

2. AUTHENTICATION

- Sign up

- Login

- Forgot password

- Basic form validation

3. ONBOARDING

Ask the user:

- Name

- Age

- Fitness experience

- Primary goal

  - Muscle gain

  - Fat loss

  - General fitness

  - Strength

  - Endurance

- Available workout days

- Typical workout duration

- Preferred workout location

- Available equipment

Do NOT ask for unnecessary sensitive information.

4. DASHBOARD

Show:

- Today's adaptive workout

- Current streak

- Weekly workout count

- Recent progress

- Goal

- Quick check-in button

- Recent workouts

5. DAILY CHECK-IN

Create a simple flow:

"How are you today?"

Inputs:

- Available time: 20 / 30 / 45 / 60 / 90 minutes

- Energy: Low / Medium / High

- Sleep: <5 / 5-7 / 7+ hours

- Location: Gym / Home / Outdoor

- Equipment available

- Optional notes

After submission, show a "Today's Recommendation" screen.

6. TODAY'S WORKOUT

Display:

- Workout title

- Estimated duration

- Difficulty

- Target muscle groups

- Exercises

- Sets

- Reps

- Rest time

- Exercise instructions

- Start Workout button

Also show a short explanation:

"Why this workout?"

For example:

"Your available time is 30 minutes and your recent training history shows that you trained chest yesterday, so today's session focuses on lower body."

This explanation should be clearly presented as an app-generated recommendation, not medical advice.

7. WORKOUT SESSION

Allow the user to:

- Mark exercises complete

- Record weight

- Record reps

- Record sets

- Add notes

- Finish workout

8. PROGRESS DASHBOARD

Show:

- Workout frequency

- Weekly/monthly consistency

- Workout volume

- Personal records

- Goal progress

- Streak

- Recent activity

Use charts where useful, but don't overload the page.

9. WORKOUT HISTORY

Allow users to:

- View previous workouts

- Open workout details

- Filter by date/type

- See completed exercises

10. PROFILE / SETTINGS

Include:

- Personal fitness preferences

- Goal

- Equipment

- Workout preferences

- Account settings

- Theme

- Logout

IMPORTANT PRODUCT RULES:

- Do not create fake AI claims.

- Do not claim medical diagnosis or medical recommendations.

- Do not make extreme weight-loss or health claims.

- The app should present fitness recommendations as general wellness guidance.

- Avoid unnecessary calorie/medical calculations in the first version.

DATA MODEL CONCEPT:

Prepare the frontend architecture so it can later connect to:

User

Profile

FitnessGoal

Exercise

Workout

WorkoutExercise

WorkoutSession

WorkoutLog

DailyCheckIn

ProgressMetric

Do not hard-code the architecture in a way that prevents a real backend/database from being connected later.

TECHNICAL DIRECTION:

For the prototype, use a clean component-based frontend architecture.

Use React with TypeScript if supported.

Keep components reusable.

Keep business logic separated from UI components.

Use mock data only where necessary for the prototype.

IMPORTANT:

Do NOT try to implement the entire production backend in this first generation.

First create a polished frontend prototype and clear application structure.

The final result should look like a serious portfolio/startup project, not a tutorial project.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/e70a6df3-74f0-5727-9c36-0a7e25a381c3).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
