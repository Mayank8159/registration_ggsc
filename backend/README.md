# Registration & Scoring Backend API

Node.js/Express backend for the registration and scoring system with Supabase integration.

## Features

- ✅ User authentication (signup, login, logout)
- ✅ User profile management
- ✅ Team management with random assignment
- ✅ Multi-round scoring system (3 rounds)
- ✅ Leaderboard endpoints
- ✅ Health check endpoint
- ✅ Supabase integration with RLS

## Prerequisites

- Node.js >= 18.0.0
- Supabase account and project
- npm or yarn

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Copy `.env.example` to `.env` and fill in your Supabase credentials:

```bash
cp .env.example .env
```

Update `.env` with your values:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key
PORT=3000
NODE_ENV=development
ADMIN_EMAILS=admin@example.com
```

### 3. Database Setup

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run the SQL script from `database/schema.sql`
4. Update admin emails in the `is_admin()` function
5. Enable **Email Auth** in Authentication settings

### 4. Run the Server

Development mode (with auto-reload):

```bash
npm run dev
```

Production mode:

```bash
npm start
```

The server will start on `http://localhost:3000`

## API Endpoints

### Health Check

- **GET** `/health` - Server health and database connectivity check

### Authentication

- **POST** `/api/auth/signup` - Register new user
- **POST** `/api/auth/login` - User login
- **POST** `/api/auth/logout` - User logout
- **GET** `/api/auth/me` - Get current user profile (requires auth token)

### Users

- **GET** `/api/users` - Get all users (optional filters: department, year)
- **GET** `/api/users/:id` - Get user by ID
- **PATCH** `/api/users/:id` - Update user profile

### Teams

- **GET** `/api/teams` - Get all teams with members (leaderboard)
- **GET** `/api/teams/:id` - Get team by ID with members
- **GET** `/api/teams/user/:userId` - Get user's team
- **POST** `/api/teams/create-random` - Create random teams (admin only)

### Scores

- **POST** `/api/scores/update` - Update team score for a round (admin only)
- **POST** `/api/scores/batch-update` - Batch update scores (admin only)
- **GET** `/api/scores/leaderboard` - Get overall leaderboard (total scores)
- **GET** `/api/scores/leaderboard/:round` - Get leaderboard for specific round (1-3)

## API Documentation

### Signup Example

```bash
POST /api/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword",
  "full_name": "John Doe",
  "enrollment_number": "EN12345",
  "mobile_number": "+1234567890",
  "department": "Computer Science",
  "year": 3
}
```

### Login Example

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
```

### Update Score Example

```bash
POST /api/scores/update
Content-Type: application/json

{
  "team_id": "team-uuid-here",
  "round": 1,
  "score": 100
}
```

### Create Random Teams Example

```bash
POST /api/teams/create-random
Content-Type: application/json

{
  "team_size": 4,
  "team_name_prefix": "Team"
}
```

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── supabase.js       # Supabase client configuration
│   ├── routes/
│   │   ├── health.js         # Health check endpoint
│   │   ├── auth.js           # Authentication endpoints
│   │   ├── users.js          # User management endpoints
│   │   ├── teams.js          # Team management endpoints
│   │   └── scores.js         # Score management endpoints
│   └── index.js              # Main Express server
├── database/
│   └── schema.sql            # Complete database schema
├── .env.example              # Environment variables template
├── .gitignore
├── package.json
└── README.md
```

## Security

- Row Level Security (RLS) enabled on all tables
- Admin-only operations for team creation and score updates
- Bcrypt password hashing (via Supabase Auth)
- JWT token-based authentication

## Development

The API uses:

- **Express.js** - Web framework
- **Supabase JS Client** - Database and auth integration
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

## License

ISC
