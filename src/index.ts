import type { ESLint } from "eslint";

import entitiesReadOnlyActions from "./rules/entities-read-only-actions";
import featuresWriteOnlyActions from "./rules/features-write-only-actions";
import noCrossSliceImport from "./rules/no-cross-slice-import";
import noMutationInEntities from "./rules/no-mutation-in-entities";
import noSupabaseInUi from "./rules/no-supabase-in-ui";
import noUseClientInEntities from "./rules/no-use-client-in-entities";
import requirePublicApi from "./rules/require-public-api";
import requireUseServerInActions from "./rules/require-use-server-in-actions";

const plugin: ESLint.Plugin = {
  meta: {
    name: "eslint-plugin-clean-fsd",
    version: "0.1.0",
  },
  rules: {
    "require-use-server-in-actions": requireUseServerInActions,
    "no-mutation-in-entities": noMutationInEntities,
    "no-cross-slice-import": noCrossSliceImport,
    "no-use-client-in-entities": noUseClientInEntities,
    "entities-read-only-actions": entitiesReadOnlyActions,
    "features-write-only-actions": featuresWriteOnlyActions,
    "no-supabase-in-ui": noSupabaseInUi,
    "require-public-api": requirePublicApi,
  },
  configs: {},
};

// Self-referencing recommended config (ESLint 9 flat config pattern)
Object.assign(plugin.configs!, {
  recommended: {
    plugins: {
      "clean-fsd": plugin,
    },
    rules: {
      // Error: architecture violations
      "clean-fsd/require-use-server-in-actions": "error",
      "clean-fsd/no-mutation-in-entities": "error",
      "clean-fsd/no-cross-slice-import": "error",
      // Warning: convention violations (legitimate edge cases exist)
      "clean-fsd/no-use-client-in-entities": "warn",
      "clean-fsd/entities-read-only-actions": "warn",
      "clean-fsd/features-write-only-actions": "warn",
      "clean-fsd/no-supabase-in-ui": "warn",
      "clean-fsd/require-public-api": [
        "warn",
        { ignoreLayers: ["shared", "app"] },
      ],
    },
  },
});

export = plugin;
