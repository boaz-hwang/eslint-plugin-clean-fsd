import { RuleTester } from "eslint";
import { describe, it } from "vitest";

import rule from "./features-write-only-actions";

const ruleTester = new RuleTester({
  languageOptions: { ecmaVersion: 2022, sourceType: "module" },
});

describe("features-write-only-actions", () => {
  it("should pass valid cases and report invalid cases", () => {
    ruleTester.run("features-write-only-actions", rule, {
      valid: [
        {
          code: "export function createPartner() {}",
          filename: "/project/src/features/partner/action/create-partner.ts",
        },
        {
          code: "export function deleteUser() {}",
          filename: "/project/src/features/user/action/delete-user.ts",
        },
        {
          code: "export function submitForm() {}",
          filename: "/project/src/features/form/action/submit-form.ts",
        },
        {
          code: "export const updateRecord = async () => {}",
          filename: "/project/src/features/record/action/update-record.ts",
        },
        {
          code: "export function toggleStatus() {}",
          filename: "/project/src/features/status/action/toggle-status.ts",
        },
        {
          code: "export function archiveItem() {}",
          filename: "/project/src/features/item/action/archive-item.ts",
        },
        {
          code: "export function restoreBackup() {}",
          filename: "/project/src/features/backup/action/restore-backup.ts",
        },
        {
          code: "export function removeTag() {}",
          filename: "/project/src/features/tag/action/remove-tag.ts",
        },
        {
          code: "export function addComment() {}",
          filename: "/project/src/features/comment/action/add-comment.ts",
        },
        {
          code: "export function upsertConfig() {}",
          filename: "/project/src/features/config/action/upsert-config.ts",
        },
        // Non-action files should be ignored
        {
          code: "export function getUser() {}",
          filename: "/project/src/features/user/model/types.ts",
        },
        // Entities layer should be ignored
        {
          code: "export function getUser() {}",
          filename: "/project/src/entities/user/action/get-user.ts",
        },
        // commands/ — write prefix required, valid
        {
          code: "export function createOrder() {}",
          filename: "/project/src/features/checkout/commands/create-order.ts",
        },
        {
          code: "export const mergeCart = async () => {};",
          filename: "/project/src/features/cart-merge/commands/merge.ts",
        },
        // queries/ is not checked by this rule (it's a read folder)
        {
          code: "export function getCartWithCoupons() {}",
          filename:
            "/project/src/features/checkout/queries/cart-with-coupons.ts",
        },
      ],
      invalid: [
        {
          code: "export function getUser() {}",
          filename: "/project/src/features/user/action/get-user.ts",
          errors: [
            {
              messageId: "writeOnlyAction",
              data: {
                name: "getUser",
                prefixes:
                  "create/update/delete/submit/toggle/archive/restore/batch/remove/add/upsert/patch/put/post",
              },
            },
          ],
        },
        {
          code: "export function fetchData() {}",
          filename: "/project/src/features/data/action/fetch-data.ts",
          errors: [
            {
              messageId: "writeOnlyAction",
              data: {
                name: "fetchData",
                prefixes:
                  "create/update/delete/submit/toggle/archive/restore/batch/remove/add/upsert/patch/put/post",
              },
            },
          ],
        },
        {
          code: "export const loadItems = async () => {}",
          filename: "/project/src/features/item/action/load-items.ts",
          errors: [
            {
              messageId: "writeOnlyAction",
              data: {
                name: "loadItems",
                prefixes:
                  "create/update/delete/submit/toggle/archive/restore/batch/remove/add/upsert/patch/put/post",
              },
            },
          ],
        },
        // commands/ — read prefix here is invalid
        {
          code: "export function getCart() {}",
          filename: "/project/src/features/checkout/commands/get-cart.ts",
          errors: [
            {
              messageId: "writeOnlyAction",
              data: { name: "getCart" },
            },
          ],
        },
      ],
    });
  });
});
