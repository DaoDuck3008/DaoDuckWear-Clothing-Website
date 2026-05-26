"use client";

import { useAuthStore } from "@/stores/auth.store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { LoadingLayer } from "../ui/LoadingLayer";

interface Props {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: Props) {
  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s.hydrated);
  const router = useRouter();

  // Use a local state or check for window to avoid SSR mismatch if needed,
  // but useEffect is safe for this.
  const pathname =
    typeof window !== "undefined" ? window.location.pathname : "";

  useEffect(() => {
    if (hydrated && !user) {
      toast.warning("Bạn cần đăng nhập để vào trang này.");
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [user, router, hydrated, pathname]);

  if (!hydrated) return <LoadingLayer isLoading={!hydrated} />;

  if (!user) return null;

  return <>{children}</>;
}
