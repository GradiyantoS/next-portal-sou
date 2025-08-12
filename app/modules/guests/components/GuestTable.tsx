"use client";

import {
  Button,
  Group,
  Table,
  TextInput,
  Pagination,
  Checkbox,
  Stack,
} from "@mantine/core";
import { IconPlus, IconUpload } from "@tabler/icons-react";
import { useState } from "react";
import { GuestRow } from "../types/guest";

interface Props {
  guests: GuestRow[];
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onEdit: (guest: GuestRow) => void;
  onDelete: (id: number) => void;
  onAddClick: () => void;
  onBulkInsertClick: () => void;
  filterName: string;
  filterAttending: boolean | undefined;
  onFilterChange: (name: string, attending: boolean | undefined) => void;
}

export default function GuestTable({
  guests,
  page,
  totalPages,
  onPageChange,
  onEdit,
  onDelete,
  onAddClick,
  onBulkInsertClick,
  filterName,
  filterAttending,
  onFilterChange,
}: Props) {
  const [name, setName] = useState(filterName);
  const [isAttending, setIsAttending] = useState(filterAttending ?? false);
  const [isAttendingChecked, setIsAttendingChecked] = useState<
    boolean | undefined
  >(filterAttending);

  const applyFilter = () => {
    onFilterChange(name, isAttendingChecked ? isAttending : undefined);
  };

  return (
    <Stack>
      {/* Filter controls */}
      <Group>
        <TextInput
          placeholder="Search by name"
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
        />
        <Checkbox
          label="Enable 'Is Attending' Filter"
          checked={isAttendingChecked}
          onChange={(e) => setIsAttendingChecked(e.currentTarget.checked)}
        />
        <Checkbox
          label="Is Attending"
          disabled={!isAttendingChecked}
          checked={isAttending}
          onChange={(e) => setIsAttending(e.currentTarget.checked)}
        />
        <Button onClick={applyFilter}>Apply Filter</Button>
        <Button leftSection={<IconPlus size={16} />} onClick={onAddClick}>
          Add Guest
        </Button>
        <Button
          leftSection={<IconUpload size={16} />}
          variant="light"
          onClick={onBulkInsertClick}
        >
          Bulk Upload
        </Button>
      </Group>

      {/* Table */}
      <Table striped withRowBorders highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Name</Table.Th>
            <Table.Th>Matrimony Attendee</Table.Th>
            <Table.Th>Celebration Attendee</Table.Th>
            <Table.Th>Fixed Pax</Table.Th>
            <Table.Th>Pax Limit</Table.Th>
            <Table.Th>Is Attending</Table.Th>
            <Table.Th>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {guests.map((guest) => (
            <Table.Tr key={guest.id ?? guest.guest_id}>
              <Table.Td>{guest.name}</Table.Td>
              <Table.Td>{guest.is_matrimony_attendee ? "Yes" : "No"}</Table.Td>
              <Table.Td>{guest.is_celebration_attendee ? "Yes" : "No"}</Table.Td>
              <Table.Td>{guest.is_fixed_pax ? "Yes" : "No"}</Table.Td>
              <Table.Td>{guest.pax_limit}</Table.Td>
              <Table.Td>{guest.is_attending ? "Yes" : "No"}</Table.Td>
              <Table.Td>
                <Group gap="xs">
                  <Button
                    size="xs"
                    variant="light"
                    onClick={() => onEdit(guest)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="xs"
                    variant="light"
                    color="red"
                    onClick={() =>
                      onDelete(guest.id ?? Number(guest.guest_id))
                    }
                  >
                    Delete
                  </Button>
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      {/* Pagination */}
      <Pagination total={totalPages} value={page} onChange={onPageChange} />
    </Stack>
  );
}