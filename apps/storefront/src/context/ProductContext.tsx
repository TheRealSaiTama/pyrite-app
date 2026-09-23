"use client";
import * as React from 'react';
import { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import type { Product } from '@/types/Product';

export interface CartItem {
  id: string | number;
  name: string;
  image: string;
  price: number;
  quantity: number;
  moq: number;
  slug?: string;
  category?: string | null;
}

interface ProductContextType {
  // Cart state and actions
  cart: CartItem[];
  addToCart: (
    item: {
      id: string | number;
      name: string;
      image?: string;
      price: number;
      moq?: number;
      slug?: string;
      category?: string | null;
    },
    quantity?: number,
  ) => void;
  updateQuantity: (id: string | number, quantity: number) => void;
  removeFromCart: (id: string | number) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
  cartGst: number;
  cartTotal: number;

  // Favourites
  favourites: (string | number)[];
  toggleFavourite: (id: string | number) => void;
  isFavourite: (id: string | number) => boolean;

  // Backwards compatibility for legacy enquiry modals
  selectedProducts: Product[];
  selectProduct: (productLike: Partial<Product> | any) => void;
  deselectProduct: (id: string | number) => void;
  clearSelected: () => void;
  isSelected: (id: string | number) => boolean;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

function normalizeProduct(input: Partial<Product> | any): Product {
  return {
    id: input.id,
    name: String(input.name ?? ""),
    image: String(input.image ?? ""),
    price: Number(input.price ?? 0),
    currency: (input.currency ?? "INR") as Product["currency"],
    rating: input.rating != null ? Number(input.rating) : 0,
  };
}

const CART_STORAGE_KEY = "pyrite_cart_v1";
const FAVS_STORAGE_KEY = "pyrite_favs_v1";

export function ProductProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [favourites, setFavourites] = useState<(string | number)[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Load cart and favourites from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
      const savedFavs = localStorage.getItem(FAVS_STORAGE_KEY);
      if (savedFavs) {
        setFavourites(JSON.parse(savedFavs));
      }
    } catch (e) {
      console.error("Failed to load cart from storage", e);
    } finally {
      setHydrated(true);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error("Failed to save cart to storage", e);
    }
  }, [cart, hydrated]);

  // Save favourites to localStorage whenever it changes
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(FAVS_STORAGE_KEY, JSON.stringify(favourites));
    } catch (e) {
      console.error("Failed to save favourites to storage", e);
    }
  }, [favourites, hydrated]);

  const addToCart = useCallback((
    item: {
      id: string | number;
      name: string;
      image?: string;
      price: number;
      moq?: number;
      slug?: string;
      category?: string | null;
    },
    quantity?: number,
  ) => {
    const moq = Math.max(1, Number(item.moq) || 50);
    const qty = Math.max(moq, Number(quantity) || moq);

    setCart((prev) => {
      const index = prev.findIndex((p) => String(p.id) === String(item.id));
      if (index >= 0) {
        const next = [...prev];
        next[index] = {
          ...next[index],
          moq,
          quantity: next[index].quantity + qty,
        };
        return next;
      }
      return [
        ...prev,
        {
          id: item.id,
          name: item.name,
          image: item.image || "/file.svg",
          price: Number(item.price) || 0,
          quantity: qty,
          moq,
          slug: item.slug,
          category: item.category,
        },
      ];
    });
  }, []);

  const updateQuantity = useCallback((id: string | number, quantity: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (String(item.id) !== String(id)) return item;
        const validQty = Math.max(item.moq || 1, quantity);
        return { ...item, quantity: validQty };
      }),
    );
  }, []);

  const removeFromCart = useCallback((id: string | number) => {
    setCart((prev) => prev.filter((item) => String(item.id) !== String(id)));
  }, []);

  const clearCart = useCallback(() => {
    setCart((prev) => (prev.length === 0 ? prev : []));
  }, []);

  const toggleFavourite = useCallback((id: string | number) => {
    setFavourites((prev) =>
      prev.some((f) => String(f) === String(id))
        ? prev.filter((f) => String(f) !== String(id))
        : [...prev, id],
    );
  }, []);

  const isFavourite = useCallback((id: string | number) => {
    return favourites.some((f) => String(f) === String(id));
  }, [favourites]);

  // Calculations
  const cartCount = cart.length; // number of distinct product lines
  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartGst = Math.round(cartSubtotal * 0.18 * 100) / 100;
  const cartTotal = cartSubtotal + cartGst;

  // Legacy functions
  const selectProduct = useCallback((productLike: Partial<Product> | any) => {
    const product = normalizeProduct(productLike);
    setSelectedProducts((prev) =>
      prev.some((p) => String(p.id) === String(product.id)) ? prev : [...prev, product],
    );
  }, []);

  const deselectProduct = useCallback((id: string | number) => {
    setSelectedProducts((prev) => prev.filter((p) => String(p.id) !== String(id)));
  }, []);

  const clearSelected = useCallback(() => {
    setSelectedProducts((prev) => (prev.length === 0 ? prev : []));
  }, []);

  const isSelected = useCallback((id: string | number) => {
    return selectedProducts.some((p) => String(p.id) === String(id));
  }, [selectedProducts]);

  const value = useMemo(
    () => ({
      cart,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      cartCount,
      cartSubtotal,
      cartGst,
      cartTotal,
      favourites,
      toggleFavourite,
      isFavourite,
      selectedProducts,
      selectProduct,
      deselectProduct,
      clearSelected,
      isSelected,
    }),
    [
      cart,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      cartCount,
      cartSubtotal,
      cartGst,
      cartTotal,
      favourites,
      toggleFavourite,
      isFavourite,
      selectedProducts,
      selectProduct,
      deselectProduct,
      clearSelected,
      isSelected,
    ],
  );

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
}

export function useCart() {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a ProductProvider');
  }
  return context;
}

export function useSelectedProducts() {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useSelectedProducts must be used within a ProductProvider');
  }
  return context;
}
