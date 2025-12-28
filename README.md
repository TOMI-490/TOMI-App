# TOMI App

A full-stack fitness and wellness application with a Python FastAPI backend and React Native (Expo) mobile frontend.

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Features](#features)
- [API Documentation](#api-documentation)
- [Database](#database)
- [Contributing](#contributing)

## 🎯 Overview

TOMI is a comprehensive fitness and wellness tracking application that helps users monitor their workouts, achieve their fitness goals, connect with friends, and earn badges for their accomplishments. The app integrates with wearable devices to track activity and provides a gamified experience with avatars, streaks, and leaderboards.

## 🏗️ Architecture

The project follows a clean architecture pattern with clear separation of concerns:

- **Frontend**: React Native mobile app built with Expo
- **Backend**: FastAPI REST API with a layered architecture
- **Database**: Supabase (PostgreSQL)

### Backend Architecture Layers

```
Server Layer (Routes)
    ↓
Core Layer (DTOs, Entities)
    ↓
Infrastructure Layer (Repositories, Database)
```

## 🛠️ Tech Stack

### Backend
- **Framework**: FastAPI 
- **Language**: Python 3.x
- **Database**: Supabase (PostgreSQL)
- **Authentication**: HTTP Bearer Token
- **ORM**: Supabase Python Client
- **Environment**: python-dotenv
- **Server**: Uvicorn (ASGI)

### Frontend
- **Framework**: React Native with Expo (~54.0.27)
- **Language**: TypeScript
- **Navigation**: Expo Router (~6.0.17)
- **UI Components**: React Navigation, Expo Vector Icons
- **State Management**: React 19.1.0
- **Styling**: React Native StyleSheet

## 📁 Project Structure

```
TOMI-App/
├── README.md
├── .gitignore
├── .venv/                          # Python virtual environment
└── src/
    ├── Backend/
    │   ├── README.md
    │   ├── start_server.sh
    │   ├── Core/
    │   │   ├── DTO/                # Data Transfer Objects
    │   │   │   ├── UserDTO.py
    │   │   │   ├── WorkoutDTO.py
    │   │   │   ├── GoalDTO.py
    │   │   │   ├── ProfileDTO.py
    │   │   │   ├── BadgeDTO.py
    │   │   │   ├── AvatarDTO.py
    │   │   │   ├── FriendDTO.py
    │   │   │   ├── StreakDTO.py
    │   │   │   ├── LeaderboardDTO.py
    │   │   │   ├── NotificationDTO.py
    │   │   │   └── WatchDeviceDTO.py
    │   │   └── Entity/             # Database Entities
    │   │       ├── UserEntity.py
    │   │       ├── WorkoutEntity.py
    │   │       ├── GoalEntity.py
    │   │       ├── ProfileEntity.py
    │   │       ├── BadgeEntity.py
    │   │       ├── AvatarEntity.py
    │   │       ├── FriendEntity.py
    │   │       ├── StreakEntity.py
    │   │       ├── LeaderboardEntity.py
    │   │       ├── Notifications.py
    │   │       └── WatchDeviceEntity.py
    │   │
    │   ├── Infrastructure/
    │   │   ├── Repository/         # Data Access Layer
    │   │   │   ├── __init__.py
    │   │   │   ├── UserRepository.py
    │   │   │   ├── WorkoutRepository.py
    │   │   │   ├── GoalRepository.py
    │   │   │   ├── ProfileRepository.py
    │   │   │   ├── BadgeRepository.py
    │   │   │   ├── AvatarRepository.py
    │   │   │   ├── FriendRepository.py
    │   │   │   ├── StreakRepository.py
    │   │   │   ├── LeaderboardRepository.py
    │   │   │   ├── NotificationRepository.py
    │   │   │   └── WatchDeviceRepository.py
    │   │   └── Supabase/
    │   │       └── db_connection.py # Database connection management
    │   │
    │   └── Server/
    │       ├── program.py          # FastAPI application entry point
    │       └── Routes/             # API endpoints
    │           ├── UserRoutes.py
    │           ├── WorkoutRoutes.py
    │           ├── GoalRoutes.py
    │           ├── AvatarRoutes.py
    │           ├── BadgeRoutes.py
    │           ├── FriendRoutes.py
    │           ├── ProfileRoutes.py
    │           ├── StreakRoutes.py
    │           ├── LeaderboardRoutes.py
    │           ├── NotificationRoutes.py
    │           └── WatchDeviceRoutes.py
    │
    └── TOMI/                       # React Native Frontend
        ├── app/                    # Expo Router app directory
        │   ├── _layout.tsx
        │   ├── (auth)/            # Authentication screens
        │   └── (tabs)/            # Tab navigation screens
        │
        ├── pages/                  # Main page components
        │   ├── HomePage.tsx
        │   ├── LoginPage.tsx
        │   ├── RegisterPage.tsx   # Registration with email pre-check
        │   ├── WorkoutPage.tsx
        │   ├── CommunityPage.tsx
        │   ├── HistoryPage.tsx
        │   └── AvatarPage.tsx
        │
        ├── components/             # Reusable UI components
        │   ├── auth/              # Authentication components
        │   │   ├── index.ts
        │   │   ├── AuthCard.tsx
        │   │   ├── AuthContainer.tsx
        │   │   ├── FormInput.tsx
        │   │   ├── PickerInput.tsx       # Custom modal picker
        │   │   ├── PrimaryButton.tsx
        │   │   ├── SecondaryButton.tsx
        │   │   ├── PasswordStrengthIndicator.tsx
        │   │   ├── ProgressBar.tsx
        │   │   └── LogoPlaceholder.tsx
        │   ├── ui/
        │   ├── haptic-tab.tsx
        │   ├── ScreenWrapper.tsx
        │   ├── themed-text.tsx
        │   └── themed-view.tsx
        │
        ├── styles/                # Centralized styles
        │   ├── auth/              # Authentication screen styles
        │   │   ├── authCard.styles.ts
        │   │   ├── authContainer.styles.ts
        │   │   ├── formInput.styles.ts
        │   │   ├── pickerInput.styles.ts
        │   │   ├── primaryButton.styles.ts
        │   │   ├── secondaryButton.styles.ts
        │   │   ├── passwordStrengthIndicator.styles.ts
        │   │   ├── progressBar.styles.ts
        │   │   └── logoPlaceholder.styles.ts
        │   ├── auth.styles.ts     # Shared auth styles
        │   └── README.md          # Style organization documentation
        │
        ├── services/              # API and authentication services
        │   ├── api.ts            # Main API service exports
        │   ├── auth.ts           # Supabase authentication service
        │   ├── httpClient.ts     # Axios HTTP client configuration
        │   ├── config/
        │   │   └── api.config.ts # API configuration
        │   ├── core/
        │   │   └── base.service.ts
        │   └── resources/
        │       └── user.service.ts    # User API service with email check
        │
        ├── models/                # TypeScript models and DTOs
        │   ├── index.ts
        │   └── dto/
        │       └── User.dto.ts    # User DTOs (authID, created_at)
        │
        ├── constants/             # Application constants
        │   └── options.ts         # Country, unit system, language options
        │
        ├── locales/               # Internationalization
        │   ├── en.json           # English translations
        │   └── fr.json           # French translations
        │
        ├── hooks/                 # Custom React hooks
        │   └── use-color-scheme.ts
        │
        ├── app.json
        ├── eslint.config.js
        ├── expo-env.d.ts
        ├── package.json
        ├── tsconfig.json
        └── README.md
```

## 🚀 Getting Started

### Prerequisites

- **Python**: 3.9 or higher
- **Node.js**: 18.x or higher
- **npm** or **yarn**: Latest version
- **Expo CLI**: Install globally with `npm install -g expo-cli`
- **Supabase Account**: Sign up at [supabase.com](https://supabase.com)

### Backend Setup

1. **Navigate to the project root:**
   ```bash
   cd TOMI-App
   ```

2. **Create and activate virtual environment:**
   ```bash
   python -m venv .venv
   
   # On macOS/Linux:
   source .venv/bin/activate
   
   # On Windows:
   .venv\Scripts\activate
   ```

3. **Install Python dependencies:**
   ```bash
   pip install fastapi uvicorn supabase python-dotenv
   ```

4. **Configure environment variables:**
   
   Create a `.env` file in the `src/` directory with the following:
   ```env
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_KEY=your_supabase_anon_key
   ```

5. **Run the backend server:**
   ```bash
   cd src/Backend/Server
   python -m uvicorn program:app --reload --host 127.0.0.1 --port 8000
   ```

   The API will be available at:
   - **API Base**: http://127.0.0.1:8000
   - **Swagger Docs**: http://127.0.0.1:8000/api/docs
   - **ReDoc**: http://127.0.0.1:8000/api/redoc

### Frontend Setup

1. **Navigate to the TOMI directory:**
   ```bash
   cd src/TOMI
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the Expo development server:**
   ```bash
   npm start
   ```

4. **Run on specific platform:**
   ```bash
   # iOS
   npm run ios
   
   # Android
   npm run android
   
   # Web
   npm run web
   ```

5. **Scan QR code:**
   - Use the Expo Go app on your mobile device to scan the QR code displayed in the terminal

## ✨ Features

### User Management
- User registration and authentication
- Profile management
- Avatar customization
- User preferences and settings

### Workout Tracking
- Record workouts with details (type, duration, intensity)
- Multiple workout types support
- Integration with wearable devices (Apple Watch, Fitbit, etc.)
- Workout history and analytics

### Goals & Achievements
- Set and track fitness goals
- Progress monitoring
- Goal types: steps, calories, distance, workout frequency
- Goal status tracking

### Social Features
- Friend connections and friend requests
- Friend status management
- Leaderboards (weekly, monthly, all-time)
- Activity sharing

### Gamification
- Badge system for achievements
- User avatars with customization
- Streak tracking for consecutive activity days
- Points and rewards system

### Notifications
- Push notifications for achievements
- Friend activity updates
- Goal reminders
- Streak maintenance alerts

## 📚 API Documentation

Once the backend is running, you can access the interactive API documentation:

- **Swagger UI**: http://127.0.0.1:8000/api/docs
- **ReDoc**: http://127.0.0.1:8000/api/redoc

### Key API Endpoints

```
POST   /api/users              - Create new user
GET    /api/users/{id}         - Get user by ID
PUT    /api/users/{id}         - Update user
DELETE /api/users/{id}         - Delete user

POST   /api/workouts           - Create workout
GET    /api/workouts           - List workouts
GET    /api/workouts/{id}      - Get workout details

POST   /api/goals              - Create goal
GET    /api/goals              - List user goals
PUT    /api/goals/{id}         - Update goal

GET    /api/friends            - List friends
POST   /api/friends            - Send friend request
PUT    /api/friends/{id}       - Update friend status

GET    /api/leaderboard        - Get leaderboard
GET    /api/badges             - List available badges
GET    /api/avatars            - List available avatars
```

## 🗄️ Database

The application uses **Supabase** (PostgreSQL) as the database with the following main tables:

- **users** - User accounts and authentication
- **profiles** - User profile information
- **workouts** - Workout records
- **workout_types** - Types of workouts (cardio, strength, etc.)
- **goals** - User fitness goals
- **goal_types** - Types of goals (steps, calories, etc.)
- **goal_status** - Goal completion status
- **friends** - Friend relationships
- **friend_status** - Friend request status
- **badges** - Available badges
- **user_badges** - Badges earned by users
- **avatars** - Available avatar options
- **user_avatars** - User's current avatar
- **streaks** - Consecutive activity day tracking
- **leaderboard** - Ranking and points
- **notifications** - User notifications
- **watch_devices** - Connected wearable devices

### Database Connection

The backend uses a singleton pattern for database connections to ensure efficient resource management. The connection is established at startup and properly closed on shutdown.

## 🤝 Contributing

This project is currently in active development. Please follow these guidelines:

1. Create a new branch from `dev` for your feature: `git checkout -b feature/your-feature-name`
2. Follow the existing code structure and naming conventions
3. Write clear commit messages
4. Test your changes thoroughly
5. Create a pull request to the `dev` branch

### Branch Strategy
- `main` - Production-ready code
- `dev` - Development branch (default)
- `feature/*` - Feature branches
- `bugfix/*` - Bug fix branches

## 📝 License

This project is private and proprietary. All rights reserved.

## 👥 Team

TOMI-490 Development Team

---

For questions or support, please contact the development team or open an issue in the repository.
