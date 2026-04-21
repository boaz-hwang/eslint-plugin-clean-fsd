export const FSD_LAYERS = [
  "app",
  "widgets",
  "features",
  "entities",
  "shared",
] as const;

export type FSDLayer = (typeof FSD_LAYERS)[number];

export const LAYER_ORDER: Record<string, number> = {
  app: 0,
  widgets: 1,
  features: 2,
  entities: 3,
  shared: 4,
};

export const ENTITY_READ_PREFIXES = [
  "get",
  "fetch",
  "load",
  "search",
  "count",
  "exists",
  "subscribe",
  "find",
  "list",
  "check",
  "query",
];

export const FEATURE_WRITE_PREFIXES = [
  "create",
  "update",
  "delete",
  "submit",
  "toggle",
  "archive",
  "restore",
  "batch",
  "remove",
  "add",
  "upsert",
  "patch",
  "put",
  "post",
];

export const SUPABASE_MUTATION_METHODS = [
  "insert",
  "update",
  "delete",
  "upsert",
];

export const ACTION_FOLDER_NAMES = ["action", "api"];

/**
 * Folders that hold single-Aggregate internal read logic (selectors/derived state).
 * Plural form is canonical; singular is accepted for flexibility.
 */
export const SELECTOR_FOLDER_NAMES = ["selectors", "selector"];

/**
 * Folders that hold single-Aggregate internal write logic (memory-state mutations
 * that uphold invariants via Root methods).
 * Plural form is canonical; singular is accepted for flexibility.
 */
export const COMMAND_FOLDER_NAMES = ["commands", "command"];

/**
 * Folders that hold multi-Aggregate coordination reads (features layer).
 * Plural form is canonical; singular is accepted for flexibility.
 */
export const QUERY_FOLDER_NAMES = ["queries", "query"];
