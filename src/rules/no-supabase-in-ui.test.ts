import { RuleTester } from "eslint";
import { describe, it } from "vitest";

import rule from "./no-supabase-in-ui";

const ruleTester = new RuleTester({
  languageOptions: { ecmaVersion: 2022, sourceType: "module" },
});

describe("no-supabase-in-ui", () => {
  it("should pass valid cases and report invalid cases", () => {
    ruleTester.run("no-supabase-in-ui", rule, {
      valid: [
        {
          code: "import React from 'react';",
          filename: "/project/src/entities/user/ui/UserCard.tsx",
        },
        {
          code: "import { cn } from '@/shared/lib/utils';",
          filename: "/project/src/entities/user/ui/UserCard.tsx",
        },
        {
          code: "import { createClient } from '@supabase/ssr';",
          filename: "/project/src/entities/user/action/get-user.ts",
        },
        {
          code: "import { createClient } from '@supabase/supabase-js';",
          filename: "/project/src/features/auth/action/login.ts",
        },
        {
          code: "import { Database } from '@supabase/supabase-js';",
          filename: "/project/src/entities/user/model/types.ts",
        },
      ],
      invalid: [
        {
          code: "import { createClient } from '@supabase/supabase-js';",
          filename: "/project/src/entities/user/ui/List.tsx",
          errors: [
            {
              messageId: "noSupabaseInUI",
              data: { source: "@supabase/supabase-js" },
            },
          ],
        },
        {
          code: "import { createClient } from '@supabase/ssr';",
          filename: "/project/src/features/auth/ui/AuthForm.tsx",
          errors: [
            {
              messageId: "noSupabaseInUI",
              data: { source: "@supabase/ssr" },
            },
          ],
        },
        {
          code: "import { createClient } from '@supabase/supabase-js';",
          filename: "/project/src/widgets/header/ui/Header.tsx",
          errors: [
            {
              messageId: "noSupabaseInUI",
              data: { source: "@supabase/supabase-js" },
            },
          ],
        },
      ],
    });
  });
});
