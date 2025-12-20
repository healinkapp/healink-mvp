import { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { useNavigate, Link } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        // Create Firebase Auth account
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        // Create Firestore document for artist (using userId as document ID)
        const userData = {
          role: 'artist',
          email: email,
          createdAt: serverTimestamp()
        };

        // Use userId as document ID (critical for security rules)
        await setDoc(doc(db, 'users', userCredential.user.uid), userData);

        // Redirect to dashboard
        navigate('/dashboard');
      } else {
        // Login - Check role and redirect accordingly
        console.log('=== [LOGIN] AUTHENTICATING USER ===');
        console.log('[LOGIN] Email:', email);
        
        const userCredential = await signInWithEmailAndPassword(auth, email, password);

        console.log('✅ [LOGIN] Firebase Auth successful:', {
          authUID: userCredential.user.uid,
          email: userCredential.user.email
        });

        // Get user role by EMAIL (document ID may differ from Auth UID for clients)
        try {
          console.log('[LOGIN] Querying Firestore for role...');
          
          const q = query(
            collection(db, 'users'),
            where('email', '==', userCredential.user.email)
          );
          
          const snapshot = await getDocs(q);
          
          console.log('[LOGIN] Query results:', snapshot.size, 'documents');
          
          if (snapshot.empty) {
            console.error('❌ [LOGIN] No Firestore document found for:', userCredential.user.email);
            await signOut(auth);
            setError('Account not found. Please contact support.');
            setLoading(false);
            return;
          }

          const userData = snapshot.docs[0].data();
          const role = userData.role;
          
          console.log('✅ [LOGIN] User document found:', {
            documentId: snapshot.docs[0].id,
            email: userData.email,
            role: role,
            hasCompletedSetup: userData.hasCompletedSetup
          });

          // Redirect based on role
          if (role === 'artist') {
            console.log('[LOGIN] Redirecting to /dashboard (artist)');
            navigate('/dashboard');
          } else if (role === 'client') {
            console.log('[LOGIN] Redirecting to /client/dashboard (client)');
            navigate('/client/dashboard');
          } else {
            console.error('[LOGIN] Invalid role:', role);
            await signOut(auth);
            setError('Invalid account type');
            setLoading(false);
          }
        } catch (roleError) {
          console.error('[Login] Error fetching role:', roleError);
          await signOut(auth);
          setError('Account not found. Please contact support.');
          setLoading(false);
        }
      }
    } catch (err) {
      console.error('[Login] Login error:', err);
      
      // Translate Firebase error codes to user-friendly messages
      let errorMessage = 'Invalid email or password';
      
      if (err.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email';
      } else if (err.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      } else if (err.code === 'auth/user-disabled') {
        errorMessage = 'This account has been disabled';
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = 'Too many attempts. Please try again later';
      } else if (err.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Check your connection';
      } else if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'Email already in use. Try logging in instead';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Use at least 6 characters';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-black mb-2">HEALINK</h1>
          <p className="text-gray-600">
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
              placeholder="your@email.com"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
              placeholder="••••••••"
            />
            {isSignUp && (
              <p className="text-xs text-gray-500 mt-1">
                Minimum 6 characters
              </p>
            )}
            {!isSignUp && (
              <div className="text-right mt-2">
                <Link
                  to="/forgot-password"
                  className="text-sm text-gray-600 hover:text-black transition"
                >
                  Forgot password?
                </Link>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 disabled:bg-gray-400 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" />
                <span>Loading...</span>
              </>
            ) : (
              isSignUp ? 'Sign Up' : 'Login'
            )}
          </button>
        </form>

        {/* Toggle Sign Up / Login */}
        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
            }}
            className="text-sm text-gray-600 hover:text-black transition"
          >
            {isSignUp ? 'Already have an account? Login' : "Don't have an account? Sign up"}
          </button>
        </div>

        {/* Back to Home */}
        <div className="mt-8 text-center">
          <a 
            href="/" 
            className="text-sm text-gray-500 hover:text-black transition"
          >
            ← Back to home
          </a>
        </div>
      </div>
    </div>
  );
}

export default Login;
