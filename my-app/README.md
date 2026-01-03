# Frontend - GGSC Registration

Next.js frontend application for the GGSC event registration system.

## Features

- ✅ User registration form with validation
- ✅ Integration with backend API
- ✅ Responsive glassmorphism design
- ✅ Success/error message display
- ✅ Loading states

## Backend Integration

The frontend connects to the backend API at `http://localhost:3000` by default.

### API Endpoint Used

- **POST** `/api/auth/signup` - User registration

### Form Fields Mapping

| Frontend Field | Backend Field | Type |
|----------------|---------------|------|
| Full Name | `full_name` | string |
| Email ID | `email` | string |
| Password | `password` | string |
| Enrollment Number | `enrollment_number` | string |
| Phone Number | `mobile_number` | string |
| Department | `department` | string |
| College Year | `year` | number (1-4) |

## Setup

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure Backend URL

If your backend is not running on `localhost:3000`, update the `BACKEND_URL` constant in `app/page.tsx`:

```typescript
const BACKEND_URL = "http://your-backend-url:3000";
```

For production, update it to your deployed backend URL.

### 3. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Production Deployment

### Update Backend URL

Before deploying, update `BACKEND_URL` in `app/page.tsx` to your production backend URL:

```typescript
const BACKEND_URL = "https://your-backend-domain.com";
```

### Build

```bash
pnpm build
```

### Start Production Server

```bash
pnpm start
```

## Project Structure

```
my-app/
├── app/
│   ├── page.tsx          # Registration form
│   ├── layout.tsx        # Root layout
│   ├── globals.css       # Global styles
│   └── favicon.ico
├── public/
│   ├── desktop_view.png  # Desktop background
│   ├── mobileview.png    # Mobile background
│   └── *.png             # Logos and icons
└── package.json
```

## Development Notes

- The form automatically converts year strings ("1st Year", etc.) to numbers (1-4) for the backend
- Password minimum length is 6 characters
- All fields are required
- Success/error messages are displayed above the form
- Form is cleared on successful registration

## Technologies

- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling
- **Axios** - HTTP client
- **Playfair Display** - Google Font

## CORS Configuration

Make sure your backend has CORS enabled for the frontend domain. The backend already has this configured.
