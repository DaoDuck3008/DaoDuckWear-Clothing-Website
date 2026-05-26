import { LoginForm } from "@/types/auth.type";

export type LoginErrors = Partial<Record<keyof LoginForm, string>>;

/**
 * Validate form đăng nhập.
 * @returns object errors (rỗng nếu hợp lệ)
 */
export function validateLoginForm(form: LoginForm): LoginErrors {
  const errors: LoginErrors = {};

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

  return errors;
}
