import type { Rule } from "eslint";

import { ENTITY_READ_PREFIXES } from "../utils/constants";
import { parseFSDLocation } from "../utils/parse-fsd-location";

function getExportedName(
  node: Rule.Node & { type: "ExportNamedDeclaration" }
): string | null {
  const decl = node.declaration;
  if (!decl) return null;

  if (decl.type === "FunctionDeclaration" && decl.id) {
    return decl.id.name;
  }

  if (decl.type === "VariableDeclaration") {
    const first = decl.declarations[0];
    if (first && first.id.type === "Identifier") {
      return first.id.name;
    }
  }

  return null;
}

function startsWithReadPrefix(name: string): boolean {
  return ENTITY_READ_PREFIXES.some((prefix) =>
    name.toLowerCase().startsWith(prefix.toLowerCase())
  );
}

const rule: Rule.RuleModule = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Enforce that entity action files only export read-operation functions (get, fetch, load, etc.)",
    },
    messages: {
      readOnlyAction:
        "Entity action '{{ name }}' must start with a read prefix ({{ prefixes }}). Entities are read-only.",
    },
    schema: [],
  },
  create(context) {
    const filename = context.filename ?? context.getFilename();
    const location = parseFSDLocation(filename);

    if (location.layer !== "entities" || !location.isActionFile) {
      return {};
    }

    return {
      ExportNamedDeclaration(node) {
        const name = getExportedName(node);
        if (!name) return;

        if (!startsWithReadPrefix(name)) {
          context.report({
            node,
            messageId: "readOnlyAction",
            data: {
              name,
              prefixes: ENTITY_READ_PREFIXES.join("/"),
            },
          });
        }
      },
    };
  },
};

export default rule;
