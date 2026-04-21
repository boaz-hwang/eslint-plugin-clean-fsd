import type { Rule } from "eslint";

import {
  parseFSDLocation,
  parseImportSource,
} from "../utils/parse-fsd-location";

/**
 * Layers that are "above" `entities` in the FSD dependency graph.
 * `entities` must not import from any of these — doing so inverts the
 * layer direction and breaks the single-direction dependency rule.
 */
const UPWARD_LAYERS = new Set(["features", "widgets", "app"]);

const rule: Rule.RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow `entities` files from importing `features`, `widgets`, or `app`. Dependencies must flow downward (higher layers import lower layers).",
    },
    messages: {
      upwardImport:
        "`entities` must not import from `{{ targetLayer }}`. Dependencies must flow downward (features/widgets/app → entities → shared).",
    },
    schema: [],
  },
  create(context) {
    const filename = context.filename ?? context.getFilename();
    const currentLocation = parseFSDLocation(filename);

    if (currentLocation.layer !== "entities") {
      return {};
    }

    return {
      ImportDeclaration(node) {
        const source = node.source.value;
        if (typeof source !== "string") return;

        const target = parseImportSource(source);
        if (!target.layer) return;

        if (!UPWARD_LAYERS.has(target.layer)) return;

        context.report({
          node,
          messageId: "upwardImport",
          data: {
            targetLayer: target.layer,
          },
        });
      },
    };
  },
};

export default rule;
