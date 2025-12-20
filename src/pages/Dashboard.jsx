import { useState, useEffect } from 'react';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp, query, where, onSnapshot, orderBy, doc, getDoc } from 'firebase/firestore';
import { uploadToCloudinary } from '../services/cloudinary';
import { sendDay0Email } from '../services/emailService';
import { Users, Clock, Flame, CheckCircle2, Plus, LogOut, Camera } from 'lucide-react';
import { getUserRole } from '../utils/getUserRole';
import { useToast } from '../contexts/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ClientCardSkeleton from '../components/ClientCardSkeleton';
import ConfirmDialog from '../components/ConfirmDialog';
import Onboarding from '../components/Onboarding';
import { getOptimizedImageUrl, getResponsiveSrcSet, DEFAULT_SIZES } from '../utils/imageOptimization';

/**
 * ICON REFERENCE (Lucide React)
 * 
 * Stats: Users, Clock, Flame, CheckCircle2
 * Actions: Plus, LogOut, Camera
 * 
 * Sizes: w-4 h-4 (small), w-5 h-5 (normal), w-6 h-6 (large)
 * Colors: text-gray-600 (default), text-orange-600 (warning), text-green-600 (success), text-black
 */

function Dashboard() {
  const [authReady, setAuthReady] = useState(false);
  const [checkingRole, setCheckingRole] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [artistData, setArtistData] = useState({
    name: '',
    studioName: ''
  });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    photo: null
  });
  const [formErrors, setFormErrors] = useState({
    name: '',
    email: '',
    photo: ''
  });
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loadingForm, setLoadingForm] = useState(false);
  const [clients, setClients] = useState([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [stats, setStats] = useState({
    totalClients: 0,
    activeHealing: 0,
    criticalCare: 0,
    completed: 0
  });
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Check auth and role - Artists only
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate('/login');
        return;
      }

      // Verify user is an artist (pass both userId and email)
      const role = await getUserRole(user.uid, user.email);
      
      if (role !== 'artist') {
        if (role === 'client') {
          navigate('/client/dashboard');
        } else {
          await signOut(auth);
          navigate('/login');
        }
        return;
      }
      
      // Load artist data from Firestore
      try {
        const artistDoc = await getDoc(doc(db, 'users', user.uid));
        if (artistDoc.exists()) {
          const data = artistDoc.data();
          setArtistData({
            name: data.name || user.displayName || '',
            studioName: data.studioName || ''
          });
        }
      } catch (error) {
        console.error('[Dashboard] Error loading artist data:', error);
      }
      
      setAuthReady(true);
      setCheckingRole(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  // Fetch clients in real-time
  useEffect(() => {
    if (!auth.currentUser) {
      return;
    }

    if (import.meta.env.DEV) {
      console.log('[Dashboard] Fetching clients for artist:', auth.currentUser.uid);
    }

    // Query clients for this artist
    const q = query(
      collection(db, 'users'),
      where('role', '==', 'client'),
      where('artistId', '==', auth.currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    // Real-time listener
    const unsubscribe = onSnapshot(
      q, 
      (snapshot) => {
        if (import.meta.env.DEV) {
          console.log('[Dashboard] Query returned', snapshot.docs.length, 'clients');
        }
        
        const clientsData = snapshot.docs.map(doc => {
          return { id: doc.id, ...doc.data() };
        });
        
        // Calculate stats
        const totalClients = clientsData.length;
        const activeHealing = clientsData.filter(c => c.status === 'healing').length;
        const criticalCare = clientsData.filter(c => 
          c.status === 'healing' && c.healingDay >= 0 && c.healingDay <= 7
        ).length;
        const completed = clientsData.filter(c => 
          c.healingDay >= 30 || c.status === 'healed'
        ).length;
        
        setClients(clientsData);
        setStats({
          totalClients,
          activeHealing,
          criticalCare,
          completed
        });
        setLoadingClients(false);
      },
      (error) => {
        console.error('[Dashboard] Firestore query error:', error);
        
        // Show user-friendly error
        showToast('Failed to load clients. Please refresh the page.', 'error');
        setLoadingClients(false);
      }
    );

    return () => unsubscribe();
  }, [showToast]);

  // Check if user needs onboarding
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    if (!hasSeenOnboarding && !loadingClients) {
      // Only show onboarding after clients have loaded
      setShowOnboarding(true);
    }
  }, [loadingClients]);

  const handleCompleteOnboarding = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    setShowOnboarding(false);
  };

  const handleCloseOnboarding = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    setShowOnboarding(false);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      showToast('See you soon!', 'info');
      navigate('/login');
    } catch (error) {
      console.error('[Dashboard] Logout error:', error);
      showToast('Failed to logout', 'error');
    }
  };

  const handleCancelForm = () => {
    // Check if form has data
    const hasData = formData.name || formData.email || formData.photo;
    
    if (hasData) {
      setShowCancelConfirm(true);
    } else {
      // No data, just close
      setShowModal(false);
    }
  };

  const confirmCancelForm = () => {
    setShowModal(false);
    setFormData({ name: '', email: '', photo: null });
    setFormErrors({ name: '', email: '', photo: '' });
    setPhotoPreview(null);
  };

  const validateForm = () => {
    const errors = {
      name: '',
      email: '',
      photo: ''
    };
    let isValid = true;

    // Validate name
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
      isValid = false;
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
      isValid = false;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!emailRegex.test(formData.email)) {
      errors.email = 'Please enter a valid email';
      isValid = false;
    }

    // Validate photo
    if (!formData.photo) {
      errors.photo = 'Photo is required';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Clear photo error when file is selected
      setFormErrors(prev => ({ ...prev, photo: '' }));
      setFormData({...formData, photo: file});
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddClient = async (e) => {
    e.preventDefault();
    
    // Validate form before submitting
    if (!validateForm()) {
      showToast('Please fix the errors before submitting', 'error');
      return;
    }
    
    setLoadingForm(true);

    try {
      console.log('=== [ARTIST] CREATING CLIENT ===');
      console.log('[ARTIST] Artist UID:', auth.currentUser.uid);
      console.log('[ARTIST] Client email:', formData.email);
      
      let photoURL = null;

      // Upload photo to Cloudinary
      if (formData.photo) {
        try {
          photoURL = await uploadToCloudinary(formData.photo);
          console.log('[ARTIST] Photo uploaded:', photoURL);
        } catch (uploadError) {
          console.error('[Dashboard] Photo upload failed:', uploadError);
          showToast('Failed to upload photo. Please try again.', 'error');
          setLoadingForm(false);
          return;
        }
      }

      // Generate unique token for magic link
      const uniqueToken = Math.random().toString(36).substring(2, 15) + 
                         Math.random().toString(36).substring(2, 15);
      
      console.log('[ARTIST] Generated uniqueToken:', uniqueToken);

      // Add client to Firestore as a user
      const clientData = {
        role: 'client',
        name: formData.name,
        email: formData.email,
        artistId: auth.currentUser.uid,
        tattooDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD format (today)
        tattooPhoto: photoURL,
        profilePhoto: photoURL,
        healingDay: 0, // Always starts at Day 0
        status: 'healing', // Always healing when just added
        hasCompletedSetup: false,
        photos: photoURL ? [photoURL] : [],
        uniqueToken: uniqueToken,
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'users'), clientData);
      
      console.log('✅ [ARTIST] Firestore document created:', {
        documentId: docRef.id,
        email: clientData.email,
        role: clientData.role,
        artistId: clientData.artistId,
        hasCompletedSetup: clientData.hasCompletedSetup,
        uniqueToken: clientData.uniqueToken
      });

      // Send Day 0 email using new email service
      try {
        const studioName = artistData.studioName || artistData.name || 'Your Tattoo Studio';
        
        await sendDay0Email({
          clientEmail: formData.email,
          clientName: formData.name,
          studioName: studioName,
          setupLink: `${window.location.origin}/client/setup/${uniqueToken}`,
          tattooPhoto: photoURL
        });
        
        showToast('Client added and welcome email sent!', 'success');
      } catch (emailError) {
        console.warn('[Dashboard] Client added but email failed:', emailError);
        showToast('Client added, but email delivery failed', 'warning');
      }

      // Reset form and close modal
      setFormData({ name: '', email: '', photo: null });
      setFormErrors({ name: '', email: '', photo: '' });
      setPhotoPreview(null);
      setShowModal(false);
    } catch (error) {
      console.error('[Dashboard] Error adding client:', error);
      showToast('Failed to add client: ' + error.message, 'error');
    } finally {
      setLoadingForm(false);
    }
  };

  if (checkingRole || !authReady) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-gray-100">
      {/* Main Content */}
      <div className="w-full">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 px-4 md:px-8 py-4 md:py-5 shadow-sm">
          <div className="flex justify-between items-center gap-4">
            {/* Title */}
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-black to-gray-800 flex items-center justify-center text-white font-bold shadow-lg">
                {auth.currentUser?.email?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-black tracking-tight">
                  Dashboard
                </h2>
                <p className="text-xs md:text-sm text-gray-600 mt-0.5">
                  Manage your clients' healing journeys
                </p>
              </div>
            </div>

            {/* Desktop User Info + Logout */}
            <div className="hidden md:flex items-center gap-4">
              <div className="text-right bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-200/50">
                <p className="text-sm font-semibold text-black truncate max-w-[150px] lg:max-w-none">
                  {auth.currentUser?.email}
                </p>
                <p className="text-xs text-gray-500 font-medium">Artist</p>
              </div>
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all duration-200"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-4 md:p-8 pb-20 md:pb-8">
          <div className="max-w-7xl mx-auto">
            
            {/* Hero Card - Attention Needed */}
            {stats.criticalCare > 0 && (
              <div className="bg-gradient-to-br from-red-500 via-red-600 to-red-700 rounded-2xl shadow-xl p-6 sm:p-8 mb-6 sm:mb-8 text-white border-2 border-red-400/30 transform hover:scale-[1.02] transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 shadow-lg">
                    <Flame className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-2">
                      {stats.criticalCare} {stats.criticalCare === 1 ? 'Client Needs' : 'Clients Need'} Attention Today
                    </h2>
                    <p className="text-sm sm:text-base text-white/90 leading-relaxed">
                      Critical healing phase (Days 0-7). These clients are at highest risk for complications. 
                      Make sure they're following aftercare protocol.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Stats Cards - 4 Cards Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
              
              {/* Total Clients */}
              <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-4 sm:p-5 border border-gray-100/50">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-xs font-semibold text-gray-600">Total</p>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-black">
                  {loadingClients ? '...' : stats.totalClients}
                </p>
              </div>

              {/* Active Healing */}
              <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-4 sm:p-5 border border-gray-100/50">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
                    <Clock className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-xs font-semibold text-gray-600">Active</p>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-black">
                  {loadingClients ? '...' : stats.activeHealing}
                </p>
              </div>

              {/* Critical Care - Day 0-7 */}
              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-4 sm:p-5 border-2 border-red-200">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-md">
                    <Flame className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-xs font-bold text-red-700">Critical</p>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-red-600">
                  {loadingClients ? '...' : stats.criticalCare}
                </p>
                <p className="text-[10px] text-red-700 font-semibold mt-1">Days 0-7</p>
              </div>

              {/* Completed Journeys */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-4 sm:p-5 border-2 border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-md">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-xs font-bold text-green-700">Healed</p>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-green-600">
                  {loadingClients ? '...' : stats.completed}
                </p>
                <p className="text-[10px] text-green-700 font-semibold mt-1">30+ days</p>
              </div>

            </div>

            {/* Clients List */}
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-5 md:p-7 border border-gray-100/50">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-7">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-black mb-1">Your Clients</h2>
                  <p className="text-sm text-gray-600 hidden md:block">Track and manage healing journeys</p>
                </div>
                <button 
                  onClick={() => setShowModal(true)}
                  className="hidden md:flex items-center gap-2.5 w-full sm:w-auto px-5 md:px-6 py-3 bg-gradient-to-r from-black to-gray-800 text-white rounded-xl font-bold hover:from-gray-800 hover:to-gray-700 transition-all duration-200 text-sm md:text-base shadow-lg hover:shadow-xl"
                >
                  <Plus className="w-5 h-5" />
                  Add Client
                </button>
              </div>

              {loadingClients ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                  <ClientCardSkeleton />
                  <ClientCardSkeleton />
                  <ClientCardSkeleton />
                </div>
              ) : clients.length === 0 ? (
                <div className="text-center py-16 px-4">
                  <div className="text-gray-300 mb-4">
                    <Users className="w-20 h-20 mx-auto mb-4" />
                  </div>
                  <p className="text-gray-700 text-lg font-bold mb-2">
                    Add your first client to start tracking
                  </p>
                  <p className="text-gray-500 text-sm max-w-md mx-auto leading-relaxed">
                    They'll get science-backed aftercare emails automatically—
                    so you don't have to answer the same questions over DM
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                  {clients.map((client) => {
                    const healingDay = client.healingDay || 0;
                    const isCritical = healingDay <= 7;
                    const isHealed = healingDay >= 30 || client.status === 'healed';
                    
                    return (
                      <div 
                        key={client.id}
                        className="group border border-gray-200 rounded-2xl p-0 hover:shadow-xl hover:border-gray-300 transition-all duration-300 bg-white overflow-hidden transform hover:scale-[1.02]"
                      >
                        {/* Tattoo Photo */}
                        {client.tattooPhoto && (
                          <div className="relative overflow-hidden">
                            <img 
                              src={getOptimizedImageUrl(client.tattooPhoto, 800)}
                              srcSet={getResponsiveSrcSet(client.tattooPhoto)}
                              sizes="(max-width: 640px) 400px, (max-width: 1024px) 800px, 800px"
                              loading="lazy"
                              alt={`${client.name}'s tattoo`}
                              className="w-full h-44 sm:h-52 object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            {/* Status Badge Overlay */}
                            <div className="absolute top-3 right-3">
                              <span className={`text-xs font-bold px-3 py-1.5 rounded-full whitespace-nowrap shadow-lg backdrop-blur-sm ${
                                isHealed
                                  ? 'bg-green-500/90 text-white' 
                                  : isCritical
                                  ? 'bg-red-500/90 text-white'
                                  : 'bg-blue-500/90 text-white'
                              }`}>
                                {isHealed
                                  ? <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Healed</span>
                                  : `Day ${healingDay}`}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Client Info */}
                        <div className="p-4 space-y-3">
                          <div>
                            <h3 className="font-bold text-base md:text-lg text-black truncate">{client.name}</h3>
                            <p className="text-xs md:text-sm text-gray-500 truncate">{client.email}</p>
                          </div>

                          {/* Progress Bar */}
                          <div className="w-full bg-gray-200 rounded-full h-2 shadow-inner">
                            <div 
                              className={`h-2 rounded-full transition-all duration-500 ${
                                isHealed 
                                  ? 'bg-gradient-to-r from-green-500 to-green-600'
                                  : isCritical
                                  ? 'bg-gradient-to-r from-red-500 to-red-600'
                                  : 'bg-gradient-to-r from-blue-500 to-blue-600'
                              }`}
                              style={{ width: `${Math.min((healingDay / 30) * 100, 100)}%` }}
                            />
                          </div>

                          {/* Tattoo Date */}
                          <div className="flex items-center justify-between pt-1">
                            <div className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                              <p className="text-xs text-gray-500 font-medium">
                                {new Date(client.tattooDate).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric' 
                                })}
                              </p>
                            </div>
                            {!isHealed && (
                              <p className="text-xs font-semibold text-gray-600">
                                {30 - healingDay} days left
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Add Client Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200/50">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xl sm:text-2xl font-bold text-black">Add New Client</h3>
              <button
                onClick={handleCancelForm}
                className="text-gray-400 hover:text-black text-3xl leading-none transition-colors"
              >
                ×
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              Upload their fresh tattoo. We'll handle the aftercare education for the next 30 days.
            </p>

            <form onSubmit={handleAddClient} className="space-y-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Client Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({...formData, name: e.target.value});
                    if (formErrors.name) setFormErrors({...formErrors, name: ''});
                  }}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-black outline-none text-base font-medium transition-all ${
                    formErrors.name 
                      ? 'border-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:border-transparent'
                  }`}
                  placeholder="John Doe"
                />
                {formErrors.name && (
                  <p className="text-xs text-red-600 mt-1.5 font-medium">{formErrors.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Client Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({...formData, email: e.target.value});
                    if (formErrors.email) setFormErrors({...formErrors, email: ''});
                  }}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-black outline-none text-base font-medium transition-all ${
                    formErrors.email 
                      ? 'border-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:border-transparent'
                  }`}
                  placeholder="john@example.com"
                />
                {formErrors.email ? (
                  <p className="text-xs text-red-600 mt-1.5 font-medium">{formErrors.email}</p>
                ) : (
                  <p className="text-xs text-gray-500 mt-2 font-medium">They'll receive automated aftercare emails</p>
                )}
              </div>

              {/* Tattoo Photo */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Fresh Tattoo Photo (Day 0)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoChange}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-black outline-none text-base file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-gradient-to-r file:from-black file:to-gray-800 file:text-white file:font-bold hover:file:from-gray-800 hover:file:to-gray-700 file:transition-all file:shadow-md ${
                    formErrors.photo 
                      ? 'border-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:border-transparent'
                  }`}
                />
                {formErrors.photo ? (
                  <p className="text-xs text-red-600 mt-1.5 font-medium">{formErrors.photo}</p>
                ) : (
                  <p className="text-xs text-gray-500 mt-2 flex items-center gap-1.5 font-medium">
                    <Camera className="w-4 h-4" />
                    Take or upload a photo of the fresh tattoo
                  </p>
                )}
                
                {/* Photo Preview */}
                {photoPreview && (
                  <div className="mt-4">
                    <img
                      src={photoPreview}
                      alt="Tattoo preview"
                      loading="eager"
                      className="w-full h-48 object-cover rounded-xl border-2 border-gray-200 shadow-md"
                    />
                  </div>
                )}
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCancelForm}
                  disabled={loadingForm}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl font-bold hover:bg-gray-50 transition-all text-base disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loadingForm}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-black to-gray-800 text-white rounded-xl font-bold hover:from-gray-800 hover:to-gray-700 disabled:from-gray-400 disabled:to-gray-400 transition-all text-base shadow-lg flex items-center justify-center gap-2"
                >
                  {loadingForm ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span>Adding...</span>
                    </>
                  ) : (
                    'Add Client'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Logout Confirmation */}
      <ConfirmDialog 
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="Logout?"
        message="Are you sure you want to logout?"
        confirmText="Logout"
        variant="warning"
      />

      {/* Cancel Form Confirmation */}
      <ConfirmDialog
        isOpen={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        onConfirm={confirmCancelForm}
        title="Discard changes?"
        message="You have unsaved changes. Are you sure you want to close?"
        confirmText="Discard"
        variant="danger"
      />

      {/* Onboarding Tutorial */}
      <Onboarding
        isOpen={showOnboarding}
        onClose={handleCloseOnboarding}
        onComplete={handleCompleteOnboarding}
      />
    </div>
  );
}

export default Dashboard;
