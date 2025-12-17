import { useNavigate } from 'react-router-dom';
import { auth } from '../config/firebase';
import { signOut } from 'firebase/auth';

export default function ClientDashboard() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <h1 className="text-3xl font-bold text-black mb-4">
            Welcome to Your Healing Journey! 🎨
          </h1>
          <p className="text-gray-600 mb-6">
            Client dashboard coming soon...
          </p>
          <p className="text-sm text-gray-500 mb-8">
            Track your progress, upload photos, and get daily care tips.
          </p>
          <button
            onClick={handleLogout}
            className="px-6 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
