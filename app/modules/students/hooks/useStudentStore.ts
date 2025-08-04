// src/modules/students/hooks/useStudentStore.ts
import { useEffect, useState, useMemo } from 'react';
import { Student, StudentFormData } from '../types/student';
import { mockApi } from '../utils/mockApi';

export function useStudentStore() {
  const [students, setStudents] = useState<Student[]>([]);
  const [filter, setFilter] = useState({
    name: '',
    isAttending: undefined as boolean | undefined,
  });
  const [page, setPage] = useState(1);
  const pageSize = 5;

  useEffect(() => {
    mockApi.get().then(setStudents);
  }, []);

  const filtered = useMemo(() => {
    return students.filter((s) => {
      const matchesName = s.name
        .toLowerCase()
        .includes(filter.name.toLowerCase());
      const matchesAttending =
        filter.isAttending === undefined ||
        s.isAttending === filter.isAttending;
      return matchesName && matchesAttending;
    });
  }, [students, filter]);

  const pagedStudents = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  return {
    students,
    pagedStudents,
    page,
    pageSize,
    filter,
    setFilter,
    setPage,
    insert: async (data: StudentFormData) => {
      const result = await mockApi.create(data);
      setStudents((prev) => [...prev, result]);
    },
    update: async (id: number, data: StudentFormData) => {
      const result = await mockApi.update(id, data);
      setStudents((prev) => prev.map((s) => (s.id === id ? result : s)));
    },
    remove: async (id: number) => {
      await mockApi.delete(id);
      setStudents((prev) => prev.filter((s) => s.id !== id));
    },
    bulkInsert: async (data: StudentFormData[]) => {
      const result = await mockApi.bulkInsert(data);
      setStudents((prev) => [...prev, ...result]);
    },
  };
}
