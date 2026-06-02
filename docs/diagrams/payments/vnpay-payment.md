# Sequence Diagram — Thanh toán đơn hàng qua VNPay

## Actors

| Actor | Mô tả |
|-------|-------|
| Khách hàng | Chọn phương thức VNPAY tại trang checkout và thực hiện thanh toán |
| VNPay | Cổng thanh toán bên thứ ba — xử lý giao dịch, gọi Return + IPN về hệ thống |

## Tổng quan

Luồng VNPay gồm **3 giai đoạn**, trong đó Return (qua trình duyệt) và IPN (server-to-server) chạy **song song** và đều cập nhật trạng thái đơn hàng:

- **Return** — hiển thị kết quả cho người dùng xem, nhưng không đảm bảo chạy (user có thể tắt trình duyệt).
- **IPN** — VNPay chủ động gọi server, là **nguồn cập nhật đáng tin cậy nhất**.

Cả hai đều **bắt buộc verify chữ ký HMAC-SHA512** trước khi tin dữ liệu, vì query string có thể bị giả mạo. Việc cập nhật đơn dùng điều kiện `paymentStatus: { $ne: PAID }` để **chống cập nhật trùng** khi cả Return và IPN cùng xử lý.

## Diagram

```mermaid
%%{init: {'themeVariables': {'fontSize': '18px'}}}%%
sequenceDiagram
    autonumber
    actor Customer as Khach hang
    participant FE as Frontend<br/>(checkout + payment.api)
    participant BE as Backend<br/>(PaymentsController + PaymentsService)
    participant Orders as MongoDB (orders)
    participant VNPay as VNPay<br/>(Cong thanh toan)

    rect rgb(235, 242, 255)
        Note over Customer,VNPay: Giai doan 1 — Tao don & xin URL thanh toan

        Customer->>FE: Chọn VNPAY, nhấn "Đặt hàng"
        FE->>BE: POST /orders { ... paymentMethod: "VNPAY" }
        BE->>Orders: Tạo order (status PENDING, paymentStatus UNPAID)
        Orders-->>BE: order { id, orderCode, finalTotal }
        BE-->>FE: 201 { id, orderCode }

        FE->>BE: POST /payments/vnpay/create { orderId }
        Note over FE,BE: Request này có AuthGuard — gửi kèm access token

        BE->>Orders: findById(orderId)
        alt Đơn không hợp lệ (sai chủ / không phải VNPAY / đã thanh toán)
            Orders-->>BE: order
            BE-->>FE: 400 / 404 Lỗi tương ứng
            FE-->>Customer: Hiển thị lỗi
        else Hợp lệ
            Orders-->>BE: order
            BE->>BE: Dựng tham số + ký HMAC-SHA512
            Note over BE: vnp_Amount = finalTotal × 100 (VNPay tính theo đơn vị nhỏ nhất)<br/>vnp_TxnRef = orderCode (mã tra cứu)<br/>vnp_ReturnUrl trỏ về chính backend (/payments/vnpay/return)<br/>vnp_SecureHash = HMAC-SHA512(sortedParams, VNP_SECRET)
            BE-->>FE: 200 { paymentUrl }
            FE->>Customer: window.location = paymentUrl (redirect)
        end
    end

    rect rgb(235, 255, 240)
        Note over Customer,VNPay: Giai doan 2 — Thanh toan & Return (qua trinh duyet)

        Customer->>VNPay: Quét QR / nhập thẻ test, xác nhận thanh toán
        VNPay-->>Customer: Trừ tiền, tạo giao dịch
        VNPay->>BE: Redirect trình duyệt → GET /payments/vnpay/return?vnp_*
        Note over VNPay,BE: Return đi qua trình duyệt user — KHÔNG đảm bảo chạy<br/>(user có thể tắt trình duyệt giữa chừng)

        BE->>BE: Tách vnp_SecureHash, tính lại HMAC từ tham số còn lại
        alt Sai chữ ký hoặc ResponseCode ≠ 00
            BE->>FE: Redirect → /checkout/result?status=failed
            FE-->>Customer: Hiển thị "Thanh toán thất bại"
        else Chữ ký hợp lệ & ResponseCode = 00
            BE->>Orders: updateOne(paymentStatus ≠ PAID → PAID, paidAt, transactionId)
            Note over BE,Orders: Điều kiện { paymentStatus: { $ne: PAID } }<br/>chống cập nhật trùng khi IPN đã xử lý trước đó
            BE->>FE: Redirect → /checkout/result?status=success&orderCode
            FE-->>Customer: Hiển thị "Thanh toán thành công"
        end
    end

    rect rgb(255, 245, 230)
        Note over Customer,VNPay: Giai doan 3 — IPN (server VNPay goi server, chay ngam song song)

        VNPay->>BE: GET /payments/vnpay/ipn?vnp_*
        Note over VNPay,BE: IPN là server-to-server, độc lập với trình duyệt user<br/>→ Đây là NGUỒN cập nhật trạng thái đáng tin cậy nhất
        BE->>BE: Verify chữ ký HMAC-SHA512
        alt Sai chữ ký
            BE-->>VNPay: { RspCode: "97", Message: "Invalid Checksum" }
        else Không tìm thấy đơn
            BE->>Orders: findOne({ orderCode })
            Orders-->>BE: null
            BE-->>VNPay: { RspCode: "01", Message: "Order Not Found" }
        else Đơn đã xác nhận trước đó
            BE->>Orders: findOne({ orderCode })
            Orders-->>BE: order (paymentStatus = PAID)
            BE-->>VNPay: { RspCode: "02", Message: "Order Already Confirmed" }
        else Hợp lệ & ResponseCode = 00
            BE->>Orders: updateOne → PAID, paidAt, transactionId
            BE-->>VNPay: { RspCode: "00", Message: "Confirm Success" }
        end
    end
```

## Source code liên quan

| File | Vai trò |
|------|---------|
| `apps/frontend/app/(app)/checkout/page.tsx` | Trang checkout — chọn VNPAY, tạo order rồi redirect sang VNPay |
| `apps/frontend/app/(app)/checkout/result/page.tsx` | Trang hiển thị kết quả thanh toán (success / failed) |
| `apps/frontend/apis/payment.api.ts` | Axios wrapper gọi `POST /payments/vnpay/create` |
| `apps/backend/src/modules/payments/payments.controller.ts` | 3 endpoint: create (có AuthGuard), return (redirect), ipn (server-to-server) |
| `apps/backend/src/modules/payments/payments.service.ts` | Build URL ký HMAC-SHA512, verify checksum Return & IPN, cập nhật order |
| `apps/backend/src/modules/orders/schemas/order.schema.ts` | Schema order — chứa `paymentStatus`, `paidAt`, `transactionId` |

## Ghi chú kỹ thuật

| Khái niệm | Giải thích |
|-----------|-----------|
| `vnp_Amount × 100` | VNPay nhận số tiền theo đơn vị nhỏ nhất (không có phần thập phân), nên VND phải nhân 100 |
| `vnp_TxnRef` | Mã tham chiếu giao dịch — dùng `orderCode` để dễ tra cứu và liên kết ngược về đơn hàng |
| `vnp_ReturnUrl` | Phải trỏ về **backend** (không phải frontend) — backend verify checksum xong mới redirect tiếp sang frontend |
| HMAC-SHA512 | Băm tham số đã sắp xếp theo ASCII với `VNP_SECRET`. Chỉ bạn và VNPay biết secret → xác minh dữ liệu không bị giả mạo |
| `RspCode` (IPN) | Mã phản hồi chuẩn để VNPay biết server đã nhận; trả sai format → VNPay gọi lại nhiều lần |
| `$ne: PAID` | Điều kiện cập nhật idempotent — đảm bảo đơn không bị xử lý 2 lần khi Return và IPN cùng chạy |
