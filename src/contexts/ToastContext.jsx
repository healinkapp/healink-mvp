import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, XCircle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now();
    const newToast = { id, message, type, duration };
    
    setToasts(prev => [...prev, newToast]);

    // Auto remove após duration
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

const ToastContainer = ({ toasts, removeToast }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};

const Toast = ({ toast, onClose }) => {
  const { message, type } = toast;

  const config = {
    success: {
      icon: CheckCircle2,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-500',
      textColor: 'text-green-800',
      iconColor: 'text-green-600'
    },
    error: {
      icon: XCircle,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-500',
      textColor: 'text-red-800',
      iconColor: 'text-red-600'
    },
    warning: {
      icon: AlertCircle,
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-500',
      textColor: 'text-orange-800',
      iconColor: 'text-orange-600'
    },
    info: {
      icon: Info,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-500',
      textColor: 'text-blue-800',
      iconColor: 'text-blue-600'
    }
  };

  const { icon: Icon, bgColor, borderColor, textColor, iconColor } = config[type] || config.info;

  return (
    <div 
      className={`
        ${bgColor} ${borderColor} ${textColor}
        border-l-4 p-4 rounded-lg shadow-xl
        flex items-center gap-3 min-w-[320px] max-w-md
        pointer-events-auto
        animate-[slideIn_0.3s_ease-out]
      `}
    >
      <Icon className={`${iconColor} w-5 h-5 flex-shrink-0`} />
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button
        onClick={onClose}
        className={`${iconColor} hover:opacity-70 transition-opacity`}
        aria-label="Fechar"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
