// src/services/guestService.ts
import axios from 'axios';
import { GuestRow } from '../modules/guests/types/guest';

const API_BASE = '/api/guests';

export interface FetchGuestsParams {
  page: number;
  limit: number;
  name?: string;
  is_attending?: boolean;
}

// Get paginated guests
export const fetchGuests = async (
  weddingCode: string,
  params: FetchGuestsParams
): Promise<GuestRow[]> => {
  const res = await axios.get<GuestRow[]>(`${API_BASE}/${weddingCode}`, { params });
  return res.data;
};

// Create a new guest
export const createGuest = async (
  weddingCode: string,
  data: Omit<GuestRow, 'id' | 'guest_id' | 'created_at' | 'updated_at'>
): Promise<GuestRow> => {
  const res = await axios.post<GuestRow>(`${API_BASE}/${weddingCode}`, data);
  return res.data;
};

// Update an existing guest
export const updateGuest = async (
  weddingCode: string,
  id: string,
  data: Partial<Omit<GuestRow, 'id' | 'guest_id' | 'created_at' | 'updated_at'>>
): Promise<GuestRow> => {
  const res = await axios.put<GuestRow>(`${API_BASE}/${weddingCode}/${id}`, data);
  return res.data;
};

// Delete a guest
export const deleteGuest = async (
  weddingCode: string,
  id: string
): Promise<{ success: boolean }> => {
  const res = await axios.delete<{ success: boolean }>(`${API_BASE}/${weddingCode}/${id}`);
  return res.data;
};

// Bulk upload guests from file
export const bulkUploadGuests = async (
  weddingCode: string,
  file: File
): Promise<GuestRow[]> => {
  const formData = new FormData();
  formData.append('file', file);

  const res = await axios.post<GuestRow[]>(`${API_BASE}/${weddingCode}/bulk-upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return res.data;
};