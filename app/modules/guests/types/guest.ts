export type GuestRow = {
  id?: number;
  guest_id?: string;
  name: string;
  is_matrimony_attendee: boolean;
  is_celebration_attendee: boolean;
  is_fixed_pax: boolean;
  pax_limit: number;
  wedding_code: string;
  is_attending?: boolean;
  pax_actual?: number;
  pax_actual_limit?: number;
  created_at?: string;
  updated_at?: string;
};
