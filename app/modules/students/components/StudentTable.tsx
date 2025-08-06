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
import { IconSearch, IconPlus, IconUpload } from "@tabler/icons-react";
import { useState } from "react";
import { Student } from "../types/student";

interface Props {
  students: Student[];
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onEdit: (student: Student) => void;
  onDelete: (id: number) => void;
  onAddClick: () => void;
  onBulkInsertClick: () => void;
  filterName: string;
  filterAttending: boolean | undefined;
  onFilterChange: (name: string, attending: boolean | undefined) => void;
}

export default function StudentTable({
  students,
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
      <Group>
        <TextInput
          placeholder="Search by name"
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
        />
        <Checkbox
          label="Filter Is Attending"
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
          Add Student
        </Button>
        <Button
          leftSection={<IconUpload size={16} />}
          variant="light"
          onClick={onBulkInsertClick}
        >
          Bulk Insert
        </Button>
      </Group>

      <Table striped withRowBorders highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Name</Table.Th>
            <Table.Th>NIM</Table.Th>
            <Table.Th>Average Score</Table.Th>
            <Table.Th>Is Attending</Table.Th>
            <Table.Th>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {students.map((student) => (
            <Table.Tr key={student.id}>
              <Table.Td>{student.name}</Table.Td>
              <Table.Td>{student.nim}</Table.Td>
              <Table.Td>{student.averageScore}</Table.Td>
              <Table.Td>{student.isAttending ? "Yes" : "No"}</Table.Td>
              <Table.Td>
                <Group gap="xs">
                  <Button
                    size="xs"
                    variant="light"
                    onClick={() => onEdit(student)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="xs"
                    variant="light"
                    color="red"
                    onClick={() => onDelete(student.id)}
                  >
                    Delete
                  </Button>
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      <Pagination total={totalPages} value={page} onChange={onPageChange} />
    </Stack>
  );
}
