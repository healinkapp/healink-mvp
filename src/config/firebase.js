import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDjGQtqvpIAHz7XoZ_F0SWyzG-QLCGsSgU",
  authDomain: "healink-mvp-27eff.firebaseapp.com",
  projectId: "healink-mvp-27eff",
  storageBucket: "healink-mvp-27eff.firebasestorage.app",
  messagingSenderId: "23117856274",
  appId: "1:23117856274:web:37ba414e208d663d0062cb"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

// Set persistence to LOCAL (survives page refresh)
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log('✅ Auth persistence set to LOCAL');
  })
  .catch((error) => {
    console.error('❌ Auth persistence error:', error);
  });