# Diagrams — DaoDuckWear

Danh sách diagram theo từng module backend.

**Loại file:**
- `.mmd` — Mermaid (sequence diagram, ER diagram) — render trực tiếp trên GitHub
- `.puml` — PlantUML (activity diagram) — cần export thành ảnh

**Trạng thái:**
- ✅ Đã hoàn thành
- 🔲 Chưa làm

---

## er/ (ER Diagrams)

| Diagram | File | Trạng thái |
|---------|------|------------|
| Tổng quan toàn hệ thống (18 collections) | `er/er-overview.mmd` | ✅ |
| Product & Catalog domain | `er/er-catalog.mmd` | ✅ |
| Inventory domain | `er/er-inventory.mmd` | ✅ |
| Commerce domain (Order, Payment, Cart, Voucher) | `er/er-commerce.mmd` | ✅ |
| User & Social domain | `er/er-user.mmd` | ✅ |

---

## auth/

| Use case | File | Trạng thái |
|----------|------|------------|
| Đăng nhập (email/password) — sequence | `auth/login.mmd` | ✅ |
| Đăng ký tài khoản + xác thực email — sequence | `auth/register.mmd` | ✅ |
| Đăng nhập Google OAuth | `auth/google-login.mmd` | ✅ |
| Quên mật khẩu | `auth/forgot-password.mmd` | 🔲 |
| Đặt lại mật khẩu | `auth/reset-password.mmd` | 🔲 |
| Refresh token | `auth/refresh-token.mmd` | 🔲 |
| Đổi mật khẩu | `auth/change-password.mmd` | 🔲 |
| Đăng nhập (email/password) — activity | `auth/login-activity.puml` | ✅ |
| Đăng ký + xác thực email — activity | `auth/register-activity.puml` | ✅ |
| Đăng nhập Google OAuth — activity | `auth/google-login-activity.puml` | ✅ |
| Quên mật khẩu + đặt lại mật khẩu — activity | `auth/forgot-password-activity.puml` | ✅ |

---

## products/

| Use case | File | Trạng thái |
|----------|------|------------|
| Tạo sản phẩm — sequence | `products/create-product.mmd` | ✅ |
| Cập nhật sản phẩm | `products/update-product.mmd` | ✅ |
| Xem chi tiết sản phẩm | `products/get-product-detail.mmd` | ✅ |
| Xoá sản phẩm | `products/delete-product.mmd` | ✅ |
| Danh sách sản phẩm (public) | `products/list-products.mmd` | ✅ |
| Sản phẩm tương tự | `products/similar-products.mmd` | 🔲 |
| Tạo sản phẩm — activity | `products/create-product-activity.puml` | ✅ |

---

## categories/

| Use case | File | Trạng thái |
|----------|------|------------|
| Danh sách danh mục (public, dạng cây) | `categories/list-categories.mmd` | ✅ |
| Danh sách danh mục (admin, dạng phẳng) | `categories/list-categories-admin.mmd` | ✅ |
| Tạo danh mục | `categories/create-category.mmd` | ✅ |
| Cập nhật danh mục | `categories/update-category.mmd` | ✅ |
| Xoá danh mục | `categories/delete-category.mmd` | ✅ |

---

## orders/

| Use case | File | Trạng thái |
|----------|------|------------|
| Đặt hàng — sequence | `orders/create-order.mmd` | ✅ |
| Huỷ đơn hàng (customer) | `orders/cancel-order.mmd` | ✅ |
| Cập nhật trạng thái đơn (admin/staff) | `orders/update-order-status.mmd` | ✅ |
| Xác nhận đã nhận hàng | `orders/confirm-receipt.mmd` | ✅ |
| Danh sách đơn hàng | `orders/list-orders.mmd` | ✅ |
| Đặt hàng — activity | `orders/create-order-activity.puml` | ✅ |

---

## cart/

| Use case | File | Trạng thái |
|----------|------|------------|
| Thêm sản phẩm vào giỏ | `cart/add-to-cart.mmd` | ✅ |
| Cập nhật số lượng | `cart/update-cart-item.mmd` | ✅ |
| Xoá sản phẩm khỏi giỏ | `cart/remove-cart-item.mmd` | ✅ |
| Lấy giỏ hàng | `cart/get-cart.mmd` | ✅ |

---

## vouchers/

| Use case | File | Trạng thái |
|----------|------|------------|
| Kiểm tra và xem trước voucher | `vouchers/validate-voucher.mmd` | 🔲 |
| Tạo voucher | `vouchers/create-voucher.mmd` | 🔲 |

---

## inventory/

| Use case | File | Trạng thái |
|----------|------|------------|
| Tạo phiếu nhập kho | `inventory/create-import.mmd` | ✅ |
| Huỷ phiếu nhập kho | `inventory/revoke-import.mmd` | ✅ |

---

## payments/

| Use case | File | Trạng thái |
|----------|------|------------|
| Thanh toán đơn hàng qua VNPay (create + return + IPN) | `payments/vnpay-payment.mmd` | ✅ |

---

## reviews/

| Use case | File | Trạng thái |
|----------|------|------------|
| Viết đánh giá sản phẩm | `reviews/create-review.mmd` | 🔲 |

---

## users/

| Use case | File | Trạng thái |
|----------|------|------------|
| Tạo tài khoản nhân viên | `users/create-staff.mmd` | ✅ |
| Danh sách nhân viên | `users/list-staff.mmd` | ✅ |
| Xem chi tiết nhân viên | `users/get-staff-detail.mmd` | ✅ |
| Cập nhật tài khoản nhân viên | `users/update-staff.mmd` | ✅ |
| Xoá tài khoản nhân viên | `users/delete-staff.mmd` | ✅ |
| Đặt lại mật khẩu nhân viên | `users/reset-staff-password.mmd` | ✅ |
| Khoá / mở khoá tài khoản khách hàng | `users/lock-customer.mmd` | ✅ |

---

## favorites/

| Use case | File | Trạng thái |
|----------|------|------------|
| Thêm / xoá sản phẩm yêu thích | `favorites/toggle-favorite.mmd` | 🔲 |

---

## Tóm tắt tiến độ

| Module | Hoàn thành | Tổng |
|--------|-----------|------|
| er (ER diagrams) | 5 | 5 |
| auth | 7 | 11 |
| categories | 5 | 5 |
| products | 6 | 7 |
| orders | 6 | 6 |
| cart | 4 | 4 |
| vouchers | 0 | 2 |
| inventory | 2 | 2 |
| payments | 1 | 1 |
| reviews | 0 | 1 |
| users | 7 | 7 |
| favorites | 0 | 1 |
| **Tổng** | **43** | **52** |
