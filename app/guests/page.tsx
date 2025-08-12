// app/guests/page.tsx
'use client';

import { Container } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';

import { useGuestStore } from '../modules/guests/hooks/useGuestStore';
import GuestTable from '../modules/guests/components/GuestTable';
import GuestFormModal from '../modules/guests/components/GuestFormModal';
import { GuestRow } from '../modules/guests/types/guest';

export default function GuestsPage() {
  const searchParams = useSearchParams();

  // Persist / read wedding code (later you’ll set this via login)
  const [weddingCode, setWeddingCode] = useState('');
  useEffect(() => {
    const fromQuery = searchParams.get('wedding_code');
    const fromStorage = typeof window !== 'undefined' ? localStorage.getItem('wedding_code') : null;
    const code = fromQuery ?? fromStorage ?? '';
    if (code) {
      setWeddingCode(code);
      if (typeof window !== 'undefined') localStorage.setItem('wedding_code', code);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount

  const store = useGuestStore(weddingCode);

  // Modal state
  const [editingGuest, setEditingGuest] = useState<GuestRow | null>(null);
  const [opened, { open, close }] = useDisclosure(false);

  // Total pages based on current filter in the store
  const filteredCount = useMemo(() => {
    const name = store.filter.name.toLowerCase();
    const att = store.filter.is_attending;
    return store.guests.filter((g) => {
      const matchesName = g.name.toLowerCase().includes(name);
      const matchesAtt = att === undefined || g.is_attending === att;
      return matchesName && matchesAtt;
    }).length;
  }, [store.guests, store.filter]);

  const totalPages = Math.max(1, Math.ceil(filteredCount / store.pageSize));

  // Handlers
  const handleAdd = () => {
    setEditingGuest(null);
    open();
  };

  const handleEdit = (guest: GuestRow) => {
    setEditingGuest(guest);
    open();
  };

  const handleDelete = (idNum: number) => {
    // Bridge numeric id from table to the real identifier (guest_id preferred)
    const target = store.guests.find(
      (g) => (g.id ?? Number.NaN) === idNum || Number(g.guest_id) === idNum,
    );
    const deleteId = target?.guest_id ?? String(idNum);
    store.remove(deleteId);
  };

  const handleSubmit = async (values: GuestRow) => {
    // Always enforce wedding_code here (field can be hidden in the modal UI)
    const payload = { ...values, wedding_code: weddingCode };

    if (editingGuest) {
      const id = editingGuest.guest_id ?? String(editingGuest.id ?? '');
      await store.update(id, payload);
    } else {
      await store.insert(payload);
    }
    close();
  };

  const handleBulkInsert = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx,.xls';

    input.onchange = async (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        await store.bulkInsert(target.files[0]); // sends raw file to /bulk-upload
      }
    };

    input.click();
  };

  return (
    <Container size="lg" py="xl">
      <GuestTable
        guests={store.pagedGuests}
        page={store.page}
        totalPages={totalPages}
        onPageChange={store.setPage}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAddClick={handleAdd}
        onBulkInsertClick={handleBulkInsert}
        filterName={store.filter.name}
        filterAttending={store.filter.is_attending}
        onFilterChange={(name, attending) => store.setFilter({ name, is_attending: attending })}
      />

      <GuestFormModal
        opened={opened}
        onClose={close}
        initial={
          editingGuest ?? {
            name: '',
            is_matrimony_attendee: false,
            is_celebration_attendee: false,
            is_fixed_pax: false,
            pax_limit: 0,
            wedding_code: weddingCode, // prefill (the field can be hidden in the component)
          }
        }
        onSubmit={handleSubmit}
        mode={editingGuest ? 'edit' : 'add'}
      />
    </Container>
  );
}
