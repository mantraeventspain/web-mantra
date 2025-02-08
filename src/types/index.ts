export interface Event {
  id: string;
  title: string;
  description: string | null;
  date: string;
  location: string;
  imageUrl: string | null;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  stock: number;
  category: string;
}

export interface CartItem {
  id: string;
  quantity: number;
  type: "event" | "product";
}
