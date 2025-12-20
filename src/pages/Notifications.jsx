import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../config/firebase';
import { collection, query, where, orderBy, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { ArrowLeft, Bell, CheckCircle2, Flame, Sparkles, Clock } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';

/**
 * NOTIFICATIONS PAGE
 * 
 * Displays important events for the artist:
 * - Client completed account setup
 * - Client entered critical phase (Day 7)
 * - Client reached healing milestone (Day 14, 30)
 * 
 * Future: Will integrate with Firebase Push Notifications
 */

function Notifications() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!auth.currentUser) {
      navigate('/login');
      return;
    }

    // Query notifications for this artist
    const q = query(
      collection(db, 'notifications'),
      where('artistId', '==', auth.currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setNotifications(notifs);
      setLoading(false);
    }, (error) => {
      console.error('[Notifications] Error loading notifications:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const markAsRead = async (notificationId) => {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        read: true
      });
    } catch (error) {
      console.error('[Notifications] Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifs = notifications.filter(n => !n.read);
      await Promise.all(
        unreadNotifs.map(n => 
          updateDoc(doc(db, 'notifications', n.id), { read: true })
        )
      );
      showToast('All notifications marked as read', 'success');
    } catch (error) {
      console.error('[Notifications] Error marking all as read:', error);
      showToast('Failed to mark notifications as read', 'error');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'account_setup':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'critical_phase':
        return <Flame className="w-5 h-5 text-red-600" />;
      case 'milestone':
        return <Sparkles className="w-5 h-5 text-blue-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'account_setup':
        return 'bg-green-50 border-green-200';
      case 'critical_phase':
        return 'bg-red-50 border-red-200';
      case 'milestone':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return 'Just now';
    
    const now = new Date();
    const notifDate = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const diffMs = now - notifDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading notifications..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Back to dashboard"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-bold">Notifications</h1>
                {unreadCount > 0 && (
                  <p className="text-sm text-gray-600">{unreadCount} unread</p>
                )}
              </div>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                Mark all as read
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {notifications.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">No notifications yet</h2>
            <p className="text-gray-600">
              You'll be notified when clients complete setup or reach important milestones
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <button
                key={notification.id}
                onClick={() => {
                  if (!notification.read) markAsRead(notification.id);
                  if (notification.clientId) {
                    navigate('/dashboard'); // Future: navigate to client detail
                  }
                }}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all hover:shadow-md ${
                  notification.read 
                    ? 'bg-white border-gray-200' 
                    : getNotificationColor(notification.type)
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    notification.read ? 'bg-gray-100' : 'bg-white'
                  }`}>
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-bold mb-1 ${
                      notification.read ? 'text-gray-700' : 'text-gray-900'
                    }`}>
                      {notification.title}
                    </h3>
                    <p className={`text-sm mb-2 ${
                      notification.read ? 'text-gray-500' : 'text-gray-700'
                    }`}>
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span>{formatTimeAgo(notification.createdAt)}</span>
                    </div>
                  </div>

                  {/* Unread Badge */}
                  {!notification.read && (
                    <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2"></div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Notifications;
