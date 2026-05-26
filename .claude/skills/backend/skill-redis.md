# SKILL: DaoDuckWear Backend – Redis & Caching

## TRIGGER

```
Load this skill when working on:
- Bất cứ thứ gì liên quan đến RedisService (inject, set, get, cacheable, delByPrefix...)
- Thêm cache cho 1 endpoint/service mới
- Xử lý invalidate cache khi mutate data
- Tối ưu performance, giảm tải MongoDB
- Lưu dữ liệu tạm có TTL (OTP, password reset code, rate-limit, session...)
- src/modules/redis/**
- src/config/redis.config.ts
- Bug liên quan đến data cũ / stale hoặc cache không tự xoá

Also load the main SKILL.md alongside this file.
```

---

## Hạ tầng (đã setup sẵn — KHÔNG sửa)

```
Container:  docker-compose up  → Redis port 6380
Client:     ioredis (không phải node-redis)
Config:     src/config/redis.config.ts
Module:     src/modules/redis/redis.module.ts  (@Global() — inject ở mọi nơi)
Service:    src/modules/redis/redis.service.ts
ENV:        REDIS_HOST, REDIS_PORT, REDIS_PASSWORD (optional)
Lazy connect: true — kết nối thực sự xảy ra khi gọi command đầu tiên (ping at bootstrap)
```

`RedisModule` đã `@Global()` → **không cần import** ở module con. Chỉ cần inject `RedisService`.

---

## Bootstrap & shutdown

Khi server start, `RedisService.onApplicationBootstrap` tự ping Redis và log:
```
[Nest] LOG [RedisService] [Redis] Connected to localhost:6380 (PING 4ms)
```
Nếu Redis chết → log error, **server vẫn chạy** (cache layer degrade thành no-op).

Server stop → `onApplicationShutdown` gọi `client.quit()` để đóng kết nối sạch.  
Điều này hoạt động vì `main.ts` đã có `app.enableShutdownHooks()` — **không xoá dòng này**.

---

## API của `RedisService`

### Tầng thấp — string/byte thô (dùng cho ephemeral data)

```ts
redis.set(key, value, ttlSeconds)    // SET key value EX ttl
redis.get(key)                        // string | null
redis.del(...keys)                    // xoá 1 hoặc nhiều key
```

**Use case:** OTP, password reset code, verification token — value đã là string.

```ts
// Ví dụ thực tế từ auth.service.ts
await this.redisService.set(`email_verify:user:${userId}`, code, VERIFY_TTL);
const stored = await this.redisService.get(`email_verify:user:${userId}`);
await this.redisService.del(`email_verify:user:${userId}`);
```

### Tầng cao — JSON cho cache business data

```ts
redis.getJson<T>(key)                  // T | null, tự xoá nếu JSON hỏng
redis.setJson<T>(key, value, ttl)      // JSON.stringify + SET EX
redis.cacheable<T>(key, ttl, loader)   // read-through pattern — DÙNG CÁI NÀY 99%
```

`cacheable<T>` là pattern chuẩn:

```ts
return this.redis.cacheable(KEY, TTL, async () => {
  // chạy CHỈ khi miss cache
  const data = await this.someModel.find(...).lean();
  return transform(data);
});
```

Đặc tính quan trọng:
- **Redis lỗi → không fail request**. Hàm log warning rồi fallback gọi loader, app vẫn chạy như không có Redis.
- Generic `<T>` để giữ type-safety; TS tự suy từ return type của loader, **không cần ghi `<T>` thủ công** trừ khi suy không ra.
- **Không có stampede protection**. Nếu 1 key cực hot có hàng trăm req/s thì cần thêm distributed lock — chưa cần ở quy mô này.

### Bulk invalidate

```ts
redis.delByPrefix(prefix)              // SCAN + DEL, non-blocking
```

Dùng khi không biết chính xác key nào cần xoá, vd `banners:*`, `product:similar:abc:*`.  
**KHÔNG dùng `KEYS pattern`** — blocking, sẽ đóng băng Redis ở DB lớn.

---

## Cache hiện đang dùng trong project

| Service | Method | Key | TTL | Invalidate ở |
|---|---|---|---|---|
| `CategoriesService` | `findAllTree` | `cats:tree` | 1h | create / update / remove |
| `ColorsService` | `findAll` | `colors:all` | 24h | (không có mutation) |
| `BannersService` | `findAll` (chỉ khi `isActive=true`) | `banners:{page}:{position}:active` | 10p | create / update / remove / toggleStatus → `delByPrefix('banners:')` |
| `ProductsService` | `findBySlug` | `product:slug:{slug}` | 5p | update / remove / `InventoryService.updateInventory` |
| `ProductsService` | `getSimilarProducts` | `product:similar:{slug}:{limit}` | 5p | update / remove product → `delByPrefix('product:similar:{slug}:')` |
| `AnalyticsService` | tất cả 6 method | `analytics:{shopId\|all}:{method}:{from}:{to}[:role]` | 3p | (TTL only) |

Public helper: `ProductsService.invalidateProductCacheByProductId(productId)` — dùng từ module khác (vd `InventoryService`) khi đổi dữ liệu liên quan tới product.

---

## Quy ước đặt key

```
{domain}:{subtype}:{identifier}[:variant]
```

Ví dụ:
```
cats:tree
colors:all
banners:home:hero:active
product:slug:ao-thun-trang
product:similar:ao-thun-trang:5
analytics:all:summary:2026-01-01:2026-01-31:ADMIN
email_verify:user:{userId}
pwd_reset:user:{userId}
```

Quy tắc:
- Dùng `:` làm separator (chuẩn cộng đồng Redis).
- Bắt đầu bằng **domain prefix** (1 từ, lowercase) → tiện cho `delByPrefix`.
- Đặt định danh cố định ở vị trí cố định để key rút gọn được khi cần xoá nhóm.
- Lưu **hằng số key + TTL** ở đầu file service, không hard-code rải rác:
  ```ts
  const PRODUCT_SLUG_PREFIX = 'product:slug:';
  const PRODUCT_SLUG_TTL = 300;
  ```

---

## Pattern khi thêm cache mới cho 1 method

```ts
// 1. Thêm constant ở đầu file
const FEATURE_LIST_KEY = 'feature:list';
const FEATURE_LIST_TTL = 600;

// 2. Inject RedisService
constructor(
  @InjectModel(Feature.name) private model: Model<...>,
  private readonly redis: RedisService,
) {}

// 3. Bọc method đọc
async findAll() {
  return this.redis.cacheable(FEATURE_LIST_KEY, FEATURE_LIST_TTL, () =>
    this.model.find({ deletedAt: null }).lean(),
  );
}

// 4. Invalidate ở MỌI method mutate (create/update/delete/toggle...)
async create(dto) {
  const doc = await this.model.create(dto);
  await this.redis.del(FEATURE_LIST_KEY);
  return doc;
}
```

### Khi method có nhiều biến thể query

Đưa biến thể vào key:
```ts
async findByPage(page: number) {
  const key = `feature:page:${page}`;
  return this.redis.cacheable(key, FEATURE_LIST_TTL, () => loader());
}
// Invalidate: redis.delByPrefix('feature:page:')
```

### Khi cần invalidate từ module khác

Expose 1 method public ở service "chủ" của cache, **không leak key format**:

```ts
// products.service.ts
async invalidateProductCacheByProductId(productId) {
  const p = await this.productModel.findById(productId).select('slug').lean();
  if (!p?.slug) return;
  await this.redis.del(`${PRODUCT_SLUG_PREFIX}${p.slug}`);
  await this.redis.delByPrefix(`${PRODUCT_SIMILAR_PREFIX}${p.slug}:`);
}
```

Module gọi import `ProductsService` qua `imports: [ProductsModule]` (Module phải `exports: [ProductsService]`).

---

## NÊN cache vs KHÔNG nên cache

### ✅ Nên cache
- Read nhiều, write ít: danh mục, màu, banner storefront, chi tiết sản phẩm
- Aggregation nặng: dashboard analytics
- Lookup table gần như static: countries, color palette

### ❌ Không nên cache
- **Cart, Favorites, User profile** — per-user, đọc-ghi gần 1:1, invalidate phức tạp
- **Inventory / stock** — phải real-time; nếu cache trang sản phẩm thì TTL phải ngắn (≤5p) và invalidate ở mọi nơi đổi stock
- **Orders, Payments** — nhạy cảm, đã có flow nghiệp vụ chặt
- **Reviews list** — ghi thường xuyên, người dùng muốn thấy review mới ngay
- **Query có filter + phân trang bất kỳ** — key bùng nổ; chỉ cache trang/filter "mặc định" nếu cần

---

## TTL tham khảo

| Loại data | TTL gợi ý |
|---|---|
| Gần như static (colors, countries) | 6h – 24h |
| Ít thay đổi (categories tree) | 30p – 1h |
| Mid (banner, product detail) | 5p – 15p |
| Tính toán nặng nhưng có thể lệch (analytics) | 1p – 5p |
| Ephemeral token (OTP, reset code) | 5p – 15p (theo nghiệp vụ) |

Đừng đặt TTL quá dài chỉ vì "ít đổi" — nhớ rằng invalidate logic có thể bị bỏ sót. TTL là **safety net cuối**.

---

## Anti-patterns — TUYỆT ĐỐI TRÁNH

- ❌ **`KEYS pattern`** trong code production — blocking. Luôn dùng `SCAN` qua `delByPrefix`.
- ❌ **Cache user-specific data với key không có userId** — leak data giữa user.
- ❌ **Quên invalidate** ở 1 trong các method mutate — sẽ ra bug "sửa xong không thấy đổi".
- ❌ **`redis.set(key, object)`** — object sẽ bị stringify thành `"[object Object]"`. Phải dùng `setJson`.
- ❌ **Throw lỗi khi Redis chết** — `cacheable` đã handle, đừng wrap thêm try/catch fail-loudly.
- ❌ **Hard-code key string** ở giữa method — luôn dùng constant ở đầu file.
- ❌ **Cache method có side-effect** (ghi DB, gửi mail...) — chỉ cache pure read.
- ❌ **Cache rồi tự gọi `redis.set` lại** trong cùng method — `cacheable` đã ghi rồi.
- ❌ **Xoá `app.enableShutdownHooks()` trong main.ts** — sẽ leak Redis connection.

---

## Debug & quan sát

```bash
# Theo dõi mọi command Redis nhận được (chạy ở terminal riêng)
docker exec -it <redis-container> redis-cli -p 6380 MONITOR

# Đếm key theo prefix
docker exec -it <redis-container> redis-cli -p 6380 --scan --pattern 'analytics:*' | wc -l

# Xem 1 key
docker exec -it <redis-container> redis-cli -p 6380 GET cats:tree
docker exec -it <redis-container> redis-cli -p 6380 TTL cats:tree

# Flush khi dev cần reset cache
docker exec -it <redis-container> redis-cli -p 6380 FLUSHDB
```

Lúc test cache hoạt động: gọi endpoint 2 lần liên tiếp, lần 2 phải thấy `GET key` trên MONITOR thay vì query Mongo.

---

## Checklist khi thêm cache cho 1 endpoint

- [ ] Đã đọc lại bảng "NÊN cache vs KHÔNG nên cache" để chắc rằng đây là candidate hợp lý
- [ ] Có constant `*_KEY` (hoặc `*_PREFIX`) và `*_TTL` ở đầu file service
- [ ] Inject `RedisService` qua constructor
- [ ] Method đọc bọc trong `cacheable(...)`
- [ ] **Tất cả** method mutate (create, update, remove, toggle, soft-delete...) đã gọi `del` hoặc `delByPrefix`
- [ ] Nếu data có thể bị mutate từ module khác → expose helper `invalidateXxx()` và gọi từ đó
- [ ] Key có chứa đủ "trục" biến thể (userId nếu per-user, locale nếu đa ngôn ngữ, v.v.)
- [ ] TTL hợp lý — không quá dài
- [ ] Test thử: gọi endpoint 2 lần, MONITOR xác nhận lần 2 không query DB
- [ ] Test invalidate: mutate xong, gọi lại endpoint phải thấy data mới ngay
