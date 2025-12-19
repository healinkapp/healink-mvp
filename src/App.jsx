import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './config/firebase';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ClientSetup from './pages/ClientSetup';
import ClientDashboard from './pages/ClientDashboard';
import FirebaseTest from './components/FirebaseTest';
import EmailTest from './components/EmailTest';

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
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Landing Page - No Nav */}
        <Route path="/" element={<Home />} />
        
        {/* Login Page */}
        <Route path="/login" element={<Login />} />
        
        {/* Dashboard Page */}
        <Route path="/dashboard" element={<Dashboard />} />
        
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
  );
}

export default App;

