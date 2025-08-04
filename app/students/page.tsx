"use client";

import { Container } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useEffect, useState } from "react";
import { Student, StudentFormData } from "../modules/students/types/student";
import { mockApi } from "../modules/students/utils/mockApi";

import StudentTable from "../modules/students/components/StudentTable";
import StudentFormModal from "../modules/students/components/StudentFormModal";
import { parseExcelFile } from "../modules/students/utils/excelParser";

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [filterName, setFilterName] = useState("");
  const [filterAttending, setFilterAttending] = useState<boolean | undefined>(
    undefined
  );
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [opened, { open, close }] = useDisclosure(false);

  const [page, setPage] = useState(1);
  const pageSize = 5;

  useEffect(() => {
    const fetch = async () => {
      const result = await mockApi.get();
      setStudents(result);
    };
    fetch();
  }, []);

  const handleFilterChange = (name: string, attending: boolean | undefined) => {
    setFilterName(name);
    setFilterAttending(attending);
    setPage(1);
  };

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(filterName.toLowerCase()) &&
      (filterAttending === undefined || s.isAttending === filterAttending)
  );

  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(filtered.length / pageSize);

  const handleAdd = () => {
    setEditingStudent(null);
    open();
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    open();
  };

  const handleDelete = (id: number) => {
    setStudents((prev) => prev.filter((s) => s.id !== id));
  };

  const handleSubmit = (data: StudentFormData) => {
    if (editingStudent) {
      setStudents((prev) =>
        prev.map((s) =>
          s.id === editingStudent.id ? { ...editingStudent, ...data } : s
        )
      );
    } else {
      const newStudent: Student = {
        id: Math.max(...students.map((s) => s.id), 0) + 1,
        ...data,
      };
      setStudents((prev) => [...prev, newStudent]);
    }
    close();
  };

  const handleBulkInsert = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".xlsx,.xls";

    input.onchange = async (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        const file = target.files[0];
        const newStudents = await parseExcelFile(file);
        const nextId = Math.max(...students.map((s) => s.id), 0) + 1;
        const withIds = newStudents.map((s, idx) => ({
          ...s,
          id: nextId + idx,
        }));
        setStudents((prev) => [...prev, ...withIds]);
      }
    };

    input.click();
  };

  return (
    <Container size="lg" py="xl">
      <StudentTable
        students={paged}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAddClick={handleAdd}
        onBulkInsertClick={handleBulkInsert}
        filterName={filterName}
        filterAttending={filterAttending}
        onFilterChange={handleFilterChange}
      />

      <StudentFormModal
        opened={opened}
        onClose={close}
        initial={editingStudent ?? undefined}
        onSubmit={handleSubmit}
        mode={editingStudent ? "edit" : "add"}
      />
    </Container>
  );
}
