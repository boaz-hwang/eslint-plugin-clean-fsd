import type { Rule } from "eslint";

import { parseFSDLocation } from "../utils/parse-fsd-location";

const rule: Rule.RuleModule = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Disallow 'use client' directive in entities/ui files (entities should be server components)",
    },
    messages: {
      noUseClient:
        "Entities UI components should be React Server Components. Remove 'use client' directive.",
    },
    schema: [],
  },
  create(context) {
    const filename = context.filename ?? context.getFilename();
    const location = parseFSDLocation(filename);

    if (location.layer !== "entities" || location.segment !== "ui") {
      return {};
    }

    return {
      Program(node) {
        const firstStmt = node.body[0];

        if (
          firstStmt &&
          firstStmt.type === "ExpressionStatement" &&
          firstStmt.expression.type === "Literal" &&
          firstStmt.expression.value === "use client"
        ) {
          context.report({
            node: firstStmt,
            messageId: "noUseClient",
          });
        }
      },
    };
  },
};

export default rule;
