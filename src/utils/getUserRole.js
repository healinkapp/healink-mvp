import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Get user role from Firestore (compatible with new security rules)
 * @param {string} userId - Firebase Auth UID (required for security rules)
 * @param {string} email - User email (fallback for backwards compatibility)
 * @returns {Promise<string|null>} - 'artist' or 'client' or null
 */
export async function getUserRole(userId, email) {
  try {
    // Strategy 1: Try direct document lookup by userId (fastest, works with security rules)
    if (userId) {
      try {
        const userDocRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          console.log('✅ getUserRole: Found by userId:', userId, '- Role:', userData.role);
          return userData.role || null;
        }
      } catch (directError) {
        // If direct lookup fails, continue to fallback
        console.log('⚠️ getUserRole: Direct lookup failed, trying email query...', directError.code);
      }
    }

    // Strategy 2: Fallback to email query (backwards compatibility)
    // Note: This requires security rules to allow query by email or user must be authenticated
    if (email) {
      const q = query(
        collection(db, 'users'),
        where('email', '==', email)
      );
      
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const userData = snapshot.docs[0].data();
        console.log('✅ getUserRole: Found by email:', email, '- Role:', userData.role);
        return userData.role || null;
      }
    }

    console.log('❌ getUserRole: No user found for userId:', userId, 'or email:', email);
    return null;
    
  } catch (error) {
    console.error('❌ getUserRole error:', error.code, error.message);
    
    // Handle permission errors gracefully
    if (error.code === 'permission-denied') {
      console.error('⚠️ Firestore permission denied. User must be authenticated.');
    }
    
    return null;
  }
}
