# DaoDuckWear — Clothing Shop

DaoDuckWear là một ứng dụng thương mại điện tử bán quần áo (full-stack). Dự án được tổ chức theo dạng **monorepo** gồm hai app độc lập, **không có** `package.json` ở thư mục gốc:

- `apps/backend/` — **NestJS 11** + MongoDB (Mongoose 9) + Redis
- `apps/frontend/` — **Next.js 16** (App Router) + React 19 + Tailwind CSS 4

> Tài liệu kiến trúc, ERD và các sequence diagram nằm trong thư mục [`docs/diagrams/`](./docs/diagrams).

---

## Mục lục

- [Tech stack](#tech-stack)
- [Yêu cầu môi trường](#yêu-cầu-môi-trường)
- [Cấu trúc thư mục](#cấu-trúc-thư-mục)
- [Hướng dẫn cài đặt](#hướng-dẫn-cài-đặt)
- [Biến môi trường](#biến-môi-trường)
- [Tài khoản seed](#tài-khoản-seed)
- [Scripts thường dùng](#scripts-thường-dùng)
- [Truy cập](#truy-cập)
- [Troubleshooting](#troubleshooting)

---

## Tech stack

| Lớp | Công nghệ |
|---|---|
| Backend | NestJS 11, TypeScript, Mongoose 9 |
| Database | MongoDB (yêu cầu **replica set** — xem bên dưới) |
| Cache / Session | Redis 7 (ioredis) |
| Realtime | Socket.io (chat) |
| Frontend | Next.js 16 (App Router), React 19, Tailwind CSS 4 |
| State management | Zustand |
| Auth | JWT (access + refresh), Google OAuth 2.0 |
| Lưu trữ ảnh | Cloudinary |
| Thanh toán | VNPAY |
| Email | Nodemailer (SMTP) |

---

## Yêu cầu môi trường

| Công cụ | Phiên bản khuyến nghị | Ghi chú |
|---|---|---|
| **Node.js** | LTS 20.x hoặc 22.x | Dự án không pin phiên bản; dùng LTS gần nhất |
| **npm** | đi kèm Node | Hoặc pnpm/yarn nếu quen, README dùng npm |
| **Docker** | mới nhất | Dùng để chạy Redis qua `docker-compose` |
| **MongoDB** | 6.0+ | Atlas (khuyến nghị) **hoặc** local có bật replica set |
| **Git** | mới nhất | |

> **Quan trọng — MongoDB phải chạy ở chế độ replica set.**
> Backend dùng **transaction** (`session.startTransaction()`) ở các module orders, inventory, products. MongoDB chỉ hỗ trợ transaction khi chạy dạng replica set. MongoDB cài mặc định (standalone) sẽ báo lỗi khi đặt hàng / nhập kho. Xem [bước cài MongoDB](#2-mongodb) bên dưới.

---

## Cấu trúc thư mục

```
DaoDuckWear/
├── apps/
│   ├── backend/          # NestJS API (port 5000)
│   │   ├── src/
│   │   ├── .env.example  # mẫu biến môi trường backend
│   │   └── package.json
│   └── frontend/         # Next.js (port 3000)
│       ├── app/
│       ├── .env          # biến môi trường frontend
│       └── package.json
├── docs/
│   └── diagrams/         # kiến trúc, ERD, sequence diagrams
├── docker-compose.yml    # Redis
└── README.md
```

> Xem mô tả chi tiết từng thư mục và quy ước tổ chức module trong tài liệu **[Cấu trúc thư mục dự án](./docs/project-structure.md)**.

---

## Hướng dẫn cài đặt

### 0. Clone repository

```bash
git clone <repo-url>
cd DaoDuckWear
```

### 1. Redis (Docker)

Từ thư mục gốc, chạy:

```bash
docker-compose up -d
```

Lệnh này khởi động Redis 7 (container `daoduckwear_clothing_redis`):

- Port: **6379**
- Mật khẩu: **`123456`**
- Bật `appendonly`, giới hạn 1GB, policy `allkeys-lfu`

> Ghi các giá trị này vào `.env` của backend ở bước 3 (`REDIS_HOST=localhost`, `REDIS_PORT=6379`, `REDIS_PASSWORD=123456`).

### 2. MongoDB

Chọn **một** trong hai cách. Cả hai đều cho ra một `MONGODB_URI` dùng ở bước 3.

#### Cách A — MongoDB Atlas (khuyến nghị, nhanh nhất)

Atlas tạo sẵn replica set nên không cần cấu hình thêm.

1. Tạo tài khoản tại [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) và tạo một **free cluster (M0)**.
2. **Database Access** → tạo user + mật khẩu.
3. **Network Access** → thêm IP hiện tại (hoặc `0.0.0.0/0` khi dev).
4. **Connect → Drivers** → copy connection string, dạng:
   ```
   mongodb+srv://<user>:<password>@<cluster>.mongodb.net/daoduckwear?retryWrites=true&w=majority
   ```
5. Dán vào `MONGODB_URI` trong `.env` backend.

#### Cách B — MongoDB local có replica set

Nếu muốn chạy offline, cần khởi tạo replica set thủ công:

```bash
# 1. Chạy mongod ở chế độ replica set
mongod --replSet rs0 --dbpath /path/to/data --port 27017

# 2. Mở terminal khác, khởi tạo replica set (chỉ làm 1 lần)
mongosh
> rs.initiate()
```

Connection string khi đó:

```
MONGODB_URI=mongodb://localhost:27017/daoduckwear?replicaSet=rs0
```

> Nếu bỏ qua bước replica set, các thao tác đặt hàng/nhập kho sẽ lỗi `Transaction numbers are only allowed on a replica set member or mongos`.

### 3. Backend

```bash
cd apps/backend
npm install

# Tạo file .env từ mẫu rồi điền giá trị
cp .env.example .env      # Windows PowerShell: Copy-Item .env.example .env

# Seed dữ liệu khởi tạo (roles, users, shops, categories, colors...)
npm run seed

# Chạy dev server (hot-reload) — http://localhost:5000
npm run start:dev
```

### 4. Frontend

```bash
cd apps/frontend
npm install

# Tạo file .env (xem biến môi trường bên dưới)

# Chạy dev server — http://localhost:3000
npm run dev
```

---

## Biến môi trường

### Backend (`apps/backend/.env`)

Tạo từ `apps/backend/.env.example`:

| Biến | Mô tả |
|---|---|
| `PORT` | Cổng backend (mặc định `5000`) |
| `ENV` | Môi trường (`development` / `production`) |
| `FRONTEND_URL` | URL frontend cho CORS (mặc định `http://localhost:3000`) |
| `MONGODB_URI` | Connection string MongoDB (xem [bước 2](#2-mongodb)) |
| `GOOGLE_CLIENT_ID` | Client ID để verify Google ID Token phía server |
| `JWT_ACCESS_SECRET` | Khóa bí mật ký access token |
| `JWT_REFRESH_SECRET` | Khóa bí mật ký refresh token |
| `JWT_ACCESS_EXPIRES_IN` | Thời hạn access token (mặc định `15m`) |
| `JWT_REFRESH_EXPIRES_IN` | Thời hạn refresh token (mặc định `7d`) |
| `CLOUDINARY_CLOUD_NAME` | Tên cloud Cloudinary |
| `CLOUDINARY_API_KEY` | API key Cloudinary |
| `CLOUDINARY_API_SECRET` | API secret Cloudinary |
| `CLOUDINARY_ROOT_FOLDER_IMAGES` | Thư mục gốc lưu ảnh trên Cloudinary |
| `REDIS_HOST` | Host Redis (dùng `localhost` khi chạy Docker local) |
| `REDIS_PORT` | Cổng Redis (`6379`) |
| `REDIS_PASSWORD` | Mật khẩu Redis (`123456` theo docker-compose) |
| `IS_VERIFY_EMAIL` | `true`/`false` — bật xác thực email khi đăng ký |
| `SMTP_MAIL_HOST` | Host SMTP gửi mail |
| `SMTP_MAIL_PORT` | Cổng SMTP |
| `SMTP_MAIL_SECURE` | `true`/`false` — dùng TLS |
| `SMTP_MAIL_USER` | Tài khoản SMTP |
| `SMTP_MAIL_PASS` | Mật khẩu / app password SMTP |
| `SMTP_MAIL_FROM_EMAIL` | Email người gửi |
| `SMTP_FROM_NAME` | Tên hiển thị người gửi |
| `VNP_TMNCODE` | Mã website (Terminal Code) VNPAY |
| `VNP_URL` | URL cổng thanh toán VNPAY |
| `VNP_SECRET` | Secret key VNPAY để ký checksum |

> Để chạy thử cơ bản, các nhóm Cloudinary / SMTP / VNPAY có thể để trống — chỉ ảnh hưởng tới upload ảnh, gửi email và thanh toán online.

### Frontend (`apps/frontend/.env`)

| Biến | Mô tả |
|---|---|
| `NEXT_PUBLIC_API_URL` | URL backend (`http://localhost:5000`) |
| `NEXT_PUBLIC_NODE_ENV` | Môi trường (`development` / `production`) |
| `NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID` | Client ID cho Google Sign-In popup |
| `NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_SECRET` | Client secret OAuth |

---

## Tài khoản seed

Sau khi chạy `npm run seed`, hệ thống tạo sẵn các tài khoản (mật khẩu chung: **`123456`**):

| Email | Vai trò |
|---|---|
| `admin@daoduck.com` | ADMIN |
| `manager@daoduck.com` | MANAGER |
| `staff@daoduck.com` | STAFF |
| `receptionist@daoduck.com` | RECEPTIONIST |
| `user1@daoduck.com` … | USER (các tài khoản test) |

Seed cũng tạo sẵn 3 chi nhánh cửa hàng (Hà Nội, TP.HCM, Đà Nẵng), danh mục sản phẩm và bảng màu.

---

## Scripts thường dùng

### Backend (`apps/backend/`)

| Lệnh | Mô tả |
|---|---|
| `npm run start:dev` | Dev server hot-reload (port 5000) |
| `npm run build` | Build ra `dist/` |
| `npm run start:prod` | Chạy bản build |
| `npm run seed` | Seed database |
| `npm run lint` | ESLint + auto-fix |
| `npm run test` | Unit test (Jest) |
| `npm run test:e2e` | E2E test |

### Frontend (`apps/frontend/`)

| Lệnh | Mô tả |
|---|---|
| `npm run dev` | Dev server (port 3000) |
| `npm run build` | Build production |
| `npm run start` | Chạy bản build |
| `npm run lint` | ESLint |

---

## Truy cập

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5000 |
| Cấu trúc thư mục | [`docs/project-structure.md`](./docs/project-structure.md) |
| Tài liệu (diagram, ERD) | [`docs/diagrams/`](./docs/diagrams) |

---

## Troubleshooting

| Lỗi | Nguyên nhân & cách xử lý |
|---|---|
| `Transaction numbers are only allowed on a replica set member or mongos` | MongoDB đang chạy standalone. Dùng Atlas hoặc bật replica set local (xem [bước 2](#2-mongodb)). |
| `ECONNREFUSED 127.0.0.1:6379` / Redis connection error | Chưa khởi động Redis. Chạy `docker-compose up -d` ở thư mục gốc và kiểm tra `REDIS_*` trong `.env`. |
| Lỗi CORS khi FE gọi API | `FRONTEND_URL` trong `.env` backend không khớp URL frontend (`http://localhost:3000`). |
| `Port 5000/3000 already in use` | Đổi `PORT` (backend) hoặc dừng tiến trình đang chiếm cổng. |
| Đăng nhập Google thất bại | `GOOGLE_CLIENT_ID` (backend) và `NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID` (frontend) phải cùng một OAuth client. |
| Cookie refresh token không được set | Cookie dùng `secure: true` (chỉ HTTPS). Trên `localhost` trình duyệt thường vẫn chấp nhận; nếu lỗi, dùng `http://localhost` (không phải IP). |
