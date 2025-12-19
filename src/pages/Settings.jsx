import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../config/firebase';
import { 
  updateProfile, 
  updateEmail, 
  updatePassword, 
  reauthenticateWithCredential, 
  EmailAuthProvider 
} from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { uploadToCloudinary } from '../services/cloudinary';
import { useToast } from '../contexts/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmDialog from '../components/ConfirmDialog';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Lock, 
  Camera, 
  Save, 
  X,
  Sparkles 
} from 'lucide-react';

/**
 * SETTINGS PAGE
 * 
 * Features:
 * - Edit profile name and email
 * - Change password with current password verification
 * - Upload profile photo
 * - Form validation
 * - Confirmation dialogs for important changes
 * 
 * Icons: ArrowLeft (back), User (profile), Mail (email), Lock (password), 
 *        Camera (photo upload), Save (submit), X (cancel)
 */

function Settings() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // User data
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    photoURL: '',
    studioName: '',
    createdAt: null
  });

  // Profile form
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    studioName: ''
  });
  const [profileErrors, setProfileErrors] = useState({
    name: '',
    email: '',
    studioName: ''
  });

  // Password form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Photo upload
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  // Confirmation dialogs
  const [showEmailConfirm, setShowEmailConfirm] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          navigate('/login');
          return;
        }

        // Get user data from Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          const userData = {
            name: data.name || user.displayName || '',
            email: user.email || '',
            photoURL: data.photoURL || user.photoURL || '',
            studioName: data.studioName || '',
            createdAt: data.createdAt
          };
          
          setUserData(userData);
          setProfileForm({
            name: userData.name,
            email: userData.email,
            studioName: userData.studioName
          });
          setPhotoPreview(userData.photoURL);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        showToast('Failed to load user data', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [navigate, showToast]);

  // Validate profile form
  const validateProfileForm = () => {
    const errors = { name: '', email: '', studioName: '' };
    let isValid = true;

    if (!profileForm.name.trim()) {
      errors.name = 'Name is required';
      isValid = false;
    } else if (profileForm.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
      isValid = false;
    }

    if (!profileForm.email.trim()) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileForm.email)) {
      errors.email = 'Please enter a valid email';
      isValid = false;
    }

    // Studio name is optional, but if provided, must be at least 2 characters
    if (profileForm.studioName && profileForm.studioName.trim().length < 2) {
      errors.studioName = 'Studio name must be at least 2 characters';
      isValid = false;
    }

    setProfileErrors(errors);
    return isValid;
  };

  // Validate password form
  const validatePasswordForm = () => {
    const errors = { currentPassword: '', newPassword: '', confirmPassword: '' };
    let isValid = true;

    if (!passwordForm.currentPassword) {
      errors.currentPassword = 'Current password is required';
      isValid = false;
    }

    if (!passwordForm.newPassword) {
      errors.newPassword = 'New password is required';
      isValid = false;
    } else if (passwordForm.newPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters';
      isValid = false;
    }

    if (!passwordForm.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
      isValid = false;
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    setPasswordErrors(errors);
    return isValid;
  };

  // Handle profile update
  const handleUpdateProfile = async () => {
    if (!validateProfileForm()) return;

    // Check if email changed
    if (profileForm.email !== userData.email) {
      setShowEmailConfirm(true);
      return;
    }

    await saveProfile();
  };

  // Save profile
  const saveProfile = async () => {
    setSavingProfile(true);
    try {
      const user = auth.currentUser;

      // Update name in Firebase Auth
      if (profileForm.name !== userData.name) {
        await updateProfile(user, { displayName: profileForm.name });
      }

      // Update email in Firebase Auth (if changed)
      if (profileForm.email !== userData.email) {
        await updateEmail(user, profileForm.email);
      }

      // Update Firestore
      await updateDoc(doc(db, 'users', user.uid), {
        name: profileForm.name,
        email: profileForm.email,
        studioName: profileForm.studioName || ''
      });

      // Update local state
      setUserData(prev => ({
        ...prev,
        name: profileForm.name,
        email: profileForm.email,
        studioName: profileForm.studioName
      }));

      showToast('Profile updated successfully', 'success');
      setShowEmailConfirm(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      
      // Handle specific errors
      if (error.code === 'auth/requires-recent-login') {
        showToast('Please log in again to update your email', 'error');
      } else if (error.code === 'auth/email-already-in-use') {
        showToast('This email is already in use', 'error');
      } else if (error.code === 'auth/invalid-email') {
        showToast('Invalid email address', 'error');
      } else {
        showToast('Failed to update profile', 'error');
      }
    } finally {
      setSavingProfile(false);
    }
  };

  // Handle password change
  const handleChangePassword = async () => {
    if (!validatePasswordForm()) return;
    setShowPasswordConfirm(true);
  };

  // Save password
  const savePassword = async () => {
    setSavingPassword(true);
    try {
      const user = auth.currentUser;

      // Re-authenticate user
      const credential = EmailAuthProvider.credential(
        user.email,
        passwordForm.currentPassword
      );
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, passwordForm.newPassword);

      // Clear form
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      showToast('Password changed successfully', 'success');
      setShowPasswordConfirm(false);
    } catch (error) {
      console.error('Error changing password:', error);
      
      if (error.code === 'auth/wrong-password') {
        showToast('Current password is incorrect', 'error');
        setPasswordErrors(prev => ({
          ...prev,
          currentPassword: 'Current password is incorrect'
        }));
      } else if (error.code === 'auth/weak-password') {
        showToast('New password is too weak', 'error');
      } else {
        showToast('Failed to change password', 'error');
      }
    } finally {
      setSavingPassword(false);
    }
  };

  // Handle photo upload
  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file
    if (file.size > 10 * 1024 * 1024) {
      showToast('Photo must be less than 10MB', 'error');
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      showToast('Photo must be JPG, PNG or WebP', 'error');
      return;
    }

    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));

    // Upload immediately
    await uploadPhoto(file);
  };

  // Upload photo
  const uploadPhoto = async (file) => {
    setUploadingPhoto(true);
    try {
      const photoURL = await uploadToCloudinary(file);
      const user = auth.currentUser;

      // Update Firebase Auth
      await updateProfile(user, { photoURL });

      // Update Firestore
      await updateDoc(doc(db, 'users', user.uid), { photoURL });

      // Update local state
      setUserData(prev => ({ ...prev, photoURL }));
      setPhotoPreview(photoURL);

      showToast('Photo updated successfully', 'success');
    } catch (error) {
      console.error('Error uploading photo:', error);
      showToast('Failed to upload photo', 'error');
      // Reset preview on error
      setPhotoPreview(userData.photoURL);
    } finally {
      setUploadingPhoto(false);
      setPhotoFile(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading settings..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 h-16">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Back to dashboard"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-xl font-bold">Settings</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Profile Photo Section */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold mb-4">Profile Photo</h2>
            
            <div className="flex items-center gap-6">
              {/* Photo Preview */}
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden">
                  {photoPreview ? (
                    <img 
                      src={photoPreview} 
                      alt="Profile" 
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                </div>
                
                {uploadingPhoto && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                    <LoadingSpinner size="sm" />
                  </div>
                )}
              </div>

              {/* Upload Button */}
              <div>
                <label className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg cursor-pointer hover:bg-gray-800 transition-colors">
                  <Camera className="w-4 h-4" />
                  <span className="font-medium">Change Photo</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handlePhotoChange}
                    disabled={uploadingPhoto}
                    className="hidden"
                  />
                </label>
                <p className="text-sm text-gray-500 mt-2">
                  JPG, PNG or WebP. Max 10MB.
                </p>
              </div>
            </div>
          </div>

          {/* Profile Information Section */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold mb-4">Profile Information</h2>
            
            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => {
                      setProfileForm(prev => ({ ...prev, name: e.target.value }));
                      setProfileErrors(prev => ({ ...prev, name: '' }));
                    }}
                    placeholder="Your name"
                    className={`w-full pl-11 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:border-black transition-colors ${
                      profileErrors.name ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                </div>
                {profileErrors.name && (
                  <p className="text-red-500 text-sm mt-1">{profileErrors.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => {
                      setProfileForm(prev => ({ ...prev, email: e.target.value }));
                      setProfileErrors(prev => ({ ...prev, email: '' }));
                    }}
                    placeholder="your.email@example.com"
                    className={`w-full pl-11 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:border-black transition-colors ${
                      profileErrors.email ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                </div>
                {profileErrors.email && (
                  <p className="text-red-500 text-sm mt-1">{profileErrors.email}</p>
                )}
                {profileForm.email !== userData.email && (
                  <p className="text-orange-600 text-sm mt-1">
                    ⚠️ Changing your email will require you to log in again
                  </p>
                )}
              </div>

              {/* Studio Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Studio Name <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={profileForm.studioName}
                    onChange={(e) => {
                      setProfileForm(prev => ({ ...prev, studioName: e.target.value }));
                      setProfileErrors(prev => ({ ...prev, studioName: '' }));
                    }}
                    placeholder="Your Tattoo Studio"
                    className={`w-full pl-11 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:border-black transition-colors ${
                      profileErrors.studioName ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                </div>
                {profileErrors.studioName && (
                  <p className="text-red-500 text-sm mt-1">{profileErrors.studioName}</p>
                )}
                <p className="text-xs text-gray-500 mt-1.5">
                  This will appear in client emails
                </p>
              </div>

              {/* Save Button */}
              <button
                onClick={handleUpdateProfile}
                disabled={savingProfile || (profileForm.name === userData.name && profileForm.email === userData.email && profileForm.studioName === userData.studioName)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {savingProfile ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Change Password Section */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold mb-4">Change Password</h2>
            
            <div className="space-y-4">
              {/* Current Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => {
                      setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }));
                      setPasswordErrors(prev => ({ ...prev, currentPassword: '' }));
                    }}
                    placeholder="Enter current password"
                    className={`w-full pl-11 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:border-black transition-colors ${
                      passwordErrors.currentPassword ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                </div>
                {passwordErrors.currentPassword && (
                  <p className="text-red-500 text-sm mt-1">{passwordErrors.currentPassword}</p>
                )}
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => {
                      setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }));
                      setPasswordErrors(prev => ({ ...prev, newPassword: '' }));
                    }}
                    placeholder="Enter new password (min 6 characters)"
                    className={`w-full pl-11 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:border-black transition-colors ${
                      passwordErrors.newPassword ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                </div>
                {passwordErrors.newPassword && (
                  <p className="text-red-500 text-sm mt-1">{passwordErrors.newPassword}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => {
                      setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }));
                      setPasswordErrors(prev => ({ ...prev, confirmPassword: '' }));
                    }}
                    placeholder="Confirm new password"
                    className={`w-full pl-11 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:border-black transition-colors ${
                      passwordErrors.confirmPassword ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                </div>
                {passwordErrors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">{passwordErrors.confirmPassword}</p>
                )}
              </div>

              {/* Change Password Button */}
              <button
                onClick={handleChangePassword}
                disabled={savingPassword || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {savingPassword ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>Changing Password...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Change Password</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Account Info Section */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold mb-4">Account Information</h2>
            
            <div className="space-y-3 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Account created</span>
                <span className="font-medium">
                  {userData.createdAt 
                    ? new Date(userData.createdAt.seconds * 1000).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                    : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">User ID</span>
                <span className="font-mono text-xs">{auth.currentUser?.uid}</span>
              </div>
            </div>

            {/* Show Tutorial Again */}
            <button
              onClick={() => {
                localStorage.removeItem('hasSeenOnboarding');
                navigate('/dashboard');
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Show Tutorial Again</span>
            </button>
          </div>
        </div>
      </div>

      {/* Email Change Confirmation */}
      <ConfirmDialog
        isOpen={showEmailConfirm}
        onClose={() => setShowEmailConfirm(false)}
        onConfirm={saveProfile}
        title="Change email?"
        message="You will need to log in again after changing your email address."
        confirmText="Change Email"
        variant="warning"
      />

      {/* Password Change Confirmation */}
      <ConfirmDialog
        isOpen={showPasswordConfirm}
        onClose={() => setShowPasswordConfirm(false)}
        onConfirm={savePassword}
        title="Change password?"
        message="Are you sure you want to change your password?"
        confirmText="Change Password"
        variant="warning"
      />
    </div>
  );
}

export default Settings;
