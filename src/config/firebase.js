import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD1GGtavpIAHz7XoZ_F0SWyzG-QLCGsSgU",
  authDomain: "healink-mvp-27eff.firebaseapp.com",
  projectId: "healink-mvp-27eff",
  storageBucket: "healink-mvp-27eff.firebasestorage.app",
  messagingSenderId: "2311785s274",
  appId: "1:2311785s274:web:37ba414e288d663d0062cb"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);