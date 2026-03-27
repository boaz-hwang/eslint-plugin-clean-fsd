import type { Rule } from "eslint";

import {
  parseFSDLocation,
  parseImportSource,
} from "../utils/parse-fsd-location";

const SKIP_LAYERS = new Set(["shared", "app"]);

const rule: Rule.RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow importing from a different slice within the same FSD layer",
    },
    messages: {
      noCrossSlice:
        "Cross-slice import is not allowed within the '{{ layer }}' layer. Cannot import from slice '{{ targetSlice }}'.",
    },
    schema: [],
  },
  create(context) {
    const filename = context.filename ?? context.getFilename();
    const currentLocation = parseFSDLocation(filename);

    if (!currentLocation.layer || !currentLocation.slice) {
      return {};
    }

    if (SKIP_LAYERS.has(currentLocation.layer)) {
      return {};
    }

    return {
      ImportDeclaration(node) {
        const source = node.source.value;
        if (typeof source !== "string") return;

        const target = parseImportSource(source);

        if (!target.layer || !target.slice) return;

        if (target.layer !== currentLocation.layer) return;

        if (target.slice === currentLocation.slice) return;

        context.report({
          node,
          messageId: "noCrossSlice",
          data: {
            targetSlice: target.slice,
            layer: currentLocation.layer,
          },
        });
      },
    };
  },
};

export default rule;
