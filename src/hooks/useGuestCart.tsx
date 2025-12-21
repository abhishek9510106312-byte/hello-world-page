import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CartProduct {
  id: string;
  name: string;
  price: number;
  image_url?: string;
  weight_kg?: number;
}

interface CartWorkshop {
  id: string;
  title: string;
  price: number;
  image_url?: string;
  duration?: string;
}

interface LocalCartItem {
  id: string;
  product_id?: string;
  workshop_id?: string;
  quantity: number;
  item_type: 'product' | 'workshop';
  product?: CartProduct;
  workshop?: CartWorkshop;
}

interface GuestCartContextType {
  items: LocalCartItem[];
  loading: boolean;
  addToCart: (item: { 
    productId?: string; 
    workshopId?: string; 
    itemType: 'product' | 'workshop';
    product?: CartProduct;
    workshop?: CartWorkshop;
  }) => Promise<void>;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getShippingCost: () => number;
  itemCount: number;
  syncCartToUser: (userId: string) => Promise<void>;
}

const GuestCartContext = createContext<GuestCartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'basho_guest_cart';

const getStoredCart = (): LocalCartItem[] => {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveCart = (items: LocalCartItem[]) => {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
};

export function GuestCartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<LocalCartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [hasSynced, setHasSynced] = useState(false);

  // Listen for auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const newUserId = session?.user?.id || null;
      setUserId(newUserId);
      
      // Reset sync flag when user logs out
      if (!newUserId) {
        setHasSynced(false);
      }
    });

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load cart from localStorage on mount
  useEffect(() => {
    setItems(getStoredCart());
    setLoading(false);
  }, []);

  // Save to localStorage whenever items change
  useEffect(() => {
    if (!loading) {
      saveCart(items);
    }
  }, [items, loading]);

  // Sync local cart to Supabase when user logs in
  const syncCartToUser = useCallback(async (uid: string) => {
    if (hasSynced || items.length === 0) return;
    
    const sessionId = localStorage.getItem('cart_session_id') || crypto.randomUUID();
    localStorage.setItem('cart_session_id', sessionId);

    try {
      // Get existing cart items for user
      const { data: existingItems } = await supabase
        .from('cart_items')
        .select('product_id, workshop_id, item_type, quantity')
        .eq('user_id', uid);

      const existingProductIds = new Set(existingItems?.filter(i => i.product_id).map(i => i.product_id));
      const existingWorkshopIds = new Set(existingItems?.filter(i => i.workshop_id).map(i => i.workshop_id));

      // Filter out items that already exist in DB
      const newItems = items.filter(item => {
        if (item.item_type === 'product' && item.product_id) {
          return !existingProductIds.has(item.product_id);
        }
        if (item.item_type === 'workshop' && item.workshop_id) {
          return !existingWorkshopIds.has(item.workshop_id);
        }
        return false;
      });

      if (newItems.length > 0) {
        const insertData = newItems.map(item => ({
          session_id: sessionId,
          user_id: uid,
          product_id: item.product_id || null,
          workshop_id: item.workshop_id || null,
          item_type: item.item_type,
          quantity: item.quantity,
        }));

        await supabase.from('cart_items').insert(insertData);
        toast.success(`${newItems.length} item(s) synced to your cart`);
      }

      // Clear local storage after sync
      localStorage.removeItem(CART_STORAGE_KEY);
      setItems([]);
      setHasSynced(true);
    } catch (error) {
      console.error('Error syncing cart:', error);
    }
  }, [items, hasSynced]);

  // Auto-sync when user logs in
  useEffect(() => {
    if (userId && items.length > 0 && !hasSynced) {
      syncCartToUser(userId);
    }
  }, [userId, items.length, hasSynced, syncCartToUser]);

  const addToCart = useCallback(async ({ 
    productId, 
    workshopId, 
    itemType,
    product,
    workshop 
  }: { 
    productId?: string; 
    workshopId?: string; 
    itemType: 'product' | 'workshop';
    product?: CartProduct;
    workshop?: CartWorkshop;
  }) => {
    // If user is logged in, use Supabase directly
    if (userId) {
      const sessionId = localStorage.getItem('cart_session_id') || crypto.randomUUID();
      localStorage.setItem('cart_session_id', sessionId);

      // Check if item already exists
      const { data: existing } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('user_id', userId)
        .eq(itemType === 'product' ? 'product_id' : 'workshop_id', productId || workshopId)
        .maybeSingle();

      if (existing) {
        if (itemType === 'product') {
          await supabase
            .from('cart_items')
            .update({ quantity: existing.quantity + 1 })
            .eq('id', existing.id);
          toast.success('Added to cart');
        } else {
          toast.info('Workshop already in cart');
        }
        return;
      }

      const { error } = await supabase.from('cart_items').insert({
        session_id: sessionId,
        user_id: userId,
        product_id: productId || null,
        workshop_id: workshopId || null,
        item_type: itemType,
        quantity: 1,
      });

      if (error) {
        toast.error('Failed to add to cart');
      } else {
        toast.success('Added to cart');
      }
      return;
    }

    // Guest user - use localStorage
    setItems(prev => {
      const existingIndex = prev.findIndex(item => 
        (itemType === 'product' && item.product_id === productId) ||
        (itemType === 'workshop' && item.workshop_id === workshopId)
      );

      if (existingIndex >= 0) {
        if (itemType === 'product') {
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: updated[existingIndex].quantity + 1,
          };
          toast.success('Added to cart');
          return updated;
        } else {
          toast.info('Workshop already in cart');
          return prev;
        }
      }

      toast.success('Added to cart');
      return [...prev, {
        id: crypto.randomUUID(),
        product_id: productId,
        workshop_id: workshopId,
        quantity: 1,
        item_type: itemType,
        product,
        workshop,
      }];
    });
  }, [userId]);

  const removeFromCart = useCallback((itemId: string) => {
    setItems(prev => prev.filter(item => item.id !== itemId));
  }, []);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, quantity } : item
    ));
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setItems([]);
    localStorage.removeItem(CART_STORAGE_KEY);
  }, []);

  const getTotal = useCallback(() => {
    return items.reduce((total, item) => {
      const price = item.product?.price || item.workshop?.price || 0;
      return total + (price * item.quantity);
    }, 0);
  }, [items]);

  const getShippingCost = useCallback(() => {
    const totalWeight = items.reduce((weight, item) => {
      if (item.product?.weight_kg) {
        return weight + (item.product.weight_kg * item.quantity);
      }
      return weight;
    }, 0);
    return Math.ceil(totalWeight) * 100;
  }, [items]);

  const itemCount = items.reduce((count, item) => count + item.quantity, 0);

  return (
    <GuestCartContext.Provider value={{
      items,
      loading,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getTotal,
      getShippingCost,
      itemCount,
      syncCartToUser,
    }}>
      {children}
    </GuestCartContext.Provider>
  );
}

export function useGuestCart() {
  const context = useContext(GuestCartContext);
  if (context === undefined) {
    throw new Error('useGuestCart must be used within a GuestCartProvider');
  }
  return context;
}
