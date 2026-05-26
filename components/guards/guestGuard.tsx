"use client";

import { Suspense } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { LoadingLayer } from "../ui/LoadingLayer";

function GuestGuardInner({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s.hydrated);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";
  const isToasted = useRef(false);

  useEffect(() => {
    if (hydrated && user && !isToasted.current) {
      isToasted.current = true;
      router.replace(redirect);
      toast.info("Bạn đã đăng nhập!");
    }
  }, [user, hydrated, router, redirect]);

  if (!hydrated) return <LoadingLayer isLoading={!hydrated} />;
  if (user) return null;
  return <>{children}</>;
}

export default function GuestGuard({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <GuestGuardInner>{children}</GuestGuardInner>
    </Suspense>
  );
}
