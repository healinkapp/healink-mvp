import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import FirebaseTest from './components/FirebaseTest';
import EmailTest from './components/EmailTest';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing Page - No Nav */}
        <Route path="/" element={<Home />} />
        
        {/* Login Page */}
        <Route path="/login" element={<Login />} />
        
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

