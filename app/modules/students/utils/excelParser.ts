import * as XLSX from 'xlsx';
import { StudentFormData } from '../types/student';

export async function parseExcelFile(file: File): Promise<StudentFormData[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const data = new Uint8Array(event.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
      }) as string[][];

      const [header, ...rows] = json;
      const nameIdx = header.findIndex((h) => h.toLowerCase().includes('name'));
      const nimIdx = header.findIndex((h) => h.toLowerCase().includes('nim'));
      const scoreIdx = header.findIndex((h) =>
        h.toLowerCase().includes('average')
      );
      const attendingIdx = header.findIndex((h) =>
        h.toLowerCase().includes('attending')
      );

      const students: StudentFormData[] = rows.map((row) => ({
        name: row[nameIdx]?.toString() ?? '',
        nim: row[nimIdx]?.toString() ?? '',
        averageScore: Number(row[scoreIdx] ?? 0),
        isAttending: row[attendingIdx]?.toString().toLowerCase() === 'true',
      }));

      resolve(students);
    };

    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}
