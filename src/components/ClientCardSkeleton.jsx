export default function ClientCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100/50 animate-pulse">
      {/* Image Skeleton */}
      <div className="relative bg-gray-200 h-48 sm:h-56">
        <div className="absolute top-3 right-3 w-16 h-7 bg-gray-300 rounded-full"></div>
      </div>

      {/* Content Skeleton */}
      <div className="p-4 space-y-3">
        {/* Name */}
        <div className="h-5 bg-gray-200 rounded w-3/4"></div>
        
        {/* Email */}
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-gray-200 rounded-full"></div>

        {/* Date Info */}
        <div className="flex items-center justify-between pt-1">
          <div className="h-3 bg-gray-200 rounded w-20"></div>
          <div className="h-3 bg-gray-200 rounded w-16"></div>
        </div>
      </div>
    </div>
  );
}
