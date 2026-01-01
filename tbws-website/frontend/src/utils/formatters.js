export const getImageUrl = (imagePath) => {
  // Handle null/undefined
  if (!imagePath) {
    return null;
  }

  // Handle File objects (when user uploads new image)
  if (imagePath instanceof File) {
    return URL.createObjectURL(imagePath);
  }

  // Handle Blob URLs (already created preview)
  if (typeof imagePath === 'string' && imagePath.startsWith('blob:')) {
    return imagePath;
  }

  // Handle string paths
  if (typeof imagePath !== 'string') {
    console.warn('Invalid image path type:', typeof imagePath, imagePath);
    return null;
  }

  // If it's already a full URL, return it
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // If it starts with /media/, return it as is
  if (imagePath.startsWith('/media/')) {
    return `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000'}${imagePath}`;
  }

  // Otherwise, prepend the media URL
  return `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000'}/media/${imagePath}`;
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
};

export const formatDateTime = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};