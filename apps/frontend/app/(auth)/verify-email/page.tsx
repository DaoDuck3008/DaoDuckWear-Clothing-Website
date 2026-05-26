"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Loader2, Mail } from "lucide-react";
import { toast } from "react-toastify";
import { verifyEmail, resendVerifyEmail } from "@/apis/auth.api";
import { handleApiError } from "@/utils/error.util";

const RESEND_COOLDOWN = 60;

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
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

  const handleChange = (index: number, value: string) => {
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
    const lastFilled = Math.min(pasted.length, 5);
    inputRefs.current[lastFilled]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = digits.join("");
    if (code.length < 6) {
      toast.error("Vui lòng nhập đủ 6 chữ số.");
      return;
    }
    if (!email) {
      toast.error("Không tìm thấy email. Vui lòng đăng ký lại.");
      return;
    }

    setLoading(true);
    try {
      await verifyEmail(email, code);
      toast.success("Xác thực email thành công! Hãy đăng nhập.");
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
      await resendVerifyEmail(email);
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
    <div className="flex min-h-screen bg-white font-sans antialiased items-center justify-center p-8">
      <div className="w-full max-w-sm space-y-12">
        <header className="space-y-4">
          <Link
            href="/"
            className="group flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400 hover:text-black transition-colors mb-4"
          >
            <ArrowRight className="w-3 h-3 rotate-180 group-hover:-translate-x-1 transition-transform" />
            Quay lại trang chủ
          </Link>

          <div className="w-10 h-10 border border-stone-200 flex items-center justify-center mb-6">
            <Mail className="w-5 h-5 text-stone-400" />
          </div>

          <h1 className="font-cormorant text-3xl lg:text-4xl font-bold tracking-tighter uppercase text-black">
            Xác thực email
          </h1>
          <p className="text-stone-400 text-xs leading-loose">
            Chúng tôi đã gửi mã 6 chữ số đến{" "}
            <span className="font-bold text-black">{email || "email của bạn"}</span>.
            Mã có hiệu lực trong <span className="font-bold text-black">10 phút</span>.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* OTP inputs */}
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400 mb-4">
              Nhập mã xác thực
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
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className="w-full aspect-square text-center text-xl font-bold border-b-2 border-stone-200 focus:border-black bg-transparent outline-none transition-colors text-black"
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || digits.join("").length < 6}
            className="w-full bg-black text-white py-4 px-6 text-[11px] font-bold uppercase tracking-[0.25em] flex items-center justify-center gap-3 hover:bg-stone-800 transition-all disabled:bg-stone-300 active:scale-[0.99]"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Đang xác thực...
              </>
            ) : (
              <>
                Xác thực
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
  );
}
