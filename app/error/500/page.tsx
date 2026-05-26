import { AlertCircle } from "lucide-react";
import Link from "next/link";

export default function InternalServerErrorPage({
  error,
}: {
  error: string | null;
}) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 px-4 text-center">
      <AlertCircle className="w-12 h-12 text-stone-200" />
      <div>
        <h2 className="text-xl font-serif font-bold mb-2">
          Oops! Có lỗi xảy ra
        </h2>
        <p className="text-stone-500 text-sm max-w-md mx-auto">
          {error || "Không tìm thấy sản phẩm này."}
        </p>
      </div>
      <Link
        href="/products"
        className="bg-black text-white px-8 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-stone-800 transition-all"
      >
        Quay lại cửa hàng
      </Link>
    </div>
  );
}
