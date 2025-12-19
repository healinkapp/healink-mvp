import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Get user role from Firestore by email
 * @param {string} email - User email
 * @returns {Promise<string|null>} - 'artist' or 'client' or null
 */
export async function getUserRole(email) {
  try {
    const q = query(
      collection(db, 'users'),
      where('email', '==', email)
    );
    
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      console.log('No user found with email:', email);
      return null;
    }

    const userData = snapshot.docs[0].data();
    return userData.role || null;
  } catch (error) {
    console.error('Error fetching user role:', error);
    return null;
  }
}
