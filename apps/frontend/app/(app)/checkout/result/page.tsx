"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { StatusModal } from "@/components/ui/StatusModal";

export default function CheckoutResultPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const status = searchParams.get("status");
  const orderCode = searchParams.get("orderCode") ?? "";
  const isSuccess = status === "success";

  return (
    <>
      <StatusModal
        isOpen={isSuccess}
        onClose={() => router.push("/")}
        type="success"
        title="Thanh toán thành công!"
        message={`Cảm ơn bạn đã tin tưởng DaoDuck Wear. Đơn hàng ${orderCode} đã được thanh toán và đang được xử lý.`}
        buttonText="Về trang chủ"
      />
      <StatusModal
        isOpen={!isSuccess}
        onClose={() => router.push("/checkout")}
        type="warning"
        title="Thanh toán thất bại"
        message="Giao dịch không thành công hoặc đã bị hủy. Vui lòng thử lại hoặc chọn phương thức thanh toán khác."
        buttonText="Thử lại"
      />
    </>
  );
}
