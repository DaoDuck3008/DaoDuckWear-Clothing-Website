# Sequence Diagram — Register Flow (Email/Password)

## Actors

| Actor | Mô tả |
|-------|-------|
| Nguoi dung | Trình duyệt, nhập form đăng ký |
| Frontend | Next.js App — register form + Axios |
| Backend | NestJS AuthController + AuthService |
| MongoDB (users) | Collection lưu tài khoản người dùng |
| MongoDB (roles) | Collection lưu vai trò (USER, ADMIN, ...) |
| Redis | Lưu OTP xác thực email (TTL 10 phút) |
| MailService | Gửi email chứa mã OTP |

## Ghi chú

- **Giai đoạn 2 chỉ xảy ra** khi biến môi trường `IS_VERIFY_EMAIL=true`
- Mã OTP có hiệu lực **10 phút** — hết hạn cần dùng `POST /auth/resend-verify-email` để gửi lại
- Tài khoản tạo với `isVerified: false` sẽ **không đăng nhập được** cho đến khi xác thực

## Diagram

```mermaid
%%{init: {'themeVariables': {'fontSize': '25px'}}}%%
sequenceDiagram
    autonumber
    actor User as Nguoi dung
    participant FE as Frontend<br/>(Next.js)
    participant BE as Backend<br/>(AuthController + AuthService)
    participant Users as MongoDB (users)
    participant Roles as MongoDB (roles)
    participant Redis
    participant Mail as MailService

    rect rgb(235, 242, 255)
        Note over User,Mail: Giai đoạn 1 — Đăng ký tài khoản
        User->>FE: Nhập email + username + password
        FE->>BE: POST /auth/register { email, username, password }
        BE->>Users: Kiểm tra email / username đã tồn tại chưa

        alt Email hoặc username đã tồn tại
            Users-->>BE: user document
            BE-->>FE: 401 Email hoặc username đã tồn tại
            FE-->>User: Hiển thị lỗi
        else Chưa tồn tại
            Users-->>BE: null
            BE->>BE: hashPassword(password)
            Note over BE: Mã hoá mật khẩu trước khi lưu — không bao giờ lưu plaintext
            BE->>Roles: Tìm role "USER"
            BE->>Users: Tạo user mới

            alt IS_VERIFY_EMAIL = false
                BE-->>FE: 201 { user, requiresVerification: false }
                FE-->>User: Đăng ký thành công
            else IS_VERIFY_EMAIL = true
                BE->>BE: Tạo mã OTP (6 chữ số ngẫu nhiên)
                BE->>Redis: SET email_verify:user:{id} → OTP (TTL 10 phút)
                BE->>Mail: Gửi email xác thực kèm mã OTP
                BE-->>FE: 201 { requiresVerification: true }
                FE-->>User: Yêu cầu nhập mã xác thực từ email
            end
        end
    end

    rect rgb(255, 235, 235)
        Note over User,Mail: Giai đoạn 2 — Xác thực email (chỉ khi IS_VERIFY_EMAIL = true)
        User->>FE: Nhập mã OTP từ email
        FE->>BE: POST /auth/verify-email { email, code }
        BE->>Redis: GET email_verify:user:{id}

        alt OTP không hợp lệ hoặc đã hết hạn
            Redis-->>BE: null hoặc mã không khớp
            BE-->>FE: 400 Mã xác thực không hợp lệ hoặc đã hết hạn
            FE-->>User: Hiển thị lỗi + nút gửi lại mã
        else OTP hợp lệ
            Redis-->>BE: OTP khớp
            BE->>Users: Cập nhật isVerified = true
            BE->>Redis: DEL email_verify:user:{id}
            BE-->>FE: 200 Xác thực email thành công
            FE-->>User: Chuyển đến trang đăng nhập
        end
    end
```

## Source code liên quan

| File | Vai trò |
|------|---------|
| `apps/backend/src/modules/auth/auth.controller.ts` | Endpoints `POST /auth/register`, `/verify-email`, `/resend-verify-email` |
| `apps/backend/src/modules/auth/auth.service.ts` | `register()`, `verifyEmail()`, `resendVerifyEmail()`, `sendOtp()` |
| `apps/backend/src/common/utils/password.util.ts` | `hashPassword()` |
| `apps/backend/src/modules/mail/mail.service.ts` | `sendVerifyEmail()` |
