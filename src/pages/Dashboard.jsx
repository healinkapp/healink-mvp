import { useState, useEffect } from 'react';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { uploadToCloudinary } from '../services/cloudinary';
import emailjs from '@emailjs/browser';
import { Users, Clock, Flame, CheckCircle2, Menu, Plus, LogOut, LayoutDashboard, Mail, Settings, ArrowLeft, ArrowRight, Camera } from 'lucide-react';
import { getUserRole } from '../utils/getUserRole';

/**
 * ICON REFERENCE (Lucide React)
 * 
 * Stats: Users, Clock, Flame, CheckCircle2
 * Navigation: LayoutDashboard, Users, Mail, Settings
 * Actions: Plus, Menu, LogOut, Camera
 * Direction: ArrowLeft, ArrowRight
 * 
 * Sizes: w-4 h-4 (small), w-5 h-5 (normal), w-6 h-6 (large)
 * Colors: text-gray-600 (default), text-orange-600 (warning), text-green-600 (success), text-black
 */

// Initialize EmailJS
emailjs.init('uH10FXkw8yv434h5P');

function Dashboard() {
  const [authReady, setAuthReady] = useState(false);
  const [checkingRole, setCheckingRole] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false); // Closed by default on mobile
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    photo: null
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

  // Check auth and role - Artists only
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate('/login');
        return;
      }

      // Verify user is an artist
      const role = await getUserRole(user.email);
      
      if (role !== 'artist') {
        console.log('❌ Not an artist, redirecting...');
        if (role === 'client') {
          navigate('/client/dashboard');
        } else {
          await signOut(auth);
          navigate('/login');
        }
        return;
      }

      console.log('✅ Dashboard: Artist authenticated:', user.email);
      setAuthReady(true);
      setCheckingRole(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  // Debug auth state
  useEffect(() => {
    console.log('🔐 Auth state:', {
      user: auth.currentUser,
      uid: auth.currentUser?.uid,
      email: auth.currentUser?.email
    });
  }, []);

  // Fetch clients in real-time
  useEffect(() => {
    if (!auth.currentUser) {
      console.log('❌ No authenticated user');
      return;
    }

    console.log('🔍 Fetching clients for artist:', auth.currentUser.uid);

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
        console.log('📊 Query returned', snapshot.docs.length, 'clients');
        
        const clientsData = snapshot.docs.map(doc => {
          const data = { id: doc.id, ...doc.data() };
          console.log('Client:', data);
          return data;
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
        
        console.log('📈 Stats calculated:', {
          totalClients,
          activeHealing,
          criticalCare,
          completed
        });
        
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
        console.error('❌ Firestore query error:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        setLoadingClients(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({...formData, photo: file});
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const sendDay0Email = async (clientData, photoURL, uniqueToken) => {
    const setupLink = `${window.location.origin}/setup/${uniqueToken}`;
    
    const templateParams = {
      client_name: clientData.name,
      studio_name: 'Appreciart', // TODO: Get from artist profile later
      tattoo_photo: photoURL,
      setup_link: setupLink,
      to_email: clientData.email
    };

    try {
      await emailjs.send(
        'service_13h3kki',
        'template_1tcang2',
        templateParams
      );
      console.log('Day 0 email sent successfully to:', clientData.email);
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  };

  const handleAddClient = async (e) => {
    e.preventDefault();
    setLoadingForm(true);

    try {
      let photoURL = null;

      // Upload photo to Cloudinary
      if (formData.photo) {
        photoURL = await uploadToCloudinary(formData.photo);
        console.log('Photo uploaded to Cloudinary:', photoURL);
      }

      // Generate unique token for magic link
      const uniqueToken = Math.random().toString(36).substring(2, 15) + 
                         Math.random().toString(36).substring(2, 15);

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
        accountSetup: false,
        photos: photoURL ? [photoURL] : [],
        uniqueToken: uniqueToken,
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'users'), clientData);

      console.log('Client added successfully:', clientData);

      // Send Day 0 email
      const emailSent = await sendDay0Email(
        { name: formData.name, email: formData.email },
        photoURL,
        uniqueToken
      );

      if (emailSent) {
        console.log('✅ Client added and email sent!');
      } else {
        console.warn('⚠️ Client added but email failed');
      }

      // Reset form and close modal
      setFormData({ name: '', email: '', photo: null });
      setPhotoPreview(null);
      setShowModal(false);
      
      alert(emailSent 
        ? '✅ Client added and welcome email sent!' 
        : '✅ Client added! (Email failed - check console)'
      );
    } catch (error) {
      console.error('Error adding client:', error);
      alert('❌ Error: ' + error.message);
    } finally {
      setLoadingForm(false);
    }
  };

  if (checkingRole || !authReady) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0 ${
        sidebarOpen ? 'w-64' : 'md:w-20 w-64'
      } bg-black text-white transition-all duration-300 flex flex-col fixed md:relative z-50 h-full`}>
        {/* Logo */}
        <div className="p-6 border-b border-gray-800">
          <h1 className={`font-bold ${sidebarOpen || 'md:text-xl'} text-2xl transition-all`}>
            <span className="md:hidden">{sidebarOpen ? 'HEALINK' : 'H'}</span>
            <span className="hidden md:inline">{sidebarOpen ? 'HEALINK' : 'H'}</span>
          </h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            <li>
              <a
                href="#"
                className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gray-800 text-white font-medium"
              >
                <LayoutDashboard className="w-5 h-5" />
                {sidebarOpen && <span>Dashboard</span>}
              </a>
            </li>
            <li>
              <a
                href="#"
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition"
              >
                <Users className="w-5 h-5" />
                {sidebarOpen && <span>Clients</span>}
              </a>
            </li>
            <li>
              <a
                href="#"
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition"
              >
                <Mail className="w-5 h-5" />
                {sidebarOpen && <span>Emails</span>}
              </a>
            </li>
            <li>
              <a
                href="#"
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition"
              >
                <Settings className="w-5 h-5" />
                {sidebarOpen && <span>Settings</span>}
              </a>
            </li>
          </ul>
        </nav>

        {/* Toggle Sidebar */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-4 border-t border-gray-800 hover:bg-gray-800 transition flex items-center justify-center"
        >
          {sidebarOpen ? <ArrowLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
        </button>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 md:px-8 py-4">
          <div className="flex justify-between items-center gap-4">
            {/* Mobile Menu Button + Title */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-black">Dashboard</h2>
                <p className="text-xs md:text-sm text-gray-500 hidden sm:block">Manage your clients' healing journeys</p>
              </div>
            </div>

            {/* User Info + Logout */}
            <div className="flex items-center gap-2 md:gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-black truncate max-w-[150px] md:max-w-none">
                  {auth.currentUser?.email}
                </p>
                <p className="text-xs text-gray-500">Artist</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 md:px-4 border border-gray-300 rounded-lg text-xs md:text-sm font-medium hover:bg-gray-50 transition"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Stats Cards - 4 Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
              
              {/* Total Clients */}
              <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-gray-600" />
                  <p className="text-sm text-gray-600">Total Clients</p>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-black">
                  {loadingClients ? '...' : stats.totalClients}
                </p>
              </div>

              {/* Active Healing */}
              <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-gray-600" />
                  <p className="text-sm text-gray-600">Active Healing</p>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-black">
                  {loadingClients ? '...' : stats.activeHealing}
                </p>
              </div>

              {/* Critical Care - Day 0-7 */}
              <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border-2 border-orange-200">
                <div className="flex items-center gap-2 mb-2">
                  <Flame className="w-5 h-5 text-orange-600" />
                  <p className="text-sm text-gray-600">Critical Care</p>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-orange-600">
                  {loadingClients ? '...' : stats.criticalCare}
                </p>
                <p className="text-xs text-gray-500 mt-1">Days 0-7 - highest risk phase</p>
              </div>

              {/* Completed Journeys */}
              <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border-2 border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <p className="text-sm text-gray-600">Completed</p>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-green-600">
                  {loadingClients ? '...' : stats.completed}
                </p>
                <p className="text-xs text-gray-500 mt-1">30+ days</p>
              </div>

            </div>

            {/* Clients List */}
            <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="text-xl md:text-2xl font-bold text-black">Your Clients</h2>
                <button 
                  onClick={() => setShowModal(true)}
                  className="flex items-center gap-2 w-full sm:w-auto px-4 md:px-6 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition text-sm md:text-base"
                >
                  <Plus className="w-5 h-5" />
                  Add Client
                </button>
              </div>

              {loadingClients ? (
                <div className="text-center py-12 text-gray-500">
                  Loading clients...
                </div>
              ) : clients.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-gray-300 mb-4">
                    <Users className="w-16 h-16 mx-auto mb-3" />
                  </div>
                  <p className="text-gray-500 text-lg font-medium mb-2">
                    Add your first client to start tracking
                  </p>
                  <p className="text-gray-400 text-sm max-w-md mx-auto">
                    They'll get science-backed aftercare emails automatically—
                    so you don't have to answer the same questions over DM
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {clients.map((client) => (
                    <div 
                      key={client.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                    >
                      {/* Tattoo Photo */}
                      {client.tattooPhoto && (
                        <img 
                          src={client.tattooPhoto}
                          alt={`${client.name}'s tattoo`}
                          className="w-full h-40 sm:h-48 object-cover rounded-lg mb-4"
                        />
                      )}

                      {/* Client Info */}
                      <div className="space-y-2">
                        <h3 className="font-bold text-base md:text-lg text-black truncate">{client.name}</h3>
                        <p className="text-xs md:text-sm text-gray-600 truncate">{client.email}</p>
                        
                        {/* Healing Status */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${
                            client.status === 'healed' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {client.status === 'healed' 
                              ? '✓ Healed' 
                              : `Day ${client.healingDay}/30`}
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-black h-2 rounded-full transition-all"
                            style={{ width: `${(client.healingDay / 30) * 100}%` }}
                          />
                        </div>

                        {/* Tattoo Date */}
                        <p className="text-xs text-gray-500">
                          Tattoo: {new Date(client.tattooDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Add Client Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xl sm:text-2xl font-bold text-black">Add Client</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-black text-3xl leading-none"
              >
                ×
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Upload their fresh tattoo. We'll handle the aftercare education for the next 30 days.
            </p>

            <form onSubmit={handleAddClient} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Client Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none text-base"
                  placeholder="John Doe"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Client Email (for aftercare updates)
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none text-base"
                  placeholder="john@example.com"
                />
              </div>

              {/* Tattoo Photo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fresh Tattoo Photo (Day 0) *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none text-base file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-black file:text-white file:font-semibold hover:file:bg-gray-800"
                />
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <Camera className="w-4 h-4" />
                  Take or upload a photo of the fresh tattoo
                </p>
                
                {/* Photo Preview */}
                {photoPreview && (
                  <div className="mt-3">
                    <img
                      src={photoPreview}
                      alt="Tattoo preview"
                      className="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
                    />
                  </div>
                )}
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition text-base"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loadingForm}
                  className="flex-1 px-4 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 disabled:bg-gray-400 transition text-base"
                >
                  {loadingForm ? 'Adding...' : 'Add Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
