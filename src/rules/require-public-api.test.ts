import { RuleTester } from "eslint";
import { describe, it } from "vitest";

import rule from "./require-public-api";

const ruleTester = new RuleTester({
  languageOptions: { ecmaVersion: 2022, sourceType: "module" },
});

describe("require-public-api", () => {
  it("should pass valid cases and report invalid cases", () => {
    ruleTester.run("require-public-api", rule, {
      valid: [
        {
          code: "import { User } from '@/entities/book';",
          filename: "/project/src/features/auth/ui/AuthButton.tsx",
        },
        {
          code: "import { login } from '@/features/auth';",
          filename: "/project/src/widgets/header/ui/Header.tsx",
        },
        {
          code: "import { Button } from '@/shared/ui/Button';",
          filename: "/project/src/entities/user/ui/UserCard.tsx",
        },
        {
          code: "import { cn } from '@/shared/lib/utils';",
          filename: "/project/src/entities/user/ui/UserCard.tsx",
        },
        // External packages should be ignored
        {
          code: "import React from 'react';",
          filename: "/project/src/entities/user/ui/UserCard.tsx",
        },
        // Relative imports should be ignored
        {
          code: "import { helper } from './helper';",
          filename: "/project/src/entities/user/model/types.ts",
        },
        // app layer is ignored by default
        {
          code: "import { layout } from '@/app/layout/utils';",
          filename: "/project/src/widgets/header/ui/Header.tsx",
        },
        // Custom ignoreLayers option
        {
          code: "import { Widget } from '@/widgets/header/ui/Header';",
          filename: "/project/src/app/page.tsx",
          options: [{ ignoreLayers: ["shared", "app", "widgets"] }],
        },
      ],
      invalid: [
        {
          code: "import { UserType } from '@/entities/book/model/types';",
          filename: "/project/src/features/auth/ui/AuthButton.tsx",
          errors: [
            {
              messageId: "requirePublicAPI",
              data: {
                source: "@/entities/book/model/types",
                suggested: "@/entities/book",
              },
            },
          ],
        },
        {
          code: "import { AuthButton } from '@/features/auth/ui/AuthButton';",
          filename: "/project/src/widgets/header/ui/Header.tsx",
          errors: [
            {
              messageId: "requirePublicAPI",
              data: {
                source: "@/features/auth/ui/AuthButton",
                suggested: "@/features/auth",
              },
            },
          ],
        },
        {
          code: "import { getUser } from '@/entities/user/action/get-user';",
          filename: "/project/src/features/auth/action/login.ts",
          errors: [
            {
              messageId: "requirePublicAPI",
              data: {
                source: "@/entities/user/action/get-user",
                suggested: "@/entities/user",
              },
            },
          ],
        },
      ],
    });
  });
});
