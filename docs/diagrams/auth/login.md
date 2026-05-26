# Sequence Diagram — Login Flow (Email/Password)

## Actors

| Actor | Mô tả |
|-------|-------|
| Nguoi dung | Trình duyệt, nhập form đăng nhập |
| Frontend | Next.js App — login form + Axios + Zustand |
| Store | Zustand auth store (`stores/auth.store.ts`) |
| Backend | NestJS AuthController + AuthService |
| MongoDB (users) | Collection lưu tài khoản người dùng |
| MongoDB (roles) | Collection lưu vai trò (USER, ADMIN, ...) |
| Redis | Lưu refresh token với TTL |

## Diagram

```mermaid
%%{init: {'themeVariables': {'fontSize': '25px'}}}%%
sequenceDiagram
    autonumber
    actor User as Nguoi dung
    participant FE as Frontend<br/>(Next.js)
    participant Store as Zustand Store
    participant BE as Backend<br/>(AuthController + AuthService)
    participant Users as MongoDB (users)
    participant Roles as MongoDB (roles)
    participant Redis

    User->>FE: Nhập email + password + rememberMe
    FE->>BE: POST /auth/login { email, password, rememberMe }

    BE->>Users: Tìm user theo email
    BE->>Roles: Populate roleId

    alt User không tồn tại
        Users-->>BE: null
        BE-->>FE: 404 Không tìm thấy tài khoản
        FE-->>User: Hiển thị lỗi
    else Sai mật khẩu
        Users-->>BE: user document
        BE-->>BE: bcrypt.compare() → false
        Note over BE: So sánh mật khẩu nhập vào với mật khẩu<br/>đã mã hoá trong DB có khớp hay không?
        BE-->>FE: 401 Mật khẩu không đúng
        FE-->>User: Hiển thị lỗi
    else Tài khoản bị khóa
        Users-->>BE: user (isLocked: true)
        BE-->>FE: 403 Tài khoản bị khóa
        FE-->>User: Hiển thị lỗi
    else Chưa gán vai trò
        Users-->>BE: user (roleId: null)
        BE-->>FE: 403 Tài khoản chưa được phân quyền
        FE-->>User: Hiển thị lỗi
    else Đăng nhập thành công
        Users-->>BE: user document hợp lệ
        BE->>BE: signAccessToken({ id, role, shopId }) — TTL 15m
        Note over BE: Access token dùng để xác thực mỗi request API,<br/>hết hạn sau 15 phút
        BE->>BE: signRefreshToken({ id }) — TTL 7d + UUID
        Note over BE: Refresh token dùng để cấp lại access token mới<br/>khi hết hạn, không cần đăng nhập lại
        BE->>Redis: SET refresh_token:{UUID} → userId (TTL 7d)
        BE-->>FE: 200 { accessToken, user }<br/>+ Set-Cookie: refreshToken (httpOnly, secure, sameSite=lax)
        FE->>Store: Lưu thông tin đăng nhập vào bộ nhớ ứng dụng
        Store->>Store: Ghi nhớ trạng thái đăng nhập<br/>(tự động đăng nhập lần sau)
        FE-->>User: Chuyển về trang chủ
    end
```

## Source code liên quan

| File | Vai trò |
|------|---------|
| `apps/backend/src/modules/auth/auth.controller.ts` | Endpoint `POST /auth/login`, set cookie |
| `apps/backend/src/modules/auth/auth.service.ts` | Validate, sign token, lưu Redis |
| `apps/backend/src/common/utils/jwt.util.ts` | `signAccessToken()`, `signRefreshToken()` |
| `apps/frontend/apis/auth.api.ts` | Gọi API login |
| `apps/frontend/stores/auth.store.ts` | `setAuth()`, `hasSession` localStorage |
