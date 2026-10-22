import "~/styles/globals.css";

import { type Metadata, type Viewport } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";

import { AuthProvider } from "~/_components/auth-provider";
import { ThemeProvider } from "~/_components/theme-provider";
import { TRPCReactProvider } from "~/trpc/react";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  // REQUIRED. Omitting `axes` silently loads the default instance with no
  // wonk — the font arrives, the character does not, and nothing errors.
  axes: ["SOFT", "WONK", "opsz"],
});

export const metadata: Metadata = {
  title: "squii",
  description: "a habit tracker that lights up the days you showed up",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f3f8" },
    { media: "(prefers-color-scheme: dark)", color: "#131219" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${jakarta.variable} ${fraunces.variable}`}
    >
      <body className="font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          <AuthProvider>
            <TRPCReactProvider>{children}</TRPCReactProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
