import { RuleTester } from "eslint";
import { describe, it } from "vitest";

import rule from "./entities-read-only-actions";

const ruleTester = new RuleTester({
  languageOptions: { ecmaVersion: 2022, sourceType: "module" },
});

describe("entities-read-only-actions", () => {
  it("should pass valid cases and report invalid cases", () => {
    ruleTester.run("entities-read-only-actions", rule, {
      valid: [
        {
          code: "export function getUser() {}",
          filename: "/project/src/entities/user/action/get-user.ts",
        },
        {
          code: "export function fetchBooks() {}",
          filename: "/project/src/entities/book/action/fetch-books.ts",
        },
        {
          code: "export function loadData() {}",
          filename: "/project/src/entities/data/action/load-data.ts",
        },
        {
          code: "export const searchItems = async () => {}",
          filename: "/project/src/entities/item/action/search-items.ts",
        },
        {
          code: "export const countRecords = async () => {}",
          filename: "/project/src/entities/record/action/count-records.ts",
        },
        {
          code: "export function findById() {}",
          filename: "/project/src/entities/user/action/find-by-id.ts",
        },
        {
          code: "export function listAll() {}",
          filename: "/project/src/entities/user/action/list-all.ts",
        },
        {
          code: "export function checkPermission() {}",
          filename: "/project/src/entities/auth/action/check-permission.ts",
        },
        {
          code: "export function queryUsers() {}",
          filename: "/project/src/entities/user/action/query-users.ts",
        },
        // Non-action files should be ignored
        {
          code: "export function createSomething() {}",
          filename: "/project/src/entities/user/model/types.ts",
        },
        // Features layer should be ignored
        {
          code: "export function createUser() {}",
          filename: "/project/src/features/user/action/create-user.ts",
        },
        // selectors/ — read prefix required, valid
        {
          code: "export function getTotal() {}",
          filename: "/project/src/entities/cart/selectors/total.ts",
        },
        {
          code: "export const countItems = () => 0;",
          filename: "/project/src/entities/cart/selectors/count.ts",
        },
      ],
      invalid: [
        {
          code: "export function createUser() {}",
          filename: "/project/src/entities/user/action/create-user.ts",
          errors: [
            {
              messageId: "readOnlyAction",
              data: {
                name: "createUser",
                prefixes:
                  "get/fetch/load/search/count/exists/subscribe/find/list/check/query",
              },
            },
          ],
        },
        {
          code: "export function deleteBook() {}",
          filename: "/project/src/entities/book/action/delete-book.ts",
          errors: [
            {
              messageId: "readOnlyAction",
              data: {
                name: "deleteBook",
                prefixes:
                  "get/fetch/load/search/count/exists/subscribe/find/list/check/query",
              },
            },
          ],
        },
        {
          code: "export const updateUser = async () => {}",
          filename: "/project/src/entities/user/action/update-user.ts",
          errors: [
            {
              messageId: "readOnlyAction",
              data: {
                name: "updateUser",
                prefixes:
                  "get/fetch/load/search/count/exists/subscribe/find/list/check/query",
              },
            },
          ],
        },
        // selectors/ — write prefix here is invalid
        {
          code: "export function addItem() {}",
          filename: "/project/src/entities/cart/selectors/add-item.ts",
          errors: [
            {
              messageId: "readOnlyAction",
              data: { name: "addItem" },
            },
          ],
        },
      ],
    });
  });
});
