import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

/**
 * DEMO_MODE is true when Firebase env vars are not configured.
 * All files check this flag and fall back to local seed data automatically.
 * To switch to live Firebase: create frontend/.env with your VITE_FIREBASE_* keys.
 */
export const DEMO_MODE = !import.meta.env.VITE_FIREBASE_API_KEY

let auth = null
let db = null
let app = null

if (!DEMO_MODE) {
  const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  }
  app = initializeApp(firebaseConfig)
  auth = getAuth(app)
  db = getFirestore(app)
}

export { auth, db }
export default app
