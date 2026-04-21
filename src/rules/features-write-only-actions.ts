import type { Rule } from "eslint";

import { FEATURE_WRITE_PREFIXES } from "../utils/constants";
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

function startsWithWritePrefix(name: string): boolean {
  return FEATURE_WRITE_PREFIXES.some((prefix) =>
    name.toLowerCase().startsWith(prefix.toLowerCase())
  );
}

const rule: Rule.RuleModule = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Enforce that feature action and command files only export write-operation functions (create, update, delete, etc.)",
    },
    messages: {
      writeOnlyAction:
        "Feature {{ folderKind }} '{{ name }}' must start with a write prefix ({{ prefixes }}). Read operations belong in entities or features/queries.",
    },
    schema: [],
  },
  create(context) {
    const filename = context.filename ?? context.getFilename();
    const location = parseFSDLocation(filename);

    if (location.layer !== "features") {
      return {};
    }

    if (!location.isActionFile && !location.isCommandFile) {
      return {};
    }

    const folderKind = location.isCommandFile ? "command" : "action";

    return {
      ExportNamedDeclaration(node) {
        const name = getExportedName(node);
        if (!name) return;

        if (!startsWithWritePrefix(name)) {
          context.report({
            node,
            messageId: "writeOnlyAction",
            data: {
              name,
              prefixes: FEATURE_WRITE_PREFIXES.join("/"),
              folderKind,
            },
          });
        }
      },
    };
  },
};

export default rule;
