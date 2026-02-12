# QRMaze API Documentation

## Overview
The QRMaze system replaces the team-based scoring (rounds 1-3) with individual set-based scoring (sets 1-5). Each user can submit their score for 5 different sets, tracked individually.

## Database Changes

### Migration: 004_create_qrmaze_table.sql
- **Drops**: `teams` and `team_members` tables
- **Creates**: `qrmaze` table with individual set-based scoring
- **Views**:
  - `qrmaze_user_totals`: Aggregated user statistics
  - `qrmaze_set_leaderboard`: Ranked leaderboard per set

### QRMaze Table Structure
```sql
{
  id: UUID,
  email: TEXT (references users.email),
  user_id: UUID (auto-populated from email),
  set_number: INTEGER (1-5),
  title: TEXT,
  correct_answers: INTEGER,
  time_taken: INTEGER (in seconds),
  created_at: TIMESTAMPTZ,
  updated_at: TIMESTAMPTZ
}
```

## API Endpoints

### 1. Verify Email
**Endpoint**: `POST /api/qrmaze/verify-email`

**Purpose**: Check if an email exists in the registered users table

**Request Body**:
```json
{
  "email": "user@example.com"
}
```

**Success Response** (200):
```json
{
  "exists": true,
  "message": "Email verified successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "John Doe",
    "enrollment_number": "12345",
    "department": "CSE",
    "year": 2
  }
}
```

**Email Not Found Response** (200):
```json
{
  "exists": false,
  "message": "Email not found in registered users"
}
```

---

### 2. Submit Score
**Endpoint**: `POST /api/qrmaze/submit-score`

**Purpose**: Submit a user's score for a specific set

**Request Body**:
```json
{
  "email": "user@example.com",
  "timeTaken": 16,
  "correctAnswers": 5,
  "setNumber": 1,
  "title": "Introduction to Programming (C & Python)"
}
```

**Validations**:
- `setNumber` must be between 1 and 5
- `timeTaken` and `correctAnswers` must be non-negative
- Email must exist in users table
- One submission per user per set (unique constraint)

**Success Response** (201):
```json
{
  "message": "Score submitted successfully",
  "submission": {
    "id": "uuid",
    "email": "user@example.com",
    "setNumber": 1,
    "title": "Introduction to Programming (C & Python)",
    "correctAnswers": 5,
    "timeTaken": 16,
    "submittedAt": "2026-02-01T10:30:00Z"
  }
}
```

**Error Responses**:
- `404`: Email not found
- `409`: Score already submitted for this set
- `400`: Validation errors

---

### 3. Get User Progress
**Endpoint**: `GET /api/qrmaze/user/:email`

**Purpose**: Get all submissions for a specific user

**Example**: `GET /api/qrmaze/user/john@example.com`

**Response** (200):
```json
{
  "email": "john@example.com",
  "user": {
    "full_name": "John Doe",
    "enrollment_number": "12345",
    "department": "CSE",
    "year": 2
  },
  "sets_completed": 3,
  "submissions": [
    {
      "setNumber": 1,
      "title": "Introduction to Programming (C & Python)",
      "correctAnswers": 5,
      "timeTaken": 16,
      "submittedAt": "2026-02-01T10:30:00Z"
    },
    {
      "setNumber": 2,
      "title": "Data Structures",
      "correctAnswers": 8,
      "timeTaken": 25,
      "submittedAt": "2026-02-01T11:00:00Z"
    }
  ]
}
```

---

### 4. Get Set Leaderboard
**Endpoint**: `GET /api/qrmaze/leaderboard/:setNumber`

**Purpose**: Get ranked leaderboard for a specific set (1-5)

**Example**: `GET /api/qrmaze/leaderboard/1`

**Response** (200):
```json
{
  "setNumber": 1,
  "title": "Introduction to Programming (C & Python)",
  "count": 50,
  "leaderboard": [
    {
      "rank": 1,
      "fullName": "John Doe",
      "email": "john@example.com",
      "enrollmentNumber": "12345",
      "department": "CSE",
      "year": 2,
      "correctAnswers": 10,
      "timeTaken": 15,
      "submittedAt": "2026-02-01T10:30:00Z"
    },
    {
      "rank": 2,
      "fullName": "Jane Smith",
      "email": "jane@example.com",
      "enrollmentNumber": "12346",
      "department": "ECE",
      "year": 3,
      "correctAnswers": 10,
      "timeTaken": 18,
      "submittedAt": "2026-02-01T10:35:00Z"
    }
  ]
}
```

**Ranking Logic**: Ordered by:
1. Correct answers (descending)
2. Time taken (ascending) - faster is better

---

### 5. Get Overall Leaderboard
**Endpoint**: `GET /api/qrmaze/leaderboard`

**Purpose**: Get overall leaderboard across all sets

**Response** (200):
```json
{
  "count": 100,
  "leaderboard": [
    {
      "rank": 1,
      "email": "john@example.com",
      "fullName": "John Doe",
      "enrollmentNumber": "12345",
      "department": "CSE",
      "year": 2,
      "setsCompleted": 5,
      "totalCorrectAnswers": 45,
      "totalTimeTaken": 120,
      "avgCorrectAnswers": "9.00",
      "avgTimeTaken": "24.00",
      "lastSubmission": "2026-02-01T12:00:00Z"
    }
  ]
}
```

---

### 6. Get Set Submissions
**Endpoint**: `GET /api/qrmaze/set/:setNumber/submissions`

**Purpose**: Get all submissions for a specific set

**Example**: `GET /api/qrmaze/set/1/submissions`

**Response** (200):
```json
{
  "setNumber": 1,
  "count": 50,
  "submissions": [
    {
      "id": "uuid",
      "email": "john@example.com",
      "fullName": "John Doe",
      "enrollmentNumber": "12345",
      "department": "CSE",
      "year": 2,
      "title": "Introduction to Programming (C & Python)",
      "correctAnswers": 10,
      "timeTaken": 15,
      "submittedAt": "2026-02-01T10:30:00Z"
    }
  ]
}
```

---

### 7. Update Score (Admin/Corrections)
**Endpoint**: `PUT /api/qrmaze/update-score`

**Purpose**: Update an existing score submission

**Request Body**:
```json
{
  "email": "user@example.com",
  "setNumber": 1,
  "timeTaken": 20,
  "correctAnswers": 8
}
```

**Response** (200):
```json
{
  "message": "Score updated successfully",
  "submission": {
    "email": "user@example.com",
    "setNumber": 1,
    "correctAnswers": 8,
    "timeTaken": 20,
    "updatedAt": "2026-02-01T13:00:00Z"
  }
}
```

---

### 8. Delete Submission (Admin Only)
**Endpoint**: `DELETE /api/qrmaze/submission/:id`

**Purpose**: Delete a specific submission

**Example**: `DELETE /api/qrmaze/submission/uuid-here`

**Response** (200):
```json
{
  "message": "Submission deleted successfully"
}
```

---

## Migration Steps

### 1. Run Database Migration
Execute the migration file in your Supabase SQL editor:
```bash
backend/database/migrations/004_create_qrmaze_table.sql
```

This will:
- Drop the old `teams` and `team_members` tables
- Create the new `qrmaze` table
- Set up views for leaderboards and statistics
- Configure RLS policies

### 2. Restart Backend Server
```bash
cd backend
pnpm install  # if needed
pnpm start
```

### 3. Test Endpoints

**Test Email Verification**:
```bash
curl -X POST http://localhost:3000/api/qrmaze/verify-email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

**Test Score Submission**:
```bash
curl -X POST http://localhost:3000/api/qrmaze/submit-score \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "timeTaken":16,
    "correctAnswers":5,
    "setNumber":1,
    "title":"Introduction to Programming (C & Python)"
  }'
```

---

## Set Titles Reference

Based on the requirement, here are suggested titles for the 5 sets:

1. **Set 1**: "Introduction to Programming (C & Python)"
2. **Set 2**: "Data Structures & Algorithms"
3. **Set 3**: "Web Development Fundamentals"
4. **Set 4**: "Database Systems"
5. **Set 5**: "Advanced Problem Solving"

---

## Security & Validation

### Row-Level Security (RLS)
- ✅ Anyone can view scores (public leaderboard)
- ✅ Users can only submit their own scores (verified by email)
- ✅ Users can update their own scores
- ✅ Only admins can delete scores

### Automatic Features
- ✅ Email → User ID mapping (automatic trigger)
- ✅ Timestamp updates on modifications
- ✅ Unique constraint per user per set
- ✅ Email validation against users table

---

## Error Codes

| Code | Meaning |
|------|---------|
| 200  | Success |
| 201  | Created successfully |
| 400  | Bad request / Validation error |
| 404  | Resource not found |
| 409  | Conflict (duplicate submission) |
| 500  | Internal server error |

---

## Migration from Teams to QRMaze

### What Changed?
- ❌ **Removed**: Team-based scoring (rounds 1-3)
- ❌ **Removed**: `teams` and `team_members` tables
- ✅ **Added**: Individual scoring (sets 1-5)
- ✅ **Added**: `qrmaze` table with email-based linking
- ✅ **Added**: Per-set leaderboards and overall statistics

### Data Impact
⚠️ **WARNING**: The migration drops the `teams` and `team_members` tables. All existing team data will be lost. Backup if needed before running the migration.

---

## Example Workflow

1. **Student registers** → Entry created in `users` table
2. **Student attempts Set 1** → Completes QR maze challenge
3. **System verifies email** → `POST /api/qrmaze/verify-email`
4. **System submits score** → `POST /api/qrmaze/submit-score`
5. **Leaderboard updates** → Automatic via views
6. **Student views progress** → `GET /api/qrmaze/user/:email`
7. **Public views leaderboard** → `GET /api/qrmaze/leaderboard/:setNumber`
