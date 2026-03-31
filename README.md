# TOMI App

**Capstone deliverable (TOMI-490)** — A full-stack fitness and wellness application with a Python FastAPI backend and a React Native (Expo) mobile app. This repository reflects the **completed** capstone: core product features, smartwatch BLE integration, offline-friendly data paths, and gamification are implemented end-to-end.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Features](#features)
- [API Documentation](#api-documentation)
- [Database](#database)
- [Contributing](#contributing)

## Overview

TOMI helps users track workouts, set goals, connect with friends, and stay motivated through XP, levels, badges, streaks, and leaderboards. The mobile app can connect to a compatible smartwatch over **Bluetooth Low Energy (BLE)** during workouts, buffer sensor-related data locally with **SQLite**, and sync with the backend when online. Deep links use the `tomi` URL scheme (see `src/TOMI/app.config.js`).

## Architecture

- **Mobile app**: Expo Router, TypeScript, themed UI (including NativeWind / Tailwind where used), Supabase client for auth/data, Axios for the FastAPI backend.
- **Backend**: FastAPI with route modules under `Server/Routes`, domain logic in `Core/Services`, DTOs/entities in `Core`, and Supabase-backed repositories in `Infrastructure`.
- **Database**: Supabase (PostgreSQL) as the system of record; on-device SQLite for offline-oriented flows.

Backend request/response shaping uses a consistent `MobileResponse` wrapper (see `src/Backend/Server/program.py`).

## Tech Stack

### Backend

- **Framework**: FastAPI  
- **Language**: Python 3.9+  
- **Database**: Supabase (PostgreSQL)  
- **Server**: Uvicorn (ASGI)  
- **Config**: python-dotenv  

### Frontend (`src/TOMI`)

- **Framework**: React Native with Expo ~54.x  
- **Language**: TypeScript  
- **Navigation**: Expo Router ~6.x  
- **HTTP**: Axios  
- **Auth / cloud**: `@supabase/supabase-js`, Expo Secure Store  
- **Offline**: Expo SQLite  
- **BLE**: react-native-ble-plx (Expo config plugin in `app.config.js`)  
- **Maps**: react-native-maps (Google Maps API key via `MAP_API_KEY` in `.env`)  
- **UI**: React Native StyleSheet, NativeWind / Tailwind (v4), vector icons, Reanimated  

## Project Structure

High-level layout (not every file):

```
TOMI-App/
├── README.md
├── .gitignore
├── .venv/                          # Python virtual environment (local)
└── src/
    ├── Backend/
    │   ├── Core/
    │   │   ├── DTO/
    │   │   ├── Entity/
    │   │   ├── Services/           # Domain services (workouts, dashboard, evolution, etc.)
    │   │   └── Utils/              # e.g. XP helpers, history helpers
    │   ├── Infrastructure/
    │   │   ├── Repository/
    │   │   └── Supabase/
    │   └── Server/
    │       ├── program.py          # FastAPI app, CORS, router registration
    │       └── Routes/             # Versioned under /api/v1/...
    │
    └── TOMI/                       # Expo mobile app
        ├── app/                    # Expo Router (tabs, auth, workout flows)
        ├── pages/                  # main/, auth/, workout/, community/, etc.
        ├── components/             # auth, gamification, BLE, community, ...
        ├── contexts/               # e.g. Theme, WorkoutBle
        ├── hooks/                  # useBLE, dashboard, gamification, ...
        ├── services/               # httpClient, sync, local DB, BLE, resources/
        ├── models/
        ├── locales/
        ├── styles/
        └── app.config.js           # scheme, BLE plugin, maps keys
```

For backend and frontend specifics, see `src/Backend/README.md` and `src/TOMI/README.md` if present.

## Getting Started

### Prerequisites

- Python 3.9+
- Node.js 18+
- npm or yarn
- Supabase project ([supabase.com](https://supabase.com))
- For physical device testing: Expo Go or a dev build; BLE features require a **development build** (not plain Expo Go) where native BLE is included.

### Backend

```bash
cd TOMI-App
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install fastapi uvicorn supabase python-dotenv
```

Create a `.env` under `src/` (or as documented in your team’s setup) with at least:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_or_service_role_key
```

Run the API (from repo root, adjust path if your team uses a different entry):

```bash
cd src/Backend/Server
python -m uvicorn program:app --reload --host 0.0.0.0 --port 8000
```

- **API base**: `http://127.0.0.1:8000` (use your machine’s LAN IP from a phone when testing on device)
- **Swagger**: `http://127.0.0.1:8000/api/docs`
- **ReDoc**: `http://127.0.0.1:8000/api/redoc`

All registered routers use the **`/api/v1`** prefix (e.g. `/api/v1/workouts`).

### Frontend

```bash
cd src/TOMI
npm install
```

Optional: copy or create `src/TOMI/.env` for `MAP_API_KEY` and any Expo public vars your team uses.

```bash
npm start
# then iOS / Android / web, or use the Expo CLI UI
npm run ios
npm run android
npm run web
```

Point the app’s API base URL at your running backend (see `src/TOMI/services/config/` — config may expect a dev machine IP for device testing).

## Features

### Account and profile

- Registration, login, password reset flows (deep link scheme `tomi`)
- Profile and preferences

### Workouts

- Start → live workout → summary flow with pause/resume where supported
- Workout types and XP awarded per session (integrated with avatar progression)
- Optional **BLE smartwatch** connection during workouts; local buffering and sync patterns in services layer
- Workout detail views

### Gamification

- XP, levels, level-up and evolution-style milestones
- Badges, streaks, leaderboard previews
- Avatar progression tied to backend user-avatar and evolution APIs
- Home **daily challenges** / quest-style goals

### Social

- Friends and community views
- Visiting friend profiles

### History and insights

- History with calendar-oriented navigation and XP trends (e.g. mini charts)

### Platform

- Theming (light/dark-aware patterns via app theme context)
- iOS/Android permissions for location (maps) and Bluetooth as configured in `app.config.js`

## API Documentation

Interactive docs are served when the backend is running:

- Swagger: `http://127.0.0.1:8000/api/docs`
- ReDoc: `http://127.0.0.1:8000/api/redoc`

Routers are grouped by tags, for example:

- `/api/v1/users`, `/api/v1/profiles`
- `/api/v1/workouts`, `/api/v1/workoutTypes`
- `/api/v1/dashboard`
- `/api/v1/gamification`, `/api/v1/badges`, `/api/v1/leaderboards`
- `/api/v1/goals`, `/api/v1/goalTypes`, `/api/v1/goalStatus`
- `/api/v1/friends`, `/api/v1/friendStatus`
- `/api/v1/community`
- `/api/v1/history`
- `/api/v1/userAvatars`, `/api/v1/avatars`, `/api/v1/evolution`
- `/api/v1/streaks`, `/api/v1/notifications`, `/api/v1/watchDevices`

Use Swagger for exact methods and payloads.

## Database

Supabase (PostgreSQL) holds users, profiles, workouts (including XP fields), goals, friends, badges, avatars, streaks, leaderboards, notifications, watch devices, and related capstone additions (e.g. evolution-related tables). Schema details live in your Supabase project and migration history.

## Contributing

The **capstone implementation is complete**. Further changes are maintenance or product iteration:

1. Branch from `main` (or your team’s default) using a clear branch name.
2. Match existing layout and naming in `src/Backend` and `src/TOMI`.
3. Test backend and mobile paths you touch; verify BLE only on supported hardware/builds.
4. Open a pull request with a short description of behavior and risk.

## License

This project is private and proprietary. All rights reserved.

## Team

TOMI-490 capstone team.

For questions, contact the project owners or use repository issues if enabled.
