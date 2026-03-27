import { RuleTester } from "eslint";
import { describe, it } from "vitest";

import rule from "./require-use-server-in-actions";

const tester = new RuleTester({
  languageOptions: { ecmaVersion: 2022, sourceType: "module" },
});

describe("require-use-server-in-actions", () => {
  it("should pass valid cases and report invalid cases", () => {
    tester.run("require-use-server-in-actions", rule, {
      valid: [
        {
          code: "'use server';\nexport async function getUser() {}",
          filename: "/project/src/entities/user/action/get-user.ts",
        },
        {
          code: '"use server";\nexport async function getUser() {}',
          filename: "/project/src/features/auth/action/login.ts",
        },
        {
          // Non-action file — no directive needed
          code: "export const x = 1;",
          filename: "/project/src/entities/user/model/types.ts",
        },
        {
          // Non-FSD file — no directive needed
          code: "export const x = 1;",
          filename: "/project/src/lib/utils.ts",
        },
      ],
      invalid: [
        {
          code: "export async function getUser() {}",
          filename: "/project/src/entities/user/action/get-user.ts",
          errors: [{ messageId: "missingUseServer" }],
          output:
            "'use server';\n\nexport async function getUser() {}",
        },
        {
          code: "import { supabase } from '@/shared/lib';\nexport async function submit() {}",
          filename: "/project/src/features/login/api/login.ts",
          errors: [{ messageId: "missingUseServer" }],
          output:
            "'use server';\n\nimport { supabase } from '@/shared/lib';\nexport async function submit() {}",
        },
      ],
    });
  });
});
