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

    // Query unread notifications for this artist
    const q = query(
      collection(db, 'notifications'),
      where('artistId', '==', auth.currentUser.uid),
      where('read', '==', false)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setUnreadCount(snapshot.docs.length);
      },
      (error) => {
        console.error('Error listening to notifications:', error);
        setUnreadCount(0);
      }
    );

    return () => unsubscribe();
  }, []);

  return unreadCount;
}
