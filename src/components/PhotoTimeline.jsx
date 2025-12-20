import { Camera } from 'lucide-react';
import { getOptimizedImageUrl } from '../utils/imageOptimization';

export default function PhotoTimeline({ photos = [], currentDay, onUploadClick }) {
  const milestones = [
    { day: 0, label: 'Fresh Tattoo' },
    { day: 3, label: 'Start Scabbing' },
    { day: 7, label: 'Critical Week' },
    { day: 14, label: 'Halfway Healed' },
    { day: 30, label: 'Fully Healed' }
  ];
  
  const getPhotoForDay = (day) => {
    // Handle both object photos and string URLs (Day 0 photo)
    if (day === 0 && photos[0] && typeof photos[0] === 'string') {
      return { url: photos[0], day: 0 };
    }
    return photos.find(p => p && p.day === day);
  };
  
  return (
    <div className="space-y-4">
      <h3 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
        <Camera className="w-5 h-5" />
        Your Healing Journey
      </h3>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
        {milestones.map(milestone => {
          const photo = getPhotoForDay(milestone.day);
          const isPast = milestone.day <= currentDay;
          const isCurrent = milestone.day === currentDay;
          const isFuture = milestone.day > currentDay;
          
          return (
            <div key={milestone.day} className="text-center">
              {/* Day label */}
              <div className={`text-xs font-bold mb-2 ${
                isCurrent 
                  ? 'text-black' 
                  : isPast 
                  ? 'text-gray-700' 
                  : 'text-gray-400'
              }`}>
                Day {milestone.day}
              </div>
              
              {/* Photo or placeholder */}
              <div className={`relative aspect-square rounded-xl overflow-hidden shadow-md ${
                isCurrent ? 'ring-2 ring-black ring-offset-2' : ''
              }`}>
                {photo ? (
                  <img 
                    src={getOptimizedImageUrl(photo.url, 400)}
                    alt={`Day ${milestone.day}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                ) : isPast ? (
                  <button 
                    onClick={() => onUploadClick(milestone.day)}
                    className="w-full h-full flex flex-col items-center justify-center bg-gray-100 hover:bg-gray-200 transition-colors border-2 border-dashed border-gray-300 hover:border-gray-400"
                  >
                    <Camera className="w-6 h-6 text-gray-400 mb-1" />
                    <span className="text-xs text-gray-600 font-semibold">Upload</span>
                  </button>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-50 border-2 border-dashed border-gray-200">
                    <span className="text-xs text-gray-300 font-semibold">Not yet</span>
                  </div>
                )}
              </div>
              
              {/* Milestone label */}
              <p className={`text-xs font-semibold mt-2 ${
                isFuture ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {milestone.label}
              </p>
              
              {/* Upload date */}
              {photo && photo.uploadedAt && (
                <p className="text-xs text-gray-400 mt-0.5">
                  {photo.uploadedAt.toDate 
                    ? new Date(photo.uploadedAt.toDate()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                    : 'Day 0'
                  }
                </p>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Progress indicator */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <p className="text-xs text-gray-500 font-semibold">
          {photos.filter(p => p && p.day !== undefined).length} of 5 milestone photos
        </p>
        <p className="text-xs text-gray-400">
          Track your healing visually
        </p>
      </div>
    </div>
  );
}
