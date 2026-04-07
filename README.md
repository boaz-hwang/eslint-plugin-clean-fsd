# eslint-plugin-clean-fsd

ESLint plugin for enforcing a Clean Feature-Sliced Design (FSD) architecture in Next.js + Supabase projects.

GitHub: https://github.com/boaz-hwang/eslint-plugin-clean-fsd

## Why?

This plugin encodes a practical convention for server-first FSD applications:

```text
[widgets / app routes]
        ↓ consume read models
    [entities]  ← read-side logic
        ↑
    [features]  → write-side interactions
```

| Layer | Role | Typical Implementation |
|-------|------|------------------------|
| **entities** | Read-focused data access, DTOs, view models | React Server Components + `action/get*.ts` or `api/get*.ts` |
| **features** | Write-focused user interactions that mutate state | `'use client'` UI + `action/create*.ts` or `api/create*.ts` |
| **widgets** | Composition layer for entities and features | Combined UI for screens and sections |
| **shared** | Shared UI, libraries, and config | Cross-cutting utilities |

The plugin catches architecture violations before runtime, which is useful for:

- Keeping team conventions consistent
- Adding guardrails for AI-assisted coding
- Automating architecture checks in code review

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
      "clean-fsd/no-use-client-in-entities": "warn",
      "clean-fsd/entities-read-only-actions": "warn",
      "clean-fsd/features-write-only-actions": "warn",
      "clean-fsd/no-supabase-in-ui": "warn",
      "clean-fsd/require-public-api": ["warn", { ignoreLayers: ["shared", "app"] }],
    },
  },
];
```

## Rules

### Error Rules

| Rule | Description | Fixable |
|------|-------------|---------|
| [require-use-server-in-actions](#require-use-server-in-actions) | `action/` and `api/` files must start with `'use server'` | ✅ |
| [no-mutation-in-entities](#no-mutation-in-entities) | The `entities` layer cannot call Supabase mutation methods | - |
| [no-cross-slice-import](#no-cross-slice-import) | A slice cannot import another slice in the same layer | - |

### Warning Rules

These are warnings because there can be legitimate edge cases, but they still flag patterns that usually indicate architectural drift.

| Rule | Description |
|------|-------------|
| [no-use-client-in-entities](#no-use-client-in-entities) | Warn on `'use client'` inside `entities/ui/` |
| [entities-read-only-actions](#entities-read-only-actions) | Entity action exports should use read-oriented prefixes |
| [features-write-only-actions](#features-write-only-actions) | Feature action exports should use write-oriented prefixes |
| [no-supabase-in-ui](#no-supabase-in-ui) | Warn when `@supabase/*` is imported directly in `ui/` files |
| [require-public-api](#require-public-api) | Warn on deep imports into slice internals instead of `index.ts` |

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

Disallows Supabase mutation methods such as `.insert()`, `.update()`, `.delete()`, and `.upsert()` anywhere in the `entities` layer.

```ts
// Bad: src/entities/user/action/create-user.ts
const { data } = await supabase.from('users').insert({ name });

// Good: move the mutation to the features layer
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

Checks that exported functions in `entities` action files start with a read-oriented prefix:

`get`, `fetch`, `load`, `search`, `count`, `exists`, `subscribe`, `find`, `list`, `check`, `query`

```ts
// Warning: src/entities/user/action/create-user.ts
export async function createUser() { ... } // This belongs in features/

// Good: src/entities/user/action/get-user.ts
export async function getUser() { ... }
```

### features-write-only-actions

Checks that exported functions in `features` action files start with a write-oriented prefix:

`create`, `update`, `delete`, `submit`, `toggle`, `archive`, `restore`, `batch`, `remove`, `add`, `upsert`, `patch`, `put`, `post`

```ts
// Warning: src/features/user/action/get-user.ts
export async function getUser() { ... } // This belongs in entities/

// Good: src/features/user/action/create-user.ts
export async function createUser() { ... }
```

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

## Conventions Recognized by the Plugin

- FSD layers: `app`, `widgets`, `features`, `entities`, `shared`
- Action folders: `action`, `api`
- Public API import pattern: `@/layer/slice`

## Example Structure

```text
src/
  entities/{domain}/
    model/                  # View models, DTOs
    action/                 # 'use server': get*, fetch*, load*
    ui/                     # React Server Components
    lib/                    # Utilities
    index.ts                # Public API

  features/{domain}/
    model/                  # Form types, validation
    action/                 # 'use server': create*, update*, delete*
    ui/                     # 'use client' components
    lib/
    index.ts

  widgets/{name}/
    ui/
    index.ts

  shared/
    ui/
    lib/
    config/
```

## Compatibility

- ESLint >= 9.0.0
- Node.js >= 18.0.0

## License

MIT
