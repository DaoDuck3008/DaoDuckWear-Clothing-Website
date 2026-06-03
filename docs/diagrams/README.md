# Diagrams — DaoDuckWear

Tài liệu tổng quan toàn bộ biểu đồ mô tả hệ thống DaoDuckWear, tổ chức theo từng nhóm/module. Mỗi biểu đồ minh hoạ một góc nhìn: kiến trúc tổng thể, mô hình dữ liệu (ERD), hoặc luồng nghiệp vụ của một use case cụ thể.

## Loại file

| Đuôi | Công cụ | Mô tả | Render trên GitHub |
|---|---|---|---|
| `.mmd` | Mermaid | Sequence diagram, ER diagram, flowchart | Có (trong file `.md`) |
| `.puml` | PlantUML | Activity diagram (swim lanes, parallel) | Không — cần export ảnh |
| `.md` | Markdown | Tài liệu context kèm diagram + bảng giải thích | Có |

## Quy ước chung

- **Sequence diagram** mô tả tương tác kỹ thuật theo thời gian giữa các tầng: `Frontend → Backend → MongoDB (collection) → Redis`.
- **Activity diagram** mô tả luồng nghiệp vụ ở mức cao với swim lanes (`Customer`, `Hệ thống`, third party như `VNPay`, `Google OAuth`).
- **ER diagram** mô tả quan hệ giữa các MongoDB collection.
- Quy ước chi tiết (font, actor, participant, note...) xem trong skill: `.claude/skills/diagrams/SKILL.md`.

> Cách xem: file `.mmd` dùng extension **Mermaid Preview** trong VS Code (`Alt+D`); file `.puml` dùng extension **PlantUML**; file `.md` render trực tiếp trên GitHub.

---

## overview/ — Tổng quan hệ thống

Điểm khởi đầu để hiểu bức tranh toàn cảnh trước khi đi vào từng luồng chi tiết.

| Biểu đồ | File | Mô tả |
|---|---|---|
| Kiến trúc hệ thống | [`../system-architecture.mmd`](../system-architecture.mmd) · [`.md`](./overview/system-architecture.md) | Các tầng client → frontend → backend → data → external services |
| Use case tổng quát | [`overview/use-case-general.mmd`](./overview/use-case-general.mmd) · [`.md`](./overview/use-case-general.md) | 4 actor (Khách hàng, Nhân viên, Quản lý, Quản trị viên) và các chức năng chính |

---

## er/ — Mô hình dữ liệu (ER Diagrams)

Mô tả 18 collection và quan hệ giữa chúng. Bắt đầu từ tài liệu thiết kế CSDL để có mô tả đầy đủ từng trường.

| Biểu đồ | File | Mô tả |
|---|---|---|
| Thiết kế cơ sở dữ liệu | [`../database-design.md`](../database-design.md) | Tài liệu đầy đủ: từng collection, trường, ràng buộc, quyết định thiết kế |
| Tổng quan toàn hệ thống | [`er/er-overview.mmd`](./er/er-overview.mmd) | Sơ đồ quan hệ 18 collection (không kèm trường) |
| Tổng quan kèm trường chính | [`er/er-overview-detail.mmd`](./er/er-overview-detail.mmd) | Như trên nhưng có các trường chính của mỗi bảng |
| Product & Catalog domain | [`er/er-catalog.mmd`](./er/er-catalog.mmd) | Product, Variant, Category, Color |
| Inventory domain | [`er/er-inventory.mmd`](./er/er-inventory.mmd) | Inventory, Inventory Import |
| Commerce domain | [`er/er-commerce.mmd`](./er/er-commerce.mmd) | Order, Payment, Cart, Voucher |
| User & Social domain | [`er/er-user.mmd`](./er/er-user.mmd) | User, Role, Shop, Review, Favorite, Post |

---

## auth/ — Xác thực & phân quyền

Mỗi use case auth có sequence diagram (`.mmd`) ở mức kỹ thuật, activity diagram (`.puml`) ở mức nghiệp vụ, và một số có tài liệu context (`.md`).

| Use case | Sequence | Activity | Context |
|---|---|---|---|
| Đăng nhập (email/mật khẩu) | [`login.mmd`](./auth/login.mmd) | [`login-activity.puml`](./auth/login-activity.puml) | [`login.md`](./auth/login.md) |
| Đăng ký + xác thực email | [`register.mmd`](./auth/register.mmd) | [`register-activity.puml`](./auth/register-activity.puml) | [`register.md`](./auth/register.md) |
| Đăng nhập Google OAuth | [`google-login.mmd`](./auth/google-login.mmd) | [`google-login-activity.puml`](./auth/google-login-activity.puml) | [`google-login.md`](./auth/google-login.md) |
| Quên / đặt lại mật khẩu | — | [`forgot-password-activity.puml`](./auth/forgot-password-activity.puml) | — |

---

## products/ — Sản phẩm

| Use case | File |
|---|---|
| Tạo sản phẩm — sequence | [`products/create-product.mmd`](./products/create-product.mmd) |
| Tạo sản phẩm — activity | [`products/create-product-activity.puml`](./products/create-product-activity.puml) |
| Cập nhật sản phẩm | [`products/update-product.mmd`](./products/update-product.mmd) |
| Xem chi tiết sản phẩm | [`products/get-product-detail.mmd`](./products/get-product-detail.mmd) |
| Xoá sản phẩm | [`products/delete-product.mmd`](./products/delete-product.mmd) |
| Danh sách sản phẩm (public) | [`products/list-products.mmd`](./products/list-products.mmd) |

---

## categories/ — Danh mục

| Use case | File |
|---|---|
| Danh sách danh mục (public, dạng cây) | [`categories/list-categories.mmd`](./categories/list-categories.mmd) |
| Danh sách danh mục (admin, dạng phẳng) | [`categories/list-categories-admin.mmd`](./categories/list-categories-admin.mmd) |
| Tạo danh mục | [`categories/create-category.mmd`](./categories/create-category.mmd) |
| Cập nhật danh mục | [`categories/update-category.mmd`](./categories/update-category.mmd) |
| Xoá danh mục | [`categories/delete-category.mmd`](./categories/delete-category.mmd) |

---

## orders/ — Đơn hàng

| Use case | File |
|---|---|
| Đặt hàng — sequence | [`orders/create-order.mmd`](./orders/create-order.mmd) |
| Đặt hàng — activity | [`orders/create-order-activity.puml`](./orders/create-order-activity.puml) |
| Huỷ đơn hàng (khách) | [`orders/cancel-order.mmd`](./orders/cancel-order.mmd) |
| Cập nhật trạng thái đơn (admin/staff) | [`orders/update-order-status.mmd`](./orders/update-order-status.mmd) |
| Xác nhận đã nhận hàng | [`orders/confirm-receipt.mmd`](./orders/confirm-receipt.mmd) |
| Danh sách đơn hàng | [`orders/list-orders.mmd`](./orders/list-orders.mmd) |

---

## cart/ — Giỏ hàng

| Use case | File |
|---|---|
| Thêm sản phẩm vào giỏ | [`cart/add-to-cart.mmd`](./cart/add-to-cart.mmd) |
| Cập nhật số lượng | [`cart/update-cart-item.mmd`](./cart/update-cart-item.mmd) |
| Xoá sản phẩm khỏi giỏ | [`cart/remove-cart-item.mmd`](./cart/remove-cart-item.mmd) |
| Lấy giỏ hàng | [`cart/get-cart.mmd`](./cart/get-cart.mmd) |

---

## vouchers/ — Mã giảm giá

Luồng CRUD voucher (chỉ Admin). Mỗi thao tác tách riêng một file.

| Use case | File |
|---|---|
| Tạo voucher | [`vouchers/create-voucher.mmd`](./vouchers/create-voucher.mmd) |
| Danh sách voucher | [`vouchers/list-voucher.mmd`](./vouchers/list-voucher.mmd) |
| Cập nhật voucher | [`vouchers/update-voucher.mmd`](./vouchers/update-voucher.mmd) |
| Xoá voucher (soft delete) | [`vouchers/delete-voucher.mmd`](./vouchers/delete-voucher.mmd) |

---

## inventory/ — Kho hàng

| Use case | File |
|---|---|
| Tạo phiếu nhập kho | [`inventory/create-import.mmd`](./inventory/create-import.mmd) |
| Huỷ phiếu nhập kho | [`inventory/revoke-import.mmd`](./inventory/revoke-import.mmd) |

---

## payments/ — Thanh toán

| Use case | File |
|---|---|
| Thanh toán qua VNPay (create + return + IPN) | [`payments/vnpay-payment.mmd`](./payments/vnpay-payment.mmd) · [`.md`](./payments/vnpay-payment.md) |

---

## users/ — Quản lý nhân viên & khách hàng

| Use case | File |
|---|---|
| Tạo tài khoản nhân viên | [`users/create-staff.mmd`](./users/create-staff.mmd) |
| Danh sách nhân viên | [`users/list-staff.mmd`](./users/list-staff.mmd) |
| Xem chi tiết nhân viên | [`users/get-staff-detail.mmd`](./users/get-staff-detail.mmd) |
| Cập nhật tài khoản nhân viên | [`users/update-staff.mmd`](./users/update-staff.mmd) |
| Xoá tài khoản nhân viên | [`users/delete-staff.mmd`](./users/delete-staff.mmd) |
| Đặt lại mật khẩu nhân viên | [`users/reset-staff-password.mmd`](./users/reset-staff-password.mmd) |
| Khoá / mở khoá tài khoản khách hàng | [`users/lock-customer.mmd`](./users/lock-customer.mmd) |

---

## chat/ — Nhắn tin

| Use case | File |
|---|---|
| Gửi tin nhắn (realtime, Socket.io) | [`chat/send-message.mmd`](./chat/send-message.mmd) · [`.md`](./chat/send-message.md) |
