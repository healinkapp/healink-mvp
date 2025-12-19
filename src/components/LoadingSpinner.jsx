import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ size = 'md', text = '' }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <Loader2 className={`${sizes[size]} text-black animate-spin`} />
      {text && (
        <p className={`${textSizes[size]} text-gray-600 font-medium`}>
          {text}
        </p>
      )}
    </div>
  );
}
