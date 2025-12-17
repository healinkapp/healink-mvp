import { useState } from 'react';
import emailjs from '@emailjs/browser';

function EmailTest() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const sendTestEmail = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setStatus('❌ Please enter an email');
      return;
    }

    setLoading(true);
    setStatus('Sending...');

    try {
      await emailjs.send(
        'service_13h3kki',
        'template_d75273a',
        {
          to_email: email,
          to_name: 'Client',
          subject: 'Welcome to Healink - Day 0',
          message: 'Your tattoo healing journey starts now! 🎨'
        },
        'uH10FXkw8yv434h5P'
      );

      setStatus('✅ Email sent successfully!');
      setEmail('');
    } catch (error) {
      console.error('Error:', error);
      setStatus(`❌ Error: ${error.text || 'Failed to send'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Email Test (EmailJS)</h2>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <form onSubmit={sendTestEmail}>
          <label className="block mb-2 font-semibold">
            Send test email to:
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your-email@example.com"
            className="w-full p-3 border border-gray-300 rounded mb-4"
          />
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded font-semibold hover:bg-gray-800 disabled:bg-gray-400"
          >
            {loading ? 'Sending...' : 'Send Test Email'}
          </button>
        </form>
        
        {status && (
          <div className={`mt-4 p-4 rounded ${
            status.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {status}
          </div>
        )}
      </div>
      
      <div className="mt-6 p-4 bg-blue-50 rounded">
        <p className="text-sm text-blue-800">
          <strong>Next step:</strong> Get your EmailJS keys at{' '}
          <a href="https://www.emailjs.com" target="_blank" rel="noopener noreferrer" className="underline">
            emailjs.com
          </a>
        </p>
      </div>
    </div>
  );
}

export default EmailTest;
