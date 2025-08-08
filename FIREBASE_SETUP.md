# Firebase Setup Guide for Retrospective App

This guide will help you set up Firebase for the multi-user functionality of the Retrospective App.

## Prerequisites
- A Google account
- Node.js and npm installed
- The retrospective-app repository cloned locally

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create a project" or "Add project"
3. Enter a project name (e.g., "retrospective-app")
4. Disable Google Analytics (optional, not needed for this app)
5. Click "Create project"

## Step 2: Enable Authentication

1. In your Firebase project, click on "Authentication" in the left sidebar
2. Click "Get started"
3. Go to the "Sign-in method" tab
4. Enable "Anonymous" authentication by clicking on it and toggling the "Enable" switch
5. Click "Save"

## Step 3: Create Firestore Database

1. Click on "Firestore Database" in the left sidebar
2. Click "Create database"
3. Choose "Start in production mode" for now (we'll add rules later)
4. Select your preferred location (choose the closest to your users)
5. Click "Enable"

## Step 4: Set Up Firestore Security Rules

1. In Firestore, click on the "Rules" tab
2. Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow anyone to read boards
    match /boards/{boardId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update: if request.auth != null;
      
      // Allow anyone to read/write notes in a board
      match /notes/{noteId} {
        allow read: if true;
        allow create: if request.auth != null;
        allow update: if request.auth != null;
        allow delete: if request.auth != null;
      }
    }
  }
}
```

3. Click "Publish"

## Step 5: Get Your Firebase Configuration

1. Go to Project Settings (click the gear icon next to "Project Overview")
2. Scroll down to "Your apps" section
3. Click on the "</>" icon to add a web app
4. Register your app with a nickname (e.g., "retrospective-web")
5. You'll see your Firebase configuration object. It looks like:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123",
  measurementId: "G-XXXXXX"
};
```

## Step 6: Configure the App

1. In your project root, create a `.env` file (copy from `.env.example`):

```bash
cp .env.example .env
```

2. Edit `.env` and add your Firebase configuration values:

```env
REACT_APP_FIREBASE_API_KEY=your-api-key-here
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abc123
REACT_APP_FIREBASE_MEASUREMENT_ID=G-XXXXXX
```

## Step 7: Test the Application

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Open http://localhost:3000 in your browser
4. Create a new board
5. Share the board URL with another browser/device to test real-time sync

## Step 8: Deploy to Production

### Option A: Deploy to GitHub Pages (with limitations)
Note: GitHub Pages only supports static hosting, so the board URLs will use hash routing (e.g., `/#/board/abc123`)

1. Update `package.json` homepage:
```json
"homepage": "https://yourusername.github.io/retrospective-app"
```

2. Build and deploy:
```bash
npm run build
npm run deploy
```

### Option B: Deploy to Firebase Hosting (recommended)
1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Initialize Firebase Hosting:
```bash
firebase init hosting
```
- Choose your Firebase project
- Set public directory to `build`
- Configure as single-page app: Yes
- Don't overwrite index.html

3. Build and deploy:
```bash
npm run build
firebase deploy --only hosting
```

## Troubleshooting

### "Permission denied" errors
- Check that Anonymous authentication is enabled
- Verify your Firestore security rules are published
- Ensure you're signed in (check browser console for auth errors)

### Real-time sync not working
- Check browser console for WebSocket errors
- Verify Firestore is enabled in Firebase Console
- Ensure your Firebase configuration is correct in `.env`

### Build errors
- Make sure all environment variables are set
- Try deleting `node_modules` and running `npm install` again
- Clear browser cache and localStorage

## Security Considerations

For production use, consider:
1. Implementing user authentication (Google, Email/Password, etc.)
2. Adding rate limiting rules
3. Setting up Cloud Functions for sensitive operations
4. Implementing data validation rules
5. Adding user permissions and board ownership

## Support

For issues or questions:
- Check the [Firebase Documentation](https://firebase.google.com/docs)
- Review the [Firestore Guide](https://firebase.google.com/docs/firestore)
- Open an issue in the GitHub repository