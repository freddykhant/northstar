import { redirect } from "next/navigation";
import { auth } from "~/server/auth";

export default async function HomePage() {
  const session = await auth();

  // Protect the route - redirect to signin if not authenticated
  if (!session?.user) {
    redirect("/signin");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black text-white">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-semibold">
          Welcome, {session.user.name ?? session.user.email}! 🎉
        </h1>
        <p className="text-zinc-400">
          You&apos;re successfully logged in to Northstar.
        </p>
        <p className="mt-4 text-sm text-zinc-500">Dashboard coming soon...</p>
      </div>
    </main>
  );
}
