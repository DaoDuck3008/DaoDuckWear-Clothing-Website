"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black min-h-screen">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-center py-32 px-16 bg-white dark:bg-black sm:items-start">
        <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
          Something went wrong
        </h1>
        <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400 mt-4">
          An unexpected error occurred.
        </p>
        <div className="flex gap-4 mt-8">
          <button
            className="flex h-12 items-center justify-center gap-2 rounded-full bg-black px-5 text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
            onClick={() => reset()}
          >
            Try again
          </button>
          <button
            className="flex h-12 items-center justify-center gap-2 rounded-full border border-zinc-200 px-5 text-black transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:text-white dark:hover:bg-zinc-900"
            onClick={() => router.push("/")}
          >
            Go to Home
          </button>
        </div>
      </main>
    </div>
  );
}
