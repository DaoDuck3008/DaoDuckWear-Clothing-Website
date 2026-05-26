import { RegisterForm } from "@/types/auth.type";

export type RegisterErrors = Partial<Record<keyof RegisterForm, string>>;

/** Các rule kiểm tra độ mạnh password — dùng chung cho UI hints */
export const passwordStrengthRules = [
  { label: "Ít nhất 6 ký tự", test: (v: string) => v.length >= 6 },
  { label: "Có chữ hoa", test: (v: string) => /[A-Z]/.test(v) },
  { label: "Có chữ số", test: (v: string) => /\d/.test(v) },
];

/**
 * Validate form đăng ký.
 * @returns object errors (rỗng nếu hợp lệ)
 */
export function validateRegisterForm(form: RegisterForm): RegisterErrors {
  const errors: RegisterErrors = {};

  if (!form.username.trim()) {
    errors.username = "Tên người dùng không được để trống.";
  } else if (form.username.trim().length < 3) {
    errors.username = "Tên người dùng phải có ít nhất 3 ký tự.";
  }

  if (!form.email.trim()) {
    errors.email = "Email không được để trống.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = "Email không hợp lệ.";
  }

  if (!form.password) {
    errors.password = "Mật khẩu không được để trống.";
  } else if (form.password.length < 6) {
    errors.password = "Mật khẩu phải có ít nhất 6 ký tự.";
  }

  if (!form.confirmPassword) {
    errors.confirmPassword = "Xác nhận mật khẩu không được để trống.";
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = "Mật khẩu xác nhận không khớp.";
  }

  return errors;
}
