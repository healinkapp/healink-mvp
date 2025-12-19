import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './config/firebase';
import Home from './pages/Home';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import ClientSetup from './pages/ClientSetup';
import ClientDashboard from './pages/ClientDashboard';
import FirebaseTest from './components/FirebaseTest';
import EmailTest from './components/EmailTest';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';

function App() {
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    // Wait for Firebase to restore auth session
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('🔐 Auth state changed:', user ? user.email : 'Not logged in');
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          {/* Landing Page - No Nav */}
          <Route path="/" element={<Home />} />
          
          {/* Login Page */}
          <Route path="/login" element={<Login />} />
          
          {/* Forgot Password Page */}
          <Route path="/forgot-password" element={<ForgotPassword />} />
          
          {/* Dashboard Page */}
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Settings Page */}
          <Route path="/settings" element={<Settings />} />
          
          {/* Client Setup Page */}
          <Route path="/setup/:token" element={<ClientSetup />} />
          
          {/* Client Dashboard */}
          <Route path="/client/dashboard" element={<ClientDashboard />} />
          
          {/* Test Pages - With Nav */}
          <Route path="/test" element={
            <div className="min-h-screen bg-gray-50">
              <nav className="bg-black text-white p-4">
                <div className="max-w-7xl mx-auto flex gap-6">
                  <Link to="/" className="hover:text-gray-300">← Home</Link>
                  <Link to="/test" className="hover:text-gray-300">Firebase Test</Link>
                  <Link to="/email" className="hover:text-gray-300">Email Test</Link>
                </div>
              </nav>
              <FirebaseTest />
            </div>
          } />
          
          <Route path="/email" element={
            <div className="min-h-screen bg-gray-50">
              <nav className="bg-black text-white p-4">
                <div className="max-w-7xl mx-auto flex gap-6">
                  <Link to="/" className="hover:text-gray-300">← Home</Link>
                  <Link to="/test" className="hover:text-gray-300">Firebase Test</Link>
                  <Link to="/email" className="hover:text-gray-300">Email Test</Link>
                </div>
              </nav>
              <EmailTest />
            </div>
          } />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;

