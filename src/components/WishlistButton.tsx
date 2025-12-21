import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { useWishlist } from '@/hooks/useWishlist';
import { cn } from '@/lib/utils';

interface WishlistButtonProps {
  product: {
    id: string;
    name: string;
    price: number;
    image_url?: string;
    category: string;
  };
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  variant?: 'icon' | 'overlay';
}

export function WishlistButton({ product, size = 'md', className, variant = 'icon' }: WishlistButtonProps) {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const isWishlisted = isInWishlist(product.id);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isWishlisted) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const sizeClasses = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
  };

  const iconSizes = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  if (variant === 'overlay') {
    return (
      <motion.button
        onClick={handleClick}
        className={cn(
          'absolute top-3 right-3 z-10 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 flex items-center justify-center transition-all duration-300',
          sizeClasses[size],
          isWishlisted 
            ? 'bg-destructive/10 border-destructive/30' 
            : 'hover:bg-background hover:border-border',
          className
        )}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        <Heart 
          className={cn(
            iconSizes[size],
            'transition-colors duration-300',
            isWishlisted 
              ? 'fill-destructive text-destructive' 
              : 'text-muted-foreground hover:text-foreground'
          )} 
        />
      </motion.button>
    );
  }

  return (
    <motion.button
      onClick={handleClick}
      className={cn(
        'rounded-full flex items-center justify-center transition-all duration-300',
        sizeClasses[size],
        isWishlisted 
          ? 'bg-destructive/10 text-destructive' 
          : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground',
        className
      )}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <Heart 
        className={cn(
          iconSizes[size],
          isWishlisted && 'fill-current'
        )} 
      />
    </motion.button>
  );
}
