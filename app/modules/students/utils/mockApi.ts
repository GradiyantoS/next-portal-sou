import { Student, StudentFormData } from '../types/student';

let mockStudents: Student[] = [
  { id: 1, name: 'Alice', nim: '001', averageScore: 85, isAttending: true },
  { id: 2, name: 'Bob', nim: '002', averageScore: 78, isAttending: false },
  { id: 3, name: 'Charlie', nim: '003', averageScore: 92, isAttending: true },
];

let nextId = 4;

export const mockApi = {
  get: async (): Promise<Student[]> => {
    await new Promise((r) => setTimeout(r, 300));
    return [...mockStudents];
  },
  create: async (data: StudentFormData): Promise<Student> => {
    const newStudent = { id: nextId++, ...data };
    mockStudents.push(newStudent);
    return newStudent;
  },
  update: async (id: number, data: StudentFormData): Promise<Student> => {
    const index = mockStudents.findIndex((s) => s.id === id);
    if (index === -1) throw new Error('Not found');
    mockStudents[index] = { id, ...data };
    return mockStudents[index];
  },
  delete: async (id: number): Promise<void> => {
    mockStudents = mockStudents.filter((s) => s.id !== id);
  },
  bulkInsert: async (data: StudentFormData[]): Promise<Student[]> => {
    const newRecords = data.map((d) => ({ id: nextId++, ...d }));
    mockStudents.push(...newRecords);
    return newRecords;
  },
};
