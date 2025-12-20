import { Sparkles } from 'lucide-react';
import { getOptimizedImageUrl } from '../utils/imageOptimization';

export default function BeforeAfter({ beforePhoto, afterPhoto }) {
  if (!beforePhoto || !afterPhoto) return null;
  
  return (
    <div className="bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-green-200/50 p-5 sm:p-7">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-blue-500 text-white px-4 py-2 rounded-full mb-3 shadow-md">
          <Sparkles className="w-4 h-4" />
          <span className="text-sm font-bold uppercase tracking-wide">Your Transformation</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
          30 Days of Healing
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          From fresh ink to fully healed
        </p>
      </div>
      
      {/* Before/After Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {/* Before */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-gray-700 uppercase tracking-wide">Day 0</p>
            <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-semibold">
              Fresh
            </span>
          </div>
          <div className="relative overflow-hidden rounded-xl shadow-xl ring-2 ring-gray-200">
            <img 
              src={getOptimizedImageUrl(beforePhoto, 800)}
              alt="Day 0 - Fresh tattoo"
              className="w-full aspect-square object-cover"
            />
          </div>
          <p className="text-xs text-gray-500 text-center">
            When plasma was still present
          </p>
        </div>
        
        {/* After */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-gray-700 uppercase tracking-wide">Day 30</p>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">
              Healed
            </span>
          </div>
          <div className="relative overflow-hidden rounded-xl shadow-xl ring-2 ring-green-200">
            <img 
              src={getOptimizedImageUrl(afterPhoto, 800)}
              alt="Day 30 - Fully healed"
              className="w-full aspect-square object-cover"
            />
          </div>
          <p className="text-xs text-gray-500 text-center">
            Skin fully regenerated
          </p>
        </div>
      </div>
      
      {/* Footer Message */}
      <div className="mt-6 text-center bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/50">
        <p className="text-sm font-semibold text-gray-900">
          🎉 Congratulations on completing your healing journey!
        </p>
        <p className="text-xs text-gray-600 mt-1">
          Your dedication to proper aftercare shows in these amazing results
        </p>
      </div>
    </div>
  );
}
