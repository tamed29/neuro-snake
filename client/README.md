# Snake Game Platform

A modern, production-level Snake game built with Next.js 14, TypeScript, and Firebase.

## Features

- Custom snake game engine with smooth animations
- 4 difficulty levels (Easy, Normal, Hard, Insane)
- Combo system with score multipliers
- Real-time leaderboard with Firebase Firestore
- Google Authentication & Anonymous play
- Fully responsive with mobile controls
- Swipe detection for mobile devices
- Profile page with user statistics
- Modern cyberpunk UI with green/black theme

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a Firebase project at https://console.firebase.google.com

3. Enable Authentication (Google & Anonymous)

4. Create a Firestore database

5. Copy `.env.local.example` to `.env.local` and add your Firebase config:
```bash
cp .env.local.example .env.local
```

6. Deploy Firestore security rules:
```bash
firebase deploy --only firestore:rules
```

7. Run the development server:
```bash
npm run dev
```

8. Open http://localhost:3000

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Firebase (Auth + Firestore)
- Zustand (State Management)
- Framer Motion (Animations)
- React Icons

## Game Controls

- Arrow Keys or WASD to move
- Space to pause/resume
- Swipe gestures on mobile
- On-screen controls for mobile

## Difficulty Levels

- **Easy**: Slow speed, no obstacles
- **Normal**: Medium speed, no obstacles
- **Hard**: Fast speed, 5 obstacles
- **Insane**: Very fast speed, 10 obstacles

## Combo System

Eat food within 3 seconds to build combos and increase your score multiplier!

## License

MIT
