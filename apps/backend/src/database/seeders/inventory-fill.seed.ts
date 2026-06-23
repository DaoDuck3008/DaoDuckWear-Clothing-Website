import 'dotenv/config';
import mongoose from 'mongoose';

import { UserSchema } from '../../modules/users/schemas/user.schema';
import { RoleSchema } from '../../modules/roles/schemas/role.schema';
import { ShopSchema } from '../../modules/shops/schemas/shop.schema';
import { ProductSchema } from '../../modules/products/schemas/product.schema';
import { ProductVariantSchema } from '../../modules/products/schemas/product-variant.schema';
import { InventorySchema } from '../../modules/inventory/schemas/inventory.schema';
import { InventoryImportSchema } from '../../modules/inventory/schemas/inventory-import.schema';

const UserModel = mongoose.model('User', UserSchema);
const RoleModel = mongoose.model('Role', RoleSchema);
const ShopModel = mongoose.model('Shop', ShopSchema);
const ProductModel = mongoose.model('Product', ProductSchema);
const VariantModel = mongoose.model('ProductVariant', ProductVariantSchema);
const InventoryModel = mongoose.model('Inventory', InventorySchema);
const ImportModel = mongoose.model('InventoryImport', InventoryImportSchema);

// Số lượng nhập cho mỗi variant: 30–120.
const QTY_MIN = 30;
const QTY_MAX = 120;
// Trải createdAt của phiếu nhập trong 30 ngày qua.
const SPREAD_DAYS = 30;

const rand = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

async function main() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) throw new Error('Missing MONGODB_URI');

  await mongoose.connect(mongoUri);

  // Tham số shop: index 0-based (theo thứ tự tạo) hoặc slug. Bắt buộc — xử lý 1 shop/lần.
  const arg = process.argv[2];
  if (arg === undefined) {
    throw new Error(
      'Thiếu tham số shop. Dùng: tsx inventory-fill.seed.ts <shopIndex|slug> (vd: 0, 1, 2)',
    );
  }

  const shops = await ShopModel.find().sort({ createdAt: 1, _id: 1 }).lean();
  if (shops.length === 0) throw new Error('Không có shop nào');

  const shop = /^\d+$/.test(arg)
    ? shops[Number(arg)]
    : shops.find((s: any) => s.slug === arg);
  if (!shop) {
    throw new Error(
      `Không tìm thấy shop "${arg}". Có ${shops.length} shop: ${shops
        .map((s: any, i) => `${i}=${s.slug}`)
        .join(', ')}`,
    );
  }

  console.log(`\n=== Nhập kho cho shop: ${shop.name} (${shop.slug}) ===`);

  // Actor: ưu tiên MANAGER của shop, fallback ADMIN.
  const [adminRole, managerRole] = await Promise.all([
    RoleModel.findOne({ name: 'ADMIN' }).lean(),
    RoleModel.findOne({ name: 'MANAGER' }).lean(),
  ]);
  const managerForShop = managerRole
    ? await UserModel.findOne({
        roleId: (managerRole as any)._id,
        shopId: shop._id,
      }).lean()
    : null;
  const adminUser = adminRole
    ? await UserModel.findOne({ roleId: (adminRole as any)._id }).lean()
    : null;
  const actor = managerForShop || adminUser;
  if (!actor) throw new Error('Không tìm thấy user (MANAGER/ADMIN) làm người nhập');

  // Sản phẩm còn hoạt động + variant còn hoạt động.
  const products = await ProductModel.find({ deletedAt: null })
    .select('_id name')
    .lean();
  const productIds = products.map((p: any) => p._id);
  const productNameById = new Map(
    products.map((p: any) => [p._id.toString(), p.name as string]),
  );

  const variants = await VariantModel.find({
    productId: { $in: productIds },
    deletedAt: null,
  })
    .select('_id productId sku')
    .lean();

  // Tổ hợp variant×shop ĐÃ có tồn → bỏ qua (chỉ bổ sung cái còn thiếu).
  const existing = await InventoryModel.find({ shopId: shop._id })
    .select('variantId')
    .lean();
  const existingVariantIds = new Set(
    existing.map((inv: any) => inv.variantId.toString()),
  );

  const missing = variants.filter(
    (v: any) => !existingVariantIds.has(v._id.toString()),
  );

  console.log(
    `Variant: ${variants.length} tổng | ${existingVariantIds.size} đã có tồn | ${missing.length} cần bổ sung`,
  );
  if (missing.length === 0) {
    console.log('Shop này đã đủ tồn cho mọi variant — không cần làm gì.');
    await mongoose.disconnect();
    return;
  }

  // Nhóm variant thiếu theo productId (mỗi phiếu nhập = 1 sản phẩm).
  const byProduct = new Map<string, any[]>();
  for (const v of missing) {
    const key = v.productId.toString();
    if (!byProduct.has(key)) byProduct.set(key, []);
    byProduct.get(key)!.push(v);
  }

  const now = Date.now();
  const importDocs: any[] = [];
  const invBulkOps: any[] = [];
  let totalUnits = 0;

  for (const [productId, vlist] of byProduct.entries()) {
    const items = vlist.map((v: any) => {
      const quantity = rand(QTY_MIN, QTY_MAX);
      totalUnits += quantity;
      return { variantId: v._id, quantity, sku: v.sku ?? null };
    });
    const totalQuantity = items.reduce((s, i) => s + i.quantity, 0);

    // Cộng tồn kho (upsert) — chỉ các tổ hợp còn thiếu nên không bị cộng dồn.
    for (const item of items) {
      invBulkOps.push({
        updateOne: {
          filter: { shopId: shop._id, variantId: item.variantId },
          update: {
            $inc: { quantity: item.quantity },
            $setOnInsert: {
              shopId: shop._id,
              productId: new mongoose.Types.ObjectId(productId),
              variantId: item.variantId,
            },
          },
          upsert: true,
        },
      });
    }

    const createdAt = new Date(
      now - rand(0, SPREAD_DAYS * 24 * 60) * 60 * 1000,
    );
    importDocs.push({
      shopId: shop._id,
      productId: new mongoose.Types.ObjectId(productId),
      createdBy: (actor as any)._id,
      items,
      totalQuantity,
      status: 'ACTIVE',
      note: `Nhập kho khởi tạo - ${productNameById.get(productId) ?? 'SP'}`,
      createdAt,
      updatedAt: createdAt,
    });
  }

  // Ghi inventory trước, rồi phiếu nhập (timestamps:false để giữ createdAt đã đặt).
  await InventoryModel.bulkWrite(invBulkOps);
  await ImportModel.insertMany(importDocs, { timestamps: false });

  console.log(
    `Đã tạo ${importDocs.length} phiếu nhập | ${invBulkOps.length} bản ghi inventory mới | tổng ${totalUnits.toLocaleString('vi-VN')} sản phẩm.`,
  );

  const invCount = await InventoryModel.countDocuments({ shopId: shop._id });
  console.log(`Inventory của shop hiện có: ${invCount} bản ghi.`);

  await mongoose.disconnect();
}

main().catch((error) => {
  console.error('Seed nhập kho thất bại:', error);
  process.exitCode = 1;
  void mongoose.disconnect();
});
