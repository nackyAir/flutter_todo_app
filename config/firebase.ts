import { getApp, getApps, initializeApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';

// Firebase設定
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID
};

console.log('🔥 Initializing Firebase...');

// Firebase App初期化
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
  console.log('✅ Firebase app initialized');
} else {
  app = getApp();
  console.log('♻️ Using existing Firebase app');
}

// Firebase Auth初期化
const auth: Auth = getAuth(app);
console.log('✅ Firebase Auth initialized');

// Firestore初期化
const db: Firestore = getFirestore(app);
console.log('✅ Firestore initialized');

console.log('🎉 Firebase setup complete!');

export { app, auth, db };

