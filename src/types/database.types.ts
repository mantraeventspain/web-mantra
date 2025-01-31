type Tables = Database["public"]["Tables"];

export interface Database {
  public: {
    Tables: {
      events: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          date: string;
          location: string;
          image_url: string | null;
          price: number;
          tickets_available: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Tables["events"]["Row"],
          "id" | "created_at" | "updated_at"
        >;
        Update: Partial<Tables["events"]["Insert"]>;
      };
      products: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          price: number;
          image_url: string | null;
          stock: number;
          category: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Tables["products"]["Row"],
          "id" | "created_at" | "updated_at"
        >;
        Update: Partial<Tables["products"]["Insert"]>;
      };
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          updated_at: string;
        };
        Insert: Omit<Tables["profiles"]["Row"], "updated_at">;
        Update: Partial<Tables["profiles"]["Insert"]>;
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          quantity: number;
          price_at_time: number;
          created_at: string;
        };
        Insert: Omit<Tables["order_items"]["Row"], "id" | "created_at">;
        Update: Partial<Tables["order_items"]["Insert"]>;
      };
    };
  };
}
