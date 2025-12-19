import { AlertCircle } from 'lucide-react';

export default function ConfirmDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'warning' // 'warning' or 'danger'
}) {
  if (!isOpen) return null;

  const variants = {
    warning: {
      icon: 'text-orange-600',
      iconBg: 'bg-orange-100',
      button: 'bg-orange-600 hover:bg-orange-700'
    },
    danger: {
      icon: 'text-red-600',
      iconBg: 'bg-red-100',
      button: 'bg-red-600 hover:bg-red-700'
    }
  };

  const style = variants[variant];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200/50 animate-[slideIn_0.2s_ease-out]">
        
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className={`w-12 h-12 rounded-full ${style.iconBg} flex items-center justify-center`}>
            <AlertCircle className={`w-6 h-6 ${style.icon}`} />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-black text-center mb-2">
          {title}
        </h3>

        {/* Message */}
        <p className="text-sm text-gray-600 text-center mb-6 leading-relaxed">
          {message}
        </p>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl font-bold hover:bg-gray-50 transition-all text-base"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 px-4 py-3 ${style.button} text-white rounded-xl font-bold transition-all text-base shadow-lg`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
