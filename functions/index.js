const functions = require('firebase-functions');
const { Resend } = require('resend');

const resend = new Resend(functions.config().resend.api_key);

exports.sendEmail = functions.https.onCall(async (data) => {
  try {
    const { to, subject, html } = data;
    
    // Validate input
    if (!to || !subject || !html) {
      throw new functions.https.HttpsError(
        'invalid-argument', 
        'Missing required fields: to, subject, or html'
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      throw new functions.https.HttpsError(
        'invalid-argument', 
        'Invalid email address format'
      );
    }
    
    console.log('Sending email to:', to);
    
    const result = await resend.emails.send({
      from: 'Healink <onboarding@resend.dev>',
      to: [to],
      subject: subject,
      html: html
    });
    
    console.log('Email sent successfully:', result.id);
    
    return { 
      success: true, 
      id: result.id,
      message: 'Email sent successfully'
    };
  } catch (error) {
    console.error('Resend API Error:', error);
    throw new functions.https.HttpsError(
      'internal', 
      `Failed to send email: ${error.message}`
    );
  }
});
