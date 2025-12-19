/**
 * Cloudinary Image Optimization Utilities
 * 
 * Applies automatic transformations for:
 * - Responsive width
 * - Smart quality compression
 * - Auto format (WebP for modern browsers)
 */

/**
 * Generate optimized Cloudinary URL with transformations
 * @param {string} photoUrl - Original Cloudinary URL
 * @param {number} width - Desired width in pixels
 * @returns {string} Optimized URL with transformations
 */
export const getOptimizedImageUrl = (photoUrl, width = 800) => {
  if (!photoUrl) return '';
  
  // Check if it's a Cloudinary URL
  if (!photoUrl.includes('cloudinary.com')) {
    return photoUrl; // Return as-is if not Cloudinary
  }

  // Check if transformations already exist
  if (photoUrl.includes('/upload/')) {
    // Insert transformations after /upload/
    return photoUrl.replace(
      '/upload/',
      `/upload/w_${width},q_auto,f_auto/`
    );
  }

  // Fallback: append as query params
  return `${photoUrl}?w_${width},q_auto,f_auto`;
};

/**
 * Generate srcSet for responsive images at different screen densities
 * @param {string} photoUrl - Original Cloudinary URL
 * @returns {string} srcSet string with multiple sizes
 */
export const getResponsiveSrcSet = (photoUrl) => {
  if (!photoUrl || !photoUrl.includes('cloudinary.com')) {
    return '';
  }

  return `
    ${getOptimizedImageUrl(photoUrl, 400)} 400w,
    ${getOptimizedImageUrl(photoUrl, 800)} 800w,
    ${getOptimizedImageUrl(photoUrl, 1200)} 1200w
  `.trim();
};

/**
 * Default sizes attribute for responsive images
 * Works for most tattoo photo display scenarios
 */
export const DEFAULT_SIZES = "(max-width: 640px) 400px, (max-width: 1024px) 800px, 1200px";
