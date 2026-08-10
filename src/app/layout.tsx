import "~/styles/globals.css";

import { type Metadata } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";

import { AuthProvider } from "~/_components/auth-provider";
import { ThemeProvider } from "~/_components/theme-provider";
import { TRPCReactProvider } from "~/trpc/react";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

// DEPRECATED — retained for out-of-scope surfaces only. See globals.css.
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  axes: ["opsz"],
});

export const metadata: Metadata = {
  title: "northstar",
  description: "habit tracker for the locked in",
  icons: [{ rel: "icon", url: "/northstar-logo.png" }],
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
