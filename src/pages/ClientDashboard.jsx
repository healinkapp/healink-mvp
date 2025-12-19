import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../config/firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { LogOut, Calendar, Flame, CheckCircle2, Clock, Sparkles, AlertCircle, Camera, Settings, Bell, X } from 'lucide-react';
import { getUserRole } from '../utils/getUserRole';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../contexts/ToastContext';
import { getOptimizedImageUrl, getResponsiveSrcSet, DEFAULT_SIZES } from '../utils/imageOptimization';
import { requestPushPermission, getPushPermissionStatus } from '../services/pushService';

export default function ClientDashboard() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [checkingRole, setCheckingRole] = useState(true);
  const [clientData, setClientData] = useState(null);
  const [showPushBanner, setShowPushBanner] = useState(false);
  const [requestingPermission, setRequestingPermission] = useState(false);

  // Check if we should show push permission banner
  useEffect(() => {
    const dismissed = localStorage.getItem('healink_push_banner_dismissed');
    const permission = getPushPermissionStatus();
    
    // Show banner if: not dismissed, permission not granted, and not denied
    if (!dismissed && permission === 'default') {
      setShowPushBanner(true);
    }
  }, []);

  const handleEnableNotifications = async () => {
    if (!clientData?.id) return;
    
    setRequestingPermission(true);
    
    try {
      const result = await requestPushPermission(clientData.id);
      
      if (result.success) {
        showToast('Notifications enabled successfully!', 'success');
        setShowPushBanner(false);
        localStorage.setItem('healink_push_banner_dismissed', 'true');
      } else {
        if (result.error.includes('denied')) {
          showToast('Notifications blocked. Please enable in browser settings.', 'error');
          setShowPushBanner(false);
          localStorage.setItem('healink_push_banner_dismissed', 'true');
        } else {
          showToast('Could not enable notifications', 'error');
        }
      }
    } catch (error) {
      console.error('Permission error:', error);
      showToast('Failed to enable notifications', 'error');
    } finally {
      setRequestingPermission(false);
    }
  };

  const handleDismissBanner = () => {
    setShowPushBanner(false);
    localStorage.setItem('healink_push_banner_dismissed', 'true');
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate('/login');
        return;
      }

      // Verify user is a client (pass both userId and email)
      const role = await getUserRole(user.uid, user.email);
      
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
          showToast('No account found. Please contact your artist.', 'error');
          setLoading(false);
          return;
        }

        const data = snapshot.docs[0].data();
        setClientData(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching client data:', error);
        showToast('Failed to load your data. Please try again.', 'error');
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate, showToast]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  if (checkingRole || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading your healing journey..." />
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

  // Calculate actual healing day based on tattoo date
  const calculateHealingDay = () => {
    const tattooDate = new Date(clientData.tattooDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to midnight for accurate day count
    tattooDate.setHours(0, 0, 0, 0);
    
    const diffTime = today.getTime() - tattooDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays); // Don't allow negative days (Day 0 = tattoo day)
  };

  const actualHealingDay = calculateHealingDay();
  
  // Use actualHealingDay for all calculations
  const progressPercentage = Math.min((actualHealingDay / 30) * 100, 100);
  const daysRemaining = Math.max(30 - actualHealingDay, 0);
  const isHealed = actualHealingDay >= 30;
  const isCritical = actualHealingDay <= 7;
  
  // Calculate next milestone
  const getNextMilestone = () => {
    if (actualHealingDay < 7) return { day: 7, label: 'Critical Phase Complete', daysLeft: 7 - actualHealingDay };
    if (actualHealingDay < 14) return { day: 14, label: 'Active Care Complete', daysLeft: 14 - actualHealingDay };
    if (actualHealingDay < 30) return { day: 30, label: 'Fully Healed', daysLeft: 30 - actualHealingDay };
    return null;
  };
  
  const nextMilestone = getNextMilestone();
  
  // Generate week dates - show current healing week (groups of 7 days)
  const generateWeekDates = () => {
    const tattooDate = new Date(clientData.tattooDate);
    tattooDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Calculate which week we're in (0-3 for 4 complete weeks)
    // Week 1: Days 0-6, Week 2: Days 7-13, Week 3: Days 14-20, Week 4: Days 21-27
    const currentWeek = Math.min(Math.floor(actualHealingDay / 7), 3); // Cap at week 4 (index 3)
    const weekStartDay = currentWeek * 7;
    const weekEndDay = Math.min(weekStartDay + 6, 27); // Show only up to Day 27 (4 complete weeks)
    
    const weekDates = [];
    
    // Generate days for current week
    for (let healingDay = weekStartDay; healingDay <= weekEndDay; healingDay++) {
      const date = new Date(tattooDate);
      date.setDate(tattooDate.getDate() + healingDay);
      
      weekDates.push({
        date: date,
        dayOfWeek: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dayOfMonth: date.getDate(),
        healingDay: healingDay,
        isToday: date.toDateString() === today.toDateString(),
        isPast: date < today,
        isFuture: date > today
      });
    }
    
    return weekDates;
  };

  const weekDates = generateWeekDates();
  
  // Calculate current week number for display (1-4)
  const currentWeekNumber = Math.min(Math.floor(actualHealingDay / 7) + 1, 4);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-gray-100">
      
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-black tracking-tight">Your Healing Journey</h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-0.5">Hi, {clientData.name}!</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/settings')}
              className="flex items-center gap-2 px-3 sm:px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 sm:px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Push Notification Banner */}
      {showPushBanner && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <Bell className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  Enable Daily Reminders
                </p>
                <p className="text-sm text-gray-600 mt-0.5">
                  Get notifications for your aftercare routine and healing tips
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={handleEnableNotifications}
                  disabled={requestingPermission}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {requestingPermission ? 'Enabling...' : 'Enable'}
                </button>
                <button
                  onClick={handleDismissBanner}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Dismiss"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-5 sm:py-7 space-y-5 sm:space-y-6">
        
        {/* Progress Card - HERO */}
        <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100/50 p-5 sm:p-7 transform hover:scale-[1.01]">
          
          {/* Day Badge */}
          <div className="flex items-center justify-between mb-6 sm:mb-7">
            <div className={`inline-flex items-center gap-2.5 px-4 sm:px-5 py-2.5 sm:py-3 rounded-full font-bold text-xs sm:text-sm shadow-sm ${
              isHealed 
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' 
                : isCritical 
                ? 'bg-gradient-to-r from-red-500 to-red-600 text-white'
                : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
            }`}>
              {isHealed ? (
                <>
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Healed!</span>
                </>
              ) : isCritical ? (
                <>
                  <Flame className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Day {actualHealingDay}/30</span>
                </>
              ) : (
                <>
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Day {actualHealingDay}/30</span>
                </>
              )}
            </div>
            
            <div className="text-right bg-gray-50 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5">
              <p className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">Started</p>
              <p className="text-xs sm:text-sm font-bold text-gray-900 mt-0.5">
                {new Date(clientData.tattooDate).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>

          {/* Week Calendar */}
          <div className="mb-6 sm:mb-7">
            
            {/* Next Milestone Indicator */}
            {nextMilestone && (
              <div className="mb-4 sm:mb-5 bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-3 sm:p-4 flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-white/70 font-semibold">Next Milestone</p>
                    <p className="text-sm sm:text-base font-bold text-white">{nextMilestone.label}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl sm:text-3xl font-bold text-white">{nextMilestone.daysLeft}</p>
                  <p className="text-[10px] sm:text-xs text-white/70 font-semibold">{nextMilestone.daysLeft === 1 ? 'day left' : 'days left'}</p>
                </div>
              </div>
            )}
            
            <div className="flex items-center justify-between mb-4 sm:mb-5">
              <div className="flex flex-col gap-1">
                <p className="text-base sm:text-lg font-bold text-gray-900">Week {currentWeekNumber} of 4</p>
                <span className="text-[10px] sm:text-xs text-gray-500 font-semibold">
                  Days {weekDates[0]?.healingDay}-{weekDates[weekDates.length - 1]?.healingDay}
                </span>
              </div>
              <div className="flex items-center gap-2 bg-gray-900 text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl shadow-lg">
                <p className="text-2xl sm:text-3xl font-bold">{Math.round(progressPercentage)}</p>
                <p className="text-xs sm:text-sm font-semibold opacity-75">%</p>
              </div>
            </div>
            
            {/* Horizontal Week Calendar */}
            <div className="flex gap-2 sm:gap-3 overflow-x-auto py-2 px-2">
              {weekDates.map((dateInfo, index) => {
                const { dayOfWeek, healingDay, isToday, isPast, isFuture } = dateInfo;
                
                let bgColor = 'bg-gray-100 text-gray-400';
                let borderColor = 'border-transparent';
                
                // Future days - disabled appearance
                if (isFuture) {
                  bgColor = 'bg-gray-50 text-gray-300';
                  borderColor = 'border-gray-200';
                }
                // Today
                else if (isToday) {
                  if (healingDay <= 7) {
                    bgColor = 'bg-red-600 text-white';
                    borderColor = 'border-red-800';
                  } else if (healingDay <= 14) {
                    bgColor = 'bg-orange-500 text-white';
                    borderColor = 'border-orange-700';
                  } else {
                    bgColor = 'bg-blue-600 text-white';
                    borderColor = 'border-blue-800';
                  }
                }
                // Past days
                else if (isPast) {
                  if (healingDay <= 7) {
                    bgColor = 'bg-red-500 text-white';
                  } else if (healingDay <= 14) {
                    bgColor = 'bg-orange-400 text-white';
                  } else {
                    bgColor = 'bg-blue-400 text-white';
                  }
                }
                
                return (
                  <div
                    key={index}
                    className={`
                      flex-shrink-0 w-14 sm:w-16 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center py-3 sm:py-4 px-2 sm:px-3
                      font-semibold transition-all border-2
                      ${bgColor} ${borderColor}
                      ${isToday ? 'ring-2 ring-offset-1 sm:ring-offset-2 ring-black shadow-lg' : 'shadow-sm'}
                      ${isFuture ? 'opacity-40 cursor-not-allowed' : ''}
                    `}
                    style={isToday ? { transform: 'scale(1.05)' } : {}}
                  >
                    <span className="text-[10px] sm:text-xs opacity-75 mb-1 sm:mb-2 uppercase tracking-wide">{dayOfWeek}</span>
                    <span className="text-2xl sm:text-3xl font-bold mb-0.5 sm:mb-1">{healingDay}</span>
                    <span className="text-[9px] sm:text-[10px] opacity-75 uppercase tracking-wider">Day</span>
                    {isToday && (
                      <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-white rounded-full mt-1 sm:mt-2"></div>
                    )}
                    {isPast && !isToday && (
                      <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 mt-1 sm:mt-2 opacity-90" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Phase Legend */}
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-5 mt-5 sm:mt-6 pt-5 sm:pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-md bg-gradient-to-br from-red-500 to-red-600 shadow-sm"></div>
                <span className="text-[10px] sm:text-xs font-semibold text-gray-700">Critical (0-7)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-md bg-gradient-to-br from-orange-400 to-orange-500 shadow-sm"></div>
                <span className="text-[10px] sm:text-xs font-semibold text-gray-700">Active (8-14)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-md bg-gradient-to-br from-blue-400 to-blue-500 shadow-sm"></div>
                <span className="text-[10px] sm:text-xs font-semibold text-gray-700">Maintenance (15-27)</span>
              </div>
            </div>
          </div>

          {/* Days Remaining */}
          {!isHealed && (
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl sm:rounded-2xl p-4 sm:p-5 text-center border border-gray-200/50">
              <p className="text-xs sm:text-sm font-semibold text-gray-700">
                <span className="font-bold text-gray-900 text-base sm:text-lg">{daysRemaining}</span> {daysRemaining === 1 ? 'day' : 'days'} until deep tissue fully regenerates
              </p>
            </div>
          )}

          {isHealed && (
            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl sm:rounded-2xl p-4 sm:p-5 text-center border-2 border-green-200/50">
              <p className="text-xs sm:text-sm text-green-700 font-bold flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
                Fully healed! Your skin has completed the regeneration process.
              </p>
            </div>
          )}
        </div>

        {/* Tattoo Photo - SECONDARY */}
        <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100/50 p-5 sm:p-7">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-4 sm:mb-5 flex items-center gap-2">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center">
              <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            Your Tattoo Progress
          </h2>
          {clientData.tattooPhoto ? (
            <div className="relative overflow-hidden rounded-xl sm:rounded-2xl shadow-xl group">
              <img 
                src={getOptimizedImageUrl(clientData.tattooPhoto, 800)}
                srcSet={getResponsiveSrcSet(clientData.tattooPhoto)}
                sizes={DEFAULT_SIZES}
                loading="eager"
                alt="Your tattoo"
                className="w-full h-56 sm:h-80 object-cover ring-1 ring-gray-200/50 transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          ) : (
            <div className="w-full h-56 sm:h-80 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl sm:rounded-2xl flex items-center justify-center border-2 border-dashed border-gray-300">
              <p className="text-sm text-gray-400 font-semibold">No photo available</p>
            </div>
          )}
          <p className="text-[10px] sm:text-xs text-gray-500 text-center mt-3 sm:mt-4 font-semibold">
            Day 0 - Fresh ink (when plasma was still present)
          </p>
        </div>

        {/* Next Check-in Card - ACCENT */}
        {!isHealed && (
          <div className="bg-gradient-to-br from-blue-50 via-blue-50 to-indigo-50 border-2 border-blue-200/50 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 p-5 sm:p-6 transform hover:scale-[1.01]">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">
                  Day {actualHealingDay + 1} Check-in
                </h3>
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed flex items-start gap-2">
                  {isCritical && <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />}
                  <span>
                    {isCritical 
                      ? "Critical phase: Your skin is forming new tissue layers. Proper care now prevents scabbing that pulls out ink."
                      : "Dermal layer is rebuilding. Keep protecting from UV damage—new skin cells are extra vulnerable."
                    }
                  </span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Care Tips Card - SECONDARY */}
        <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100/50 p-5 sm:p-7">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-4 sm:mb-5 flex items-center gap-2">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            {isCritical ? 'Critical Phase Care' : 'Daily Care Protocol'}
          </h2>
          <ul className="space-y-3.5 sm:space-y-4">
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 bg-gradient-to-br from-gray-900 to-gray-700 rounded-full mt-2 flex-shrink-0 shadow-sm"></div>
              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                <strong className="text-gray-900 font-bold">Wash gently</strong> 2-3x daily—removes bacteria without disrupting healing
              </p>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 bg-gradient-to-br from-gray-900 to-gray-700 rounded-full mt-2 flex-shrink-0 shadow-sm"></div>
              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                <strong className="text-gray-900 font-bold">Thin moisturizer layer</strong>—keeps skin flexible, prevents thick scabs
              </p>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 bg-gradient-to-br from-gray-900 to-gray-700 rounded-full mt-2 flex-shrink-0 shadow-sm"></div>
              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                <strong className="text-gray-900 font-bold">No sun/swimming</strong>—UV + chlorine damage fresh cells permanently
              </p>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 bg-gradient-to-br from-gray-900 to-gray-700 rounded-full mt-2 flex-shrink-0 shadow-sm"></div>
              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                <strong className="text-gray-900 font-bold">Don't pick/scratch</strong>—removes ink trapped in scabs, causes patchiness
              </p>
            </li>
          </ul>
        </div>

        {/* Coming Soon Card - SUBTLE */}
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-5 sm:p-7 text-center border border-gray-700/50 transform hover:scale-[1.01]">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-3 sm:mb-4">
            <Sparkles className="w-4 h-4 text-white" />
            <p className="text-xs sm:text-sm text-white font-bold uppercase tracking-wider">Coming Soon</p>
          </div>
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
            • Upload weekly progress photos<br/>
            • Daily symptom tracking (itching, redness)<br/>
            • 30-day healing timeline with science explanations
          </p>
        </div>

      </main>
    </div>
  );
}
