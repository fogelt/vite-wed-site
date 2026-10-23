export interface NavItem {
  label: string;
  target: string;
}

/** Sections that appear in the header navigation, in page order. */
export const NAV_ITEMS: NavItem[] = [
  { label: "Välkommen", target: "valkommen" },
  { label: "Priser", target: "priser" },
  { label: "Förlovning", target: "forlovning" },
  { label: "Galleri", target: "galleri" },
  { label: "Kontakt", target: "kontakt" },
];

export const SECTION_IDS = NAV_ITEMS.map((item) => item.target);
