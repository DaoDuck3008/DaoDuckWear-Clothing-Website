import 'dotenv/config';
import mongoose from 'mongoose';

import { OrderSchema } from '../../modules/orders/schemas/order.schema';
import { ProductSchema } from '../../modules/products/schemas/product.schema';
import { ProductVariantSchema } from '../../modules/products/schemas/product-variant.schema';
import { InventorySchema } from '../../modules/inventory/schemas/inventory.schema';
import { UserSchema } from '../../modules/users/schemas/user.schema';
import { RoleSchema } from '../../modules/roles/schemas/role.schema';

const OrderModel = mongoose.model('Order', OrderSchema);
const ProductModel = mongoose.model('Product', ProductSchema);
const ProductVariantModel = mongoose.model(
  'ProductVariant',
  ProductVariantSchema,
);
const InventoryModel = mongoose.model('Inventory', InventorySchema);
const UserModel = mongoose.model('User', UserSchema);
const RoleModel = mongoose.model('Role', RoleSchema);

// Số đơn MỚI cần sinh (giữ nguyên đơn cũ).
const NEW_ORDERS = 80;
// Trải createdAt trong 30 ngày gần đây.
const SPREAD_DAYS = 30;
const SHIPPING_FEE = 30000;

// ---- Tiện ích random ----
const rand = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const pick = <T>(arr: T[]): T => arr[rand(0, arr.length - 1)];

// Chọn 1 phần tử theo trọng số: [['COD', 50], ...]
const weighted = <T>(pairs: [T, number][]): T => {
  const total = pairs.reduce((s, [, w]) => s + w, 0);
  let r = Math.random() * total;
  for (const [value, w] of pairs) {
    if ((r -= w) <= 0) return value;
  }
  return pairs[pairs.length - 1][0];
};

// Lấy n phần tử không trùng nhau.
const sampleUnique = <T>(arr: T[], n: number): T[] => {
  const copy = [...arr];
  const out: T[] = [];
  const take = Math.min(n, copy.length);
  for (let i = 0; i < take; i++) {
    out.push(copy.splice(rand(0, copy.length - 1), 1)[0]);
  }
  return out;
};

// Sinh số giao dịch giả lập (giống VNPay/MoMo): 14 chữ số.
const fakeTxnId = () =>
  Array.from({ length: 14 }, () => rand(0, 9)).join('');

// ---- Dữ liệu địa chỉ / khách giả lập ----
const lastNames = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Vũ', 'Đặng', 'Bùi', 'Đỗ', 'Ngô', 'Dương'];
const midNames = ['Văn', 'Thị', 'Hữu', 'Đức', 'Minh', 'Thanh', 'Quốc', 'Ngọc', 'Gia', 'Hải'];
const firstNames = ['An', 'Bình', 'Châu', 'Dũng', 'Giang', 'Hà', 'Hùng', 'Khoa', 'Lan', 'Linh', 'Mai', 'Nam', 'Phúc', 'Quân', 'Sơn', 'Trang', 'Tú', 'Vy', 'Yến', 'Đạt'];

const places = [
  {
    province: 'Hà Nội',
    wards: ['Phường Cầu Giấy', 'Phường Đống Đa', 'Phường Hoàn Kiếm', 'Phường Hai Bà Trưng', 'Phường Thanh Xuân'],
    streets: ['Số 12 Trần Duy Hưng', 'Số 88 Láng Hạ', 'Số 45 Nguyễn Trãi', 'Số 7 Tôn Đức Thắng', 'Số 102 Xuân Thủy'],
  },
  {
    province: 'TP. Hồ Chí Minh',
    wards: ['Phường Bến Nghé', 'Phường Tân Định', 'Phường Bình Thạnh', 'Phường Phú Nhuận', 'Phường Tân Bình'],
    streets: ['Số 25 Lê Lợi', 'Số 156 Hai Bà Trưng', 'Số 9 Nguyễn Huệ', 'Số 240 Điện Biên Phủ', 'Số 33 Cách Mạng Tháng 8'],
  },
  {
    province: 'Đà Nẵng',
    wards: ['Phường Hải Châu', 'Phường Thanh Khê', 'Phường Sơn Trà', 'Phường Ngũ Hành Sơn', 'Phường Liên Chiểu'],
    streets: ['Số 18 Bạch Đằng', 'Số 56 Nguyễn Văn Linh', 'Số 3 Lê Duẩn', 'Số 77 Trần Phú', 'Số 120 Hùng Vương'],
  },
];

const buildShippingAddress = (email: string) => {
  const place = pick(places);
  const fullName = `${pick(lastNames)} ${pick(midNames)} ${pick(firstNames)}`;
  const phone = `0${pick(['9', '8', '7', '3', '5'])}${Array.from({ length: 8 }, () => rand(0, 9)).join('')}`;
  return {
    fullName,
    email,
    phone,
    province: place.province,
    ward: pick(place.wards),
    address: pick(place.streets),
    note: Math.random() < 0.2 ? 'Giao giờ hành chính giúp em nhé' : undefined,
  };
};

async function main() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) throw new Error('Missing MONGODB_URI');

  await mongoose.connect(mongoUri);
  console.log('Bắt đầu seed đơn hàng (orders)...');

  // 1. Khách hàng (role USER)
  const userRole = await RoleModel.findOne({ name: 'USER' }).lean();
  if (!userRole) throw new Error('Không tìm thấy role USER');
  const customers = await UserModel.find({ roleId: userRole._id })
    .select('_id email')
    .lean();
  if (customers.length === 0) throw new Error('Không có khách hàng nào');

  // 2. Pool sản phẩm có thể mua: dựa trên inventory (variant + shop hợp lệ)
  const inventories = await InventoryModel.find().lean();
  const productMap = new Map(
    (await ProductModel.find({ deletedAt: null }).lean()).map((p) => [
      p._id.toString(),
      p,
    ]),
  );
  const variantMap = new Map(
    (await ProductVariantModel.find({ deletedAt: null }).lean()).map((v) => [
      v._id.toString(),
      v,
    ]),
  );

  const pool = inventories
    .map((inv) => {
      const product = productMap.get(inv.productId.toString());
      const variant = variantMap.get(inv.variantId.toString());
      if (!product || !variant) return null;
      const mainImage =
        (product.images || []).find((img: any) => img.isMain)?.url ||
        (product.images || [])[0]?.url;
      return {
        productId: product._id,
        variantId: variant._id,
        shopId: inv.shopId,
        name: product.name,
        image: mainImage,
        size: variant.size || 'Freesize',
        color: variant.color || 'Mặc định',
        price: variant.price || product.basePrice,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  if (pool.length === 0) {
    throw new Error('Không dựng được pool sản phẩm từ inventory');
  }
  console.log(
    `Khách hàng: ${customers.length} | Pool item khả dụng: ${pool.length}`,
  );

  const now = Date.now();
  const usedCodes = new Set<string>();
  const docs: any[] = [];

  for (let i = 0; i < NEW_ORDERS; i++) {
    const customer = pick(customers);

    // createdAt ngẫu nhiên trong SPREAD_DAYS ngày qua
    const createdAt = new Date(
      now - rand(0, SPREAD_DAYS * 24 * 60) * 60 * 1000,
    );

    // 1-4 item khác nhau, mỗi item số lượng 1-3
    const chosen = sampleUnique(pool, rand(1, 4));
    const items = chosen.map((it) => ({ ...it, quantity: rand(1, 3) }));
    const totalAmount = items.reduce(
      (s, it) => s + it.price * it.quantity,
      0,
    );
    const discountAmount = 0;
    const finalTotal = totalAmount + SHIPPING_FEE - discountAmount;

    const paymentMethod = weighted<'COD' | 'VNPAY' | 'MOMO' | 'BANK_TRANSFER'>([
      ['COD', 50],
      ['VNPAY', 25],
      ['MOMO', 15],
      ['BANK_TRANSFER', 10],
    ]);
    const isOnline = paymentMethod !== 'COD';

    const status = weighted<
      'COMPLETED' | 'SHIPPING' | 'CONFIRMED' | 'PENDING' | 'CANCELLED'
    >([
      ['COMPLETED', 45],
      ['SHIPPING', 15],
      ['CONFIRMED', 15],
      ['PENDING', 12],
      ['CANCELLED', 13],
    ]);

    // Suy ra paymentStatus / paidAt / transactionId nhất quán
    let paymentStatus: 'UNPAID' | 'PAID' | 'REFUNDED' = 'UNPAID';
    let paidAt: Date | null = null;
    let transactionId: string | null = null;

    const markPaid = () => {
      paymentStatus = 'PAID';
      // paidAt: sau createdAt 0-2 ngày, không vượt hiện tại
      paidAt = new Date(
        Math.min(createdAt.getTime() + rand(0, 2 * 24 * 60) * 60 * 1000, now),
      );
      if (isOnline) transactionId = fakeTxnId();
    };

    if (status === 'COMPLETED') {
      // COD trả khi nhận, online trả trước -> đều PAID
      markPaid();
    } else if (status === 'SHIPPING' || status === 'CONFIRMED') {
      // Online trả trước nên đã PAID; COD vẫn UNPAID (thu khi giao)
      if (isOnline) markPaid();
    } else if (status === 'PENDING') {
      // Vừa tạo, chưa thanh toán
      paymentStatus = 'UNPAID';
    } else if (status === 'CANCELLED') {
      // Online: ~50% đã thanh toán rồi hủy -> hoàn tiền (REFUNDED)
      if (isOnline && Math.random() < 0.5) {
        paidAt = new Date(
          Math.min(
            createdAt.getTime() + rand(0, 1 * 24 * 60) * 60 * 1000,
            now,
          ),
        );
        transactionId = fakeTxnId();
        paymentStatus = 'REFUNDED';
      } else {
        paymentStatus = 'UNPAID';
      }
    }

    // orderCode duy nhất: DDW-YYYYMMDD-HEX (YYYYMMDD theo createdAt)
    const ymd =
      createdAt.getFullYear() +
      String(createdAt.getMonth() + 1).padStart(2, '0') +
      String(createdAt.getDate()).padStart(2, '0');
    let code: string;
    do {
      const hex = Array.from({ length: 8 }, () =>
        '0123456789ABCDEF'[rand(0, 15)],
      ).join('');
      code = `DDW-${ymd}-${hex}`;
    } while (usedCodes.has(code));
    usedCodes.add(code);

    // updatedAt: bám theo cột mốc cuối cùng của đơn
    const updatedAt = paidAt && paidAt > createdAt ? paidAt : createdAt;

    docs.push({
      orderCode: code,
      userId: customer._id,
      shippingAddress: buildShippingAddress(customer.email),
      items,
      totalAmount,
      shippingFee: SHIPPING_FEE,
      voucherCode: null,
      discountAmount,
      finalTotal,
      status,
      paymentMethod,
      paymentStatus,
      paidAt,
      transactionId,
      deletedAt: null,
      createdAt,
      updatedAt,
    });
  }

  // timestamps:false để giữ đúng createdAt/updatedAt đã đặt thủ công
  await OrderModel.insertMany(docs, { timestamps: false });

  // Thống kê nhanh
  const byStatus = docs.reduce<Record<string, number>>((acc, d) => {
    acc[d.status] = (acc[d.status] || 0) + 1;
    return acc;
  }, {});
  const byPayStatus = docs.reduce<Record<string, number>>((acc, d) => {
    acc[d.paymentStatus] = (acc[d.paymentStatus] || 0) + 1;
    return acc;
  }, {});
  const revenue = docs
    .filter((d) => d.paymentStatus === 'PAID')
    .reduce((s, d) => s + d.finalTotal, 0);

  console.log(`Đã tạo ${docs.length} đơn hàng mới.`);
  console.log('Theo trạng thái đơn:', byStatus);
  console.log('Theo trạng thái thanh toán:', byPayStatus);
  console.log('Doanh thu (đơn PAID):', revenue.toLocaleString('vi-VN'), 'đ');
  console.log('Seed đơn hàng thành công.');
}

main()
  .catch((error) => {
    console.error('Seed đơn hàng thất bại:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
