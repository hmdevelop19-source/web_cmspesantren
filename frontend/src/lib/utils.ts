export const getImageUrl = (path: string | null | undefined): string => {
  if (!path) return '';
  
  // If it's already an absolute URL, return it
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  const baseUrl = 'http://localhost:8000';
  
  // Clean the path to ensure it starts with / but not //
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  return `${baseUrl}${cleanPath}`;
};
