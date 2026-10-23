import type { ImageSourcePropType } from "react-native";

export type ProductCategory =
  | "RO Purifiers"
  | "UV & UF"
  | "Filters"
  | "Pumps"
  | "Parts & Accessories";

export type Product = {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  dealerPrice: number;
  description: string;
  rating: number;
  reviews: number;
  image: ImageSourcePropType;
};

export const CATEGORIES = [
  "All",
  "RO Purifiers",
  "UV & UF",
  "Filters",
  "Pumps",
  "Parts & Accessories",
] as const;

const images = {
  ro: require("../assets/images/purifier-ro.png"),
  uv: require("../assets/images/purifier-uv.png"),
  filter: require("../assets/images/filter-cartridges.png"),
};

type ProductSeed = [string, number, string];

const groups: {
  key: string;
  category: ProductCategory;
  image: keyof typeof images;
  items: ProductSeed[];
}[] = [
  {
    key: "ro",
    category: "RO Purifiers",
    image: "ro",
    items: [
      ["AquaPure RO 8L", 12990, "8-stage purification · 8 L storage"],
      ["AquaPure RO Copper+", 16490, "RO + UV · copper mineralizer"],
      ["AquaPure RO Slim", 10990, "Wall-mount · compact body"],
      ["AquaPure RO Max", 18990, "High-recovery membrane · 10 L tank"],
      ["AquaPure RO Smart", 21990, "Filter-life indicator · 8-stage"],
      ["AquaPure RO Pro", 24990, "Commercial-grade membrane · 12 L"],
      ["AquaPure RO Alkaline", 17990, "Alkaline cartridge · 8 L storage"],
      ["AquaPure RO Prime", 14490, "Mineral balance · 7-stage"],
      ["AquaPure RO Advance", 19990, "TDS controller · 10 L storage"],
      ["AquaPure RO Compact", 9990, "Space-saving · 7 L storage"],
    ],
  },
  {
    key: "uv",
    category: "UV & UF",
    image: "uv",
    items: [
      ["ClearWave UV 7L", 7990, "UV disinfection · 7 L storage"],
      ["ClearWave UV+UF", 9990, "Dual purification · 8 L storage"],
      ["ClearWave UV Smart", 11990, "Digital alerts · 7 L storage"],
      ["ClearWave UF Direct", 4490, "Gravity-compatible · 6-stage"],
      ["ClearWave UV Max", 13990, "High-flow UV chamber · 10 L"],
      ["ClearWave UV Copper", 10990, "UV + copper cartridge · 8 L"],
      ["ClearWave UF Compact", 3990, "Compact direct-flow · 5-stage"],
      ["ClearWave UV Pro", 15990, "Stainless UV chamber · 8 L"],
    ],
  },
  {
    key: "filter",
    category: "Filters",
    image: "filter",
    items: [
      ["Sediment Filter 10 in", 299, "5 micron · universal fit"],
      ["Sediment Filter 20 in", 549, "5 micron · high capacity"],
      ["Pre-Carbon Block 10 in", 399, "Coconut shell carbon"],
      ["Post-Carbon Inline Filter", 449, "Taste and odour reduction"],
      ["RO Membrane 75 GPD", 1299, "High rejection · standard housing"],
      ["RO Membrane 100 GPD", 1699, "High flow · standard housing"],
      ["UF Membrane 10 in", 799, "Hollow-fibre · 0.01 micron"],
      ["Mineral Cartridge", 599, "Adds balanced mineral taste"],
      ["Copper Mineral Cartridge", 899, "Copper-infused mineral media"],
      ["Alkaline Cartridge", 749, "pH balancing media"],
      ["Inline Taste Filter", 349, "Quick-connect · 1/4 in"],
      ["Filter Service Kit", 1499, "Three-stage annual replacement set"],
    ],
  },
  {
    key: "pump",
    category: "Pumps",
    image: "ro",
    items: [
      ["Booster Pump 75 GPD", 1899, "24 V · 1.2 L/min"],
      ["Booster Pump 100 GPD", 2299, "24 V · 1.5 L/min"],
      ["Pump Head Assembly", 999, "Replacement head · 24 V"],
      ["Solenoid Valve 24 V", 399, "Auto shut-off compatible"],
      ["Auto Shut-off Valve", 299, "Four-way · quick-connect"],
      ["Flow Restrictor 300 ml", 149, "For 75 GPD membranes"],
      ["Flow Restrictor 450 ml", 179, "For 100 GPD membranes"],
      ["Pressure Switch Set", 349, "High and low pressure pair"],
    ],
  },
  {
    key: "parts",
    category: "Parts & Accessories",
    image: "filter",
    items: [
      ["RO Storage Tank 8L", 2199, "Food-grade · 8 L capacity"],
      ["RO Storage Tank 12L", 2899, "Food-grade · 12 L capacity"],
      ["Faucet Chrome Finish", 499, "Lead-free brass · countertop mount"],
      ["Faucet Matte Black", 649, "Lead-free brass · countertop mount"],
      ["Filter Housing 10 in", 349, "Clear bowl · 1/4 in ports"],
      ["Filter Housing Spanner", 129, "Universal housing wrench"],
      ["Quick Connect Elbow Set", 199, "Six-piece · 1/4 in tubing"],
      ["Food-grade Tube 5 m", 299, "1/4 in · pressure rated"],
      ["Leak Stop Float Valve", 249, "Tank safety shut-off"],
      ["UV Lamp Replacement", 799, "Compatible 11 W lamp"],
      ["Power Adapter 24 V", 549, "2 A regulated supply"],
      ["Wall Mount Bracket", 399, "Powder-coated steel"],
    ],
  },
];

export const PRODUCTS: Product[] = groups.flatMap((group) =>
  group.items.map(([name, price, description], index) => ({
    id: `${group.key}-${index + 1}`,
    name,
    category: group.category,
    price,
    dealerPrice: Math.round((price * 0.8) / 10) * 10,
    description,
    rating: Number((4.2 + ((index + group.key.length) % 7) * 0.1).toFixed(1)),
    reviews: 18 + ((index * 23 + group.key.length * 7) % 210),
    image: images[group.image],
  })),
);
