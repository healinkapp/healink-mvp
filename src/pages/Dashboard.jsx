import { useState, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { uploadToCloudinary } from '../services/cloudinary';

function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false); // Closed by default on mobile
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    tattooDate: '',
    photo: null
  });
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loadingForm, setLoadingForm] = useState(false);
  const [clients, setClients] = useState([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const navigate = useNavigate();

  // Fetch clients in real-time
  useEffect(() => {
    if (!auth.currentUser) return;

    // Query clients for this artist
    const q = query(
      collection(db, 'users'),
      where('role', '==', 'client'),
      where('artistId', '==', auth.currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    // Real-time listener
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const clientsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setClients(clientsData);
      setLoadingClients(false);
    });

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

      // Calculate healing day (days since tattoo)
      const tattooDate = new Date(formData.tattooDate);
      const today = new Date();
      const daysSince = Math.floor((today - tattooDate) / (1000 * 60 * 60 * 24));
      const healingDay = Math.max(0, Math.min(daysSince, 30));

      // Generate unique token for magic link
      const uniqueToken = Math.random().toString(36).substring(2, 15) + 
                         Math.random().toString(36).substring(2, 15);

      // Add client to Firestore as a user
      const clientData = {
        role: 'client',
        name: formData.name,
        email: formData.email,
        artistId: auth.currentUser.uid,
        tattooDate: formData.tattooDate,
        tattooPhoto: photoURL,
        profilePhoto: photoURL, // Use tattoo photo as initial profile
        healingDay: healingDay,
        status: healingDay >= 30 ? 'healed' : 'healing',
        accountSetup: false, // Client needs to set password
        photos: photoURL ? [photoURL] : [],
        uniqueToken: uniqueToken,
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'users'), clientData);

      console.log('Client added successfully:', clientData);

      // TODO: Send Day 0 email with magic link (next step)

      // Reset form and close modal
      setFormData({ name: '', email: '', tattooDate: '', photo: null });
      setPhotoPreview(null);
      setShowModal(false);
      
      alert('✅ Client added successfully! They will receive an email to set up their account.');
    } catch (error) {
      console.error('Error adding client:', error);
      alert('❌ Error: ' + error.message);
    } finally {
      setLoadingForm(false);
    }
  };

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
                <span>📊</span>
                {sidebarOpen && <span>Dashboard</span>}
              </a>
            </li>
            <li>
              <a
                href="#"
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition"
              >
                <span>👥</span>
                {sidebarOpen && <span>Clients</span>}
              </a>
            </li>
            <li>
              <a
                href="#"
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition"
              >
                <span>📧</span>
                {sidebarOpen && <span>Emails</span>}
              </a>
            </li>
            <li>
              <a
                href="#"
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition"
              >
                <span>⚙️</span>
                {sidebarOpen && <span>Settings</span>}
              </a>
            </li>
          </ul>
        </nav>

        {/* Toggle Sidebar */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-4 border-t border-gray-800 hover:bg-gray-800 transition"
        >
          {sidebarOpen ? '←' : '→'}
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
                <span className="text-2xl">☰</span>
              </button>
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-black">Dashboard</h2>
                <p className="text-xs md:text-sm text-gray-500 hidden sm:block">Welcome back!</p>
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
                className="px-3 py-2 md:px-4 border border-gray-300 rounded-lg text-xs md:text-sm font-medium hover:bg-gray-50 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
              <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-200">
                <p className="text-sm text-gray-600 mb-1">Total Clients</p>
                <p className="text-2xl md:text-3xl font-bold text-black">{clients.length}</p>
              </div>
              <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-200">
                <p className="text-sm text-gray-600 mb-1">Active Healing</p>
                <p className="text-2xl md:text-3xl font-bold text-black">
                  {clients.filter(c => c.status === 'healing').length}
                </p>
              </div>
              <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-200">
                <p className="text-sm text-gray-600 mb-1">Emails Sent</p>
                <p className="text-2xl md:text-3xl font-bold text-black">0</p>
              </div>
            </div>

            {/* Clients List */}
            <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="text-xl md:text-2xl font-bold text-black">Your Clients</h2>
                <button 
                  onClick={() => setShowModal(true)}
                  className="w-full sm:w-auto px-4 md:px-6 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition text-sm md:text-base"
                >
                  + Add Client
                </button>
              </div>

              {loadingClients ? (
                <div className="text-center py-12 text-gray-500">
                  Loading clients...
                </div>
              ) : clients.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">No clients yet</p>
                  <button 
                    onClick={() => setShowModal(true)}
                    className="px-6 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition"
                  >
                    Add Your First Client
                  </button>
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
                          <span className="text-xs md:text-sm font-semibold text-black whitespace-nowrap">
                            Day {client.healingDay}/30
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${
                            client.status === 'healed' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {client.status === 'healed' ? '✓ Healed' : '⏱ Healing'}
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
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl sm:text-2xl font-bold text-black">Add New Client</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-black text-3xl leading-none"
              >
                ×
              </button>
            </div>

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
                  Email
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

              {/* Tattoo Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tattoo Date
                </label>
                <input
                  type="date"
                  value={formData.tattooDate}
                  onChange={(e) => setFormData({...formData, tattooDate: e.target.value})}
                  required
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none text-base"
                />
                <p className="text-xs text-gray-500 mt-1">When did they get the tattoo?</p>
              </div>

              {/* Tattoo Photo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tattoo Photo *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none text-base file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-black file:text-white file:font-semibold hover:file:bg-gray-800"
                />
                <p className="text-xs text-gray-500 mt-1">
                  📸 Take or upload a photo of the fresh tattoo
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
