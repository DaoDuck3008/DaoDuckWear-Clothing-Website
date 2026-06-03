# Đăng nhập bằng tài khoản Google

## Tổng quan

Chức năng cho phép người dùng đăng nhập/đăng ký bằng tài khoản Google thông qua **Google OAuth 2.0** (luồng ID Token). Nếu email chưa có trong hệ thống, tài khoản mới được **tạo tự động** với vai trò `USER`. Toàn bộ việc xác minh token diễn ra **phía server** để đảm bảo an toàn.

| Thành phần | Vai trò |
|---|---|
| **Frontend** | Mở Google Sign-In popup, nhận ID Token, gửi lên backend |
| **Google OAuth** | Xác thực người dùng, cấp ID Token |
| **Backend** (`AuthService.googleLogin`) | Verify token với Google, tìm/tạo user, cấp JWT |
| **MongoDB** | Lưu tài khoản (`users`), vai trò (`roles`) |
| **Redis** | Lưu refresh token (TTL 7 ngày) |

## Diagram

- **Sequence diagram** (chi tiết kỹ thuật): [`google-login.mmd`](./google-login.mmd)
- **Activity diagram** (luồng nghiệp vụ, swim lanes): [`google-login-activity.puml`](./google-login-activity.puml)

## Luồng xử lý (tóm tắt)

1. User nhấn "Đăng nhập bằng Google" → FE mở popup Google Sign-In.
2. User chọn tài khoản → Google trả về **ID Token** cho FE.
3. FE gửi `POST /auth/google { credential: idToken }` lên BE.
4. BE gọi `client.verifyIdToken()` để xác minh token **với Google** (kiểm tra chữ ký + `audience`).
5. BE trích xuất `email`, `name`, `picture`, `sub` từ payload.
6. BE tìm user theo `{ email, provider: 'google' }`:
   - **Đã tồn tại** → dùng user đó.
   - **Chưa tồn tại** → tạo user mới (`provider: 'google'`, `isVerified: true`, vai trò `USER`).
7. BE kiểm tra `isLocked` — nếu khóa thì trả 401.
8. BE cấp `accessToken` (15m) + `refreshToken` (7d), lưu refresh token vào Redis.
9. BE trả `200 { accessToken, user }` kèm `Set-Cookie: refreshToken` (httpOnly).
10. FE lưu phiên đăng nhập vào Zustand store, chuyển về trang chủ.

---

## Những điểm cần chú ý

### 1. Verify token phía server — bắt buộc
FE **không** tự giải mã hay tin tưởng ID Token. BE gọi `OAuth2Client.verifyIdToken()` với `audience = GOOGLE_OAUTH_CLIENT_ID` để Google xác nhận token là thật, chưa hết hạn, và được cấp đúng cho ứng dụng này. Nếu bỏ bước này, kẻ tấn công có thể giả mạo token bất kỳ.

```ts
const client = new OAuth2Client(process.env.GOOGLE_OAUTH_CLIENT_ID);
const ticket = await client.verifyIdToken({
  idToken: credential,
  audience: process.env.GOOGLE_OAUTH_CLIENT_ID,
});
const payload = ticket.getPayload();
```

### 2. Tài khoản Google không có mật khẩu thật
Schema `users` yêu cầu `password`, nhưng tài khoản Google không cung cấp mật khẩu. Hệ thống **sinh mật khẩu ngẫu nhiên** rồi hash bằng bcrypt để thỏa ràng buộc schema:

```ts
const randomPassword = Math.random().toString(36).slice(-10);
const hashedPassword = await hashPassword(randomPassword);
```

> Mật khẩu này không bao giờ được dùng — user Google luôn đăng nhập qua Google. Nó chỉ là giá trị placeholder.

### 3. `provider: 'google'` chặn các luồng dùng mật khẩu
User tạo qua Google được gắn `provider: 'google'`. Cờ này được kiểm tra ở nhiều nơi để **chặn** các thao tác liên quan mật khẩu:

| Luồng | Hành vi với tài khoản Google |
|---|---|
| Đăng nhập local (`/auth/login`) | Bị từ chối — "Hãy sử dụng Google để đăng nhập" |
| Quên mật khẩu (`/auth/forgot-password`) | Bị từ chối — "Tài khoản Google không hỗ trợ đặt lại mật khẩu" |
| Đổi mật khẩu (`/auth/change-password`) | Bị từ chối — "Tài khoản Google không thể đổi mật khẩu" |

### 4. Tài khoản mới được auto-verify
User tạo qua Google có `isVerified: true` ngay lập tức — vì email đã được Google xác thực. Không cần gửi email xác minh như đăng ký local.

### 5. `providerId` lưu Google `sub`
Khi tạo user, BE lưu `providerId: payload.sub` — đây là ID định danh duy nhất của tài khoản Google. Diagram không thể hiện trường này nhưng nó được lưu trong code, hữu ích để truy vết/đối chiếu tài khoản về sau.

### 6. Email là duy nhất giữa các provider
Query tìm user dùng `{ email, provider: 'google' }`, nhưng schema `users` có **unique index trên `email`**. Hệ quả: nếu một email đã đăng ký bằng tài khoản **local** trước đó, việc đăng nhập Google với cùng email sẽ **không tìm thấy** user Google → cố tạo mới → **lỗi duplicate key** ở tầng DB. Đây là edge case cần lưu ý nếu sau này muốn hỗ trợ "liên kết tài khoản" (account linking).

### 7. Cookie luôn `secure: true`
Refresh token cookie được set với `httpOnly: true, secure: true, sameSite: 'lax'`. Vì `secure: true`, **cookie chỉ gửi qua HTTPS** — ở môi trường dev chạy `http://localhost` cần đảm bảo trình duyệt vẫn chấp nhận (localhost thường được miễn trừ), hoặc dùng HTTPS local.

### 8. Google login luôn nhớ phiên 7 ngày
Khác với đăng nhập local (cookie maxAge phụ thuộc `rememberMe`: 1 hoặc 7 ngày), Google login **luôn** set cookie 7 ngày:

```ts
res.cookie('refreshToken', refreshToken, {
  httpOnly: true, secure: true, sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày với google login
});
```

### 9. Rate limiting
Endpoint `/auth/google` được giới hạn **5 request/phút** qua `@Throttle({ global: { ttl: 60_000, limit: 5 } })` để chống brute-force / spam.

---

## Lưu ý về sự khác biệt giữa Diagram và Code

Khi đọc diagram cùng code, có vài điểm **không khớp hoàn toàn** — code là nguồn chính xác:

| Điểm | Diagram | Code thực tế |
|---|---|---|
| **Thứ tự kiểm tra khóa** | Nhánh "Tài khoản bị khóa" nằm **trước** nhánh tạo user mới | `isLocked` được kiểm tra **sau** khi tìm/tạo user (dòng 396). User mới không bao giờ bị khóa lúc tạo |
| **Status code khóa tài khoản** | `.puml` ghi **403**, `.mmd` ghi **401** | `UnauthorizedException` = **401** (theo `.mmd`) |
| **`providerId`** | Không thể hiện | Có lưu `providerId: payload.sub` |

> Khuyến nghị: cập nhật `.puml` đổi 403 → 401 cho khớp với hành vi thực tế.

---

## Source code liên quan

| File | Vai trò |
|---|---|
| `apps/backend/src/modules/auth/auth.controller.ts` | Endpoint `POST /auth/google`, set cookie, rate limit (dòng 129–166) |
| `apps/backend/src/modules/auth/auth.service.ts` | `googleLogin()` — verify token, tìm/tạo user, cấp JWT (dòng 349–436) |
| `apps/backend/src/common/utils/jwt.util.ts` | `signAccessToken`, `signRefreshToken` |
| `apps/backend/src/modules/users/schemas/user.schema.ts` | Schema `users` — `provider`, `providerId`, `isVerified`, `isLocked` |
| `apps/backend/src/modules/roles/schemas/role.schema.ts` | Schema `roles` — tìm vai trò `USER` mặc định |

## Biến môi trường

| Biến | Mô tả |
|---|---|
| `GOOGLE_OAUTH_CLIENT_ID` (backend) | Client ID dùng làm `audience` khi verify token |
| `NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID` (frontend) | Client ID cho Google Sign-In popup |
| `NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_SECRET` (frontend) | Client secret OAuth |
