import { Readable } from 'node:stream';
import { type NextRequest } from 'next/server';
import Busboy from 'busboy';
import { supabase } from '../../../../utils/dbClient';
import { mapExcelData } from '../../../../utils/api/parseExcel';
import { type GuestRow } from '../../../../modules/guests/types/guest';

export const runtime = 'nodejs';

async function getBufferFromBusboy(stream: Readable, contentType: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const busboy = Busboy({ headers: { 'content-type': contentType } });

    const chunks: Buffer[] = [];

    busboy.on('file', (_fieldname, file) => {
      file.on('data', (data) => chunks.push(data));
      file.on('end', () => resolve(Buffer.concat(chunks)));
    });

    busboy.on('error', (err) => reject(err instanceof Error ? err : new Error(String(err))));
    stream.pipe(busboy);
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: { wedding_code: string } },
): Promise<Response> {
  try {
    const { wedding_code } = params;
    const contentType = req.headers.get('content-type');

    if (!contentType) {
      return new Response(JSON.stringify({ message: 'Missing content-type' }), {
        status: 400,
      });
    }

    if (!(req.body instanceof ReadableStream)) {
      return new Response(JSON.stringify({ message: 'Invalid body stream' }), {
        status: 400,
      });
    }

    // Convert ReadableStream to Node.js Readable
    const reader = req.body.getReader();
    const stream = new Readable({
      async read() {
        const { done, value } = await reader.read();
        this.push(done ? null : Buffer.from(value));
      },
    });

    const buffer = await getBufferFromBusboy(stream, contentType);
    const guests: GuestRow[] = mapExcelData(buffer, wedding_code);

    const { data: existing, error: fetchError } = await supabase
      .from('guests')
      .select('name')
      .eq('wedding_code', wedding_code);

    if (fetchError) {
      throw new Error(fetchError.message);
    }

    const existingNames = new Set((existing ?? []).map((g) => g.name));
    const duplicates = guests.filter((g) => existingNames.has(g.name));

    if (duplicates.length > 0) {
      return new Response(
        JSON.stringify({
          message: 'Duplicate guest names found',
          duplicates,
        }),
        { status: 400 },
      );
    }
    console.log('[Uploading Guests]', guests);

    const { error: insertError } = await supabase.from('guests').insert(guests);

    if (insertError) {
      throw new Error(insertError.message);
    }

    return new Response(JSON.stringify({ message: 'Guests uploaded successfully' }), {
      status: 200,
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        message: 'Internal Server Error',
        error: (error as Error).message,
      }),
      { status: 500 },
    );
  }
}
