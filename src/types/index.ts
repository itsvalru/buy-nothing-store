import { UUID } from "crypto";

export interface Product {
  sales_count: number;
  uuid: UUID;
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  category: string;
  created_at?: string;
}

export interface User {
  id: string;
  email: string;
  display_name: string;
  avatar_url: string;
  total_spent: number;
  created_at?: string;
}

export interface Purchase {
  id: string;
  user_id: string;
  product_id: string;
  method: string;
  created_at: string;
}

export interface LeaderboardEntry {
  id: string;
  display_name: string;
  avatar_url: string;
  total_spent: number;
}

export type PaymentMethod = "creditcard" | "paypal" | "klarna";

export interface croppedAreaPixelsType {
  x: number;
  y: number;
  width: number;
  height: number;
}
