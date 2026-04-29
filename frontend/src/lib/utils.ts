export const getImageUrl = (path: string | null | undefined): string => {
  if (!path) return '';
  
  // If it's already an absolute URL, return it
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  const baseUrl = 'http://localhost:8000';
  
  // In Laravel, public disk files are served via the /storage/ symlink
  // We ensure we don't double the /storage prefix if it's already there
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  if (cleanPath.startsWith('/storage/')) {
    return `${baseUrl}${cleanPath}`;
  }
  
  return `${baseUrl}/storage${cleanPath}`;
};
