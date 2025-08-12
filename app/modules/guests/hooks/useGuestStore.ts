// src/modules/guests/hooks/useGuestStore.ts
import { useEffect, useState, useMemo } from 'react';
import { GuestRow } from '../types/guest';
import * as guestService from '../../../services/guestService';

interface GuestFilter {
  name: string;
  is_attending?: boolean;
}

export function useGuestStore(weddingCode: string) {
  const [guests, setGuests] = useState<GuestRow[]>([]);
  const [filter, setFilter] = useState<GuestFilter>({ name: '' });
  const [page, setPage] = useState(1);
  const pageSize = 5;

  // Load guests from API
  useEffect(() => {
    if (!weddingCode) return;
    guestService
      .fetchGuests(weddingCode, { page, limit: pageSize })
      .then((data) => {
        setGuests(data);
      })
      .catch((err) => {
        console.error('Failed to load guests:', err);
      });
  }, [weddingCode, page]);

  // Filtering
  const filtered = useMemo(() => {
    return guests.filter((g) => {
      const matchesName = g.name.toLowerCase().includes(filter.name.toLowerCase());
      const matchesAttending =
        filter.is_attending === undefined || g.is_attending === filter.is_attending;
      return matchesName && matchesAttending;
    });
  }, [guests, filter]);

  // Pagination after filtering
  const pagedGuests = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  return {
    guests,
    pagedGuests,
    page,
    pageSize,
    filter,
    setFilter,
    setPage,
    insert: async (data: GuestRow) => {
      const result = await guestService.createGuest(weddingCode, data);
      setGuests((prev) => [...prev, result]);
    },
    update: async (id: string, data: Partial<GuestRow>) => {
      const result = await guestService.updateGuest(weddingCode, id, data);
      setGuests((prev) => prev.map((g) => (g.guest_id === id ? result : g)));
    },
    remove: async (id: string) => {
      await guestService.deleteGuest(weddingCode, id);
      setGuests((prev) => prev.filter((g) => g.guest_id !== id));
    },
    bulkInsert: async (file: File) => {
      const result = await guestService.bulkUploadGuests(weddingCode, file);
      setGuests((prev) => [...prev, ...result]);
    },
  };
}
