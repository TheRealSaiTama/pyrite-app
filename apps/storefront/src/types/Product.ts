export interface Product {
  id: string | number;
  name: string;
  image: string;
  minPrice?: number | null;
  maxPrice?: number | null;
  price?: number;
  currency: 'INR' | 'USD';
  description?: string;
  rating?: number;
  reviewCount?: number;
  category?: string | null;
}
