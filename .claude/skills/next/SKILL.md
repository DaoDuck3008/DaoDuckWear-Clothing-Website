# SKILL: DaoDuckWear Design System – NextJS UI

## Trigger — Đọc file này khi

- Tạo page, component, layout, hoặc bất kỳ file .tsx nào
- Nhận lệnh: "tạo trang", "tạo component", "tạo UI", "tạo giao diện"
- Làm việc trong thư mục: pages/, app/, components/, layouts/
- Bất kỳ task nào liên quan đến NextJS frontend

## Khi nào dùng skill này

Đọc file này trước khi tạo bất kỳ component, page, hoặc UI nào trong dự án.
Mục tiêu: mọi giao diện phải nhất quán với phong cách thương hiệu DaoDuckWear.

---

## Quy tắc styling — TAILWIND FIRST

**Ưu tiên tuyệt đối**: Dùng Tailwind utility classes cho mọi styling.
Chỉ viết custom CSS khi Tailwind **thực sự không làm được**, gồm:

- Pseudo-element (`::before`, `::after`) phức tạp — ví dụ underline animation
- `@keyframes` animation tùy chỉnh
- CSS variables cần dùng trong JS (via `style` prop thì không cần)
- Selector phức tạp kiểu `parent:hover > child` mà Tailwind group/peer không đáp ứng được
- `clamp()` cho fluid typography

**KHÔNG viết custom CSS cho**: màu, spacing, font-size, border, shadow, flex/grid, transition đơn giản — tất cả đã có trong Tailwind.

### Tailwind v4 — cấu hình dự án

> **Dự án dùng Tailwind CSS v4** (`tailwindcss ^4.2.2` + `@tailwindcss/postcss`). Cú pháp config khác hoàn toàn so với v3.

```js
// tailwind.config.js (v4)
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./features/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        editorial: {
          background: "#f9f9f9",
          surface: "#f3f3f3",
          high: "#e8e8e8",
          highest: "#e2e2e2",
          primary: "#000000",
          accent: "#b91446",
        },
      },
      fontFamily: {
        cormorant: ["var(--font-cormorant)", "serif"],
        serif: ["var(--font-cormorant)", "serif"],
        sans: ["var(--font-inter)", "sans-serif"],
      },
    },
  },
};
```

Tokens được khai báo thêm trong CSS qua directive `@theme` (v4):

```css
/* styles/global.css */
@import "tailwindcss";

@theme {
  --font-sans: var(--font-inter), ui-sans-serif, system-ui;
  --font-serif: var(--font-cormorant), ui-serif, Georgia, serif;
  --font-cormorant: var(--font-cormorant), ui-serif, Georgia, serif;
}
```

Sau khi config xong, dùng class như: `text-editorial-accent`, `bg-editorial-background`, `bg-editorial-surface`, `font-cormorant`, `font-sans`, `text-black`, `stone-*`, v.v.

---

## Phân tích phong cách DaoDuckWear

DaoDuckWear là thương hiệu thời trang phong cách editorial luxury. Phong cách thiết kế:

- **Tone**: Luxury editorial — sạch sẽ, tinh tế, cảm giác như xem lookbook fashion magazine
- **Đối tượng**: Người dùng trẻ quan tâm phong cách, thẩm mỹ cao
- **Cảm giác**: Black & white minimalism với accent crimson — tối giản nhưng có chiều sâu
- **Keyword**: Clean · Editorial · Structured · Confident

---

## Design Tokens

### Color Palette

```
editorial-background  #f9f9f9  — nền trang tổng thể
editorial-surface     #f3f3f3  — nền card, panel
editorial-high        #e8e8e8  — border nhẹ, divider
editorial-highest     #e2e2e2  — border đậm hơn
editorial-primary     #000000  — text chính, button primary
editorial-accent      #b91446  — accent crimson (yêu thích, badge sale)
```

Dùng kết hợp với **Tailwind stone palette** (default) cho neutrals:

- `stone-100` — border nhẹ, divider (`border-stone-100`, `border-stone-200`)
- `stone-400`, `stone-500` — text phụ, placeholder
- `stone-800`, `stone-900` — text đậm, hover trên dark background

### CSS Variables (fonts)

```css
/* Khai báo trong app/layout.tsx qua next/font/google */
--font-inter:     /* Inter — body/default */ --font-cormorant:
  /* Cormorant Garamond — display/heading */;
```

---

## Typography Rules

```tsx
// Import fonts trong app/layout.tsx
import { Inter, Cormorant_Garamond } from "next/font/google";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "vietnamese"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
});
```

**Quy tắc dùng font:**

- Section headings, logo, display title: `font-cormorant` (hoặc `font-serif`), thường kết hợp `italic font-bold`
- Navigation, button, body, label: `font-sans` (Inter là default — không cần class)
- Giá tiền, số liệu: `font-bold` (Inter) — **không dùng monospace**
- TRÁNH: serif cho body text dài — chỉ dùng Cormorant cho display/heading

**Scale chữ thực tế:**

- Micro labels: `text-[9px]` hoặc `text-[10px]` + `uppercase tracking-[0.2em]`
- Nav items: `text-[10px] lg:text-[11px] uppercase tracking-[0.25em]`
- Section headings: `text-2xl md:text-4xl font-cormorant font-bold uppercase` hoặc `italic`
- Hero: `text-5xl lg:text-7xl font-cormorant font-black italic`

---

## Layout Patterns

### Grid sản phẩm

```tsx
// Product grid — 2 col mobile, 3–4 col desktop
<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-12">
```

### Container

```tsx
// Max-width container
<div className="max-w-[1600px] mx-auto px-4 md:px-8 lg:px-12">
```

### Section structure

```tsx
<section className="py-16 md:py-24">
  <div className="flex items-end justify-between mb-8 md:mb-12">
    <h2 className="font-cormorant text-2xl md:text-3xl font-bold uppercase tracking-wider">
      BỘ SƯU TẬP MỚI
    </h2>
    <Link
      href="..."
      className="text-[10px] uppercase tracking-widest border-b border-stone-300 hover:border-black transition-colors pb-0.5"
    >
      Xem tất cả
    </Link>
  </div>
  {/* content */}
</section>
```

### Hero banner

- `min-h-[60vh] lg:min-h-[80vh]` — không dùng fixed aspect-ratio
- Background: `bg-stone-900` với image overlay `bg-black/10`
- Carousel auto-slide với dot indicators
- CTA button: dark fill, uppercase, letter-spacing rộng

---

## Component Patterns

### ProductCard

```tsx
// components/products/ProductCard.tsx
// Hover: image zoom (scale-100 → scale-110), duration-700
// Badge: absolute top-left, bg-red-500 (sale/new) hoặc bg-stone-500 (hết hàng)
// Price: font-bold, original bị gạch ngang text-stone-400
// Tên sản phẩm: text-sm font-bold truncate
// Icon buttons: rounded-full w-9 h-9

interface ProductCardProps {
  name: string;
  price: number;
  originalPrice?: number;
  images: string[];
  badge?: string;
  href: string;
}

// Image container
<div className="relative aspect-[3/4] overflow-hidden bg-editorial-surface">
  <Image
    className="object-cover transition-all duration-700 ease-in-out group-hover:scale-110 scale-100"
    fill
    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
  />
</div>;
```

### Badge variants

```tsx
// Sale/New: bg-red-500 text-white text-[9px] uppercase tracking-[0.2em] px-2 py-1
// Hết hàng: bg-stone-500/80 text-white backdrop-blur-sm
// outline: border border-editorial-accent text-editorial-accent text-[9px]
```

### Navigation

- `sticky top-0 z-50 bg-white border-b border-stone-100`
- Logo: `font-cormorant text-3xl lg:text-4xl font-bold tracking-tighter`
- Nav text: `text-[10px] lg:text-[11px] uppercase tracking-[0.25em] font-bold`
- Dropdown: `bg-white border border-stone-100 shadow-2xl`
- Badge cart/notify: `absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full`
- Icons: `w-6 h-6` (lucide-react)

### Button

```tsx
// Primary CTA
className="bg-black text-white py-3 px-6 text-[11px] font-bold uppercase tracking-widest
           hover:bg-stone-800 transition-all active:scale-[0.99]"

// Secondary / Ghost
className="border border-stone-200 px-6 py-2 text-[11px] font-medium uppercase tracking-widest
           hover:border-black transition-colors"

// Disabled
className="disabled:bg-stone-300 disabled:cursor-not-allowed"

// KHÔNG bo tròn nhiều — tối đa rounded-sm, trừ icon buttons dùng rounded-full
```

### Input / Form

```tsx
// Bottom-border only style (editorial feel)
className="bg-transparent border-b border-stone-200 py-3 px-2
           focus:border-black focus:ring-0 focus:outline-none
           transition-colors text-sm"

// Label floating
className="text-[10px] uppercase tracking-[0.15em] text-stone-500 group-focus-within:text-black transition-colors"
```

---

## Animation & Interaction

### Dùng Tailwind cho transitions đơn giản

```tsx
// Image zoom — dùng cho ProductCard
className = "transition-all duration-700 ease-in-out group-hover:scale-110";

// Color/border transitions — buttons, links
className = "transition-colors duration-200";
className = "transition-all duration-300";

// Opacity — overlays
className = "transition-opacity duration-300";

// Active press
className = "active:scale-[0.99]";
```

### Custom CSS — chỉ khi Tailwind không làm được

```css
/* styles/global.css */

/* Scrollbar styling — không có trong Tailwind */
* {
  scrollbar-width: thin;
  scrollbar-color: #d6d3d1 transparent;
}
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-thumb {
  background: #d6d3d1;
  border-radius: 10px;
}
::-webkit-scrollbar-thumb:hover {
  background: #78716c;
}

/* Underline animation — ::after pseudo-element */
.nav-link {
  position: relative;
}
.nav-link::after {
  content: "";
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 1px;
  background: currentColor;
  transition: width 250ms ease;
}
.nav-link:hover::after {
  width: 100%;
}

/* Fluid hero typography */
.text-hero {
  font-size: clamp(3rem, 8vw, 6rem);
}

/* Fade-up scroll reveal */
@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fade-up {
  animation: fadeUp 400ms cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
}
```

**Nguyên tắc animation:**

- Subtle > Flashy — không dùng bounce, shake
- Image zoom: `duration-700` (700ms) cho product card hover
- UI interactions: 200–300ms
- Scroll reveal: staggered fade-up cho product grids
- Không dùng animation liên tục (spinning, pulsing) trừ loading state

---

## NextJS Implementation Notes

### Image optimization

```tsx
// LUÔN dùng next/image với đúng sizes
<Image
  src={product.image}
  alt={product.name}
  fill
  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
  className="object-cover object-top transition-all duration-700 group-hover:scale-110"
/>
```

### Vietnamese text

- Tên danh mục: UPPERCASE với `tracking-widest` hoặc `tracking-[0.25em]`
- Giá tiền: format `xxx.000 ₫` — dùng `Intl.NumberFormat('vi-VN')`
- Font phải support Vietnamese: **Inter** load với `subsets: ["latin", "vietnamese"]`
- Cormorant Garamond chỉ load `subsets: ["latin"]` — không cần Vietnamese vì chỉ dùng cho headings ngắn

### SEO & Performance

- Dùng `loading="eager"` cho hero images, `lazy` cho product grid
- Alt text tiếng Việt, mô tả đầy đủ
- Server Components mặc định; `'use client'` chỉ khi cần interactivity hoặc browser API

---

## Những điều TRÁNH

- ❌ Viết custom CSS cho thứ Tailwind đã có — spacing, color, flex, grid, border
- ❌ Hard-code hex color trong className hay style prop — dùng token đã extend
- ❌ Dùng Tailwind v3 config syntax (module.exports, `type Config`) — dự án dùng v4
- ❌ Border-radius lớn (> 4px) cho card, button — trông cheap (trừ `rounded-full` cho icon button)
- ❌ Drop shadow nặng — dùng `border border-stone-100` nhẹ thay thế
- ❌ Màu sắc quá nhiều — stick với editorial palette + stone + black/white
- ❌ Font Inter làm heading/display — Cormorant Garamond mới có cá tính brand
- ❌ Font mono cho giá — dùng `font-bold` (Inter) là đủ
- ❌ Gold/warm accent (`#C8A96E`) — DaoDuckWear dùng crimson `#b91446`
- ❌ Purple gradient, neon colors — không phù hợp tone luxury
- ❌ Pill buttons (`rounded-full`) cho CTA — chỉ dùng `rounded-full` cho icon buttons nhỏ
- ❌ Centered body text dài — chỉ center cho headings, taglines
- ❌ Animation quá nhiều hoặc quá nhanh

---

## Checklist trước khi ship component

- [ ] Tailwind classes được dùng cho mọi styling có thể
- [ ] Custom CSS chỉ có trong `styles/global.css`, có comment giải thích tại sao không dùng Tailwind
- [ ] Font Cormorant cho headings/display (`font-cormorant`), Inter (default) cho body
- [ ] Màu đúng palette — dùng `text-editorial-accent`, `bg-editorial-background`... không hard-code hex
- [ ] Product image có hover state zoom dùng Tailwind `group` + `scale-110 duration-700`
- [ ] Aspect ratio product image: `aspect-[3/4]`
- [ ] Badge hiển thị đúng (new / sale / hết hàng) với màu `bg-red-500` hoặc `bg-stone-500`
- [ ] Giá format đúng tiếng Việt với ₫ dùng `Intl.NumberFormat('vi-VN')`
- [ ] Responsive: 2 col mobile → 4 col desktop (`grid-cols-2 md:grid-cols-3 lg:grid-cols-4`)
- [ ] next/image với `fill` + `sizes` phù hợp
- [ ] Uppercase + tracking rộng (`tracking-widest` hoặc `tracking-[0.25em]`) cho section headings và nav
- [ ] Tailwind v4 syntax — `tailwind.config.js` (không phải `.ts`), `@import "tailwindcss"` trong CSS
