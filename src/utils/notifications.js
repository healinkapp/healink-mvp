import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Notification Types:
 * - account_setup: Client completed account setup
 * - critical_phase: Client entered critical healing phase (Day 7)
 * - milestone: Client reached healing milestone (Day 14, 30)
 */

/**
 * Create a notification in Firestore
 * @param {string} artistId - Artist user ID
 * @param {string} type - Notification type (account_setup, critical_phase, milestone)
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {string} clientId - Client document ID (optional)
 * @param {string} clientName - Client name (optional)
 */
export async function createNotification({
  artistId,
  type,
  title,
  message,
  clientId = null,
  clientName = null
}) {
  try {
    await addDoc(collection(db, 'notifications'), {
      artistId,
      type,
      title,
      message,
      clientId,
      clientName,
      read: false,
      createdAt: serverTimestamp()
    });
    
    if (import.meta.env.DEV) {
      console.log('[notifications] Created:', { type, title });
    }
  } catch (error) {
    console.error('[notifications] Error creating notification:', error);
  }
}

/**
 * Create notification when client completes account setup
 */
export function notifyAccountSetup(artistId, clientName, clientId) {
  return createNotification({
    artistId,
    type: 'account_setup',
    title: `${clientName} completed setup`,
    message: `${clientName} has activated their account and started their healing journey.`,
    clientId,
    clientName
  });
}

/**
 * Create notification when client enters critical phase
 */
export function notifyCriticalPhase(artistId, clientName, clientId, day) {
  return createNotification({
    artistId,
    type: 'critical_phase',
    title: `${clientName} is in critical phase`,
    message: `Day ${day}/30 - Critical healing phase. Make sure they're following aftercare protocol.`,
    clientId,
    clientName
  });
}

/**
 * Create notification when client reaches milestone
 */
export function notifyMilestone(artistId, clientName, clientId, day) {
  let message = '';
  
  if (day === 14) {
    message = `${clientName} completed 2 weeks of healing. Active care phase complete.`;
  } else if (day >= 30) {
    message = `${clientName} has fully healed! Their tattoo journey is complete.`;
  } else {
    message = `${clientName} reached Day ${day} milestone.`;
  }

  return createNotification({
    artistId,
    type: 'milestone',
    title: `${clientName} reached Day ${day}`,
    message,
    clientId,
    clientName
  });
}
