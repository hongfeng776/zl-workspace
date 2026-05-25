export interface Merchant {
  id: string;
  name: string;
  category: string;
  categoryType: 'food' | 'hotel' | 'travel' | 'shopping' | 'entertainment' | 'life';
  rating: number;
  reviewCount: number;
  address: string;
  distance: number;
  priceLevel: 1 | 2 | 3 | 4;
  avgPrice: number;
  tags: string[];
  image: string;
  promotion?: string;
  isHot?: boolean;
  isOpen: boolean;
  location: {
    lat: number;
    lng: number;
  };
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  type: 'food' | 'hotel' | 'travel' | 'shopping' | 'entertainment' | 'life';
  color: string;
}

export interface HotContent {
  id: string;
  title: string;
  description: string;
  image: string;
  type: 'article' | 'activity' | 'discount';
  link?: string;
}

export interface UserLocation {
  city: string;
  district: string;
  address: string;
  lat: number;
  lng: number;
}

export interface SearchFilter {
  keyword: string;
  category: string;
  radius: number;
  sortBy: 'distance' | 'rating' | 'price' | 'default';
  priceRange?: [number, number];
}
