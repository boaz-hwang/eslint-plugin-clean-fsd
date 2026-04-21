import {
  ACTION_FOLDER_NAMES,
  COMMAND_FOLDER_NAMES,
  FSD_LAYERS,
  QUERY_FOLDER_NAMES,
  SELECTOR_FOLDER_NAMES,
  type FSDLayer,
} from "./constants";

export interface FSDLocation {
  layer: FSDLayer | null;
  slice: string | null;
  segment: string | null;
  /** File is in `action/` or `api/` (server-boundary). */
  isActionFile: boolean;
  /** File is in `selectors/` (single-Aggregate internal read). */
  isSelectorFile: boolean;
  /** File is in `commands/` (single-Aggregate internal write or multi-Aggregate write). */
  isCommandFile: boolean;
  /** File is in `queries/` (multi-Aggregate read). */
  isQueryFile: boolean;
  rawPath: string;
}

export function parseFSDLocation(
  filename: string,
  actionFolders: string[] = ACTION_FOLDER_NAMES
): FSDLocation {
  const normalized = filename.replace(/\\/g, "/");
  const segments = normalized.split("/");

  const result: FSDLocation = {
    layer: null,
    slice: null,
    segment: null,
    isActionFile: false,
    isSelectorFile: false,
    isCommandFile: false,
    isQueryFile: false,
    rawPath: filename,
  };

  const layerIndex = segments.findIndex((s) =>
    (FSD_LAYERS as readonly string[]).includes(s)
  );
  if (layerIndex === -1) return result;

  result.layer = segments[layerIndex] as FSDLayer;

  const setSegmentFlags = (segmentName: string) => {
    result.segment = segmentName;
    result.isActionFile = actionFolders.includes(segmentName);
    result.isSelectorFile = SELECTOR_FOLDER_NAMES.includes(segmentName);
    result.isCommandFile = COMMAND_FOLDER_NAMES.includes(segmentName);
    result.isQueryFile = QUERY_FOLDER_NAMES.includes(segmentName);
  };

  // shared and app layers don't always have slices
  const sliceSegment = segments[layerIndex + 1];
  if (sliceSegment) {
    // If the next segment looks like a known FSD segment, then there is no slice
    // (e.g., shared/ui/Button.tsx).
    const knownSegments = [
      "ui",
      "model",
      "lib",
      ...actionFolders,
      ...SELECTOR_FOLDER_NAMES,
      ...COMMAND_FOLDER_NAMES,
      ...QUERY_FOLDER_NAMES,
    ];
    if (knownSegments.includes(sliceSegment)) {
      setSegmentFlags(sliceSegment);
    } else {
      result.slice = sliceSegment;

      const segmentPart = segments[layerIndex + 2];
      if (segmentPart) {
        setSegmentFlags(segmentPart);
      }
    }
  }

  return result;
}

/**
 * Parse an import source path (alias or relative) to extract FSD layer and slice.
 * Returns { layer, slice, depth } where depth is the number of segments after layer/slice.
 */
export function parseImportSource(source: string): {
  layer: FSDLayer | null;
  slice: string | null;
  depth: number;
} {
  // Handle alias imports like @/entities/book/model/types
  const aliasMatch = source.match(/^@\/(\w+)(?:\/(.+))?$/);
  if (aliasMatch) {
    const [, layerCandidate, rest] = aliasMatch;
    if ((FSD_LAYERS as readonly string[]).includes(layerCandidate)) {
      const layer = layerCandidate as FSDLayer;
      if (!rest) return { layer, slice: null, depth: 0 };
      const parts = rest.split("/");
      return { layer, slice: parts[0], depth: parts.length - 1 };
    }
  }

  return { layer: null, slice: null, depth: 0 };
}
