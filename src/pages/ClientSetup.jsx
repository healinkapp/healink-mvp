import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, updateDoc, doc, limit } from 'firebase/firestore';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '../config/firebase';
import { Palette, XCircle } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ClientSetup() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [clientData, setClientData] = useState(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Fetch client data by token
  useEffect(() => {
    const fetchClient = async () => {
      try {
        const q = query(
          collection(db, 'users'),
          where('uniqueToken', '==', token),
          where('role', '==', 'client'),
          limit(1) // Required by security rules for unauthenticated queries
        );
        
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
          setError('Invalid or expired link');
          setLoading(false);
          return;
        }

        const clientDoc = snapshot.docs[0];
        const data = { id: clientDoc.id, ...clientDoc.data() };
        
        if (data.accountSetup) {
          setError('Account already set up. Please login.');
          setLoading(false);
          return;
        }

        setClientData(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching client:', err);
        setError('Error loading account info');
        setLoading(false);
      }
    };

    fetchClient();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setSubmitting(true);

    try {
      // Create Firebase Auth account
      await createUserWithEmailAndPassword(auth, clientData.email, password);

      // Update Firestore
      await updateDoc(doc(db, 'users', clientData.id), {
        accountSetup: true
      });

      // Redirect to client dashboard
      showToast('Account created successfully!', 'success');
      navigate('/client/dashboard');
    } catch (err) {
      console.error('Setup error:', err);
      
      // If account already exists, try to login
      if (err.code === 'auth/email-already-in-use') {
        try {
          await signInWithEmailAndPassword(auth, clientData.email, password);
          await updateDoc(doc(db, 'users', clientData.id), {
            accountSetup: true
          });
          navigate('/client/dashboard');
        } catch (loginErr) {
          setError('Account exists but password incorrect');
        }
      } else {
        setError('Error creating account: ' + err.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  if (error && !clientData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
              <XCircle className="w-10 h-10 text-red-500" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-black mb-2">Oops!</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <a 
            href="/"
            className="inline-block px-6 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition"
          >
            Go to Homepage
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <h1 className="text-3xl font-bold text-black">
              Welcome to Healink!
            </h1>
            <Palette className="w-8 h-8 text-black" />
          </div>
          <p className="text-gray-600">
            Hi {clientData?.name}! Let's complete your account setup.
          </p>
        </div>

        {/* Tattoo Photo */}
        {clientData?.tattooPhoto && (
          <div className="mb-6">
            <p className="text-sm font-semibold text-gray-700 mb-3 text-center">
              Your fresh tattoo:
            </p>
            <img 
              src={clientData.tattooPhoto}
              alt="Your tattoo"
              className="w-full h-48 object-cover rounded-lg shadow-md"
            />
          </div>
        )}

        {/* Day Badge */}
        <div className="bg-black text-white text-center py-3 rounded-lg mb-6">
          <p className="text-sm font-semibold">Day {clientData?.healingDay}/30</p>
          <p className="text-xs opacity-80">Your healing journey starts now</p>
        </div>

        {/* Setup Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Email (readonly) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={clientData?.email || ''}
              disabled
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Create Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="Min 6 characters"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              placeholder="Re-enter password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full px-6 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 disabled:bg-gray-400 transition flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <LoadingSpinner size="sm" />
                <span>Setting up...</span>
              </>
            ) : (
              'Complete Setup →'
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="text-xs text-gray-500 text-center mt-6">
          Takes just 30 seconds. Your data is secure.
        </p>
      </div>
    </div>
  );
}
