export interface ServiceProvider {
  id: number | string;
  name: string;
  profession: string;
  rating: number;
  reviews: number;
  location: string;
  hourlyRate: number;
  imageUrl?: string;
  category?: string;
  email: string;
  phone?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  priceId?: string;
  active: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  read: boolean;
}

export interface Chat {
  id: string;
  participants: string[];
  lastMessage?: string;
  lastMessageTimestamp?: Date;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  featured?: boolean;
  active: boolean;
}