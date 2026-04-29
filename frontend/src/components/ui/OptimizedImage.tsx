import { useState } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: string;
}

const OptimizedImage = ({ src, alt, className = "", aspectRatio = "aspect-video" }: OptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div className={`relative overflow-hidden bg-gray-100 ${aspectRatio} ${className}`}>
      {/* Skeleton/Placeholder Loader */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100" />
      )}

      {/* Error State */}
      {hasError ? (
        <div className="absolute inset-0 flex items-center justify-center text-gray-300">
          <span className="text-[10px] font-bold uppercase tracking-widest">Gagal Memuat Gambar</span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={`h-full w-full object-cover transition-all duration-1000 ${
            isLoaded ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-110 blur-xl'
          }`}
        />
      )}
    </div>
  );
};

export default OptimizedImage;
