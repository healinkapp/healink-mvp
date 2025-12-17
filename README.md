# Healink MVP

Automated aftercare platform for tattoo artists.

## Tech Stack

- **Frontend**: React + Vite
- **Styling**: Tailwind CSS
- **Backend**: Firebase (Auth, Firestore, Storage, Functions)
- **Email**: EmailJS
- **Routing**: React Router

## Project Structure

```
src/
├── auth/          # Authentication components (Login, Signup)
├── dashboard/     # Tattoo artist dashboard
├── client/        # Client-facing PWA
├── components/    # Reusable components
├── config/        # Firebase and app configuration
└── assets/        # Images, icons, etc.
```

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.local` and add your Firebase credentials:

```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

**Note**: Email system uses EmailJS with credentials in `EmailTest.jsx`

### 3. Run Development Server

```bash
npm run dev
```

### 4. Build for Production

```bash
npm run build
```

## Routes

- `/` - Home page
- `/dashboard` - Artist dashboard
- `/client/:id` - Client aftercare view

## Next Steps

1. Create Firebase project and add credentials to `.env.local`
2. Implement authentication components
3. Build dashboard features
4. Create client PWA experience

## Notes

- All code, comments, and UI text are in English
- Firebase SDK is installed but not configured yet
- Environment variables need to be set before Firebase will work

