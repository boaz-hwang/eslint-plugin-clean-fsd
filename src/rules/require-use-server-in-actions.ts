import type { Rule } from "eslint";

import { parseFSDLocation } from "../utils/parse-fsd-location";

const rule: Rule.RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Require 'use server' directive at the top of action files in FSD layers",
    },
    fixable: "code",
    messages: {
      missingUseServer:
        "Action files must start with a 'use server' directive.",
    },
    schema: [],
  },
  create(context) {
    const filename = context.filename ?? context.getFilename();
    const location = parseFSDLocation(filename);

    if (!location.isActionFile) {
      return {};
    }

    return {
      Program(node) {
        const firstStmt = node.body[0];

        if (
          firstStmt &&
          firstStmt.type === "ExpressionStatement" &&
          firstStmt.expression.type === "Literal" &&
          firstStmt.expression.value === "use server"
        ) {
          return;
        }

        context.report({
          node,
          messageId: "missingUseServer",
          fix(fixer) {
            return fixer.insertTextBeforeRange([0, 0], "'use server';\n\n");
          },
        });
      },
    };
  },
};

export default rule;
