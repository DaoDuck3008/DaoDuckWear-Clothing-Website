"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { forgotPassword } from "@/apis/auth.api";
import { handleApiError } from "@/utils/error.util";
import AuthImagePanel from "@/components/auth/AuthImagePanel";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Vui lòng nhập email");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Email không hợp lệ");
      return;
    }

    setLoading(true);
    try {
      await forgotPassword(email);
      toast.info("Nếu email tồn tại, mã xác thực đã được gửi đến hộp thư của bạn.");
      router.push(`/reset-password?email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      handleApiError(err, "Gửi yêu cầu thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white font-sans antialiased">
      <div className="hidden lg:block w-1/2 relative overflow-hidden bg-stone-100">
        <AuthImagePanel page="login" />
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16 lg:p-24 overflow-y-auto">
        <div className="w-full max-w-sm space-y-12">
          <header className="space-y-4">
            <Link
              href="/login"
              className="group flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400 hover:text-black transition-colors mb-4"
            >
              <ArrowRight className="w-3 h-3 rotate-180 group-hover:-translate-x-1 transition-transform" />
              Quay lại đăng nhập
            </Link>
            <Link
              href="/"
              className="lg:hidden font-serif text-2xl font-bold tracking-tighter mb-8 block"
            >
              DAODUCK WEAR
            </Link>
            <h1 className="font-cormorant text-4xl lg:text-5xl font-bold tracking-tighter uppercase text-black">
              Quên mật khẩu
            </h1>
            <p className="text-stone-400 text-xs uppercase tracking-widest leading-loose">
              Nhập địa chỉ email đã đăng ký. Chúng tôi sẽ gửi mã xác thực để
              đặt lại mật khẩu của bạn.
            </p>
          </header>

          <form onSubmit={handleSubmit} noValidate className="space-y-10">
            <div className="space-y-2 group">
              <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400 group-focus-within:text-black transition-colors">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError("");
                }}
                className={`w-full bg-transparent border-b ${error ? "border-red-500" : "border-stone-200"} focus:border-black py-3 text-sm transition-colors outline-none font-medium`}
                placeholder="example@daoduckwear.com"
              />
              {error && (
                <p className="text-[10px] text-red-500 uppercase tracking-wider">
                  {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-4 px-6 text-[11px] font-bold uppercase tracking-[0.25em] flex items-center justify-center gap-3 hover:bg-stone-800 transition-all disabled:bg-stone-300 active:scale-[0.99]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang gửi...
                </>
              ) : (
                <>
                  Gửi mã xác thực
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <footer className="border-t border-stone-100 pt-6">
            <p className="text-[10px] text-stone-400 uppercase tracking-widest text-center">
              Đã có mã?{" "}
              <Link
                href={`/reset-password${email ? `?email=${encodeURIComponent(email)}` : ""}`}
                className="text-black hover:underline"
              >
                Đặt lại mật khẩu
              </Link>
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
