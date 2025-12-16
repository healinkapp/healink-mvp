import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import FirebaseTest from './components/FirebaseTest';
import EmailTest from './components/EmailTest';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-black text-white p-4">
          <div className="max-w-7xl mx-auto flex gap-6">
            <Link to="/" className="hover:text-gray-300">Home</Link>
            <Link to="/test" className="hover:text-gray-300">Firebase Test</Link>
            <Link to="/email" className="hover:text-gray-300">Email Test</Link>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={
            <div className="p-8 text-center">
              <h1 className="text-4xl font-bold mb-4">Healink</h1>
              <p className="text-gray-600">Automated aftercare for tattoo artists</p>
            </div>
          } />
          <Route path="/test" element={<FirebaseTest />} />
          <Route path="/email" element={<EmailTest />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;

