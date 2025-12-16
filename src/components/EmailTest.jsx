import { useState } from 'react';

function EmailTest() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const sendTestEmail = async () => {
    if (!email) {
      setStatus('❌ Please enter an email');
      return;
    }

    setLoading(true);
    setStatus('Sending...');

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: email,
          subject: 'Welcome to Healink - Day 0',
          html: '<h1>Test Email</h1><p>Your tattoo healing journey starts now!</p>'
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setStatus(`✅ Email sent successfully! ID: ${result.id}`);
        console.log('Result:', result);
      } else {
        setStatus(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error:', error);
      setStatus(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Email Test (Vercel API + Resend)</h2>
      
      <div className="bg-white p-6 rounded-lg shadow">
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
          onClick={sendTestEmail}
          disabled={loading}
          className="w-full bg-black text-white py-3 rounded font-semibold hover:bg-gray-800 disabled:bg-gray-400"
        >
          {loading ? 'Sending...' : 'Send Test Email'}
        </button>
        
        {status && (
          <div className={`mt-4 p-4 rounded ${
            status.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {status}
          </div>
        )}
      </div>
      
      <div className="mt-6 p-4 bg-gray-100 rounded">
        <h3 className="font-semibold mb-2">📡 Using Vercel Serverless API</h3>
        <ul className="list-disc list-inside text-sm text-gray-700">
          <li>✅ No Firebase Functions needed</li>
          <li>✅ Free tier friendly</li>
          <li>📧 Resend API (server-side)</li>
          <li>🚀 Instant deployment</li>
        </ul>
      </div>
    </div>
  );
}

export default EmailTest;
