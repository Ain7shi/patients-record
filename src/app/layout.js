"use client"
import "./globals.css";

import { AuthProvider } from "@/components/context/authProvider";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
