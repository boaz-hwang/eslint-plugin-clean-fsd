import { ACTION_FOLDER_NAMES, FSD_LAYERS, type FSDLayer } from "./constants";

export interface FSDLocation {
  layer: FSDLayer | null;
  slice: string | null;
  segment: string | null;
  isActionFile: boolean;
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
    rawPath: filename,
  };

  const layerIndex = segments.findIndex((s) =>
    (FSD_LAYERS as readonly string[]).includes(s)
  );
  if (layerIndex === -1) return result;

  result.layer = segments[layerIndex] as FSDLayer;

  // shared and app layers don't always have slices
  const sliceSegment = segments[layerIndex + 1];
  if (sliceSegment) {
    // If the next segment looks like a known FSD segment (ui, model, action, lib),
    // then there is no slice (e.g., shared/ui/Button.tsx)
    const knownSegments = ["ui", "model", "lib", ...actionFolders];
    if (knownSegments.includes(sliceSegment)) {
      result.segment = sliceSegment;
      result.isActionFile = actionFolders.includes(sliceSegment);
    } else {
      result.slice = sliceSegment;

      const segmentPart = segments[layerIndex + 2];
      if (segmentPart) {
        result.segment = segmentPart;
        result.isActionFile = actionFolders.includes(segmentPart);
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
