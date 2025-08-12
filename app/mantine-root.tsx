'use client';

import { MantineProvider } from '@mantine/core';
import { useEffect, useState } from 'react';

export function MantineRoot({ children }: { children: React.ReactNode }) {
  // Optional: guard to avoid SSR/CSR mismatch flashes
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return <MantineProvider>{children}</MantineProvider>;
}
