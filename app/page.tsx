'use client';

import {
  Button, Checkbox, Paper, PasswordInput, Stack, TextInput, Title, Alert,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { login } from './services/authService';
import { setCookie } from './utils/cookies';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // avoid hydration mismatch in App Router
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const form = useForm({
    initialValues: {
      username: '',
      password: '',
      remember: true,
    },
    validate: {
      username: (v) => (v.trim().length < 2 ? 'Username is required' : null),
      password: (v) => (v.length < 1 ? 'Password is required' : null),
    },
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(values: typeof form.values) {
    setError(null);
    setLoading(true);
    try {
      const res = await login(values.username, values.password);

      // set cookies for middleware + client usage
      const days = values.remember ? 7 : undefined;
      setCookie('auth_token', res.token, days);
      setCookie('wedding_code', res.wedding_code, days);

      // optional: also keep localStorage if you prefer
      // localStorage.setItem('wedding_code', res.wedding_code);

      const to = searchParams.get('from') || '/guests';
      router.replace(to);
    } catch (e: any) {
      setError(e?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Stack align="center" mt="xl">
      <Paper withBorder p="lg" w={420}>
        <Title order={3} mb="md">Sign in</Title>

        {error && (
          <Alert color="red" mb="md">
            {error}
          </Alert>
        )}

        <form onSubmit={form.onSubmit(onSubmit)}>
          <Stack>
            <TextInput label="Username" {...form.getInputProps('username')} required />
            <PasswordInput label="Password" {...form.getInputProps('password')} required />
            <Checkbox label="Remember me for 7 days" {...form.getInputProps('remember', { type: 'checkbox' })} />
            <Button type="submit" loading={loading}>Login</Button>
          </Stack>
        </form>
      </Paper>
    </Stack>
  );
}
