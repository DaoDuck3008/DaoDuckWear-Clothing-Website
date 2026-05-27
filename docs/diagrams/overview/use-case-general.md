# Use Case Diagram — Tổng quát DaoDuckWear

## Actors

| Actor | Role DB | Mô tả |
|-------|---------|-------|
| Khách hàng | `USER` | Người dùng đã đăng ký — mua hàng, quản lý đơn, đánh giá |
| Nhân viên | `STAFF` | Xử lý đơn hàng, nhập kho, xem thống kê chi nhánh |
| Quản lý | `MANAGER` | Mọi quyền của Nhân viên + xem nhân sự, thu hồi phiếu kho |
| Quản trị viên | `ADMIN` | Toàn quyền hệ thống |

> Quan hệ kế thừa: Nhân viên ⊃ Khách hàng · Quản lý ⊃ Nhân viên · Quản trị viên ⊃ Quản lý

## Diagram

```mermaid
%%{init: {'themeVariables': {'fontSize': '16px'}}}%%
flowchart LR
    %% ===== ACTORS =====
    KH(["Khách hàng"])
    NV(["Nhân viên"])
    QL(["Quản lý"])
    ADM(["Quản trị viên"])

    NV -. kế thừa .-> KH
    QL -. kế thừa .-> NV
    ADM -. kế thừa .-> QL

    subgraph SYS["Hệ thống DaoDuckWear"]

        subgraph GRP_AUTH["Xác thực"]
            UC1(["Đăng ký tài khoản"])
            UC2(["Đăng nhập (Email / Google)"])
            UC3(["Quên mật khẩu"])
            UC4(["Đăng xuất"])
        end

        subgraph GRP_PROFILE["Hồ sơ cá nhân"]
            UC5(["Xem & Cập nhật hồ sơ"])
            UC6(["Đổi mật khẩu"])
            UC7(["Upload ảnh đại diện"])
        end

        subgraph GRP_SHOP["Mua hàng"]
            UC8(["Xem & Tìm sản phẩm"])
            UC9(["Quản lý giỏ hàng"])
            UC10(["Đặt hàng & Thanh toán"])
        end

        subgraph GRP_POST["Sau mua hàng"]
            UC11(["Xem lịch sử đơn hàng"])
            UC12(["Hủy đơn hàng"])
            UC13(["Xác nhận nhận hàng"])
            UC14(["Đánh giá sản phẩm"])
            UC15(["Yêu thích sản phẩm"])
            UC16(["Dùng mã voucher"])
        end

        subgraph GRP_OPS["Vận hành"]
            UC17(["Xem & Cập nhật đơn hàng"])
            UC18(["Quản lý kho hàng"])
            UC19(["Xem thống kê & Dashboard"])
        end

        subgraph GRP_MGR["Quản lý chi nhánh"]
            UC20(["Xem danh sách nhân viên"])
            UC21(["Thu hồi phiếu nhập kho"])
        end

        subgraph GRP_ADM["Quản trị hệ thống"]
            UC22(["Quản lý sản phẩm"])
            UC23(["Quản lý danh mục"])
            UC24(["Quản lý banner"])
            UC25(["Quản lý voucher"])
            UC26(["Quản lý khách hàng"])
            UC27(["Quản lý nhân viên"])
            UC28(["Xem Audit Logs"])
            UC29(["Thống kê toàn hệ thống"])
        end

    end

    %% ===== CONNECTIONS =====
    KH --> UC1 & UC2 & UC3 & UC4
    KH --> UC5 & UC6 & UC7
    KH --> UC8 & UC9 & UC10
    KH --> UC11 & UC12 & UC13 & UC14 & UC15 & UC16

    NV --> UC17 & UC18 & UC19

    QL --> UC20 & UC21

    ADM --> UC22 & UC23 & UC24 & UC25 & UC26 & UC27 & UC28 & UC29

    %% ===== STYLES =====
    style GRP_AUTH  fill:#EBF5FF,stroke:#4A90D9,color:#000
    style GRP_PROFILE fill:#EBF5FF,stroke:#4A90D9,color:#000
    style GRP_SHOP  fill:#EBF5FF,stroke:#4A90D9,color:#000
    style GRP_POST  fill:#EBF5FF,stroke:#4A90D9,color:#000
    style GRP_OPS   fill:#FFF7EB,stroke:#E8A020,color:#000
    style GRP_MGR   fill:#FFF3EB,stroke:#D4631A,color:#000
    style GRP_ADM   fill:#FCEEF5,stroke:#B91446,color:#000
    style SYS       fill:#F8F9FA,stroke:#555,color:#000

    style KH  fill:#D6EAFF,stroke:#4A90D9,color:#000
    style NV  fill:#FFF0D6,stroke:#E8A020,color:#000
    style QL  fill:#FFE6D6,stroke:#D4631A,color:#000
    style ADM fill:#F5D6E8,stroke:#B91446,color:#000
```

## Nhóm chức năng

| Màu nền | Nhóm | Use Cases |
|---------|------|-----------|
| Xanh dương | Xác thực + Hồ sơ + Mua hàng + Sau mua | UC1 – UC16 (Khách hàng) |
| Cam vàng | Vận hành | UC17 – UC19 (Nhân viên) |
| Cam đậm | Quản lý chi nhánh | UC20 – UC21 (Quản lý) |
| Hồng đỏ | Quản trị hệ thống | UC22 – UC29 (Quản trị viên) |

## Source code liên quan

| File | Vai trò |
|------|---------|
| `apps/backend/src/modules/auth/auth.controller.ts` | UC1–UC4, UC6 |
| `apps/backend/src/modules/users/users.controller.ts` | UC5, UC7, UC20, UC26, UC27 |
| `apps/backend/src/modules/products/products.controller.ts` | UC8, UC22 |
| `apps/backend/src/modules/cart/cart.controller.ts` | UC9 |
| `apps/backend/src/modules/orders/orders.controller.ts` | UC10–UC13, UC17 |
| `apps/backend/src/modules/reviews/reviews.controller.ts` | UC14 |
| `apps/backend/src/modules/favorites/favorites.controller.ts` | UC15 |
| `apps/backend/src/modules/vouchers/vouchers.controller.ts` | UC16, UC25 |
| `apps/backend/src/modules/inventory/inventory.controller.ts` | UC18, UC21 |
| `apps/backend/src/modules/analytics/analytics.controller.ts` | UC19, UC29 |
| `apps/backend/src/modules/categories/categories.controller.ts` | UC23 |
| `apps/backend/src/modules/banners/banners.controller.ts` | UC24 |
| `apps/backend/src/modules/audit-logs/audit-logs.controller.ts` | UC28 |
