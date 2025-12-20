import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, updateDoc, doc, limit, deleteField } from 'firebase/firestore';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { db, auth } from '../config/firebase';
import { Palette, XCircle } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { getOptimizedImageUrl, getResponsiveSrcSet, DEFAULT_SIZES } from '../utils/imageOptimization';
import { requestPushPermission } from '../services/pushService';

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
  const [authChecked, setAuthChecked] = useState(false);

  // Force logout if user is authenticated (client setup requires unauthenticated access)
  useEffect(() => {
    const checkAuthAndLogout = async () => {
      if (auth.currentUser) {
        console.log('[ClientSetup] User is authenticated, logging out for client setup...');
        console.log('[ClientSetup] Current user:', auth.currentUser.email);
        await signOut(auth);
        console.log('[ClientSetup] Logged out successfully');
        // Delay to ensure auth state updates
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      setAuthChecked(true);
    };
    
    checkAuthAndLogout();
  }, []);

  // Fetch client data by token (only after auth check is complete)
  useEffect(() => {
    if (!authChecked) {
      console.log('[ClientSetup] Waiting for auth check to complete...');
      return;
    }

    const fetchClient = async () => {
      console.log('=== CLIENT SETUP DEBUG ===');
      console.log('1. Token from URL:', token);
      console.log('2. Building query...');
      
      try {
        // Query simplified: uniqueToken is unique, no need for role filter
        // Firestore rule will still validate role=='client' when checking permissions
        const q = query(
          collection(db, 'users'),
          where('uniqueToken', '==', token),
          limit(1)
        );
        
        console.log('3. Query built successfully (simplified - single where clause)');
        console.log('4. Executing query...');
        
        const snapshot = await getDocs(q);
        
        console.log('5. Query executed');
        console.log('6. Results:', snapshot.size, 'documents');
        
        if (snapshot.empty) {
          console.log('7. NO DOCUMENTS FOUND');
          console.log('   - Token searched:', token);
          console.log('   - Collection: users');
          console.log('   - Role: client');
          setError('Invalid or expired setup link');
          setLoading(false);
          return;
        }
        
        const clientDoc = snapshot.docs[0];
        const data = clientDoc.data();
        
        console.log('8. DOCUMENT FOUND:');
        console.log('   - ID:', clientDoc.id);
        console.log('   - Email:', data.email);
        console.log('   - Role:', data.role);
        console.log('   - hasCompletedSetup:', data.hasCompletedSetup);
        console.log('   - uniqueToken:', data.uniqueToken);
        console.log('   - Token match:', data.uniqueToken === token);
        
        if (data.hasCompletedSetup) {
          console.warn('[SETUP] ⚠️ Account already set up');
          setError('Account already set up. Please login.');
          setLoading(false);
          return;
        }
        
        setClientData({
          id: clientDoc.id,
          ...data
        });
        setLoading(false);
        
      } catch (error) {
        console.log('❌ QUERY FAILED');
        console.log('Error code:', error.code);
        console.log('Error message:', error.message);
        console.log('Full error:', error);
        setError('Error loading account info');
        setLoading(false);
      }
    };

    fetchClient();
  }, [token, authChecked]);

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
      console.log('=== [SETUP] CREATING ACCOUNT ===');
      console.log('[SETUP] Client document ID:', clientData.id);
      console.log('[SETUP] Client email:', clientData.email);
      
      // Step 1: Create Firebase Auth account
      const userCredential = await createUserWithEmailAndPassword(auth, clientData.email, password);
      
      console.log('✅ [SETUP] Auth account created:', {
        authUID: userCredential.user.uid,
        email: userCredential.user.email
      });
      
      console.log('[SETUP] ⚠️ CRITICAL: Firestore doc ID (' + clientData.id + ') ≠ Auth UID (' + userCredential.user.uid + ')');
      console.log('[SETUP] This is CORRECT. They are linked by EMAIL.');

      // Step 2: Update Firestore document with hasCompletedSetup
      console.log('[SETUP] Updating Firestore document:', clientData.id);
      
      await updateDoc(doc(db, 'users', clientData.id), {
        hasCompletedSetup: true,
        uniqueToken: deleteField()  // Delete one-time setup token for security
      });
      
      console.log('✅ [SETUP] Firestore updated successfully:', {
        documentId: clientData.id,
        hasCompletedSetup: true,
        uniqueToken: 'DELETED'
      });

      // Step 3: Request push notification permission (non-blocking)
      requestPushPermission(clientData.id)
        .then((result) => {
          if (import.meta.env.DEV) {
            if (result.success) {
              console.log('[ClientSetup] Push notifications enabled');
            } else {
              console.log('[ClientSetup] Push notifications not enabled:', result.error);
            }
          }
        })
        .catch((error) => {
          if (import.meta.env.DEV) {
            console.warn('[ClientSetup] Push permission request failed:', error);
          }
        });

      // Step 4: Success! Show message and redirect
      showToast('Welcome to Healink! Your account is ready.', 'success');
      
      // Give a moment for Firestore to propagate (prevent race condition)
      setTimeout(() => {
        navigate('/client/dashboard');
      }, 300);
      
    } catch (err) {
      console.error('[ClientSetup] Setup error:', err);
      
      // If account already exists, try to login
      if (err.code === 'auth/email-already-in-use') {
        try {
          await signInWithEmailAndPassword(auth, clientData.email, password);
          
          // Update hasCompletedSetup if not already set
          await updateDoc(doc(db, 'users', clientData.id), {
            hasCompletedSetup: true,
            uniqueToken: deleteField()  // Delete token in recovery flow too
          });
          
          showToast('Welcome back!', 'success');
          
          // Request push permission (non-blocking)
          requestPushPermission(clientData.id).catch(() => {});
          
          setTimeout(() => {
            navigate('/client/dashboard');
          }, 300);
        } catch (loginErr) {
          console.error('[ClientSetup] Login failed:', loginErr);
          setError('Account exists but password is incorrect');
        }
      } else if (err.code === 'permission-denied') {
        setError('Permission error. Please try again or contact support.');
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
              src={getOptimizedImageUrl(clientData.tattooPhoto, 800)}
              srcSet={getResponsiveSrcSet(clientData.tattooPhoto)}
              sizes="(max-width: 640px) 400px, 800px"
              loading="eager"
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
