# Frontend Agent Rules - DaoDuckWear

Follow these rules strictly when developing the frontend for DaoDuckWear (Next.js project).

## 1. Naming & Structure

- **Components**: Use `PascalCase` for all React components (e.g., `ProductCard.tsx`, `Sidebar.tsx`).
- **Folders (App Router)**: Use `kebab-case` for folders within `apps/frontend/app` (e.g., `create-product`, `user-profile`).
- **Custom Hooks**: Only extract logic into separate custom hooks files if it is too complex or used in multiple components. Otherwise, keep the logic in the component file.
- **Suffixes**: Use special suffixes like `.component.tsx` only when needed.
- **Provider, Guard Components**: All parent components like `authHydrator` or `adminGuard` should be placed in the `layout.tsx` file and wrapped around the child components.

## 2. Styling & UI

- **Styling**: Use **Tailwind CSS** as the primary styling framework. Use vanilla CSS only when Tailwind cannot handle the requirement.
- **Icons**: Use **Lucide Icons** only.
- **Aesthetics**: Prioritize a **Premium & Modern** feel.
  - Implement **Hover effects**, **Glassmorphism**, and smooth transitions.
  - Ensure the UI feels alive and responsive.
- **Visuals**: Use `generate_image` or search for web images for placeholders (always note if an image is just a placeholder and not real content).

## 3. Data Management & State

- **Fetching**: Use **Axios**. All API services must inherit from or use the base config in `apps/frontend/apis/api.ts`.
- **State Management**: Use **Zustand** for global state.
- **Forms & Validation**: Keep validation simple. **Do not use heavy libraries** like React Hook Form or Zod unless specifically requested.

## 4. Components Organization

- **Common Components**: High-frequency, reusable components should go to `@common` or `apps/frontend/components/ui`.
- **Feature Components**: Feature-specific components (e.g., Product-related) should be in `@components/[feature-name]` (e.g., `apps/frontend/components/products/ProductItem.tsx`).
- **Rendering Strategy**: Use `'use client'` only when necessary (e.g., for hooks or interactive elements). Prefer Server Components for SEO and performance.

## 5. SKU Logic (Automatic Generation)

- **Format**: `[BrandPrefix][TypePrefix][Day][Warehouse] - [Size] - [ColorCode]`
- **Example**: `UNLE15HCM - S - H`
  - `UN`: Brand (e.g., Uniqlo)
  - `LE`: Product Type (e.g., Len tăm)
  - `15`: Arrival Day
  - `HCM`: Warehouse location
  - `S`: Size
  - `H`: Color initial (e.g., Hồng)
- **Target**: Maintain this logic in `apps/frontend/utils/product.util.ts`.

## 6. Error Handling

- **Error Handling**: Use `handleApiError` helper to handle API errors.
- **Target**: Maintain this logic in `apps/frontend/utils/error.util.ts`.

## 7. Workflow & Stability

- **Reusability**: Prioritize component reusability. DRY (Don't Repeat Yourself).
- **Testing**: After adding significant UI or logic, **must run the frontend server** and verify stability. Report any errors found in the console or terminal immediately.
