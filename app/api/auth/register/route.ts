import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabase } from '../../../utils/dbClient';
import { signToken } from '../../../utils/jwt';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const username = String(body?.username ?? '').trim();
    const password = String(body?.password ?? '');
    const weddingCode = String(body?.wedding_code ?? '').trim();
    const remember: boolean = Boolean(body?.remember); // optional

    if (!username || !password || !weddingCode) {
      return NextResponse.json(
        { message: 'username, password, and wedding_code are required' },
        { status: 400 },
      );
    }

    // Enforce uniqueness
    const { data: existing, error: existingErr } = await supabase
      .from('credentials')
      .select('username')
      .eq('username', username)
      .maybeSingle();

    if (existingErr) {
      return NextResponse.json({ message: 'Query failed' }, { status: 500 });
    }
    if (existing) {
      return NextResponse.json({ message: 'Username already exists' }, { status: 409 });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Insert user
    const { data: created, error: insertErr } = await supabase
      .from('credentials')
      .insert([
        {
          username,
          password_hash: passwordHash,
          wedding_code: weddingCode,
        },
      ])
      .select('username,wedding_code')
      .single();

    if (insertErr || !created) {
      return NextResponse.json({ message: 'Failed to create user' }, { status: 500 });
    }

    // Sign JWT & set cookies (immediate login)
    const token = await signToken(
      { sub: created.username, wedding_code: created.wedding_code },
      remember ? '7d' : '1d',
    );

    const res = NextResponse.json({
      token,
      wedding_code: created.wedding_code,
      username: created.username,
    });

    const maxAge = remember ? 7 * 24 * 60 * 60 : undefined;
    res.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      ...(maxAge ? { maxAge } : {}),
    });
    res.cookies.set('wedding_code', created.wedding_code, {
      httpOnly: true, // keep server-readable only
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      ...(maxAge ? { maxAge } : {}),
    });

    return res;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Register error', e);
    return NextResponse.json({ message: 'Unexpected error' }, { status: 500 });
  }
}
