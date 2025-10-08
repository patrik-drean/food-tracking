# Google OAuth Setup Guide

This guide walks you through setting up Google Sign-In for the Food Tracker application.

## Prerequisites

- Google account
- Access to [Google Cloud Console](https://console.cloud.google.com/)

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" dropdown at the top
3. Click "New Project"
4. Enter project name (e.g., "Food Tracker")
5. Click "Create"

## Step 2: Enable Google+ API

1. In your project, go to "APIs & Services" → "Library"
2. Search for "Google+ API"
3. Click on it and click "Enable"

## Step 3: Configure OAuth Consent Screen

1. Go to "APIs & Services" → "OAuth consent screen"
2. Choose "External" (unless you have a Google Workspace account)
3. Click "Create"
4. Fill in required fields:
   - **App name**: Food Tracker
   - **User support email**: Your email
   - **Developer contact**: Your email
5. Click "Save and Continue"
6. Skip "Scopes" (click "Save and Continue")
7. Add yourself as a test user:
   - Click "Add Users"
   - Enter your email
   - Click "Add"
8. Click "Save and Continue"
9. Review and click "Back to Dashboard"

## Step 4: Create OAuth Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Choose "Web application"
4. Enter name: "Food Tracker Web Client"
5. Add **Authorized JavaScript origins**:
   - `http://localhost:3000` (for local development)
   - `https://patrik-drean.github.io` (for production - if using GitHub Pages)
6. Add **Authorized redirect URIs**:
   - `http://localhost:3000/api/auth/callback/google` (for local development)
   - `https://patrik-drean.github.io/api/auth/callback/google` (for production)
7. Click "Create"
8. **Copy the Client ID and Client Secret** - you'll need these!

## Step 5: Generate NEXTAUTH_SECRET

Run this command in your terminal:

```bash
openssl rand -base64 32
```

Copy the output - this is your `NEXTAUTH_SECRET`.

## Step 6: Configure Backend Environment

1. Navigate to `backend/` directory
2. Copy `.env.example` to `.env` (if not already done):
   ```bash
   cp .env.example .env
   ```
3. Edit `.env` and add:
   ```bash
   NEXTAUTH_SECRET="your-generated-secret-from-step-5"
   ```

## Step 7: Configure Frontend Environment

1. Navigate to `frontend/` directory
2. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
3. Edit `.env.local` and add:
   ```bash
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="same-secret-as-backend"
   GOOGLE_CLIENT_ID="your-client-id-from-step-4"
   GOOGLE_CLIENT_SECRET="your-client-secret-from-step-4"
   NEXT_PUBLIC_GRAPHQL_URL="http://localhost:4000/graphql"
   ```

## Step 8: Apply Database Migration

The multi-user database schema needs to be applied:

```bash
cd backend
npx prisma migrate deploy
```

## Step 9: Start the Application

### Backend:
```bash
cd backend
npm run dev
```

### Frontend (in a new terminal):
```bash
cd frontend
npm run dev
```

## Step 10: Test Authentication

1. Open `http://localhost:3000` in your browser
2. You should be redirected to `/login`
3. Click "Sign in with Google"
4. Sign in with your Google account
5. You should be redirected back to the app
6. You should see your name and profile picture in the header with a "Sign out" button

## Production Deployment

### Railway (Backend)

Add these environment variables in Railway:

```
NEXTAUTH_SECRET=your-generated-secret
FRONTEND_URL=http://localhost:3000,https://patrik-drean.github.io
```

### GitHub Pages (Frontend)

Update your GitHub Actions workflow or environment variables:

```
NEXTAUTH_URL=https://patrik-drean.github.io
NEXTAUTH_SECRET=your-generated-secret
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
NEXT_PUBLIC_GRAPHQL_URL=https://your-railway-app.railway.app/graphql
```

## Troubleshooting

### "Redirect URI mismatch" error

- Make sure your redirect URIs in Google Console exactly match your application URLs
- Include `/api/auth/callback/google` at the end
- Check for http vs https
- No trailing slashes

### "Invalid client" error

- Double-check your Client ID and Client Secret
- Make sure there are no extra spaces
- Verify the secrets are in the correct `.env` files

### Can't sign in / Token errors

- Ensure `NEXTAUTH_SECRET` is the same in both frontend and backend
- Check that the backend is running and accessible
- Verify CORS settings allow your frontend origin

### Database errors after migration

- Run `npx prisma generate` to update the Prisma client
- Check that `DATABASE_URL` is correct
- Verify the migration was applied: `npx prisma migrate status`

## Next Steps

After successful authentication setup:

1. Run the data migration script (TASK-011) to assign existing food entries to your user
2. Test creating new food entries - they should be associated with your user
3. Sign out and sign in again to verify data persistence
4. Test that you can only see your own food entries

## Security Notes

- Never commit `.env` or `.env.local` files to git
- Keep your `NEXTAUTH_SECRET` secure and never share it
- Use strong, unique secrets for production
- Rotate secrets periodically
- In production, always use HTTPS
