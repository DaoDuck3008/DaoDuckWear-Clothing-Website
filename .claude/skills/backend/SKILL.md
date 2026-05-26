# SKILL: DaoDuckWear Backend – NestJS Architecture

## TRIGGER

```
Load this skill BEFORE:
- Creating any NestJS module, service, controller, schema, or DTO in apps/backend/
- Adding a new feature/endpoint to the backend
- Working on any src/modules/** code
- Debugging backend errors or refactoring services

Keywords that should trigger this skill:
backend, nestjs, module, service, controller, schema, dto, mongoose, endpoint, api route
```

---

## Stack & Versions

```
NestJS:        ^11.0.1   (KHÔNG dùng @nestjs/jwt — dùng jsonwebtoken trực tiếp)
Mongoose:      ^9.5.0    (@nestjs/mongoose 11.0.4)
MongoDB:       ^7.2.0
bcrypt:        ^6.0.0
jsonwebtoken:  ^9.0.3
class-validator / class-transformer: DTOs
cloudinary:    ^2.9.0    (file uploads)
cookie-parser  (refresh token trong httpOnly cookie)
```

---

## Module Structure

Mỗi feature = 1 thư mục trong `src/modules/`:

```
src/modules/{feature}/
├── {feature}.module.ts
├── {feature}.controller.ts
├── {feature}.service.ts
├── dto/
│   └── {feature}.dto.ts        ← optional, dùng cho complex inputs
└── schemas/
    └── {feature}.schema.ts
```

Đăng ký module trong `src/app.module.ts` — import vào `@Module({ imports: [...] })`.

---

## Naming Conventions (bắt buộc từ AGENT_RULES.md)

| Loại | Convention | Ví dụ |
|------|-----------|-------|
| File | camelCase | `productsService.ts`, `authController.ts` |
| Class | PascalCase | `ProductsService`, `AuthController` |
| Function/method | camelCase | `getProductById`, `createNewUser` |
| Variable | camelCase | `hashedPassword`, `accessToken` |

---

## Schema Pattern

```ts
// src/modules/{feature}/schemas/{feature}.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';
import { applyIdVirtual } from '../../../common/utils/mongoose-schema.util';

export type FeatureDocument = HydratedDocument<Feature>;

@Schema({ timestamps: true, collection: 'features' })  // ← collection name PHẢI explicit
export class Feature {
  @Prop({ type: String, required: true, trim: true })
  name!: string;

  // Ref tới model khác
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Category', default: null })
  categoryId?: Types.ObjectId | null;

  // Soft delete — dùng thay vì xóa thật
  @Prop({ type: Date, default: null })
  deletedAt?: Date | null;
}

export const FeatureSchema = SchemaFactory.createForClass(Feature);

// Index
FeatureSchema.index({ name: 1 });

// LUÔN gọi applyIdVirtual — tạo virtual field `id` từ `_id`
applyIdVirtual(FeatureSchema);
```

### Nested Schema (ví dụ ProductImage trong product.schema.ts)

```ts
@Schema({ _id: true, timestamps: true })
export class NestedItem {
  @Prop({ type: String, required: true })
  url!: string;

  @Prop({ type: Boolean, default: false })
  isMain?: boolean;
}
export const NestedItemSchema = SchemaFactory.createForClass(NestedItem);
applyIdVirtual(NestedItemSchema);

// Dùng trong parent schema:
@Prop({ type: [NestedItemSchema], default: [] })
items!: NestedItem[];
```

### Đăng ký schema trong module

```ts
// {feature}.module.ts
import { MongooseModule } from '@nestjs/mongoose';
import { Feature, FeatureSchema } from './schemas/feature.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Feature.name, schema: FeatureSchema },
    ]),
  ],
  controllers: [FeatureController],
  providers: [FeatureService],
  exports: [FeatureService],  // ← export nếu module khác cần dùng
})
export class FeatureModule {}
```

---

## Service Pattern

**Không có repository** — inject Mongoose model trực tiếp vào service.

```ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { Feature, FeatureDocument } from './schemas/feature.schema';

@Injectable()
export class FeatureService {
  constructor(
    @InjectModel(Feature.name) private featureModel: Model<FeatureDocument>,
    @InjectConnection() private readonly connection: Connection,  // ← chỉ cần khi dùng transaction
  ) {}

  async findAll() {
    return this.featureModel.find({ deletedAt: null }).lean();
  }

  async findOne(id: string) {
    const doc = await this.featureModel.findById(id).lean();
    if (!doc) throw new NotFoundException('Không tìm thấy');
    return doc;
  }
}
```

### Transaction Pattern (dùng khi cần atomicity)

```ts
async createWithTransaction(data: any) {
  const session = await this.connection.startSession();
  session.startTransaction();

  try {
    const result = await this.featureModel.create([data], { session });
    // ... các thao tác khác cùng session

    await session.commitTransaction();
    return result;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}
```

### Populate

```ts
// Populate ref fields
const doc = await this.featureModel
  .findById(id)
  .populate('categoryId', 'name _id')  // ← chỉ select field cần thiết
  .lean();
```

---

## Controller Pattern

```ts
import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query,
  UseGuards, UseInterceptors, UploadedFiles,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('features')
export class FeatureController {
  constructor(private readonly featureService: FeatureService) {}

  // Public route
  @Get()
  findAll(@Query('page') page = '1', @Query('limit') limit = '20') {
    return this.featureService.findAll(+page, +limit);
  }

  // Protected — user đã đăng nhập
  @Get('my')
  @UseGuards(AuthGuard)
  findMine(@CurrentUser() user: any) {
    return this.featureService.findByUser(user.id);
  }

  // Protected — chỉ ADMIN hoặc MANAGER
  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN', 'MANAGER')
  create(@Body() dto: CreateFeatureDto, @CurrentUser() user: any) {
    return this.featureService.create(dto, user.id);
  }

  // File upload
  @Post('upload')
  @UseGuards(AuthGuard)
  @UseInterceptors(AnyFilesInterceptor())
  upload(
    @UploadedFiles() files: Express.Multer.File[],
    @CurrentUser() user: any,
  ) {
    return this.featureService.uploadFiles(files, user.id);
  }
}
```

### Pagination query params convention

```ts
@Get()
findAll(
  @Query('page') page = '1',
  @Query('limit') limit = '20',
  @Query('status') status?: string,
  @Query('q') search?: string,
) { ... }
```

---

## DTO Pattern

```ts
// dto/{feature}.dto.ts
import { IsString, IsEmail, IsOptional, MinLength, IsNumber, Matches } from 'class-validator';
import { IsMatch } from '../../../common/decorators/is-match.decorator';

export class CreateFeatureDto {
  @IsString({ message: 'Tên phải là chuỗi ký tự' })
  name!: string;

  @IsEmail({}, { message: 'Email không hợp lệ' })
  email!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber({}, { message: 'Giá phải là số' })
  price!: number;
}

// Confirm password (dùng custom decorator IsMatch)
export class ChangePasswordDto {
  @IsString()
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  newPassword!: string;

  @IsString()
  @IsMatch('newPassword', { message: 'Mật khẩu xác nhận không khớp' })
  confirmPassword!: string;
}
```

**Quy tắc DTO:**
- Message lỗi bắt buộc bằng **tiếng Việt**
- DTO là optional trừ khi input phức tạp
- Không dùng Zod hoặc React Hook Form (frontend rule — không áp dụng cho backend)
- Không dùng Swagger `@ApiProperty` (chưa cần)

---

## Error Handling

### HttpException (cho HTTP errors)

```ts
import {
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';

throw new NotFoundException('Không tìm thấy sản phẩm');
throw new BadRequestException('Dữ liệu không hợp lệ');
throw new UnauthorizedException('Bạn chưa đăng nhập');
throw new ForbiddenException('Bạn không có quyền thực hiện thao tác này');
throw new ConflictException('Email đã tồn tại');
```

### BusinessException (cho domain/business logic errors)

```ts
// src/common/exceptions/business.exception.ts
import { BusinessException } from '../../common/exceptions/business.exception';
import { HttpStatus } from '@nestjs/common';

throw new BusinessException(
  'Sản phẩm đã hết hàng tại chi nhánh này',  // message — tiếng Việt
  'OUT_OF_STOCK',                               // errorCode — SCREAMING_SNAKE_CASE
  HttpStatus.BAD_REQUEST,                       // statusCode — optional, default 400
);
```

**Quy tắc:**
- **Tất cả message lỗi phải bằng tiếng Việt**
- Dùng `HttpException` khi lỗi là HTTP-level (400, 401, 403, 404, 409...)
- Dùng `BusinessException` khi lỗi là logic nghiệp vụ (hết hàng, không đủ điều kiện, vi phạm business rule)

---

## Common Utilities Reference

| Utility | Path | Dùng khi |
|---------|------|---------|
| `applyIdVirtual(schema)` | `common/utils/mongoose-schema.util` | Sau mỗi SchemaFactory — tạo virtual `id` |
| `hashPassword(password)` | `common/utils/password.util` | Hash password trước khi lưu |
| `comparePassword(plain, hash)` | `common/utils/password.util` | So sánh password khi login |
| `signAccessToken(payload)` | `common/utils/jwt.util` | Tạo access token |
| `signRefreshToken(payload)` | `common/utils/jwt.util` | Tạo refresh token |
| `verifyAccessToken(token)` | `common/utils/jwt.util` | Verify access token |
| `verifyRefreshToken(token)` | `common/utils/jwt.util` | Verify refresh token |
| `generateUniqueHex()` | `common/utils/crypto.util` | Tạo unique code (orderCode...) |
| `formatDateCode(date)` | `common/utils/date.util` | Format date thành code string |
| `BusinessException` | `common/exceptions/business.exception` | Domain errors |

---

## Global Wiring — Đã Setup Sẵn

Các thứ sau đã được setup trong `src/main.ts` — **không cần thêm lại**:

```ts
app.use(cookieParser())                    // ✓ httpOnly cookie support
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
}))                                        // ✓ DTO validation tự động
app.useGlobalInterceptors(new LoggingInterceptor())  // ✓ request logging
app.useGlobalFilters(new HttpExceptionFilter(...))   // ✓ error response format
app.enableCors({ origin: FRONTEND_URL, credentials: true })  // ✓ CORS
```

---

## Seeding Rules (từ AGENT_RULES.md)

1. **Tạo file seed mới** khi thêm data mới trong quá trình dev:
   ```
   src/database/seeders/seed-categories-v2.ts   ← chạy file này
   ```
   Không chạy `seed.ts` chính nếu có `deleteMany()` — sẽ xóa mất data hiện tại.

2. **Cập nhật `seed.ts` chính** sau khi xong — để "source of truth" cho fresh deploy.

3. Chạy seed: `npm run seed` (từ `apps/backend/`)

---

## Những điều TRÁNH

- ❌ **Repository pattern** — không tạo class repository riêng, dùng model trực tiếp trong service
- ❌ **@nestjs/jwt** — dùng `jsonwebtoken` (`jwt.sign`, `jwt.verify`) trực tiếp
- ❌ **Swagger decorators** (`@ApiProperty`, `@ApiOperation`...) — chưa cần ở giai đoạn này
- ❌ **Unit tests** — chưa cần
- ❌ **English error messages** — phải dùng tiếng Việt
- ❌ **Implicit collection name** — phải khai báo `collection: 'xxx'` trong `@Schema()`
- ❌ **Dùng `.save()` sau `new Model()`** — ưu tiên `Model.create([data], { session })` khi có transaction
- ❌ **Hard-code secret keys** — luôn dùng `process.env.JWT_*`
- ❌ **Hỏi user trước khi đọc .env** — theo AGENT_RULES.md

---

## Checklist trước khi ship feature

- [ ] File/class/function đặt tên đúng convention (camelCase file, PascalCase class)
- [ ] Schema có `collection: 'xxx'` explicit và gọi `applyIdVirtual()`
- [ ] Service inject `@InjectModel` trực tiếp, không có repository class
- [ ] Error messages bằng tiếng Việt
- [ ] BusinessException cho domain errors, HttpException cho HTTP errors
- [ ] Module đã import vào `app.module.ts`
- [ ] Nếu có seed data: tạo file seed mới và cập nhật `seed.ts` chính
