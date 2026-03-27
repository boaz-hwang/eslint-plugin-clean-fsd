# eslint-plugin-clean-fsd

ESLint plugin for enforcing **Clean Feature-Sliced Design (F.S.D)** architecture in Next.js + Supabase projects.

Clean F.S.D 아키텍처를 ESLint로 자동 강제하는 플러그인입니다.

## Why? / 왜 필요한가?

Clean F.S.D physically separates **READ** and **WRITE** responsibilities through folder structure:

```
[Widgets / app routes]
        ↓ (READ)
    [Entities]   ←─(READ)─  [Features]   ←─ write requests
```

| Layer | Role | Implementation |
|-------|------|----------------|
| **entities** | READ-only: ViewModel, DTO, immutable data | React Server Components + `action/get*.ts` |
| **features** | WRITE: single user interaction that mutates state | `'use client'` forms + `action/create*.ts` |
| **widgets** | Composed UI combining features/entities | - |
| **shared** | Common UI, libs, config | - |

This plugin catches architecture violations **before build**, making it ideal for:
- Team collaboration with consistent architecture
- AI "vibe-coding" where LLMs need guardrails
- Code review automation

## Installation

```bash
npm install -D eslint-plugin-clean-fsd
# or
pnpm add -D eslint-plugin-clean-fsd
```

## Usage

### Recommended Config (recommended)

```js
// eslint.config.mjs
import cleanFsd from "eslint-plugin-clean-fsd";

export default [
  cleanFsd.configs.recommended,
  // ... your other configs
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

### Error Rules (architecture violations)

| Rule | Description | Fixable |
|------|-------------|---------|
| [require-use-server-in-actions](#require-use-server-in-actions) | `action/` files must start with `'use server'` | ✅ |
| [no-mutation-in-entities](#no-mutation-in-entities) | Entities cannot call `.insert()/.update()/.delete()/.upsert()` | - |
| [no-cross-slice-import](#no-cross-slice-import) | Same-layer slices cannot import each other | - |

### Warning Rules (convention violations with legitimate edge cases)

| Rule | Description | Edge Cases |
|------|-------------|------------|
| [no-use-client-in-entities](#no-use-client-in-entities) | `'use client'` in `entities/ui/` | Infinite scroll, real-time, virtualized lists |
| [entities-read-only-actions](#entities-read-only-actions) | Entity actions should use read prefixes | `subscribe*`, `count*`, `search*` |
| [features-write-only-actions](#features-write-only-actions) | Feature actions should use write prefixes | `submit*`, `toggle*`, `archive*` |
| [no-supabase-in-ui](#no-supabase-in-ui) | UI files shouldn't import `@supabase/*` | Real-time subscriptions |
| [require-public-api](#require-public-api) | Import through `index.ts`, not deep paths | Type imports, test files |

---

### require-use-server-in-actions

Server Action 파일에 `'use server'` 지시어를 강제합니다.

```ts
// ❌ Bad: src/entities/user/action/get-user.ts
export async function getUser() { ... }

// ✅ Good: src/entities/user/action/get-user.ts
'use server';
export async function getUser() { ... }
```

### no-mutation-in-entities

Entities 레이어에서 Supabase 뮤테이션 메서드 호출을 금지합니다.

```ts
// ❌ Bad: src/entities/user/action/get-user.ts
const { data } = await supabase.from('users').insert({ name });

// ✅ Good: move to features layer
// src/features/user/action/create-user.ts
'use server';
const { data } = await supabase.from('users').insert({ name });
```

### no-cross-slice-import

같은 레이어 내 다른 slice를 직접 import하는 것을 금지합니다.

```ts
// ❌ Bad: src/entities/book/ui/BookCard.tsx
import { getPartner } from '@/entities/partner';

// ✅ Good: use widgets layer to compose
// src/widgets/book-with-partner/ui/BookWithPartner.tsx
import { BookCard } from '@/entities/book';
import { PartnerBadge } from '@/entities/partner';
```

### no-use-client-in-entities

Entities UI 컴포넌트에 `'use client'`를 경고합니다. 서버 컴포넌트가 기본입니다.

```ts
// ⚠️ Warning: src/entities/user/ui/UserList.tsx
'use client'; // Do you really need this?

// ✅ Preferred: Server Component (no directive needed)
export async function UserList() {
  const users = await getUsers();
  return <ul>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
}
```

### entities-read-only-actions

Entity action 함수명이 READ 접두어(get/fetch/load/search/count/exists/subscribe/find/list/check/query)로 시작하는지 검사합니다.

```ts
// ⚠️ Warning: src/entities/user/action/create-user.ts
export async function createUser() { ... } // This belongs in features/

// ✅ Good: src/entities/user/action/get-user.ts
export async function getUser() { ... }
```

### features-write-only-actions

Feature action 함수명이 WRITE 접두어(create/update/delete/submit/toggle/archive/restore/batch/remove/add/upsert/patch/put/post)로 시작하는지 검사합니다.

```ts
// ⚠️ Warning: src/features/user/action/get-user.ts
export async function getUser() { ... } // This belongs in entities/

// ✅ Good: src/features/user/action/create-user.ts
export async function createUser() { ... }
```

### no-supabase-in-ui

UI 컴포넌트에서 `@supabase/*` 직접 import를 경고합니다.

```ts
// ⚠️ Warning: src/entities/user/ui/UserList.tsx
import { createClient } from '@supabase/supabase-js';

// ✅ Good: import through action layer
// src/entities/user/action/get-users.ts
import { createClient } from '@supabase/supabase-js';
```

### require-public-api

FSD slice 내부의 deep import를 경고합니다. `index.ts`를 통해 import해야 합니다.

```ts
// ⚠️ Warning
import { UserForm } from '@/features/user/ui/UserForm';

// ✅ Good
import { UserForm } from '@/features/user';
```

**Options:**
- `ignoreLayers`: Layers to skip (default: `['shared', 'app']`)

## FSD Layer Structure

```
src/
  entities/{domain}/        # READ only
    model/                  # ViewModels, DTOs
    action/                 # 'use server': get*, fetch*, load*
    ui/                     # React Server Components
    lib/                    # Utilities
    index.ts                # Public API

  features/{domain}/        # WRITE (CUD)
    model/                  # Form types, validation
    action/                 # 'use server': create*, update*, delete*
    ui/                     # 'use client' components
    lib/
    index.ts

  widgets/{name}/           # Composed UI
    ui/
    index.ts

  shared/                   # Common utilities
    ui/
    lib/
    config/
```

## Compatibility

- ESLint >= 9.0.0 (flat config)
- Node.js >= 18.0.0

## License

MIT
