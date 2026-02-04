# Team Formation API Documentation

## Overview
The team formation system randomly assigns registered users into teams of 4 members. This works alongside the QRMaze individual scoring system.

## Database Changes

### Migration: 005_create_team_members.sql
- **Creates**: `team_members` table for random team assignments
- **View**: `team_summary` - Aggregated team information with member details
- **Function**: `create_random_team_assignments()` - Randomly form teams

### Team Members Table Structure
```sql
{
  id: UUID,
  user_id: UUID (references users.id),
  email: TEXT (references users.email),
  team_number: INTEGER,
  team_name: TEXT,
  role: TEXT (default: 'member'),
  created_at: TIMESTAMPTZ,
  updated_at: TIMESTAMPTZ
}
```

**Constraint**: Each user can only be in ONE team (unique constraint on user_id)

---

## API Endpoints

### 1. Verify Email
**Endpoint**: `POST /api/verify-email`

**Purpose**: Check if an email exists in the registered users table

**Request Body**:
```json
{
  "email": "user@example.com"
}
```

**Success Response - Email Found** (200):
```json
{
  "success": true,
  "exists": true,
  "message": "Email verified successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "John Doe",
    "enrollment_number": "12345",
    "department": "CSE",
    "year": 2,
    "mobile_number": "+919876543210"
  }
}
```

**Success Response - Email Not Found** (200):
```json
{
  "success": true,
  "exists": false,
  "message": "Email not found in registered users",
  "email": "user@example.com"
}
```

**Error Response** (400):
```json
{
  "success": false,
  "exists": false,
  "error": "Invalid email format"
}
```

---

### 2. Verify Multiple Emails (Bulk)
**Endpoint**: `POST /api/verify-email/bulk`

**Purpose**: Verify multiple emails in a single request (max 100)

**Request Body**:
```json
{
  "emails": [
    "user1@example.com",
    "user2@example.com",
    "user3@example.com"
  ]
}
```

**Response** (200):
```json
{
  "success": true,
  "total": 3,
  "found": 2,
  "not_found": 1,
  "results": [
    {
      "email": "user1@example.com",
      "exists": true,
      "user": {
        "id": "uuid",
        "email": "user1@example.com",
        "full_name": "John Doe",
        "enrollment_number": "12345"
      }
    },
    {
      "email": "user2@example.com",
      "exists": true,
      "user": {
        "id": "uuid",
        "email": "user2@example.com",
        "full_name": "Jane Smith",
        "enrollment_number": "12346"
      }
    },
    {
      "email": "user3@example.com",
      "exists": false,
      "user": null
    }
  ]
}
```

---

### 3. Create Random Teams
**Endpoint**: `POST /api/teams/create-random`

**Purpose**: Randomly assign all registered users into teams of 4

**Request Body** (optional):
```json
{
  "team_size": 4,
  "team_name_prefix": "Team"
}
```

**Response** (201):
```json
{
  "message": "Random teams created successfully",
  "total_teams": 25,
  "total_members": 100,
  "teams": [
    {
      "team_number": 1,
      "team_name": "Team 1",
      "member_count": 4,
      "members": [
        {
          "user_id": "uuid",
          "email": "user1@example.com",
          "full_name": "John Doe",
          "enrollment_number": "12345",
          "department": "CSE",
          "year": 2
        },
        {
          "user_id": "uuid",
          "email": "user2@example.com",
          "full_name": "Jane Smith",
          "enrollment_number": "12346",
          "department": "ECE",
          "year": 3
        }
      ]
    }
  ]
}
```

**Notes**:
- Clears all existing team assignments before creating new ones
- Randomly shuffles all users
- Creates teams of exactly 4 members (last team may have fewer if total users not divisible by 4)
- Requires admin privileges

---

### 4. Get All Teams
**Endpoint**: `GET /api/teams`

**Purpose**: Retrieve all teams with their members

**Response** (200):
```json
{
  "teams": [
    {
      "team_number": 1,
      "team_name": "Team 1",
      "member_count": 4,
      "members": [
        {
          "user_id": "uuid",
          "email": "user1@example.com",
          "full_name": "John Doe",
          "enrollment_number": "12345",
          "department": "CSE",
          "year": 2,
          "role": "member"
        }
      ],
      "created_at": "2026-02-01T10:00:00Z",
      "updated_at": "2026-02-01T10:00:00Z"
    }
  ],
  "count": 25,
  "total_members": 100
}
```

---

### 5. Get Team by Number
**Endpoint**: `GET /api/teams/:teamNumber`

**Purpose**: Get details of a specific team

**Example**: `GET /api/teams/1`

**Response** (200):
```json
{
  "team": {
    "team_number": 1,
    "team_name": "Team 1",
    "member_count": 4,
    "members": [
      {
        "user_id": "uuid",
        "email": "user1@example.com",
        "full_name": "John Doe",
        "enrollment_number": "12345",
        "department": "CSE",
        "year": 2,
        "role": "member"
      }
    ],
    "created_at": "2026-02-01T10:00:00Z",
    "updated_at": "2026-02-01T10:00:00Z"
  }
}
```

---

### 6. Get User's Team
**Endpoint**: `GET /api/teams/user/:identifier`

**Purpose**: Find which team a user belongs to (by email or user_id)

**Examples**: 
- `GET /api/teams/user/john@example.com`
- `GET /api/teams/user/uuid-here`

**Response** (200):
```json
{
  "user": {
    "user_id": "uuid",
    "email": "john@example.com",
    "full_name": "John Doe",
    "enrollment_number": "12345"
  },
  "team": {
    "team_number": 1,
    "team_name": "Team 1",
    "member_count": 4,
    "members": [...]
  }
}
```

**Error Response** (404):
```json
{
  "error": "User not in any team"
}
```

---

### 7. Clear All Teams (Admin)
**Endpoint**: `DELETE /api/teams/clear`

**Purpose**: Remove all team assignments

**Response** (200):
```json
{
  "message": "All team assignments cleared successfully"
}
```

**Note**: Requires admin privileges

---

## Migration Steps

### 1. Run Database Migration
Execute the migration file in your Supabase SQL editor:
```sql
-- Run: backend/database/migrations/005_create_team_members.sql
```

This will:
- Create the `team_members` table
- Create the `team_summary` view
- Set up the `create_random_team_assignments()` function
- Configure RLS policies

### 2. Server Already Updated
The routes are already registered in [index.js](backend/src/index.js):
- `/api/verify-email` → Email verification
- `/api/teams` → Team management

### 3. Test Endpoints

**Test Email Verification**:
```bash
curl -X POST http://localhost:3000/api/verify-email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

**Test Team Creation**:
```bash
curl -X POST http://localhost:3000/api/teams/create-random \
  -H "Content-Type: application/json" \
  -d '{"team_size":4,"team_name_prefix":"Team"}'
```

**Test Get All Teams**:
```bash
curl http://localhost:3000/api/teams
```

**Test Get User's Team**:
```bash
curl http://localhost:3000/api/teams/user/test@example.com
```

---

## Use Cases

### Scenario 1: Event Registration & Team Formation
1. Students register → `POST /api/auth/register`
2. Admin verifies registrations → `GET /api/users`
3. Admin creates random teams → `POST /api/teams/create-random`
4. Students check their teams → `GET /api/teams/user/:email`

### Scenario 2: QR Maze + Team Activities
1. Individual QR Maze scoring → `POST /api/qrmaze/submit-score`
2. Team-based activities → Teams formed via `POST /api/teams/create-random`
3. View leaderboards:
   - Individual: `GET /api/qrmaze/leaderboard`
   - Teams: `GET /api/teams`

### Scenario 3: Email Verification Before Submission
1. User scans QR code → Frontend captures email
2. Verify email exists → `POST /api/verify-email`
3. If exists, allow score submission → `POST /api/qrmaze/submit-score`
4. If not, prompt registration

---

## Security & Validation

### Row-Level Security (RLS)
- ✅ Anyone can view teams (public)
- ✅ Users can view their own team
- ✅ Only admins can create/update/delete team assignments

### Automatic Features
- ✅ Email normalization (lowercase, trim)
- ✅ Email format validation (regex)
- ✅ Unique constraint (one user per team)
- ✅ Timestamp updates on modifications

### Constraints
- User can only be in ONE team at a time
- Team size default: 4 members
- Last team may have fewer members if users not divisible by 4

---

## Algorithm: Random Team Formation

```
1. Clear all existing team assignments
2. Get all registered users from users table
3. Shuffle users randomly
4. Iterate through users:
   - Assign 4 users to Team 1
   - Assign next 4 users to Team 2
   - Continue until all users assigned
   - Last team gets remaining users (may be 1-3)
5. Return all created teams with member details
```

**Example**: 
- 100 users → 25 teams of 4
- 102 users → 25 teams of 4 + 1 team of 2
- 98 users → 24 teams of 4 + 1 team of 2

---

## Error Codes

| Code | Meaning |
|------|---------|
| 200  | Success |
| 201  | Created successfully |
| 400  | Bad request / Validation error |
| 404  | Resource not found |
| 500  | Internal server error |

---

## Complete System Architecture

### Database Tables
1. **users** - Student registrations
2. **team_members** - Random team assignments (NEW)
3. **qrmaze** - Individual set scores (1-5)

### API Routes
1. `/api/auth` - Authentication (register, login)
2. `/api/users` - User management
3. `/api/verify-email` - Email verification (NEW)
4. `/api/teams` - Team formation & queries (UPDATED)
5. `/api/qrmaze` - QR Maze scoring
6. `/api/scores` - Legacy scores (can be removed)

### Workflow Integration
```
Registration → Email Verification → Team Formation → QR Maze Scoring
     ↓              ↓                    ↓                  ↓
  users table   verify-email       team_members       qrmaze table
```

---

## Example: Complete Flow

```bash
# 1. Student registers
POST /api/auth/register
{
  "email": "john@example.com",
  "password": "secure123",
  "full_name": "John Doe",
  "enrollment_number": "12345",
  ...
}

# 2. Verify email exists
POST /api/verify-email
{
  "email": "john@example.com"
}
# Response: { "exists": true, "user": {...} }

# 3. Admin creates teams (after registration closes)
POST /api/teams/create-random
{
  "team_size": 4
}
# Response: 25 teams created

# 4. Student checks their team
GET /api/teams/user/john@example.com
# Response: { "team": { "team_number": 5, "team_name": "Team 5", ... } }

# 5. Student completes QR Maze Set 1
POST /api/qrmaze/submit-score
{
  "email": "john@example.com",
  "setNumber": 1,
  "correctAnswers": 8,
  "timeTaken": 25,
  "title": "Introduction to Programming (C & Python)"
}

# 6. View individual leaderboard
GET /api/qrmaze/leaderboard/1

# 7. View team roster
GET /api/teams/5
```
