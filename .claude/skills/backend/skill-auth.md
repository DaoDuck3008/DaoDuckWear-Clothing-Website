# SKILL: DaoDuckWear Backend – Auth, Guards & JWT

## TRIGGER

```
Load this skill when working on:
- Authentication or authorization logic
- JWT access/refresh tokens
- Guards: AuthGuard, OptionalAuthGuard, RolesGuard
- Protected routes (@UseGuards, @Roles)
- Custom decorators: @CurrentUser, @CurrentShop
- Google OAuth / social login
- Cookie-based refresh token
- src/modules/auth/**
- src/common/guards/**
- src/common/decorators/**

Also load the main SKILL.md alongside this file.
```

---

## JWT Utilities

**Path:** `src/common/utils/jwt.util.ts`  
**Package:** `jsonwebtoken` (không phải `@nestjs/jwt`)

```ts
import jwt from 'jsonwebtoken';

// Tạo access token — ngắn hạn (15m)
export const signAccessToken = (payload: any) =>
  jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN,  // vd: '15m'
  });

// Tạo refresh token — dài hạn (7d)
export const signRefreshToken = (payload: any) =>
  jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,  // vd: '7d'
  });

// Verify
export const verifyAccessToken = (token: string) =>
  jwt.verify(token, process.env.JWT_ACCESS_SECRET);

export const verifyRefreshToken = (token: string) =>
  jwt.verify(token, process.env.JWT_REFRESH_SECRET);
```

**Env variables cần có** (`.env` trong `apps/backend/`):
```
JWT_ACCESS_SECRET=your_access_secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRES_IN=7d
GOOGLE_CLIENT_ID=your_google_client_id
```

---

## Guards

### AuthGuard — bắt buộc đăng nhập

**Path:** `src/common/guards/auth.guard.ts`

Cơ chế: Extract `Bearer {token}` từ `Authorization` header → verify → set `request.user`.

```ts
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { verifyAccessToken } from '../utils/jwt.util';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const auth = request.headers.authorization;

    if (!auth || !auth.startsWith('Bearer ')) {
      throw new UnauthorizedException('You are not authorized to access this resource');
    }

    try {
      const token = auth.split(' ')[1];
      request.user = verifyAccessToken(token);  // ← user payload gắn vào request
      return true;
    } catch {
      throw new UnauthorizedException('Access token is invalid or expired');
    }
  }
}
```

### OptionalAuthGuard — semi-public routes

Cho phép cả user đã đăng nhập lẫn chưa đăng nhập. Nếu không có token → `request.user = null`.

```ts
export class OptionalAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const auth = request.headers.authorization;

    if (!auth || !auth.startsWith('Bearer ')) {
      request.user = null;
      return true;  // ← cho qua dù không có token
    }

    try {
      const token = auth.split(' ')[1];
      request.user = verifyAccessToken(token);
      return true;
    } catch {
      return false;
    }
  }
}
```

### RolesGuard — kiểm tra role

**Path:** `src/common/guards/roles.guard.ts`  
Dùng kết hợp sau `AuthGuard`. Đọc metadata từ `@Roles()` decorator.

```ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // getAllAndOverride: check cả @Roles trên method VÀ class level
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('You are not authorized to access this resource');
    }

    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException('You do not have permission to access this resource');
    }
    return true;
  }
}
```

---

## Custom Decorators

### @CurrentUser() — lấy user từ request

**Path:** `src/common/decorators/current-user.decorator.ts`

```ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return data ? user?.[data] : user;  // ← supports field extraction
  },
);
```

Dùng trong controller:
```ts
@Get('profile')
@UseGuards(AuthGuard)
getProfile(@CurrentUser() user: any) {
  return this.authService.getProfile(user.id);
}

// Lấy field cụ thể
getShop(@CurrentUser('shopId') shopId: string) { ... }
```

### @Roles(...roles) — set role metadata

**Path:** `src/common/decorators/roles.decorator.ts`

```ts
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
```

### @CurrentShop() — lấy shop từ user

**Path:** `src/common/decorators/current-shop.decorator.ts`  
Dùng cho multi-tenant operations (SELLER/MANAGER scoped to their shop).

---

## Protected Route Patterns

```ts
import { AuthGuard } from '../../common/guards/auth.guard';
import { OptionalAuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('products')
export class ProductsController {
  // Public — không cần guard
  @Get(':slug')
  findOne(@Param('slug') slug: string) { ... }

  // Semi-public — user logged in OR not, nhưng behavior khác nhau
  @Get()
  @UseGuards(OptionalAuthGuard)
  findAll(@CurrentUser() user: any) { ... }  // user có thể là null

  // Phải đăng nhập
  @Post('review')
  @UseGuards(AuthGuard)
  addReview(@CurrentUser() user: any, @Body() dto: any) { ... }

  // Phải đăng nhập VÀ có role cụ thể
  @Post()
  @UseGuards(AuthGuard, RolesGuard)   // ← thứ tự: AuthGuard trước, RolesGuard sau
  @Roles('ADMIN', 'MANAGER')
  create(@CurrentUser() user: any, @Body() dto: any) { ... }
}
```

**Roles hiện có trong hệ thống:** `USER`, `ADMIN`, `MANAGER`, `STAFF`, `SELLER`

---

## Cookie Pattern — Refresh Token

Refresh token lưu trong **httpOnly cookie**, không expose ra response body.

```ts
// Set cookie (trong controller dùng @Res({ passthrough: true }))
@Post('login')
async login(
  @Body() body: LoginDto,
  @Res({ passthrough: true }) res: Response,  // ← passthrough: true giữ NestJS response handling
) {
  const { user, accessToken, refreshToken } = await this.authService.login(body);

  const maxAge = body.rememberMe
    ? 7 * 24 * 60 * 60 * 1000   // 7 ngày nếu rememberMe
    : 1 * 24 * 60 * 60 * 1000;  // 1 ngày nếu không

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,   // ← JS không đọc được, bảo vệ XSS
    secure: true,
    sameSite: 'lax',
    maxAge,
  });

  return { success: true, accessToken, user: { ... } };
}

// Đọc cookie (trong refresh endpoint)
@Post('refresh')
async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
  const token = req.cookies.refreshToken;  // ← cookie-parser đã parse sẵn
  if (!token) throw new UnauthorizedException('Không tìm thấy Refresh Token');
  // ...
}

// Clear cookie (logout)
@Post('logout')
@UseGuards(AuthGuard)
async logout(@Res({ passthrough: true }) res: Response) {
  res.clearCookie('refreshToken', { httpOnly: true, secure: true, sameSite: 'lax' });
  return { success: true, message: 'User logged out successfully' };
}
```

---

## Auth Service Pattern

```ts
// Login response pattern — luôn trả về cả user + cả 2 tokens
async login(body: LoginDto) {
  const user = await this.userModel
    .findOne({ email: body.email })
    .populate('shopId', 'name _id')
    .populate('roleId', 'name _id');

  if (!user) throw new NotFoundException('Email hoặc mật khẩu không chính xác');

  const valid = await comparePassword(body.password, user.password);
  if (!valid) throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');

  const payload = { id: user.id, role: user.role?.name, shopId: user.shopId?.id };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  return { user, accessToken, refreshToken };
}
```

---

## Google OAuth Flow

```ts
import { OAuth2Client } from 'google-auth-library';

async googleLogin(credential: string) {
  const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

  // 1. Verify Google credential
  const ticket = await client.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  if (!payload?.email) throw new UnauthorizedException('Google credential không hợp lệ');

  // 2. Tìm hoặc tạo user
  let user = await this.userModel.findOne({ email: payload.email });
  if (!user) {
    const role = await this.roleModel.findOne({ name: 'USER' });
    user = await this.userModel.create({
      email: payload.email,
      username: payload.name || payload.email.split('@')[0],
      avatar: payload.picture,
      provider: 'google',
      roleId: role._id,
    });
  }

  // 3. Trả về JWT giống login thường
  const tokenPayload = { id: user.id, role: user.role?.name };
  return {
    user,
    accessToken: signAccessToken(tokenPayload),
    refreshToken: signRefreshToken(tokenPayload),
  };
}
```

---

## Module Import Checklist

Khi dùng guard/decorator trong module mới, phải import đúng:

```ts
// Trong module cần dùng RolesGuard:
import { Module } from '@nestjs/common';
import { Reflector } from '@nestjs/core';  // ← RolesGuard cần Reflector

@Module({
  providers: [
    FeatureService,
    // RolesGuard là global nếu đã register — thường không cần thêm vào providers
  ],
})

// Guards được dùng inline với @UseGuards() không cần providers trong module
// Nếu muốn apply global: dùng app.useGlobalGuards() trong main.ts
```

---

## Những điều TRÁNH

- ❌ `@nestjs/passport` hoặc `passport-jwt` — hệ thống dùng custom guard với `jsonwebtoken`
- ❌ `@nestjs/jwt` — dùng `jsonwebtoken` trực tiếp
- ❌ Lưu refresh token trong localStorage — phải là httpOnly cookie
- ❌ Trả access token trong cookie — access token trong response body, refresh token trong cookie
- ❌ English error messages trong UnauthorizedException/ForbiddenException — phải tiếng Việt (ngoại lệ: một số message hệ thống có thể giữ tiếng Anh)
- ❌ `@UseGuards(RolesGuard)` mà không có `@UseGuards(AuthGuard)` trước — RolesGuard đọc `request.user` do AuthGuard set
