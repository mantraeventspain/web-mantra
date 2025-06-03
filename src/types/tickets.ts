export interface TicketEvent {
  id: string;
  name: string;
  url: string;
  is_active: boolean;
  display_order: number;
  created_at: string | null;
  updated_at: string | null;
}

export interface TicketEventInsert {
  name: string;
  url: string;
  is_active?: boolean;
  display_order: number;
}

export interface TicketEventUpdate {
  name?: string;
  url?: string;
  is_active?: boolean;
  display_order?: number;
}
