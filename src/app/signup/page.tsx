"use client";

import { PanelLeftOpen } from "lucide-react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "~/trpc/react";

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const signUpMutation = api.auth.signUp.useMutation({
    onSuccess: async () => {
      // After successful signup, sign in automatically
      setIsLoading(true);
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Account created but sign in failed. Please try logging in.");
        setIsLoading(false);
      } else {
        router.push("/home");
      }
    },
    onError: (error) => {
      setError(error.message);
      setIsLoading(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!email || !password || !firstName || !lastName) {
      setError("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    signUpMutation.mutate({ email, password, firstName, lastName });
  };

  const handleGoogleSignIn = () => {
    void signIn("google", { callbackUrl: "/home" });
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#0a0a0a] text-white">
      {/* Base dark gradient layer */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 50% 50%, rgba(38, 35, 32, 0.4) 0%, transparent 50%),
            radial-gradient(ellipse 60% 40% at 50% 45%, rgba(45, 40, 35, 0.3) 0%, transparent 40%),
            radial-gradient(ellipse 100% 80% at 50% 50%, rgba(25, 23, 22, 0.5) 0%, transparent 60%)
          `,
        }}
      />
      {/* Subtle noise texture overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
      <main className="relative z-10 flex flex-1 items-center justify-center px-4">
        <div className="w-full max-w-100 rounded-3xl border border-zinc-800 bg-zinc-900/50 p-8">
          {/* Logo */}
          <div className="mb-6">
            <div className="mb-6 flex h-15 w-15 items-center justify-center rounded-full bg-zinc-800">
              <PanelLeftOpen className="h-7 w-7 text-zinc-400" />
            </div>
            <div className="flex flex-col gap-1">
              <h1 className="mb-1 text-xl font-semibold text-white">
                Welcome to Northstar
              </h1>
              <p className="text-sm text-zinc-400">
                Create your account to get started.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Inputs */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="mb-2 block text-sm font-medium text-white">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="John"
                    required
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-800/50 px-4 py-3 text-white placeholder-zinc-500 transition-all focus:border-transparent focus:ring-2 focus:ring-zinc-600 focus:outline-none"
                  />
                </div>
                <div className="flex-1">
                  <label className="mb-2 block text-sm font-medium text-white">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe"
                    required
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-800/50 px-4 py-3 text-white placeholder-zinc-500 transition-all focus:border-transparent focus:ring-2 focus:ring-zinc-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Email Input */}
              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  required
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-800/50 px-4 py-3 text-white placeholder-zinc-500 transition-all focus:border-transparent focus:ring-2 focus:ring-zinc-600 focus:outline-none"
                />
              </div>

              {/* Password Input */}
              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  required
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-800/50 px-4 py-3 text-white placeholder-zinc-500 transition-all focus:border-transparent focus:ring-2 focus:ring-zinc-600 focus:outline-none"
                />
              </div>

              {error && (
                <div className="rounded-xl bg-red-500/10 p-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              {/* Sign Up Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-xl bg-white py-3 font-medium text-black transition-colors hover:bg-zinc-200 disabled:opacity-50"
              >
                {isLoading ? "Creating account..." : "Sign Up"}
              </button>
            </form>
          </div>

          {/* Google Sign In */}
          <div className="mt-4 space-y-3">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-800 py-3 font-medium text-white transition-colors hover:bg-zinc-700"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign up with Google
            </button>
          </div>

          {/* Sign In Link */}
          <p className="mt-6 text-center text-sm text-zinc-400">
            Already have an account?{" "}
            <Link href="/signin" className="text-white hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
