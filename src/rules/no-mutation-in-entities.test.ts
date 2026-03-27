import { RuleTester } from "eslint";
import { describe, it } from "vitest";

import rule from "./no-mutation-in-entities";

const tester = new RuleTester({
  languageOptions: { ecmaVersion: 2022, sourceType: "module" },
});

describe("no-mutation-in-entities", () => {
  it("should pass valid cases and report invalid cases", () => {
    tester.run("no-mutation-in-entities", rule, {
      valid: [
        {
          // SELECT in entities is allowed
          code: "const data = await supabase.from('users').select('*');",
          filename: "/project/src/entities/user/action/get-users.ts",
        },
        {
          // Mutation in features is allowed
          code: "await supabase.from('users').insert({ name: 'John' });",
          filename: "/project/src/features/user/action/create-user.ts",
        },
        {
          // .insert() without .from() chain — not a Supabase call, no report
          code: "array.insert(0, item);",
          filename: "/project/src/entities/user/model/utils.ts",
        },
        {
          // Non-entity layer — no check
          code: "await supabase.from('users').delete().eq('id', 1);",
          filename: "/project/src/widgets/header/ui/Header.ts",
        },
      ],
      invalid: [
        {
          code: "await supabase.from('users').insert({ name: 'John' });",
          filename: "/project/src/entities/user/action/create-user.ts",
          errors: [{ messageId: "noMutation", data: { method: "insert" } }],
        },
        {
          code: "await supabase.from('posts').delete().eq('id', 1);",
          filename: "/project/src/entities/post/action/remove-post.ts",
          errors: [{ messageId: "noMutation", data: { method: "delete" } }],
        },
        {
          code: "await supabase.from('items').update({ qty: 5 }).eq('id', 2);",
          filename: "/project/src/entities/item/action/update-item.ts",
          errors: [{ messageId: "noMutation", data: { method: "update" } }],
        },
        {
          code: "await supabase.from('products').upsert({ id: 1, name: 'A' });",
          filename: "/project/src/entities/product/action/upsert-product.ts",
          errors: [{ messageId: "noMutation", data: { method: "upsert" } }],
        },
      ],
    });
  });
});
