import { describe, expect, it } from "vitest";

import { parseFSDLocation, parseImportSource } from "./parse-fsd-location";

describe("parseFSDLocation", () => {
  it("parses standard entity path", () => {
    const r = parseFSDLocation("/project/src/entities/user/model/types.ts");
    expect(r.layer).toBe("entities");
    expect(r.slice).toBe("user");
    expect(r.segment).toBe("model");
    expect(r.isActionFile).toBe(false);
  });

  it("parses entity action path", () => {
    const r = parseFSDLocation(
      "/project/src/entities/user/action/get-user.ts"
    );
    expect(r.layer).toBe("entities");
    expect(r.slice).toBe("user");
    expect(r.segment).toBe("action");
    expect(r.isActionFile).toBe(true);
  });

  it("parses feature api folder as action", () => {
    const r = parseFSDLocation("/project/src/features/login/api/login.ts");
    expect(r.layer).toBe("features");
    expect(r.slice).toBe("login");
    expect(r.segment).toBe("api");
    expect(r.isActionFile).toBe(true);
  });

  it("parses feature ui path", () => {
    const r = parseFSDLocation(
      "/project/src/features/auth/ui/AuthButton.tsx"
    );
    expect(r.layer).toBe("features");
    expect(r.slice).toBe("auth");
    expect(r.segment).toBe("ui");
    expect(r.isActionFile).toBe(false);
  });

  it("parses shared without slice", () => {
    const r = parseFSDLocation("/project/src/shared/ui/Button.tsx");
    expect(r.layer).toBe("shared");
    expect(r.slice).toBe(null);
    expect(r.segment).toBe("ui");
  });

  it("parses shared with subfolder", () => {
    const r = parseFSDLocation("/project/src/shared/lib/utils.ts");
    expect(r.layer).toBe("shared");
    expect(r.slice).toBe(null);
    expect(r.segment).toBe("lib");
  });

  it("parses widgets path", () => {
    const r = parseFSDLocation("/project/src/widgets/header/ui/Header.tsx");
    expect(r.layer).toBe("widgets");
    expect(r.slice).toBe("header");
    expect(r.segment).toBe("ui");
  });

  it("parses app layer", () => {
    const r = parseFSDLocation("/project/src/app/(auth)/login/page.tsx");
    expect(r.layer).toBe("app");
    expect(r.slice).toBe("(auth)");
  });

  it("returns null for non-FSD path", () => {
    const r = parseFSDLocation("/project/src/utils/helpers.ts");
    expect(r.layer).toBe(null);
    expect(r.slice).toBe(null);
  });

  it("handles Windows paths", () => {
    const r = parseFSDLocation(
      "C:\\project\\src\\entities\\user\\action\\get-user.ts"
    );
    expect(r.layer).toBe("entities");
    expect(r.slice).toBe("user");
    expect(r.isActionFile).toBe(true);
  });

  it("parses entity selectors folder", () => {
    const r = parseFSDLocation(
      "/project/src/entities/cart/selectors/total.ts"
    );
    expect(r.layer).toBe("entities");
    expect(r.slice).toBe("cart");
    expect(r.segment).toBe("selectors");
    expect(r.isSelectorFile).toBe(true);
    expect(r.isActionFile).toBe(false);
    expect(r.isCommandFile).toBe(false);
  });

  it("parses entity commands folder", () => {
    const r = parseFSDLocation(
      "/project/src/entities/cart/commands/add-item.ts"
    );
    expect(r.layer).toBe("entities");
    expect(r.slice).toBe("cart");
    expect(r.segment).toBe("commands");
    expect(r.isCommandFile).toBe(true);
    expect(r.isSelectorFile).toBe(false);
  });

  it("parses feature queries folder", () => {
    const r = parseFSDLocation(
      "/project/src/features/checkout/queries/cart-with-coupons.ts"
    );
    expect(r.layer).toBe("features");
    expect(r.slice).toBe("checkout");
    expect(r.segment).toBe("queries");
    expect(r.isQueryFile).toBe(true);
    expect(r.isCommandFile).toBe(false);
  });

  it("parses feature commands folder", () => {
    const r = parseFSDLocation(
      "/project/src/features/cart-merge/commands/merge.ts"
    );
    expect(r.layer).toBe("features");
    expect(r.slice).toBe("cart-merge");
    expect(r.segment).toBe("commands");
    expect(r.isCommandFile).toBe(true);
  });

  it("accepts singular folder names for backward compatibility", () => {
    const selector = parseFSDLocation(
      "/project/src/entities/cart/selector/total.ts"
    );
    expect(selector.isSelectorFile).toBe(true);

    const command = parseFSDLocation(
      "/project/src/entities/cart/command/add-item.ts"
    );
    expect(command.isCommandFile).toBe(true);

    const query = parseFSDLocation(
      "/project/src/features/checkout/query/list.ts"
    );
    expect(query.isQueryFile).toBe(true);
  });
});

describe("parseImportSource", () => {
  it("parses alias import with layer only", () => {
    const r = parseImportSource("@/entities");
    expect(r.layer).toBe("entities");
    expect(r.slice).toBe(null);
    expect(r.depth).toBe(0);
  });

  it("parses alias import with slice", () => {
    const r = parseImportSource("@/entities/book");
    expect(r.layer).toBe("entities");
    expect(r.slice).toBe("book");
    expect(r.depth).toBe(0);
  });

  it("parses deep alias import", () => {
    const r = parseImportSource("@/entities/book/model/types");
    expect(r.layer).toBe("entities");
    expect(r.slice).toBe("book");
    expect(r.depth).toBe(2);
  });

  it("returns null for non-FSD alias", () => {
    const r = parseImportSource("@/lib/utils");
    expect(r.layer).toBe(null);
  });

  it("returns null for external package", () => {
    const r = parseImportSource("react");
    expect(r.layer).toBe(null);
  });
});
