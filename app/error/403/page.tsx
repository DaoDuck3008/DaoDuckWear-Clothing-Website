"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function ForbiddenContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");

  return (
    <div className="min-h-screen flex items-center justify-center bg-editorial-background px-6">
      <div className="max-w-md w-full text-center space-y-12">
        <div className="space-y-4">
          <h1 className="text-8xl font-bold tracking-tighter text-editorial-primary">
            403
          </h1>
          <h2 className="text-2xl font-bold tracking-tight text-editorial-primary uppercase">
            Truy cập bị từ chối
          </h2>
          <div className="h-px w-12 bg-editorial-accent mx-auto"></div>
        </div>

        <p className="text-stone-500 text-sm leading-relaxed">
          Rất tiếc, bạn không có quyền truy cập vào khu vực này. <br />
          Vui lòng liên hệ quản trị viên hoặc quay lại trang chủ.
        </p>

        <div className="pt-8 flex gap-4 justify-center">
          <button
            onClick={() =>
              callbackUrl ? router.push(callbackUrl) : router.back()
            }
            className="inline-block bg-black text-white px-12 py-4 text-[11px] font-bold uppercase tracking-[0.2em] transition-all hover:bg-stone-800"
          >
            Quay lại
          </button>
          <button
            onClick={() => router.push("/")}
            className="inline-block bg-black text-white px-12 py-4 text-[11px] font-bold uppercase tracking-[0.2em] transition-all hover:bg-stone-800"
          >
            Quay lại trang chủ
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ForbiddenPage() {
  return (
    <Suspense fallback={null}>
      <ForbiddenContent />
    </Suspense>
  );
}
