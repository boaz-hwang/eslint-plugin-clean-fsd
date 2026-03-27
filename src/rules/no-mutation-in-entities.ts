import type { Rule } from "eslint";

import { SUPABASE_MUTATION_METHODS } from "../utils/constants";
import { parseFSDLocation } from "../utils/parse-fsd-location";

interface ASTNode {
  type: string;
  callee?: ASTNode;
  object?: ASTNode;
  property?: ASTNode;
  name?: string;
}

const rule: Rule.RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow Supabase mutation methods (insert, update, delete, upsert) in the entities layer",
    },
    messages: {
      noMutation:
        "Supabase .{{ method }}() is a mutation and must not be used in the entities layer. Move it to features.",
    },
    schema: [],
  },
  create(context) {
    const filename = context.filename ?? context.getFilename();
    const location = parseFSDLocation(filename);

    if (location.layer !== "entities") {
      return {};
    }

    return {
      CallExpression(node) {
        const callee = node.callee;
        if (callee.type !== "MemberExpression") return;
        if (callee.property.type !== "Identifier") return;

        const method = callee.property.name;
        if (!SUPABASE_MUTATION_METHODS.includes(method)) return;

        // Walk up the MemberExpression chain to find a .from() call
        if (!hasFromCallInChain(callee.object as ASTNode)) return;

        context.report({
          node,
          messageId: "noMutation",
          data: { method },
        });
      },
    };
  },
};

function hasFromCallInChain(node: ASTNode): boolean {
  if (node.type === "CallExpression" && node.callee) {
    const callee = node.callee;
    if (
      callee.type === "MemberExpression" &&
      callee.property?.type === "Identifier" &&
      callee.property.name === "from"
    ) {
      return true;
    }
    // Continue walking up the chain (e.g., supabase.from('t').select('*').insert())
    if (callee.type === "MemberExpression" && callee.object) {
      return hasFromCallInChain(callee.object);
    }
  }

  if (node.type === "MemberExpression" && node.object) {
    return hasFromCallInChain(node.object);
  }

  return false;
}

export default rule;
