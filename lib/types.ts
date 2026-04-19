/* ============================================
   PAW PALACE — TYPE DEFINITIONS
   ============================================ */

export type PetCategory = "dog" | "cat" | "bird" | "fish" | "small-pet" | "reptile";

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: PetCategory;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  images: string[];
  hoverImage?: string;
  badge?: "new" | "sale" | "bestseller" | "limited";
  tags: string[];
  description: string;
  inStock: boolean;
  freeShipping: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

export interface Review {
  id: string;
  author: string;
  avatar: string;
  rating: number;
  date: string;
  text: string;
  photo?: string;
  petName?: string;
  petType?: PetCategory;
  verified: boolean;
}

export interface Category {
  id: PetCategory;
  label: string;
  emoji: string;
  image: string;
  productCount: number;
  color: string;
}

export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

export interface Feature {
  icon: string;
  title: string;
  description: string;
}
