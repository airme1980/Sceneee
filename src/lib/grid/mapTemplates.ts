import type { GridTile, GridTileType } from "@/types";

const OFFICE_TEMPLATE = [
  "####################",
  "#..................#",
  "#..................#",
  "#..D.............D.#",
  "#..................#",
  "#......TTTTTT......#",
  "#......T....T......#",
  "#......T....T......#",
  "#......TTTTTT......#",
  "#..................#",
  "#..TT..........TT..#",
  "#..TT..........TT..#",
  "#..................#",
  "#......C....C......#",
  "#..................#",
  "#..................#",
  "#..D............D..#",
  "#..................#",
  "#..................#",
  "####################",
];

export const GRID_MAP_TEMPLATES = {
  office_20: {
    id: "office_20",
    name: "20x20 Office Grid",
    rows: OFFICE_TEMPLATE,
  },
};

export function buildGridMap(templateId: string): GridTile[][] {
  const template = GRID_MAP_TEMPLATES[templateId as keyof typeof GRID_MAP_TEMPLATES] ?? GRID_MAP_TEMPLATES.office_20;

  return template.rows.map((row) =>
    row.split("").map((tile) => {
      const type = toTileType(tile);
      return {
        type,
        walkable: type === "floor" || type === "chair",
      };
    }),
  );
}

function toTileType(tile: string): GridTileType {
  switch (tile) {
    case "#":
      return "wall";
    case "T":
      return "table";
    case "C":
      return "chair";
    case "D":
      return "decor";
    default:
      return "floor";
  }
}
