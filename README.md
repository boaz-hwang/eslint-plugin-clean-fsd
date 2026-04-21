# eslint-plugin-clean-fsd

ESLint plugin for **Clean FSD** — Feature-Sliced Design layered on **two axes**:

1. **CQRS axis** — read vs. write
2. **DDD axis** — single-Aggregate internal vs. multi-Aggregate coordination

Built for Next.js + Supabase projects, but the rules apply to any FSD codebase.

> Companion article: [F.S.D 모호함, CQRS와 DDD 두 축으로 구분합니다](https://www.productengineer.info/community/articles/ko/clean-fsd-two-axes)

GitHub: https://github.com/boaz-hwang/eslint-plugin-clean-fsd

---

## Why two axes?

Classic FSD gives you layers (`entities`, `features`, `widgets`, ...) but leaves the boundary between `entities` and `features` fuzzy. Teams end up debating every PR: *"should `addItemToCart` live in `entities/cart` or `features/add-to-cart`?"*

Clean FSD resolves that by asking two questions about every piece of logic:

|                          | **Read (Query)**                | **Write (Command)**             |
| ------------------------ | ------------------------------- | ------------------------------- |
| **Single Aggregate**     | `entities/<slice>/selectors/`   | `entities/<slice>/commands/`    |
| **Multi-Aggregate**      | `features/<slice>/queries/`     | `features/<slice>/commands/`    |

Once you map a piece of logic onto this 2×2, its location is mechanical — no more PR debates.

In addition, `action/` (or `api/`) folders remain the canonical place for **server-boundary code** (Next.js Server Actions with `'use server'`). This plugin recognizes both.

---

## Installation

```bash
npm install -D eslint-plugin-clean-fsd
# or
pnpm add -D eslint-plugin-clean-fsd
```

## Usage

### Recommended Config

```js
// eslint.config.mjs
import cleanFsd from "eslint-plugin-clean-fsd";

export default [
  cleanFsd.configs.recommended,
  // ...your other configs
];
```

### Manual Config

```js
// eslint.config.mjs
import cleanFsd from "eslint-plugin-clean-fsd";

export default [
  {
    plugins: { "clean-fsd": cleanFsd },
    rules: {
      "clean-fsd/require-use-server-in-actions": "error",
      "clean-fsd/no-mutation-in-entities": "error",
      "clean-fsd/no-cross-slice-import": "error",
      "clean-fsd/no-upward-entity-import": "error",
      "clean-fsd/no-use-client-in-entities": "warn",
      "clean-fsd/entities-read-only-actions": "warn",
      "clean-fsd/features-write-only-actions": "warn",
      "clean-fsd/no-supabase-in-ui": "warn",
      "clean-fsd/require-public-api": ["warn", { ignoreLayers: ["shared", "app"] }],
    },
  },
];
```

---

## Folder Conventions

| Folder              | Purpose                                                                       | Read/Write | Aggregate Scope          |
| ------------------- | ----------------------------------------------------------------------------- | ---------- | ------------------------ |
| `action/` or `api/` | Next.js Server Actions (`'use server'`) — server boundary                     | Either     | Either                   |
| `selectors/`        | Pure read functions on a single Aggregate (derived state, memos)              | Read       | Single Aggregate         |
| `commands/`         | Write functions that mutate memory state while upholding Aggregate invariants | Write      | Single or Multi          |
| `queries/`          | Reads that combine multiple Aggregates                                        | Read       | Multi-Aggregate          |

Plural form is canonical. Singular (`selector/`, `command/`, `query/`) is also accepted for flexibility.

**Note**: `entities/*/commands/` mutates in-memory state only (e.g. `cart.changeQuantity()`). Supabase mutations (`.insert()`, `.update()`, `.delete()`, `.upsert()`) remain disallowed anywhere in `entities/` — they belong in `features/*/action/` or `features/*/commands/`.

---

## Example Structure (Cart domain)

```text
src/
  entities/cart/
    model/                  # Cart Aggregate Root, CartItem types, invariants
    selectors/              # [single × read]  totalPrice, itemCount, canAdd
    commands/               # [single × write] addItem, changeQuantity, clear
    action/                 # Server Actions:  'use server'; get/load/fetch only
    ui/                     # Server Components by default
    index.ts                # Public API

  features/checkout/
    model/
    queries/                # [multi × read]   cartWithCoupons, cartWithShipping
    commands/               # [multi × write]  completeCheckout (Cart + Order + Stock)
    action/                 # Server Actions:  'use server'; create/update/...
    ui/                     # 'use client' OK
    index.ts

  features/cart-merge/
    commands/               # [multi × write]  mergeGuestAndServerCart (User + Cart)

  widgets/cart-panel/
    ui/
    index.ts

  shared/
    ui/
    lib/
    config/
```

---

## Rules

### Error Rules

| Rule                                                        | Description                                                                     | Fixable |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------- | ------- |
| [require-use-server-in-actions](#require-use-server-in-actions) | `action/` and `api/` files must start with `'use server'`                       | ✅      |
| [no-mutation-in-entities](#no-mutation-in-entities)         | The `entities` layer cannot call Supabase mutation methods                      | -       |
| [no-cross-slice-import](#no-cross-slice-import)             | A slice cannot import another slice in the same layer                           | -       |
| [no-upward-entity-import](#no-upward-entity-import)         | `entities` cannot import from `features`, `widgets`, or `app` (layer direction) | -       |

### Warning Rules

These flag patterns that usually indicate architectural drift but sometimes have legitimate exceptions.

| Rule                                                              | Description                                                                                          |
| ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| [no-use-client-in-entities](#no-use-client-in-entities)           | Warn on `'use client'` inside `entities/ui/`                                                         |
| [entities-read-only-actions](#entities-read-only-actions)         | Exports in `entities/*/action/`, `entities/*/api/`, and `entities/*/selectors/` should use read prefixes |
| [features-write-only-actions](#features-write-only-actions)       | Exports in `features/*/action/`, `features/*/api/`, and `features/*/commands/` should use write prefixes |
| [no-supabase-in-ui](#no-supabase-in-ui)                           | Warn when `@supabase/*` is imported directly in `ui/` files                                          |
| [require-public-api](#require-public-api)                         | Warn on deep imports into slice internals instead of `index.ts`                                      |

---

### require-use-server-in-actions

Enforces a top-level `'use server'` directive in FSD action files. The rule treats both `action/` and `api/` as action folders and can auto-fix missing directives.

```ts
// Bad: src/entities/user/action/get-user.ts
export async function getUser() { ... }

// Good: src/entities/user/action/get-user.ts
'use server';
export async function getUser() { ... }
```

### no-mutation-in-entities

Disallows Supabase mutation methods such as `.insert()`, `.update()`, `.delete()`, and `.upsert()` anywhere in the `entities` layer — including `selectors/` and `commands/`. Memory-state mutations inside `commands/` are still allowed; this rule only targets server-side writes.

```ts
// Bad: src/entities/user/action/create-user.ts
const { data } = await supabase.from('users').insert({ name });

// Good: move the DB mutation to the features layer
// src/features/user/action/create-user.ts
'use server';
const { data } = await supabase.from('users').insert({ name });
```

### no-cross-slice-import

Disallows importing a different slice from the same layer. Compose those slices from a higher layer such as `widgets` or `app`.

```ts
// Bad: src/entities/book/ui/BookCard.tsx
import { getPartner } from '@/entities/partner';

// Good: compose them in widgets
// src/widgets/book-with-partner/ui/BookWithPartner.tsx
import { BookCard } from '@/entities/book';
import { PartnerBadge } from '@/entities/partner';
```

### no-upward-entity-import

Disallows `entities/*` files from importing `features/*`, `widgets/*`, or `app/*`. Dependencies must flow downward in the FSD layer graph.

```ts
// Bad: src/entities/cart/commands/add-item.ts
import { startCheckout } from '@/features/checkout';

// Good: coordination that needs `features` belongs in `features`
// src/features/cart-merge/commands/merge.ts
import { loadCart } from '@/entities/cart';
import { getCurrentUser } from '@/entities/user';
```

### no-use-client-in-entities

Warns when an `entities/ui` file starts with `'use client'`. Entity UI should stay server-first unless there is a clear reason to make it client-side.

```ts
// Warning: src/entities/user/ui/UserList.tsx
'use client';

// Preferred: Server Component
export async function UserList() {
  const users = await getUsers();
  return <ul>{users.map((user) => <li key={user.id}>{user.name}</li>)}</ul>;
}
```

### entities-read-only-actions

Checks that exported functions in `entities/*/action/`, `entities/*/api/`, and `entities/*/selectors/` start with a read-oriented prefix:

`get`, `fetch`, `load`, `search`, `count`, `exists`, `subscribe`, `find`, `list`, `check`, `query`

```ts
// Warning: src/entities/user/action/create-user.ts
export async function createUser() { ... } // This belongs in features/

// Good: src/entities/user/action/get-user.ts
export async function getUser() { ... }

// Good: src/entities/cart/selectors/total.ts
export function getTotal(cart: Cart) { ... }
```

### features-write-only-actions

Checks that exported functions in `features/*/action/`, `features/*/api/`, and `features/*/commands/` start with a write-oriented prefix:

`create`, `update`, `delete`, `submit`, `toggle`, `archive`, `restore`, `batch`, `remove`, `add`, `upsert`, `patch`, `put`, `post`

```ts
// Warning: src/features/user/action/get-user.ts
export async function getUser() { ... } // This belongs in entities/

// Good: src/features/user/action/create-user.ts
export async function createUser() { ... }

// Good: src/features/checkout/commands/complete-checkout.ts
export async function completeCheckout(...) { ... }
```

`features/*/queries/` is **not** checked by this rule, because queries are reads. Use read-oriented prefixes there.

### no-supabase-in-ui

Warns when a file in a `ui` segment imports `@supabase/*` directly. Keep database access in server actions instead of UI modules.

```ts
// Warning: src/entities/user/ui/UserList.tsx
import { createClient } from '@supabase/supabase-js';

// Good: import through an action file
// src/entities/user/action/get-users.ts
import { createClient } from '@supabase/supabase-js';
```

### require-public-api

Warns on deep alias imports into FSD slice internals. Import through the slice public API instead.

```ts
// Warning
import { UserForm } from '@/features/user/ui/UserForm';

// Good
import { UserForm } from '@/features/user';
```

**Options**

- `ignoreLayers`: layers to skip when checking deep imports. Default: `["shared", "app"]`

---

## Conventions Recognized by the Plugin

- FSD layers: `app`, `widgets`, `features`, `entities`, `shared`
- Server-boundary folders: `action`, `api`
- Aggregate internal read folders: `selectors` (also `selector`)
- Aggregate internal write folders: `commands` (also `command`)
- Multi-Aggregate read folders: `queries` (also `query`)
- Public API import pattern: `@/layer/slice`

---

## Migrating from v0.1.x

v0.2.0 is **fully backward compatible**. Existing `action/` and `api/` conventions continue to work unchanged.

Opt-in changes you may want to make:
- Move pure single-Aggregate reads into `selectors/`
- Move single-Aggregate writes (memory state, invariant maintenance) into `commands/`
- Move multi-Aggregate reads into `features/*/queries/`
- Enable the new `no-upward-entity-import` rule (included in `recommended`)

No rules have been removed or had their severity raised.

---

## Compatibility

- ESLint >= 9.0.0
- Node.js >= 18.0.0

## License

MIT
