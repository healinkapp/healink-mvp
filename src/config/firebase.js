import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';
import { getMessaging, isSupported } from 'firebase/messaging';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

// Initialize messaging (check support first)
// We export a promise that resolves to messaging instance or null
export const getMessagingInstance = async () => {
  try {
    const supported = await isSupported();
    if (supported) {
      const messaging = getMessaging(app);
      console.log('✅ Firebase Messaging initialized');
      return messaging;
    } else {
      console.warn('⚠️ Firebase Messaging not supported in this browser');
      return null;
    }
  } catch (error) {
    console.warn('⚠️ Firebase Messaging initialization failed:', error.message);
    return null;
  }
};

// Set persistence to LOCAL (survives page refresh)
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log('✅ Auth persistence set to LOCAL');
  })
  .catch((error) => {
    console.error('❌ Auth persistence error:', error);
  });