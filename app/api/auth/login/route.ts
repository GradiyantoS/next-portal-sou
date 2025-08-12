import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabase } from '../../../utils/dbClient';
import { signToken } from '../../../utils/jwt';

type LoginBody = {
  username: string;
  password: string;
  remember?: boolean;
};

type CredentialRow = {
  username: string;
  password_hash: string | null; // recommended
  wedding_code: string;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<LoginBody>;
    const username = body.username?.trim() ?? '';
    const password = body.password ?? '';
    const remember = Boolean(body.remember);

    if (!username || !password) {
      return NextResponse.json({ message: 'Username and password are required' }, { status: 400 });
    }

    // Typed Supabase query
    const { data, error } = await supabase
      .from('credentials')
      .select<
        'username,password_hash,password,wedding_code',
        CredentialRow
      >('username,password_hash,password,wedding_code')
      .eq('username', username)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ message: 'Auth query failed' }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const { password_hash, wedding_code } = data;

    // Verify (prefer hashed; allow legacy plaintext only if present)
    let ok = false;
    if (password_hash) {
      ok = await bcrypt.compare(password, password_hash);
    }

    if (!ok) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    // Sign token
    const token = await signToken({ sub: username, wedding_code }, remember ? '7d' : '1d');

    // Set HttpOnly cookies
    const res = NextResponse.json({ token, wedding_code });
    const maxAge = remember ? 7 * 24 * 60 * 60 : undefined;

    res.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      ...(maxAge ? { maxAge } : {}),
    });
    res.cookies.set('wedding_code', wedding_code, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      ...(maxAge ? { maxAge } : {}),
    });

    return res;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Login error', err);
    return NextResponse.json({ message: 'Unexpected error' }, { status: 500 });
  }
}
