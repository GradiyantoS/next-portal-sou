import Busboy from "busboy";
import type { IncomingHttpHeaders } from "http";
import type { Readable } from "stream";
import * as XLSX from "xlsx";
import type { GuestRow } from "@/types/guest";

export function parseExcelFromBusboy(
  req: Readable & { headers: IncomingHttpHeaders }
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const busboy = Busboy({ headers: req.headers });
    const fileBuffer: Buffer[] = [];

    busboy.on("file", (_fieldname, file) => {
      file.on("data", (data: Buffer) => fileBuffer.push(data));
      file.on("end", () => resolve(Buffer.concat(fileBuffer)));
    });

    busboy.on("error", reject);
    req.pipe(busboy);
  });
}

export function mapExcelData(buffer: Buffer, weddingCode: string): GuestRow[] {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);

  return rows.map((row): GuestRow => {
    const name = typeof row.name === "string" ? row.name.trim() : "";

    const isMatrimonyAttendee =
      typeof row["Holy Matrimony attendee"] === "string" &&
      row["Holy Matrimony attendee"].toLowerCase() === "yes";

    const isCelebrationAttendee =
      typeof row["Wedding ceremony attendee"] === "string" &&
      row["Wedding ceremony attendee"].toLowerCase() === "yes";

    const isFixedPax =
      typeof row["fixed Pax"] === "string" &&
      row["fixed Pax"].toLowerCase() === "yes";

    const paxLimit =
      typeof row["Maximum Pax"] === "number"
        ? row["Maximum Pax"]
        : Number(row["Maximum Pax"]) || 4;

    return {
      name,
      is_matrimony_attendee: isMatrimonyAttendee,
      is_celebration_attendee: isCelebrationAttendee,
      is_fixed_pax: isFixedPax,
      pax_limit: paxLimit,
      wedding_code: weddingCode,
    };
  });
}
