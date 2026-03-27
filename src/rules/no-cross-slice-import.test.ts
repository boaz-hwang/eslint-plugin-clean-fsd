import { RuleTester } from "eslint";
import { describe, it } from "vitest";

import rule from "./no-cross-slice-import";

const tester = new RuleTester({
  languageOptions: { ecmaVersion: 2022, sourceType: "module" },
});

describe("no-cross-slice-import", () => {
  it("should pass valid cases and report invalid cases", () => {
    tester.run("no-cross-slice-import", rule, {
      valid: [
        {
          // Same slice import — allowed
          code: "import { BookType } from '@/entities/book/model/types';",
          filename: "/project/src/entities/book/ui/BookCard.tsx",
        },
        {
          // Cross-layer import — allowed (features -> entities)
          code: "import { getUser } from '@/entities/user';",
          filename: "/project/src/features/auth/action/login.ts",
        },
        {
          // Shared layer — skip
          code: "import { cn } from '@/shared/lib/utils';",
          filename: "/project/src/shared/ui/Button.tsx",
        },
        {
          // App layer — skip
          code: "import { Layout } from '@/app/layout';",
          filename: "/project/src/app/(main)/page.tsx",
        },
        {
          // External package — skip
          code: "import React from 'react';",
          filename: "/project/src/entities/book/ui/BookCard.tsx",
        },
        {
          // No slice in current file — skip
          code: "import { something } from '@/entities/book';",
          filename: "/project/src/entities/model/types.ts",
        },
      ],
      invalid: [
        {
          // entities/book imports from entities/partner — cross-slice
          code: "import { PartnerName } from '@/entities/partner';",
          filename: "/project/src/entities/book/ui/BookCard.tsx",
          errors: [
            {
              messageId: "noCrossSlice",
              data: { targetSlice: "partner", layer: "entities" },
            },
          ],
        },
        {
          // features/login imports from features/auth — cross-slice
          code: "import { authStore } from '@/features/auth/model/store';",
          filename: "/project/src/features/login/ui/LoginForm.tsx",
          errors: [
            {
              messageId: "noCrossSlice",
              data: { targetSlice: "auth", layer: "features" },
            },
          ],
        },
        {
          // widgets/sidebar imports from widgets/header — cross-slice
          code: "import { HeaderLogo } from '@/widgets/header';",
          filename: "/project/src/widgets/sidebar/ui/Sidebar.tsx",
          errors: [
            {
              messageId: "noCrossSlice",
              data: { targetSlice: "header", layer: "widgets" },
            },
          ],
        },
      ],
    });
  });
});
