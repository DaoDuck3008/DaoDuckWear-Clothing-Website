"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, User, Loader2, ArrowRight, Check } from "lucide-react";
import { toast } from "react-toastify";
import { register } from "@/apis/auth.api";
import { RegisterForm } from "@/types/auth.type";
import {
  validateRegisterForm,
  passwordStrengthRules,
  type RegisterErrors,
} from "@/validators/register.validator";
import { handleApiError } from "@/utils/error.util";
import GoogleLoginButton from "@/components/auth/googleBtn";
import AuthImagePanel from "@/components/auth/AuthImagePanel";

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState<RegisterForm>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [passwordFocused, setPasswordFocused] = useState(false);

  const validate = (): boolean => {
    const newErrors = validateRegisterForm(form);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof RegisterForm]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await register(form);
      if (res.data.requiresVerification) {
        toast.info("Vui lòng kiểm tra email để lấy mã xác thực.");
        router.push(`/verify-email?email=${encodeURIComponent(form.email)}`);
        return;
      }
      toast.success("Đăng ký thành công! Hãy đăng nhập để tiếp tục.");
      router.push("/login");
    } catch (err: any) {
      handleApiError(err, "Đăng ký thất bại. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white font-sans antialiased">
      {/* Left Panel: Form */}
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
            <h1 className="font-cormorant text-3xl lg:text-5xl font-bold tracking-tighter uppercase text-black">
              Tạo tài khoản
            </h1>
            <p className="text-stone-400 text-xs uppercase tracking-widest leading-loose">
              Tạo tài khoản để nhận những ưu đãi đặc quyền và cập nhật mới nhất.
            </p>
          </header>

          <div className="space-y-6">
            <GoogleLoginButton />

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-stone-200"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
                <span className="bg-white px-4 text-stone-400 font-bold">
                  hoặc đăng ký với email
                </span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-8">
            <div className="space-y-6">
              {/* Username */}
              <div className="space-y-2 group">
                <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400 group-focus-within:text-black transition-colors">
                  Tên đăng nhập
                </label>
                <input
                  name="username"
                  type="text"
                  value={form.username}
                  onChange={handleChange}
                  className={`w-full bg-transparent border-b ${errors.username ? "border-red-500" : "border-stone-200"} focus:border-black py-3 text-sm transition-colors outline-none font-medium`}
                  placeholder="nguyenvana"
                />
                {errors.username && (
                  <p className="text-[10px] text-red-500 uppercase tracking-wider">
                    {errors.username}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2 group">
                <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400 group-focus-within:text-black transition-colors">
                  Email
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

              {/* Password */}
              <div className="space-y-2 group">
                <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400 group-focus-within:text-black transition-colors">
                  Mật khẩu
                </label>
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={handleChange}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
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

                {/* Elegant Strength Indicator */}
                {(passwordFocused || form.password.length > 0) && (
                  <div className="pt-2 flex flex-wrap gap-x-4 gap-y-2">
                    {passwordStrengthRules.map((rule) => {
                      const passed = rule.test(form.password);
                      return (
                        <div
                          key={rule.label}
                          className={`flex items-center gap-1.5 text-[9px] uppercase tracking-widest ${passed ? "text-black" : "text-stone-300"}`}
                        >
                          <div
                            className={`w-1 h-1 rounded-full ${passed ? "bg-black" : "bg-stone-200"}`}
                          />
                          {rule.label}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2 group">
                <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400 group-focus-within:text-black transition-colors">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    name="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    value={form.confirmPassword}
                    onChange={handleChange}
                    className={`w-full bg-transparent border-b ${errors.confirmPassword ? "border-red-500" : "border-stone-200"} focus:border-black py-3 text-sm transition-colors outline-none font-medium pr-10`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-stone-400 hover:text-black transition-colors"
                  >
                    {showConfirm ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-[10px] text-red-500 uppercase tracking-wider">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            <p className="text-[10px] text-stone-400 uppercase tracking-widest leading-loose">
              Bằng cách đăng ký, bạn đồng ý với{" "}
              <Link href="/terms" className="text-black underline">
                Điều khoản
              </Link>{" "}
              và{" "}
              <Link href="/privacy" className="text-black underline">
                Chính sách
              </Link>{" "}
              của chúng tôi.
            </p>

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
                  Tạo tài khoản
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <footer className="pt-10 border-t border-stone-100 flex flex-col gap-4">
            <p className="text-[10px] text-stone-400 uppercase tracking-widest text-center">
              Đã có tài khoản?
            </p>
            <Link
              href="/login"
              className="w-full border border-stone-200 text-black py-4 px-6 text-[11px] font-bold uppercase tracking-[0.25em] text-center hover:border-black transition-all"
            >
              Đăng nhập
            </Link>
          </footer>
        </div>
      </div>

      {/* Right Panel: Fashion Imagery */}
      <div className="hidden lg:block w-1/2 relative overflow-hidden bg-stone-100">
        <AuthImagePanel page="register" />
      </div>
    </div>
  );
}
