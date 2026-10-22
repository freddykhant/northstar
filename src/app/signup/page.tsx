"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Squii } from "~/_components/brand/squii";
import { Wordmark } from "~/_components/brand/wordmark";
import { Card } from "~/_components/ui/primitives";
import type { SquiiExpression } from "~/lib/squii";
import { api } from "~/trpc/react";

/** How long Squii holds his gold before we leave for /home. */
const SUCCESS_HOLD_MS = 600;

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [expression, setExpression] = useState<SquiiExpression>("resting");

  const signUpMutation = api.auth.signUp.useMutation({
    onSuccess: async () => {
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
        setExpression("gold");
        await new Promise((resolve) => setTimeout(resolve, SUCCESS_HOLD_MS));
        router.push("/home");
      }
    },
    onError: (error) => {
      setError(error.message);
      setIsLoading(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
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

  const inputClass =
    "w-full rounded-[var(--radius-control)] border border-[var(--color-field-border)] bg-transparent px-3 py-3 text-[16px] text-[var(--color-ink)] focus:border-[var(--color-mind)] focus:outline-none";
  const labelClass =
    "mb-1.5 block text-[11px] tracking-[0.14em] text-[var(--color-ink-muted)] uppercase";

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[var(--color-wash-from)] to-[var(--color-wash-to)] px-4 py-12 text-[var(--color-ink)]">
      <div className="w-full max-w-sm">
        {/* The Wordmark is a role="img" labelled "squii", so the Link carries
            no aria-label of its own (same as landing-nav). The glyph is
            decorative. */}
        <Link href="/" className="mb-8 flex flex-col items-center gap-3">
          <Squii size={64} expression={expression} />
          <Wordmark height={30} />
        </Link>

        <Card className="p-8">
          <div className="mb-6">
            <h1 className="text-title mb-1 text-[var(--color-ink)]">Begin</h1>
            <p className="text-[13px] text-[var(--color-ink-muted)]">
              Create your account to start tracking.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            aria-busy={isLoading}
            className="space-y-4"
          >
            <div className="flex gap-3">
              <div className="flex-1">
                <label htmlFor="firstName" className={labelClass}>
                  First name
                </label>
                <input
                  id="firstName"
                  autoComplete="given-name"
                  aria-describedby={error ? "form-error" : undefined}
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="John"
                  required
                  className={inputClass}
                />
              </div>
              <div className="flex-1">
                <label htmlFor="lastName" className={labelClass}>
                  Last name
                </label>
                <input
                  id="lastName"
                  autoComplete="family-name"
                  aria-describedby={error ? "form-error" : undefined}
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                  required
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className={labelClass}>
                Email
              </label>
              <input
                id="email"
                autoComplete="email"
                aria-describedby={error ? "form-error" : undefined}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                required
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="password" className={labelClass}>
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  autoCapitalize="none"
                  spellCheck={false}
                  aria-describedby={error ? "form-error" : undefined}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() =>
                    setExpression((e) =>
                      e === "gold" || showPassword ? e : "shy",
                    )
                  }
                  onBlur={() =>
                    setExpression((e) => (e === "gold" ? e : "resting"))
                  }
                  placeholder="Min. 8 characters"
                  required
                  className={inputClass + " pr-12"}
                />
                <button
                  type="button"
                  aria-label="Show password"
                  aria-pressed={showPassword}
                  onClick={() => {
                    const willShow = !showPassword;
                    setShowPassword(willShow);
                    // Hidden while the field still has focus: shy. Otherwise
                    // the field has lost focus to this button: resting.
                    const stillTyping =
                      !willShow && document.activeElement?.id === "password";
                    setExpression((e) =>
                      e === "gold" ? e : stillTyping ? "shy" : "resting",
                    );
                  }}
                  className="absolute top-1/2 right-0 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-ink)]"
                >
                  <svg
                    aria-hidden
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {showPassword ? (
                      <>
                        <path d="M3 3l18 18" />
                        <path d="M10.6 6.1A9.9 9.9 0 0 1 12 6c5 0 8.5 4 9.5 6a14 14 0 0 1-2.6 3.3M6.6 6.7A14 14 0 0 0 2.5 12c1 2 4.5 6 9.5 6 1.4 0 2.7-.3 3.8-.8" />
                        <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
                      </>
                    ) : (
                      <>
                        <path d="M2.5 12C3.5 10 7 6 12 6s8.5 4 9.5 6c-1 2-4.5 6-9.5 6S3.5 14 2.5 12z" />
                        <circle cx="12" cy="12" r="3" />
                      </>
                    )}
                  </svg>
                </button>
              </div>
            </div>

            {error && (
              <div
                id="form-error"
                role="alert"
                className="rounded-[var(--radius-control)] border border-[var(--color-body)]/30 bg-[var(--color-body)]/8 px-3 py-2 text-[13px] text-[var(--color-body-ink)]"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-full bg-[var(--color-ink)] px-7 py-3.5 text-[15px] font-semibold text-[var(--color-canvas)] hover:opacity-90 disabled:opacity-50"
            >
              {isLoading ? "Creating account…" : "Create account"}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3 text-[10px] tracking-[0.14em] text-[var(--color-ink-muted)] uppercase">
            <div className="h-px flex-1 bg-[var(--color-hairline)]" />
            or
            <div className="h-px flex-1 bg-[var(--color-hairline)]" />
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-[var(--color-hairline)] bg-transparent py-3.5 text-[15px] font-medium text-[var(--color-ink)] hover:border-[var(--color-ink-faint)]"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
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
            Continue with Google
          </button>
        </Card>

        <p className="mt-6 text-center text-[13px] text-[var(--color-ink)]">
          Already have an account?{" "}
          <Link
            href="/signin"
            className="inline-flex min-h-11 items-center font-medium text-[var(--color-ink)] underline underline-offset-4"
          >
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
