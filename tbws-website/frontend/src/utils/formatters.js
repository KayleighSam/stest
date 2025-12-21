import { format, formatDistanceToNow, parseISO } from 'date-fns';

export const formatDate = (date) => {
  if (!date) return '';
  return format(parseISO(date), 'MMMM dd, yyyy');
};

export const formatDateTime = (date) => {
  if (!date) return '';
  return format(parseISO(date), 'MMMM dd, yyyy • h:mm a');
};

export const formatRelativeTime = (date) => {
  if (!date) return '';
  return formatDistanceToNow(parseISO(date), { addSuffix: true });
};

export const truncateText = (text, maxLength) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  return `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${imagePath}`;
};