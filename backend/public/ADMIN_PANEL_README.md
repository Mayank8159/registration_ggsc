# Admin Panel - Login & Attendance Management

## 🔐 Login Credentials

**Default Admin Credentials:**
- **Username:** `admin`
- **Password:** `admin123`

⚠️ **Security Note:** These are default credentials for development. In production, change these credentials and implement proper authentication with encrypted passwords.

## 📋 Features

### 1. **Secure Login System**
- Login page with username/password authentication
- Session-based authentication using sessionStorage
- Auto-redirect to dashboard after successful login
- Logout functionality with confirmation

### 2. **Main Dashboard** (`index.html`)
- Access to all API testing features
- Team management (create, view, clear teams)
- QRMaze score submission and leaderboards
- Email verification
- User team lookup
- Protected by login - requires authentication

### 3. **Attendance Management** (`attendance.html`)
- Mark student attendance (present/absent)
- Real-time statistics dashboard:
  - Total students
  - Present count
  - Absent count
  - Attendance rate percentage
- **Search functionality**: Search by name, email, enrollment number, or department
- **Filter options**:
  - All Students
  - Present Only
  - Absent Only
  - Filter by Year (1, 2, 3)
- **Bulk actions**:
  - Select all users
  - Mark multiple users as present
  - Mark multiple users as absent
- Individual user toggle (mark present/absent)
- Protected by login - requires authentication

## 🚀 Usage

### Accessing the Admin Panel

1. **Start the backend server:**
   ```bash
   cd backend
   pnpm start
   ```

2. **Open your browser and navigate to:**
   ```
   http://localhost:3000
   ```

3. **Login with credentials:**
   - Username: `admin`
   - Password: `admin123`

4. **After successful login, you'll see:**
   - Main Dashboard with all API testing features
   - Navigation bar with "Mark Attendance" button

### Marking Attendance

1. **From the dashboard, click "📋 Mark Attendance"**
   - Or navigate directly to `http://localhost:3000/attendance.html`

2. **View Statistics:**
   - See total students, present/absent counts, and attendance rate

3. **Search for Students:**
   - Use the search box to find students by:
     - Name
     - Email
     - Enrollment number
     - Department

4. **Filter Students:**
   - Click filter buttons to show:
     - All students
     - Only present students
     - Only absent students
     - Students by year (1, 2, or 3)

5. **Mark Individual Attendance:**
   - Click "Mark Present" or "Mark Absent" button next to each student

6. **Bulk Mark Attendance:**
   - Check the "Select All" checkbox or select individual students
   - Click "Mark Selected as Present" or "Mark Selected as Absent"
   - Confirmation message will show how many users were updated

7. **Return to Dashboard:**
   - Click "← Back to Dashboard" in the navigation bar

### Security Features

- ✅ Login required for all admin functions
- ✅ Session-based authentication
- ✅ Auto-redirect if not logged in
- ✅ Logout confirmation
- ✅ Protected attendance management page

## 🛠️ Technical Details

### Authentication Flow

1. User enters credentials on login page
2. JavaScript validates credentials against hardcoded values
3. On success, sets `sessionStorage.isLoggedIn = 'true'`
4. Shows dashboard and hides login screen
5. Attendance page checks session on load
6. If not authenticated, redirects to login page

### API Endpoints Used

- `GET /api/users` - Get all users
- `GET /api/users/stats` - Get attendance statistics
- `PATCH /api/users/:id` - Update user attendance status

### Session Management

- Uses `sessionStorage` (cleared when tab closes)
- Can be upgraded to `localStorage` for persistent login
- Logout clears session and returns to login screen

## 🔒 Changing Default Credentials

To change the default admin credentials, edit `index.html`:

```javascript
const ADMIN_CREDENTIALS = {
    username: 'admin',      // Change this
    password: 'admin123'    // Change this
};
```

⚠️ **For production use, implement:**
- Backend authentication with JWT tokens
- Password hashing (bcrypt)
- Database-stored credentials
- Role-based access control
- Two-factor authentication

## 📸 Screenshots

### Login Page
- Clean, centered login form
- Username and password fields
- Error messages for invalid credentials

### Main Dashboard
- Navigation bar with logout and attendance buttons
- All API testing cards
- Real-time API responses

### Attendance Management
- Statistics cards at the top
- Search bar with magnifying glass icon
- Filter buttons for quick access
- Table with all students
- Checkbox selection for bulk actions
- Individual action buttons

## 🎨 Design Features

- Modern gradient background (purple theme)
- Responsive card-based layout
- Smooth transitions and hover effects
- Color-coded status badges (green for present, red for absent)
- Loading spinners for async operations
- Success/error message notifications
- Clean typography and spacing

## 🔄 Future Enhancements

Possible improvements:
- [ ] Backend API for authentication
- [ ] Password encryption
- [ ] Remember me functionality
- [ ] Password reset feature
- [ ] Role-based permissions (admin, teacher, etc.)
- [ ] Export attendance to CSV/Excel
- [ ] Attendance history and analytics
- [ ] Email notifications for absent students
- [ ] QR code-based check-in
- [ ] Mobile app integration
