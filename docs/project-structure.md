# Cấu trúc thư mục — DaoDuckWear

Tài liệu mô tả cách tổ chức mã nguồn của dự án. DaoDuckWear là **monorepo** gồm hai app độc lập trong `apps/`, không có `package.json` ở thư mục gốc — mỗi app tự quản lý dependencies và scripts riêng.

## Tổng quan

```
DaoDuckWear/
├── apps/
│   ├── backend/          # NestJS API (port 5000)
│   └── frontend/         # Next.js (port 3000)
├── docs/                 # Tài liệu: diagram, ERD, mô tả hệ thống
├── docker-compose.yml    # Redis 7
└── README.md
```

---

## Backend — `apps/backend/`

NestJS 11 theo kiến trúc **feature-based module**: mỗi tính năng là một module tự chứa controller, service, schema, DTO.

```
apps/backend/
├── src/
│   ├── main.ts               # Bootstrap: CORS, cookie-parser, global pipe/filter/interceptor
│   ├── app.module.ts         # Root module — import toàn bộ feature modules
│   │
│   ├── common/               # Mã dùng chung toàn hệ thống
│   │   ├── decorators/       # @CurrentUser, @CurrentShop, @Roles
│   │   ├── exceptions/       # BusinessException (lỗi nghiệp vụ)
│   │   ├── filters/          # HttpExceptionFilter (chuẩn hóa response lỗi)
│   │   ├── guards/           # AuthGuard, RolesGuard
│   │   ├── interceptors/     # LoggingInterceptor
│   │   └── utils/            # jwt.util, hash.util...
│   │
│   ├── config/               # Cấu hình app (env, kết nối...)
│   │
│   ├── database/
│   │   ├── seeders/          # Seed dữ liệu khởi tạo (npm run seed)
│   │   └── migrations/       # Script migrate dữ liệu (vd: backfill paidAt)
│   │
│   ├── jobs/                 # Background jobs (cron): cleanup-cart, release-reserved-stock, send-email
│   │
│   ├── types/                # Type/interface dùng chung
│   │
│   └── modules/              # Các feature module
│       ├── auth/             # Đăng nhập/đăng ký, JWT, Google OAuth
│       ├── users/            # Quản lý người dùng
│       ├── roles/            # Vai trò & phân quyền
│       ├── shops/            # Chi nhánh cửa hàng
│       ├── categories/       # Danh mục sản phẩm (đệ quy)
│       ├── colors/           # Bảng màu
│       ├── products/         # Sản phẩm + biến thể (variant)
│       ├── inventory/        # Tồn kho + phiếu nhập kho
│       ├── cart/             # Giỏ hàng
│       ├── orders/           # Đơn hàng (dùng transaction)
│       ├── payments/         # Thanh toán
│       ├── vouchers/         # Mã giảm giá
│       ├── favorites/        # Sản phẩm yêu thích
│       ├── reviews/          # Đánh giá sản phẩm
│       ├── posts/            # Bài viết / blog
│       ├── banners/          # Banner quảng cáo
│       ├── chat/             # Chat realtime (Socket.io)
│       ├── analytics/        # Thống kê / dashboard
│       ├── audit-logs/       # Nhật ký hành động
│       ├── mail/             # Gửi email (templates)
│       ├── cloudinary/       # Upload ảnh
│       ├── redis/            # RedisService (cache, TTL)
│       └── health/           # Health check
│
├── test/                     # E2E tests
├── .env.example              # Mẫu biến môi trường
└── package.json
```

### Cấu trúc một module điển hình

Mỗi module trong `src/modules/` thường gồm:

```
products/
├── products.module.ts        # Khai báo module (imports, providers, exports)
├── products.controller.ts    # Định nghĩa route HTTP
├── products.service.ts       # Business logic (thao tác Mongoose model trực tiếp)
├── dto/                      # Data Transfer Object + validation (class-validator)
│   ├── create-product.dto.ts
│   └── update-product.dto.ts
└── schemas/                  # Mongoose schema
    ├── product.schema.ts
    └── product-variant.schema.ts
```

> Quy ước: **không dùng repository pattern** — service thao tác Mongoose model trực tiếp. Một số module đơn giản (cloudinary, redis, health) không có `schemas/` hoặc `dto/`.

---

## Frontend — `apps/frontend/`

Next.js 16 **App Router** với route group để phân tách layout theo nhóm người dùng.

```
apps/frontend/
├── app/                      # App Router — routing theo thư mục
│   ├── (app)/                # Storefront khách hàng
│   │   ├── products/         # Danh sách + chi tiết ([slug]) + theo danh mục
│   │   ├── cart/             # Giỏ hàng
│   │   └── checkout/         # Thanh toán + trang kết quả
│   │
│   ├── (admin)/admin/        # Dashboard quản trị (guard ADMIN/STAFF/MANAGER)
│   │   ├── products/         # CRUD sản phẩm (create, edit/[id])
│   │   ├── orders/           # Đơn hàng ([orderCode])
│   │   ├── inventory/        # Tồn kho + nhập kho (import, history)
│   │   ├── customers/        # Khách hàng
│   │   ├── staff/            # Nhân viên
│   │   ├── vouchers/         # Mã giảm giá
│   │   ├── categories/       # Danh mục
│   │   ├── banners/          # Banner
│   │   ├── messages/         # Chat với khách
│   │   └── audit-logs/       # Nhật ký
│   │
│   ├── (auth)/               # Đăng nhập/đăng ký (guard cho khách chưa login)
│   │   ├── login/  register/
│   │   ├── forgot-password/  reset-password/
│   │   └── verify-email/
│   │
│   ├── (user)/profile/       # Khu vực người dùng đã đăng nhập
│   │   ├── orders/           # Lịch sử đơn ([id], review)
│   │   ├── favorites/        # Yêu thích
│   │   └── vouchers/         # Voucher của tôi
│   │
│   └── error/                # Trang lỗi (403, 500)
│
├── apis/                     # Lớp gọi API — Axios instance + interceptor (tự gắn JWT, refresh khi 401)
├── components/               # React components, chia theo domain
│   ├── ui/                   # Component UI cơ bản (button, modal...)
│   ├── common/               # Component dùng chung
│   ├── layouts/              # Header, footer, sidebar
│   ├── guards/               # AuthGuard, RoleGuard, GuestGuard
│   ├── providers/            # Context provider (AuthHydrator...)
│   ├── admin/                # Component riêng cho admin (gồm dashboard)
│   ├── home/  products/  cart/  checkout/  order/
│   ├── auth/  favorites/  chat/
│   └── ...
│
├── stores/                   # Zustand stores: auth, cart, favorite, buy-now
├── hooks/                    # Custom React hooks (gồm hooks/product)
├── utils/                    # Hàm tiện ích (vd: product.util.ts — sinh SKU)
├── validators/              # Logic validation thủ công (không dùng Zod)
├── constants/                # Hằng số
├── types/                    # TypeScript types
├── lib/                      # Thư viện cấu hình / helper
├── styles/                   # CSS global, Tailwind
├── public/                   # Tài nguyên tĩnh (assets)
├── .env                      # Biến môi trường
└── package.json
```

### Route group là gì?

Thư mục đặt trong ngoặc đơn `(app)`, `(admin)`, `(auth)`, `(user)` là **route group** của Next.js — nhóm các route để dùng chung một `layout.tsx` mà **không** thêm segment vào URL. Ví dụ `app/(app)/cart/page.tsx` → URL là `/cart` (không phải `/(app)/cart`).

| Route group | Đối tượng | Guard |
|---|---|---|
| `(app)` | Khách hàng (storefront) | Công khai |
| `(admin)` | Quản trị viên / nhân viên | AuthGuard + RoleGuard |
| `(auth)` | Khách chưa đăng nhập | GuestGuard |
| `(user)` | Người dùng đã đăng nhập | AuthGuard |

---

## Ví dụ: một request đi qua các thư mục như thế nào

Để thấy rõ vai trò của từng thư mục, hãy theo dõi luồng **đăng nhập bằng email + mật khẩu** đi xuyên suốt hệ thống. Mỗi bước được gắn với file/thư mục đảm nhận.

```
Người dùng nhập email + mật khẩu, nhấn "Đăng nhập"
        │
        ▼
┌─────────────────────────────── FRONTEND ───────────────────────────────┐
│ 1. app/(auth)/login/page.tsx        Trang đăng nhập, nhận input        │
│ 2. apis/auth.api.ts                 Gọi hàm login()                    │
│ 3. apis/api.ts                      Axios instance gửi POST /auth/login│
└─────────────────────────────────────────────────────────────────────────┘
        │  HTTP POST /auth/login { email, password }
        ▼
┌─────────────────────────────── BACKEND ────────────────────────────────┐
│ 4. modules/auth/auth.controller.ts  Nhận request, validate DTO         │
│       └─ dùng dto/ + ValidationPipe (khai báo ở main.ts)               │
│ 5. modules/auth/auth.service.ts     Business logic đăng nhập           │
│ 6. modules/users/schemas/           Truy vấn user (Mongoose model)     │
│       user.schema.ts                                                    │
│ 7. common/utils/ (hash, jwt)        So khớp mật khẩu (bcrypt),         │
│                                     ký access + refresh token          │
│ 8. modules/redis/                   Lưu refresh token (TTL 7 ngày)     │
│ 9. auth.controller.ts               Set-Cookie refreshToken (httpOnly) │
│                                     + trả 200 { accessToken, user }    │
└─────────────────────────────────────────────────────────────────────────┘
        │  HTTP 200 + Set-Cookie
        ▼
┌─────────────────────────────── FRONTEND ───────────────────────────────┐
│ 10. stores/auth.store.ts            Lưu accessToken + user vào state   │
│ 11. components/guards/              Cho phép vào trang được bảo vệ     │
│ 12. app/(app)/ hoặc (admin)/        Điều hướng về trang phù hợp vai trò│
└─────────────────────────────────────────────────────────────────────────┘
```

### Đối chiếu bước ↔ thư mục

| Bước | Thư mục / File | Vai trò trong kiến trúc |
|---|---|---|
| 1 | `app/(auth)/login/` | **Route** — UI và nhận input người dùng |
| 2–3 | `apis/` | **Lớp gọi API** — Axios tự gắn JWT, tự refresh khi 401 |
| 4 | `modules/auth/auth.controller.ts` + `dto/` | **Controller** — định tuyến HTTP, validate dữ liệu vào |
| 5 | `modules/auth/auth.service.ts` | **Service** — chứa business logic |
| 6 | `modules/users/schemas/` | **Schema** — model Mongoose, service thao tác trực tiếp |
| 7 | `common/utils/` | **Tiện ích dùng chung** — bcrypt, ký JWT |
| 8 | `modules/redis/` | **Hạ tầng** — lưu refresh token có TTL |
| 10 | `stores/` | **State** — Zustand giữ phiên đăng nhập |
| 11 | `components/guards/` | **Guard phía client** — chặn route theo vai trò |

> **Điểm mấu chốt:** request luôn đi theo cùng một "đường ray":
> `route → apis → controller → service → schema`, với `common/` và `modules/redis` hỗ trợ ngang. Mọi tính năng (sản phẩm, đơn hàng, voucher...) đều lặp lại đúng mô hình này — nắm một luồng là hiểu được toàn bộ.

---

## Docs — `docs/`

```
docs/
├── database-design.md       # Tài liệu thiết kế cơ sở dữ liệu
├── system-architecture.mmd  # Sơ đồ kiến trúc hệ thống
├── project-structure.md     # Tài liệu này
├── test/                    # Báo cáo kiểm thử (test case theo module)
└── diagrams/
    ├── overview/             # Use case tổng quát, kiến trúc hệ thống
    ├── er/                   # ERD + tài liệu thiết kế CSDL
    ├── auth/                 # Sequence/activity diagram cho auth (login, register, google)
    └── vouchers/             # CRUD sequence diagram cho voucher
```

Xem thêm:
- [Tài liệu thiết kế cơ sở dữ liệu](./database-design.md)
- [Kiến trúc hệ thống tổng quát](./diagrams/overview/system-architecture.md)
- [Báo cáo kiểm thử các module](./test/README.md)
