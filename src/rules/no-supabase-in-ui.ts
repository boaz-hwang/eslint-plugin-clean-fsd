import type { Rule } from "eslint";

import { parseFSDLocation } from "../utils/parse-fsd-location";

const rule: Rule.RuleModule = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Disallow importing Supabase packages directly in UI segment files",
    },
    messages: {
      noSupabaseInUI:
        "Do not import '{{ source }}' in UI components. Use server actions in the action segment instead.",
    },
    schema: [],
  },
  create(context) {
    const filename = context.filename ?? context.getFilename();
    const location = parseFSDLocation(filename);

    if (location.segment !== "ui") {
      return {};
    }

    return {
      ImportDeclaration(node) {
        const source = node.source.value as string;

        if (source.startsWith("@supabase/")) {
          context.report({
            node,
            messageId: "noSupabaseInUI",
            data: { source },
          });
        }
      },
    };
  },
};

export default rule;
