import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { toast } from 'sonner';

interface WishlistItem {
  id: string;
  name: string;
  price: number;
  image_url?: string;
  category: string;
  addedAt: number;
}

interface WishlistContextType {
  items: WishlistItem[];
  addToWishlist: (product: Omit<WishlistItem, 'addedAt'>) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
  itemCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const WISHLIST_STORAGE_KEY = 'basho_wishlist';

const getStoredWishlist = (): WishlistItem[] => {
  try {
    const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveWishlist = (items: WishlistItem[]) => {
  localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
};

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);

  // Load wishlist from localStorage on mount
  useEffect(() => {
    setItems(getStoredWishlist());
  }, []);

  // Save to localStorage whenever items change
  useEffect(() => {
    saveWishlist(items);
  }, [items]);

  const addToWishlist = useCallback((product: Omit<WishlistItem, 'addedAt'>) => {
    setItems(prev => {
      const exists = prev.some(item => item.id === product.id);
      if (exists) {
        toast.info('Already in wishlist');
        return prev;
      }
      toast.success('Added to wishlist');
      return [...prev, { ...product, addedAt: Date.now() }];
    });
  }, []);

  const removeFromWishlist = useCallback((productId: string) => {
    setItems(prev => {
      const filtered = prev.filter(item => item.id !== productId);
      if (filtered.length < prev.length) {
        toast.success('Removed from wishlist');
      }
      return filtered;
    });
  }, []);

  const isInWishlist = useCallback((productId: string) => {
    return items.some(item => item.id === productId);
  }, [items]);

  const clearWishlist = useCallback(() => {
    setItems([]);
    toast.success('Wishlist cleared');
  }, []);

  const itemCount = items.length;

  return (
    <WishlistContext.Provider value={{
      items,
      addToWishlist,
      removeFromWishlist,
      isInWishlist,
      clearWishlist,
      itemCount,
    }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
