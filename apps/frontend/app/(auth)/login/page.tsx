"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import { toast } from "react-toastify";
import { useAuthStore } from "@/stores/auth.store";
import { login } from "@/apis/auth.api";
import { LoginForm } from "@/types/auth.type";
import {
  validateLoginForm,
  type LoginErrors,
} from "@/validators/login.validator";
import { handleApiError } from "@/utils/error.util";
import GoogleLoginButton from "@/components/auth/googleBtn";
import AuthImagePanel from "@/components/auth/AuthImagePanel";

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [form, setForm] = useState<LoginForm>({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<LoginErrors>({});

  const validate = (): boolean => {
    const newErrors = validateLoginForm(form);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name as keyof LoginForm]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await login(form);
      if (res.data.requiresVerification) {
        toast.info("Mã xác thực đã được gửi đến email của bạn.");
        router.push(`/verify-email?email=${encodeURIComponent(res.data.email)}`);
        return;
      }
      const { accessToken, user } = res.data;
      setAuth(accessToken, user);
      toast.success(`Chào mừng trở lại, ${user.username}!`);
      router.push("/");
    } catch (err: any) {
      handleApiError(
        err,
        "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white font-sans antialiased">
      {/* Left Panel: Fashion Imagery */}
      <div className="hidden lg:block w-1/2 relative overflow-hidden bg-stone-100">
        <AuthImagePanel page="login" />
      </div>

      {/* Right Panel: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16 lg:p-24 overflow-y-auto">
        <div className="w-full max-w-sm space-y-12">
          <header className="space-y-4">
            <Link
              href="/"
              className="group flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400 hover:text-black transition-colors mb-4"
            >
              <ArrowRight className="w-3 h-3 rotate-180 group-hover:-translate-x-1 transition-transform" />
              Quay lại trang chủ
            </Link>
            <Link
              href="/"
              className="lg:hidden font-serif text-2xl font-bold tracking-tighter mb-8 block"
            >
              DAODUCK WEAR
            </Link>
            <h1 className="font-cormorant text-4xl lg:text-5xl font-bold tracking-tighter uppercase text-black">
              Đăng nhập tài khoản
            </h1>
            <p className="text-stone-400 text-xs uppercase tracking-widest leading-loose">
              Truy cập vào tài khoản của bạn để khám phá những bộ sưu tập mới
              nhất.
            </p>
          </header>

          <div className="space-y-6">
            <GoogleLoginButton />
            
            <div className="relative">
               <div className="absolute inset-0 flex items-center">
                   <div className="w-full border-t border-stone-200"></div>
               </div>
               <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
                   <span className="bg-white px-4 text-stone-400 font-bold">hoặc đăng nhập với email</span>
               </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-10">
            <div className="space-y-8">
              {/* Email Field */}
              <div className="space-y-2 group">
                <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400 group-focus-within:text-black transition-colors">
                  Email Address
                </label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className={`w-full bg-transparent border-b ${errors.email ? "border-red-500" : "border-stone-200"} focus:border-black py-3 text-sm transition-colors outline-none font-medium`}
                  placeholder="example@DAODUCK WEAR.com"
                />
                {errors.email && (
                  <p className="text-[10px] text-red-500 uppercase tracking-wider">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2 group">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400 group-focus-within:text-black transition-colors">
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    title="Forgot Password"
                    className="text-[9px] uppercase tracking-widest text-stone-400 hover:text-black"
                  >
                    Quên mật khẩu?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={handleChange}
                    className={`w-full bg-transparent border-b ${errors.password ? "border-red-500" : "border-stone-200"} focus:border-black py-3 text-sm transition-colors outline-none font-medium pr-10`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-stone-400 hover:text-black transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-[10px] text-red-500 uppercase tracking-wider">
                    {errors.password}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                id="rememberMe"
                name="rememberMe"
                type="checkbox"
                checked={form.rememberMe}
                onChange={handleChange}
                className="w-3 h-3 accent-black cursor-pointer"
              />
              <label
                htmlFor="rememberMe"
                className="text-[10px] uppercase tracking-widest text-stone-500 cursor-pointer"
              >
                Ghi nhớ đăng nhập
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-4 px-6 text-[11px] font-bold uppercase tracking-[0.25em] flex items-center justify-center gap-3 hover:bg-stone-800 transition-all disabled:bg-stone-300 active:scale-[0.99]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  Đăng nhập
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          <footer className="border-t border-stone-100 flex flex-col gap-4">
            <p className="text-[10px] text-stone-400 uppercase tracking-widest text-center">
              Chưa có tài khoản?
            </p>
            <Link
              href="/register"
              className="w-full border border-stone-200 text-black py-4 px-6 text-[11px] font-bold uppercase tracking-[0.25em] text-center hover:border-black transition-all"
            >
              Tạo tài khoản
            </Link>
          </footer>
        </div>
      </div>
    </div>
  );
}
