import { RuleTester } from "eslint";
import { describe, it } from "vitest";

import rule from "./no-upward-entity-import";

const tester = new RuleTester({
  languageOptions: { ecmaVersion: 2022, sourceType: "module" },
});

describe("no-upward-entity-import", () => {
  it("should pass valid cases and report invalid cases", () => {
    tester.run("no-upward-entity-import", rule, {
      valid: [
        {
          // entities importing shared — allowed (downward)
          code: "import { cn } from '@/shared/lib/utils';",
          filename: "/project/src/entities/cart/action/get-cart.ts",
        },
        {
          // entities importing another entity — not this rule's concern
          // (handled by no-cross-slice-import)
          code: "import { UserType } from '@/entities/user';",
          filename: "/project/src/entities/cart/model/types.ts",
        },
        {
          // features importing entities — allowed (downward)
          code: "import { getCart } from '@/entities/cart';",
          filename: "/project/src/features/checkout/action/create-order.ts",
        },
        {
          // widgets importing features — allowed (downward)
          code: "import { CheckoutButton } from '@/features/checkout';",
          filename: "/project/src/widgets/cart-panel/ui/CartPanel.tsx",
        },
        {
          // Source file outside entities — rule should not fire
          code: "import { StartCheckout } from '@/features/checkout';",
          filename: "/project/src/widgets/cart-panel/ui/CartPanel.tsx",
        },
        {
          // External package — skip
          code: "import React from 'react';",
          filename: "/project/src/entities/cart/ui/CartList.tsx",
        },
      ],
      invalid: [
        {
          // entities → features : upward import
          code: "import { startCheckout } from '@/features/checkout';",
          filename: "/project/src/entities/cart/commands/add-item.ts",
          errors: [
            {
              messageId: "upwardImport",
              data: { targetLayer: "features" },
            },
          ],
        },
        {
          // entities → widgets : upward import
          code: "import { CartPanel } from '@/widgets/cart-panel';",
          filename: "/project/src/entities/cart/ui/CartMini.tsx",
          errors: [
            {
              messageId: "upwardImport",
              data: { targetLayer: "widgets" },
            },
          ],
        },
        {
          // entities → app : upward import
          code: "import { Layout } from '@/app/layout';",
          filename: "/project/src/entities/user/action/get-user.ts",
          errors: [
            {
              messageId: "upwardImport",
              data: { targetLayer: "app" },
            },
          ],
        },
        {
          // Deep entity file → features deep path
          code: "import { helper } from '@/features/auth/lib/helper';",
          filename: "/project/src/entities/session/selectors/is-logged-in.ts",
          errors: [
            {
              messageId: "upwardImport",
              data: { targetLayer: "features" },
            },
          ],
        },
      ],
    });
  });
});
