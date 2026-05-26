"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { forgotPassword, resetPassword } from "@/apis/auth.api";
import { handleApiError } from "@/utils/error.util";
import AuthImagePanel from "@/components/auth/AuthImagePanel";

const RESEND_COOLDOWN = 60;

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const focusNext = (index: number) => {
    if (index < 5) inputRefs.current[index + 1]?.focus();
  };

  const focusPrev = (index: number) => {
    if (index > 0) inputRefs.current[index - 1]?.focus();
  };

  const handleDigitChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const char = value.slice(-1);
    const next = [...digits];
    next[index] = char;
    setDigits(next);
    if (char) focusNext(index);
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (digits[index]) {
        const next = [...digits];
        next[index] = "";
        setDigits(next);
      } else {
        focusPrev(index);
      }
    } else if (e.key === "ArrowLeft") {
      focusPrev(index);
    } else if (e.key === "ArrowRight") {
      focusNext(index);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const next = Array(6).fill("");
    pasted.split("").forEach((char, i) => { next[i] = char; });
    setDigits(next);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (digits.join("").length < 6) newErrors.code = "Vui lòng nhập đủ 6 chữ số";
    if (!newPassword) {
      newErrors.newPassword = "Vui lòng nhập mật khẩu mới";
    } else if (newPassword.length < 6) {
      newErrors.newPassword = "Mật khẩu phải có ít nhất 6 ký tự";
    } else if (!/[A-Z]/.test(newPassword)) {
      newErrors.newPassword = "Mật khẩu phải chứa ít nhất 1 chữ in hoa";
    } else if (!/\d/.test(newPassword)) {
      newErrors.newPassword = "Mật khẩu phải chứa ít nhất 1 chữ số";
    }
    if (!confirmPassword) {
      newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu";
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (!email) {
      toast.error("Không tìm thấy email. Vui lòng thử lại từ đầu.");
      return;
    }

    setLoading(true);
    try {
      await resetPassword({ email, code: digits.join(""), newPassword, confirmPassword });
      toast.success("Đặt lại mật khẩu thành công! Hãy đăng nhập.");
      router.push("/login");
    } catch (err: any) {
      handleApiError(err, "Mã xác thực không đúng hoặc đã hết hạn.");
      setDigits(Array(6).fill(""));
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email || cooldown > 0) return;
    setResendLoading(true);
    try {
      await forgotPassword(email);
      toast.success("Mã xác thực mới đã được gửi.");
      setCooldown(RESEND_COOLDOWN);
      setDigits(Array(6).fill(""));
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      handleApiError(err, "Gửi lại thất bại. Vui lòng thử lại sau.");
    } finally {
      setResendLoading(false);
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
              href="/forgot-password"
              className="group flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400 hover:text-black transition-colors mb-4"
            >
              <ArrowRight className="w-3 h-3 rotate-180 group-hover:-translate-x-1 transition-transform" />
              Quay lại
            </Link>
            <Link
              href="/"
              className="lg:hidden font-serif text-2xl font-bold tracking-tighter mb-8 block"
            >
              DAODUCK WEAR
            </Link>
            <h1 className="font-cormorant text-4xl lg:text-5xl font-bold tracking-tighter uppercase text-black">
              Đặt lại mật khẩu
            </h1>
            <p className="text-stone-400 text-xs uppercase tracking-widest leading-loose">
              Nhập mã 6 chữ số đã gửi đến{" "}
              <span className="font-bold text-black">{email || "email của bạn"}</span>{" "}
              và mật khẩu mới.
            </p>
          </header>

          <form onSubmit={handleSubmit} noValidate className="space-y-10">
            {/* OTP inputs */}
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400 mb-4">
                Mã xác thực
              </p>
              <div className="flex gap-3" onPaste={handlePaste}>
                {digits.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { inputRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    className="w-full aspect-square text-center text-xl font-bold border-b-2 border-stone-200 focus:border-black bg-transparent outline-none transition-colors text-black"
                  />
                ))}
              </div>
              {errors.code && (
                <p className="text-[10px] text-red-500 uppercase tracking-wider mt-2">
                  {errors.code}
                </p>
              )}
            </div>

            {/* New password */}
            <div className="space-y-2 group">
              <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400 group-focus-within:text-black transition-colors">
                Mật khẩu mới
              </label>
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (errors.newPassword) setErrors((prev) => ({ ...prev, newPassword: "" }));
                  }}
                  className={`w-full bg-transparent border-b ${errors.newPassword ? "border-red-500" : "border-stone-200"} focus:border-black py-3 text-sm transition-colors outline-none font-medium pr-10`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-stone-400 hover:text-black transition-colors"
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-[10px] text-red-500 uppercase tracking-wider">
                  {errors.newPassword}
                </p>
              )}
            </div>

            {/* Confirm password */}
            <div className="space-y-2 group">
              <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400 group-focus-within:text-black transition-colors">
                Xác nhận mật khẩu
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: "" }));
                  }}
                  className={`w-full bg-transparent border-b ${errors.confirmPassword ? "border-red-500" : "border-stone-200"} focus:border-black py-3 text-sm transition-colors outline-none font-medium pr-10`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-stone-400 hover:text-black transition-colors"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-[10px] text-red-500 uppercase tracking-wider">
                  {errors.confirmPassword}
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
                  Đang xử lý...
                </>
              ) : (
                <>
                  Đặt lại mật khẩu
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <footer className="pt-6 border-t border-stone-100 space-y-4">
            <p className="text-[10px] text-stone-400 uppercase tracking-widest text-center">
              Không nhận được mã?
            </p>
            <button
              type="button"
              onClick={handleResend}
              disabled={resendLoading || cooldown > 0}
              className="w-full border border-stone-200 text-black py-4 px-6 text-[11px] font-bold uppercase tracking-[0.25em] text-center hover:border-black transition-all disabled:text-stone-300 disabled:border-stone-100 disabled:cursor-not-allowed"
            >
              {resendLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Đang gửi...
                </span>
              ) : cooldown > 0 ? (
                `Gửi lại sau ${cooldown}s`
              ) : (
                "Gửi lại mã"
              )}
            </button>
            <p className="text-[10px] text-stone-400 uppercase tracking-widest text-center">
              <Link href="/login" className="text-black hover:underline">
                Quay lại đăng nhập
              </Link>
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
