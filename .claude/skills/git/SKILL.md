# SKILL: DaoDuckWear Git – Commit & Subtree

## TRIGGER

```
Load this skill BEFORE:
- Any git commit in this repo (staging, committing, writing a commit message)
- Any task mentioning: commit, git commit, "commit giúp tôi", "commit lại", push, subtree
- Splitting/pushing changes to the backend or frontend sub-repos
```

---

## 1. Commit message format — Conventional Commits

Mọi commit **bắt buộc** theo dạng:

```
<type>(<scope>): <subject>
```

### Type (luôn dùng một trong các type này)

| Type       | Khi nào dùng                                                         |
| ---------- | ------------------------------------------------------------------- |
| `feat`     | Thêm tính năng / API / component mới                                 |
| `fix`      | Sửa bug                                                              |
| `refactor` | Đổi cấu trúc code, không thêm feature cũng không sửa bug             |
| `perf`     | Tối ưu hiệu năng (vd: chuyển build sang SWC)                         |
| `docs`     | Tài liệu, README, comment                                           |
| `style`    | Format, whitespace, không đổi logic                                  |
| `test`     | Thêm/sửa test                                                       |
| `chore`    | Việc lặt vặt: deps, config, .gitignore, build tooling               |
| `build`    | Thay đổi hệ thống build / dependency                                |
| `ci`       | Pipeline CI/CD                                                       |
| `revert`   | Revert một commit trước                                             |

### Scope — BẮT BUỘC ghi rõ phần bị tác động

- **Backend** → `(backend-<module>)` — kèm module/phần cụ thể trong `apps/backend`.
  - `feat(backend-products): Add create-product api`
  - `fix(backend-auth): Refresh token not rotating on 401`
  - `perf(backend): switch dev build to SWC` ← nếu là thay đổi toàn backend, không thuộc 1 module thì để `(backend)`.
- **Frontend** → `(frontend-<part>)` — kèm trang/component/phần trong `apps/frontend`.
  - `feat(frontend-footer): add Google map`
  - `fix(frontend-cart): badge count not updating after remove`
  - `(frontend)` nếu là thay đổi toàn cục (vd: proxy/CSP, layout gốc).
- **Diagrams** → luôn dùng `(diagrams)`, không kèm module.
  - `feat(diagrams): Add detail ERD and system architecture diagram`
- **Khác** (docs gốc, config monorepo) → `(docs)`, `(config)`, hoặc bỏ scope nếu là root (`chore: add .gitignore`).

> `<module>`/`<part>` viết **kebab-case**, lấy đúng tên thư mục module backend (products, auth, orders, vouchers, audit-logs...) hoặc tên phần frontend (footer, header, cart, product-detail...).

### Subject

- Tiếng Anh, viết ngắn gọn, động từ thường ở đầu (Add, Fix, Update, Remove...).
- Không kết thúc bằng dấu chấm.

---

## 2. Tách commit theo prefix (vì dùng git subtree)

`apps/backend` và `apps/frontend` là **git subtree**. Để split ra sub-repo sạch, **mỗi commit chỉ nên đụng một prefix**:

- Thay đổi backend → 1 commit riêng (chỉ file trong `apps/backend/`).
- Thay đổi frontend → 1 commit riêng (chỉ file trong `apps/frontend/`).
- Thay đổi diagrams/docs → 1 commit riêng.

→ Khi một task động vào cả backend lẫn frontend, tạo **nhiều commit** thay vì gộp.

---

## 3. Cách viết commit message (tránh bug `@`)

Dùng **Bash tool + heredoc**, KHÔNG dùng here-string PowerShell `@'...'@` (sẽ dính ký tự `@` thừa vào message):

```bash
git commit -F - <<'EOF'
feat(backend-products): Add create-product api

Optional body explaining the why, wrapped ~72 cols.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
```

- Luôn thêm footer `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.
- Body chỉ cần khi cần giải thích "tại sao"; commit nhỏ thì subject là đủ.

---

## 4. Subtree push (chỉ khi user yêu cầu push)

Remotes đã cấu hình:

| Remote     | Repo                                                          | Prefix          |
| ---------- | ------------------------------------------------------------ | --------------- |
| `origin`   | DaoDuckWear-Clothing-Website (monorepo)                      | toàn repo       |
| `backend`  | BE-DaoDuckWear-Clothing-Website                              | `apps/backend`  |
| `frontend` | FE-DaoDuckWear-Clothing-Website-                            | `apps/frontend` |

Nhánh mặc định: `main`.

```bash
# 1. Push monorepo
git push origin main

# 2. Split & push backend (chỉ khi commit có đụng apps/backend)
git subtree push --prefix=apps/backend backend main

# 3. Split & push frontend (chỉ khi commit có đụng apps/frontend)
git subtree push --prefix=apps/frontend frontend main
```

> Push là thao tác ra ngoài — chỉ chạy khi user yêu cầu rõ. Nếu user chỉ nói "commit" thì dừng ở commit, KHÔNG tự push.

---

## Checklist trước khi commit

- [ ] Đúng `type` Conventional Commit (feat/fix/refactor/perf/...).
- [ ] Có scope: backend → `(backend-<module>)`, frontend → `(frontend-<part>)`, diagram → `(diagrams)`.
- [ ] Mỗi commit chỉ đụng một prefix (backend / frontend / diagrams tách riêng).
- [ ] Viết message bằng Bash heredoc, không dùng `@'...'@`.
- [ ] Có footer `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.
- [ ] Không tự push trừ khi user yêu cầu; nếu push thì dùng đúng remote subtree ở trên.
