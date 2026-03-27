import type { Rule } from "eslint";

import { parseImportSource } from "../utils/parse-fsd-location";

const rule: Rule.RuleModule = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Require imports from FSD slices to go through the public API (index.ts), not deep internals",
    },
    messages: {
      requirePublicAPI:
        "Import '{{ source }}' reaches into slice internals. Use the public API '{{ suggested }}' instead.",
    },
    schema: [
      {
        type: "object",
        properties: {
          ignoreLayers: {
            type: "array",
            items: { type: "string" },
          },
        },
        additionalProperties: false,
      },
    ],
  },
  create(context) {
    const options = context.options[0] as
      | { ignoreLayers?: string[] }
      | undefined;
    const ignoreLayers = options?.ignoreLayers ?? ["shared", "app"];

    return {
      ImportDeclaration(node) {
        const source = node.source.value as string;
        const parsed = parseImportSource(source);

        if (!parsed.layer || !parsed.slice) return;

        if (ignoreLayers.includes(parsed.layer)) return;

        if (parsed.depth > 0) {
          context.report({
            node,
            messageId: "requirePublicAPI",
            data: {
              source,
              suggested: `@/${parsed.layer}/${parsed.slice}`,
            },
          });
        }
      },
    };
  },
};

export default rule;
