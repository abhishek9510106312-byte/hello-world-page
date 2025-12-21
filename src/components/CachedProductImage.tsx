import { useState, useEffect, useRef, memo } from "react";
import { motion } from "framer-motion";

interface CachedProductImageProps {
  src: string;
  alt: string;
  className?: string;
}

// Global cache to track loaded images across component instances
const loadedImages = new Set<string>();

const CachedProductImage = memo(({ src, alt, className }: CachedProductImageProps) => {
  const [isLoaded, setIsLoaded] = useState(loadedImages.has(src));
  const [isInView, setIsInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Lazy loading with Intersection Observer
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "100px", threshold: 0 }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Load image only when in view
  useEffect(() => {
    if (!isInView) return;
    if (loadedImages.has(src)) {
      setIsLoaded(true);
      return;
    }

    const img = new Image();
    img.onload = () => {
      loadedImages.add(src);
      setIsLoaded(true);
    };
    img.src = src;
  }, [src, isInView]);

  return (
    <div ref={containerRef} className="relative w-full h-full">
      {/* Skeleton loader */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-muted via-muted/80 to-muted animate-pulse">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-background/20 to-transparent skeleton-shimmer" />
        </div>
      )}
      
      {isInView && (
        <motion.img
          src={src}
          alt={alt}
          className={className}
          initial={false}
          animate={{ opacity: isLoaded ? 1 : 0 }}
          whileHover={{ scale: 1.08 }}
          transition={{ 
            opacity: { duration: loadedImages.has(src) ? 0 : 0.3 },
            scale: { duration: 0.6, ease: "easeOut" }
          }}
        />
      )}
    </div>
  );
});

CachedProductImage.displayName = "CachedProductImage";

export default CachedProductImage;
