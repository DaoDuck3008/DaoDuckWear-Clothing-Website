"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
export default function NotFound() {
  const router = useRouter();
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black min-h-screen">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-center py-32 px-16 bg-white dark:bg-black sm:items-start">
        <h1 className="max-w-xs text-3xl font-bold leading-10 tracking-tight text-black dark:text-zinc-50">
          <span className="text-6xl text-gray-400">404</span> - Không tìm thấy
          trang
        </h1>
        <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400 mt-4">
          Trang bạn đang tìm không tồn tại.
        </p>
        <div className="flex gap-2">
          <Link
            href="/"
            className="mt-8 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-black px-5 text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200 md:w-[158px]"
          >
            Trang chủ
          </Link>
          <button
            onClick={() => router.back()}
            className="mt-8 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-black px-5 text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200 md:w-[158px]"
          >
            Quay lại trang trước
          </button>
        </div>
      </main>
    </div>
  );
}
