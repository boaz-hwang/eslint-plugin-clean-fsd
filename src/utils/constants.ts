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
