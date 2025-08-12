import '@mantine/core/styles.css';
import { ColorSchemeScript } from '@mantine/core';
import React from 'react';
import { MantineRoot } from './mantine-root';

export const metadata = {
  title: 'Guests',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* v8: still valid; choose 'light' | 'dark' | 'auto' */}
        <ColorSchemeScript defaultColorScheme="light" />
      </head>
      <body>
        <MantineRoot>{children}</MantineRoot>
      </body>
    </html>
  );
}
