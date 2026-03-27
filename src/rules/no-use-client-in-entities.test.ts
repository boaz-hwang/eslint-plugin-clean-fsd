import { RuleTester } from "eslint";
import { describe, it } from "vitest";

import rule from "./no-use-client-in-entities";

const ruleTester = new RuleTester({
  languageOptions: { ecmaVersion: 2022, sourceType: "module" },
});

describe("no-use-client-in-entities", () => {
  it("should pass valid cases and report invalid cases", () => {
    ruleTester.run("no-use-client-in-entities", rule, {
      valid: [
        {
          code: "export function UserCard() { return null; }",
          filename: "/project/src/entities/user/ui/UserCard.tsx",
        },
        {
          code: "'use client';\nexport function AuthButton() { return null; }",
          filename: "/project/src/features/auth/ui/AuthButton.tsx",
        },
        {
          code: "'use client';\nexport function Header() { return null; }",
          filename: "/project/src/widgets/header/ui/Header.tsx",
        },
        {
          code: "export function getUser() { return null; }",
          filename: "/project/src/entities/user/action/get-user.ts",
        },
      ],
      invalid: [
        {
          code: "'use client';\nexport function List() { return null; }",
          filename: "/project/src/entities/user/ui/List.tsx",
          errors: [{ messageId: "noUseClient" }],
        },
        {
          code: "'use client';\nexport function BookCard() { return null; }",
          filename: "/project/src/entities/book/ui/BookCard.tsx",
          errors: [{ messageId: "noUseClient" }],
        },
      ],
    });
  });
});
