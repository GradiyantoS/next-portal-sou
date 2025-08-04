export interface Student {
    id: number;
    name: string;
    nim: string;
    averageScore: number;
    isAttending: boolean;
  }
  
export type StudentFormData = Omit<Student, 'id'>;