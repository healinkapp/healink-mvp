const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

export const uploadToCloudinary = async (file) => {
  // Validate file
  if (!file) {
    throw new Error('No file provided');
  }

  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    throw new Error('File size exceeds 10MB limit');
  }

  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type. Please upload JPG, PNG or WebP');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'healink_unsigned');
  formData.append('folder', 'tattoos');

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || 'Upload failed');
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    
    // Re-throw with more context
    if (error.message.includes('Failed to fetch')) {
      throw new Error('Network error. Check your connection');
    }
    
    throw error;
  }
};
