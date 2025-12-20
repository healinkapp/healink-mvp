import emailjs from '@emailjs/browser';

/**
 * EMAIL SERVICE - Healink MVP
 * 
 * Handles all email communications via EmailJS
 * Supports Day 0, 1, 3, 5, 7, and 30 aftercare emails
 */

// Initialize EmailJS with public key
emailjs.init(import.meta.env.VITE_EMAILJS_PUBLIC_KEY);

/**
 * Email template IDs mapped by healing day
 */
const TEMPLATE_MAP = {
  0: import.meta.env.VITE_EMAILJS_TEMPLATE_DAY0,
  1: import.meta.env.VITE_EMAILJS_TEMPLATE_DAY1,
  3: import.meta.env.VITE_EMAILJS_TEMPLATE_DAY3,
  5: import.meta.env.VITE_EMAILJS_TEMPLATE_DAY5,
  7: import.meta.env.VITE_EMAILJS_TEMPLATE_DAY7,
  30: import.meta.env.VITE_EMAILJS_TEMPLATE_DAY30
};

/**
 * Get template ID for specific healing day
 * @param {number} dayNumber - Healing day (0, 1, 3, 5, 7, or 30)
 * @returns {string|null} Template ID or null if not found
 */
export function getTemplateId(dayNumber) {
  const templateId = TEMPLATE_MAP[dayNumber];
  
  if (!templateId) {
    console.warn(`[emailService] No template configured for Day ${dayNumber}`);
    return null;
  }
  
  return templateId;
}

/**
 * Send Day 0 welcome email with setup link
 * @param {Object} params - Email parameters
 * @param {string} params.clientEmail - Client's email address
 * @param {string} params.clientName - Client's name
 * @param {string} params.studioName - Artist's studio name
 * @param {string} params.setupLink - Unique setup link for client
 * @param {string} params.tattooPhoto - Cloudinary URL of tattoo photo (optional)
 * @returns {Promise<boolean>} Success status
 */
export async function sendDay0Email({
  clientEmail,
  clientName,
  studioName,
  setupLink,
  tattooPhoto = null
}) {
  const templateId = getTemplateId(0);
  if (!templateId) {
    throw new Error('Day 0 template not configured');
  }

  const templateParams = {
    to_email: clientEmail,
    email: clientEmail, // Backup field
    client_name: clientName,
    studio_name: studioName,
    setup_link: setupLink,
    tattoo_photo: tattooPhoto || '' // Optional
  };

  try {
    if (import.meta.env.DEV) {
      console.log('[EMAIL] Sending Day 0 email to:', clientEmail);
    }
    
    const response = await emailjs.send(
      import.meta.env.VITE_EMAILJS_SERVICE_ID,
      templateId,
      templateParams
    );

    return true;
  } catch (error) {
    console.error('[emailService] Failed to send Day 0 email:', error);
    throw error;
  }
}

/**
 * Send aftercare email for specific healing day
 * @param {Object} params - Email parameters
 * @param {string} params.clientEmail - Client's email address
 * @param {string} params.clientName - Client's name
 * @param {number} params.dayNumber - Healing day (1, 3, 5, 7, or 30)
 * @param {string} params.appLink - Link to client dashboard
 * @returns {Promise<boolean>} Success status
 */
export async function sendAftercareEmail({
  clientEmail,
  clientName,
  dayNumber,
  appLink = `${window.location.origin}/client/dashboard`
}) {
  const templateId = getTemplateId(dayNumber);
  if (!templateId) {
    throw new Error(`Day ${dayNumber} template not configured`);
  }

  const templateParams = {
    to_email: clientEmail,
    email: clientEmail, // Backup field
    client_name: clientName,
    app_link: appLink
  };

  try {
    if (import.meta.env.DEV) {
      console.log(`[EMAIL] Sending Day ${dayNumber} email to:`, clientEmail);
    }
    
    const response = await emailjs.send(
      import.meta.env.VITE_EMAILJS_SERVICE_ID,
      templateId,
      templateParams
    );

    return true;
  } catch (error) {
    console.error(`[emailService] Failed to send Day ${dayNumber} email:`, error);
    throw error;
  }
}

/**
 * Universal email sender - auto-detects Day 0 vs aftercare
 * @param {Object} client - Client data from Firestore
 * @param {Object} artist - Artist data from Firestore
 * @param {number} dayNumber - Healing day (0, 1, 3, 5, 7, or 30)
 * @param {string} setupToken - Unique setup token (only for Day 0)
 * @returns {Promise<boolean>} Success status
 */
export async function sendHealingEmail(client, artist, dayNumber, setupToken = null) {
  try {
    // Validate day number
    if (!TEMPLATE_MAP[dayNumber]) {
      console.warn(`[emailService] No template for Day ${dayNumber}, skipping email`);
      return false;
    }

    // Day 0 - Welcome + Setup
    if (dayNumber === 0) {
      if (!setupToken) {
        throw new Error('Setup token required for Day 0 email');
      }

      const setupLink = `${window.location.origin}/client/setup/${setupToken}`;
      const studioName = artist.studioName || artist.name || 'Your Tattoo Studio';

      return await sendDay0Email({
        clientEmail: client.email,
        clientName: client.name,
        studioName,
        setupLink,
        tattooPhoto: client.tattooPhoto
      });
    }

    // Day 1, 3, 5, 7, 30 - Aftercare
    return await sendAftercareEmail({
      clientEmail: client.email,
      clientName: client.name,
      dayNumber
    });
  } catch (error) {
    console.error(`[emailService] Error sending Day ${dayNumber} email:`, error);
    throw error;
  }
}

/**
 * Check if email template is configured for specific day
 * @param {number} dayNumber - Healing day to check
 * @returns {boolean} True if template is configured
 */
export function isTemplateConfigured(dayNumber) {
  return !!TEMPLATE_MAP[dayNumber];
}

/**
 * Get all configured email days
 * @returns {number[]} Array of configured day numbers
 */
export function getConfiguredDays() {
  return Object.keys(TEMPLATE_MAP)
    .map(Number)
    .filter(day => TEMPLATE_MAP[day]);
}

/**
 * Validate EmailJS configuration
 * @returns {Object} Configuration status
 */
export function validateEmailConfig() {
  const config = {
    publicKey: !!import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
    serviceId: !!import.meta.env.VITE_EMAILJS_SERVICE_ID,
    templates: {}
  };

  Object.keys(TEMPLATE_MAP).forEach(day => {
    config.templates[`day${day}`] = !!TEMPLATE_MAP[day];
  });

  const isValid = config.publicKey && config.serviceId && 
                  Object.values(config.templates).some(t => t);

  return {
    ...config,
    isValid,
    configuredDays: getConfiguredDays()
  };
}

// Export template map for reference
export { TEMPLATE_MAP };
