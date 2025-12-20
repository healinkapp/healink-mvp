// Push Notification Service for Healink MVP
// Handles Firebase Cloud Messaging (FCM) token management and push notifications

import { getToken, onMessage } from 'firebase/messaging';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, getMessagingInstance } from '../config/firebase';

/**
 * Request push notification permission from browser and save FCM token
 * @param {string} userId - Firestore user document ID
 * @returns {Promise<{success: boolean, token?: string, error?: string}>}
 */
export async function requestPushPermission(userId) {
  try {
    if (import.meta.env.DEV) {
      console.log('[PUSH] Requesting push notification permission...');
    }

    // Check if browser supports notifications
    if (!('Notification' in window)) {
      console.warn('[pushService] This browser does not support notifications');
      return {
        success: false,
        error: 'Browser does not support notifications'
      };
    }

    // Check current permission status
    if (Notification.permission === 'denied') {
      console.warn('[pushService] Notification permission was denied by user');
      return {
        success: false,
        error: 'Notification permission denied'
      };
    }

    // Get messaging instance
    const messaging = await getMessagingInstance();
    if (!messaging) {
      console.warn('[pushService] Firebase Messaging not available');
      return {
        success: false,
        error: 'Firebase Messaging not supported'
      };
    }

    // Request permission (this will show browser prompt if not already decided)
    const permission = await Notification.requestPermission();
    
    if (permission !== 'granted') {
      console.warn('[pushService] Notification permission not granted:', permission);
      return {
        success: false,
        error: `Permission ${permission}`
      };
    }

    // Get FCM token using VAPID key
    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
    
    if (!vapidKey) {
      console.error('[pushService] VAPID key not found in environment variables');
      return {
        success: false,
        error: 'VAPID key not configured'
      };
    }

    const token = await getToken(messaging, { vapidKey });

    if (!token) {
      console.error('[pushService] Failed to get FCM token');
      return {
        success: false,
        error: 'Failed to retrieve FCM token'
      };
    }

    if (import.meta.env.DEV) {
      console.log('[PUSH] FCM token obtained:', token.substring(0, 20) + '...');
    }

    // Save token to Firestore
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      fcmToken: token,
      fcmTokenUpdatedAt: serverTimestamp()
    });

    return {
      success: true,
      token: token
    };

  } catch (error) {
    console.error('[pushService] Push permission request failed:', error);
    return {
      success: false,
      error: error.message || 'Unknown error occurred'
    };
  }
}

/**
 * Subscribe to foreground push messages (when app is open)
 * @param {Function} callback - Called with {title, body, data} when message arrives
 * @returns {Function} - Unsubscribe function
 */
export async function subscribeToPushMessages(callback) {
  try {
    const messaging = await getMessagingInstance();
    
    if (!messaging) {
      console.warn('[pushService] Firebase Messaging not available for subscription');
      return () => {}; // Return empty unsubscribe function
    }

    // Listen for foreground messages
    const unsubscribe = onMessage(messaging, (payload) => {
      if (import.meta.env.DEV) {
        console.log('[PUSH] Foreground message received:', payload);
      }

      const { notification, data } = payload;
      
      if (notification) {
        callback({
          title: notification.title || 'Healink Notification',
          body: notification.body || '',
          icon: notification.icon || '/icons/icon-192.png',
          data: data || {}
        });
      }
    });

    return unsubscribe;

  } catch (error) {
    console.error('[pushService] Failed to subscribe to push messages:', error);
    return () => {}; // Return empty unsubscribe function
  }
}

/**
 * Remove FCM token from Firestore (unsubscribe from push)
 * @param {string} userId - Firestore user document ID
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function unsubscribePush(userId) {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      fcmToken: null,
      fcmTokenUpdatedAt: serverTimestamp()
    });

    return { success: true };

  } catch (error) {
    console.error('[pushService] Failed to unsubscribe from push:', error);
    return {
      success: false,
      error: error.message || 'Failed to unsubscribe'
    };
  }
}

/**
 * Check if push notifications are supported in current browser
 * @returns {boolean}
 */
export function isPushSupported() {
  return (
    'Notification' in window &&
    'serviceWorker' in navigator &&
    'PushManager' in window
  );
}

/**
 * Get current notification permission status
 * @returns {'granted' | 'denied' | 'default'}
 */
export function getPushPermissionStatus() {
  if (!('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission;
}

/**
 * Send a test push notification (for development)
 * NOTE: This is a client-side test that shows a local notification.
 * Real FCM notifications must be sent from backend (Cloud Functions).
 * 
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {Object} options - Additional notification options
 * @returns {Promise<void>}
 */
export async function sendTestNotification(title, body, options = {}) {
  try {
    if (!isPushSupported()) {
      throw new Error('Push notifications not supported');
    }

    if (Notification.permission !== 'granted') {
      throw new Error('Notification permission not granted');
    }

    // Show local notification (not a real FCM push)
    const notification = new Notification(title, {
      body: body,
      icon: options.icon || '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      tag: options.tag || 'healink-test',
      data: options.data || {},
      ...options
    });

    // Auto-close after 5 seconds
    setTimeout(() => {
      notification.close();
    }, 5000);

  } catch (error) {
    console.error('[pushService] Test notification failed:', error);
    throw error;
  }
}

/**
 * Handle FCM token refresh
 * Call this when token expires or changes
 * 
 * @param {string} userId - Firestore user document ID
 * @returns {Promise<{success: boolean, token?: string, error?: string}>}
 */
export async function refreshFCMToken(userId) {
  // Same logic as requestPushPermission but for refresh
  return await requestPushPermission(userId);
}

// Export convenience function for testing
export { sendTestNotification as sendTestPush };
