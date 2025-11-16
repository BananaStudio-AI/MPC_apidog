// Unified model registry types
// Import generated types if available

export type UnifiedModelRecord = {
  source: "comet" | "fal";
  id: string;
  provider?: string | null;
  category?: string | null;
  raw: unknown;
};
