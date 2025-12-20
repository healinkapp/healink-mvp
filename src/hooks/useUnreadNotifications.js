import { useState, useEffect } from 'react';
import { auth, db } from '../config/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

/**
 * Custom hook to get unread notification count for current artist
 * @returns {number} Count of unread notifications
 */
export function useUnreadNotifications() {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!auth.currentUser) {
      setUnreadCount(0);
      return;
    }

    // Query unread notifications for current user (artist or client)
    // Use userId instead of artistId to support both roles
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', auth.currentUser.uid),
      where('read', '==', false)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setUnreadCount(snapshot.docs.length);
      },
      (error) => {
        // Silently fail if collection doesn't exist or permission denied
        if (import.meta.env.DEV) {
          console.warn('[useUnreadNotifications] Could not fetch notifications:', error.code);
        }
        setUnreadCount(0);
      }
    );

    return () => unsubscribe();
  }, []);

  return unreadCount;
}
