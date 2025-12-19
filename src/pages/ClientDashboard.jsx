import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../config/firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { LogOut, Calendar, Flame, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import { getUserRole } from '../utils/getUserRole';

export default function ClientDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [checkingRole, setCheckingRole] = useState(true);
  const [clientData, setClientData] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate('/login');
        return;
      }

      // Verify user is a client
      const role = await getUserRole(user.email);
      
      if (role !== 'client') {
        console.log('❌ Not a client, redirecting...');
        if (role === 'artist') {
          navigate('/dashboard');
        } else {
          await signOut(auth);
          navigate('/login');
        }
        return;
      }

      console.log('✅ Client Dashboard: Client authenticated:', user.email);
      setCheckingRole(false);

      try {
        // Fetch client data
        const q = query(
          collection(db, 'users'),
          where('email', '==', user.email),
          where('role', '==', 'client')
        );
        
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
          console.error('No client data found');
          setLoading(false);
          return;
        }

        const data = snapshot.docs[0].data();
        setClientData(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching client data:', error);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  if (checkingRole || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your healing journey...</p>
        </div>
      </div>
    );
  }

  if (!clientData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-black mb-4">No Account Found</h2>
          <p className="text-gray-600 mb-6">
            Your artist hasn't set up your aftercare journey yet. 
            Contact them to get started.
          </p>
          <button
            onClick={handleLogout}
            className="px-6 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const progressPercentage = Math.min((clientData.healingDay / 30) * 100, 100);
  const daysRemaining = Math.max(30 - clientData.healingDay, 0);
  const isHealed = clientData.healingDay >= 30;
  const isCritical = clientData.healingDay <= 7;

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-black">Your Healing Journey</h1>
            <p className="text-xs sm:text-sm text-gray-600">Hi, {clientData.name}!</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        
        {/* Progress Card */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          
          {/* Day Badge */}
          <div className="flex items-center justify-between mb-4">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold ${
              isHealed 
                ? 'bg-green-100 text-green-700' 
                : isCritical 
                ? 'bg-orange-100 text-orange-700'
                : 'bg-blue-100 text-blue-700'
            }`}>
              {isHealed ? (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Healed!</span>
                </>
              ) : isCritical ? (
                <>
                  <Flame className="w-5 h-5" />
                  <span>Day {clientData.healingDay}/30</span>
                </>
              ) : (
                <>
                  <Clock className="w-5 h-5" />
                  <span>Day {clientData.healingDay}/30</span>
                </>
              )}
            </div>
            
            <div className="text-right">
              <p className="text-xs text-gray-500">Started</p>
              <p className="text-sm font-semibold text-gray-700">
                {new Date(clientData.tattooDate).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-gray-700">Healing Progress</p>
              <p className="text-sm font-bold text-black">{Math.round(progressPercentage)}%</p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  isHealed 
                    ? 'bg-green-500' 
                    : isCritical 
                    ? 'bg-orange-500'
                    : 'bg-blue-500'
                }`}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Days Remaining */}
          {!isHealed && (
            <p className="text-sm text-gray-600 text-center">
              {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} until deep tissue fully regenerates
            </p>
          )}

          {isHealed && (
            <p className="text-sm text-green-600 font-semibold text-center flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4" />
              Fully healed! Your skin has completed the regeneration process.
            </p>
          )}
        </div>

        {/* Tattoo Photo */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-black mb-4">Your Tattoo Progress</h2>
          {clientData.tattooPhoto ? (
            <img 
              src={clientData.tattooPhoto}
              alt="Your tattoo"
              className="w-full h-64 sm:h-80 object-cover rounded-lg shadow-md"
            />
          ) : (
            <div className="w-full h-64 sm:h-80 bg-gray-100 rounded-lg flex items-center justify-center">
              <p className="text-gray-400">No photo available</p>
            </div>
          )}
          <p className="text-xs text-gray-500 text-center mt-3">
            Day 0 - Fresh ink (when plasma was still present)
          </p>
        </div>

        {/* Next Check-in Card */}
        {!isHealed && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <Calendar className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-bold text-black mb-2">
                  Day {clientData.healingDay + 1} Check-in
                </h3>
                <p className="text-sm text-gray-700">
                  {isCritical 
                    ? "Critical phase: Your skin is forming new tissue layers. Proper care now prevents scabbing that pulls out ink."
                    : "Dermal layer is rebuilding. Keep protecting from UV damage—new skin cells are extra vulnerable."
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Care Tips Card */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-black mb-4">
            {isCritical ? 'Critical Phase Care' : 'Daily Care Protocol'}
          </h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 bg-black rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-sm text-gray-700">
                <strong>Wash gently</strong> 2-3x daily—removes bacteria without disrupting healing
              </p>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 bg-black rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-sm text-gray-700">
                <strong>Thin moisturizer layer</strong>—keeps skin flexible, prevents thick scabs
              </p>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 bg-black rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-sm text-gray-700">
                <strong>No sun/swimming</strong>—UV + chlorine damage fresh cells permanently
              </p>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 bg-black rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-sm text-gray-700">
                <strong>Don't pick/scratch</strong>—removes ink trapped in scabs, causes patchiness
              </p>
            </li>
          </ul>
        </div>

        {/* Coming Soon Card */}
        <div className="bg-gray-100 rounded-xl p-6 text-center">
          <p className="text-sm text-gray-600 mb-2 font-semibold">Coming Soon</p>
          <p className="text-xs text-gray-500">
            • Upload weekly progress photos<br/>
            • Daily symptom tracking (itching, redness)<br/>
            • 30-day healing timeline with science explanations
          </p>
        </div>

      </main>
    </div>
  );
}
