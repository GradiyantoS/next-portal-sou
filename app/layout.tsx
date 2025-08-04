import "@mantine/core/styles.css";
import { ColorSchemeScript } from "@mantine/core";
import React from "react";
import { MantineWrapper } from "./mantine-wrapper";

export const metadata = {
  title: "My App",
  description: "Using Mantine with Next.js",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <ColorSchemeScript />
      </head>
      <body>
        <MantineWrapper>{children}</MantineWrapper>
      </body>
    </html>
  );
}
