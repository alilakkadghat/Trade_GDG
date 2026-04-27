export type ShipmentStatus =
  | "In Transit"
  | "Pending Clearance"
  | "Delayed"
  | "Cleared"
  | "Pending Validation";

export interface Shipment {
  id: string;
  product: string;
  hsCode: string;
  destination: string;
  destinationCode: string;
  quantity: string;
  value: string;
  status: ShipmentStatus;
  eta: string;
  cargoLocation: string;
}

export const shipments: Shipment[] = [
  {
    id: "SHP-2024-001",
    product: "Basmati Rice (Premium 1121)",
    hsCode: "1006.30.20",
    destination: "Rotterdam, Netherlands",
    destinationCode: "NL",
    quantity: "24 MT",
    value: "$48,200",
    status: "Pending Clearance",
    eta: "12 May 2026",
    cargoLocation: "Nhava Sheva, CFS",
  },
  {
    id: "SHP-2024-002",
    product: "Cotton Yarn (Combed, 30s)",
    hsCode: "5205.23.00",
    destination: "Hamburg, Germany",
    destinationCode: "DE",
    quantity: "18 MT",
    value: "$72,500",
    status: "In Transit",
    eta: "08 May 2026",
    cargoLocation: "Mid-Atlantic",
  },
  {
    id: "SHP-2024-003",
    product: "Pharmaceutical Excipients",
    hsCode: "8517.62.00",
    destination: "New York, USA",
    destinationCode: "US",
    quantity: "4.2 MT",
    value: "$118,000",
    status: "Delayed",
    eta: "15 May 2026",
    cargoLocation: "Mundra Port",
  },
  {
    id: "SHP-2024-004",
    product: "Handloom Textiles",
    hsCode: "5208.42.00",
    destination: "London, UK",
    destinationCode: "GB",
    quantity: "2.8 MT",
    value: "$31,400",
    status: "Cleared",
    eta: "02 May 2026",
    cargoLocation: "Felixstowe",
  },
  {
    id: "SHP-2024-005",
    product: "Spices Mix (Turmeric, Cumin)",
    hsCode: "0910.30.00",
    destination: "Dubai, UAE",
    destinationCode: "AE",
    quantity: "12 MT",
    value: "$26,800",
    status: "In Transit",
    eta: "06 May 2026",
    cargoLocation: "Arabian Sea",
  },
];

export interface AlertItem {
  id: string;
  title: string;
  shipmentId: string;
  severity: "Critical" | "Warning" | "Info";
  description: string;
  time: string;
}

export const alerts: AlertItem[] = [
  {
    id: "AL-001",
    title: "HS Code Mismatch",
    shipmentId: "SHP-2024-001",
    severity: "Critical",
    description:
      "Bill of Lading lists HS 1006.30.10 but Commercial Invoice shows 1006.30.20. Will trigger customs hold.",
    time: "2h ago",
  },
  {
    id: "AL-002",
    title: "Red Sea Disruption",
    shipmentId: "SHP-2024-002",
    severity: "Warning",
    description:
      "Houthi-related rerouting via Cape of Good Hope. Expect 12–14 day ETA delay on Hamburg shipment.",
    time: "6h ago",
  },
  {
    id: "AL-003",
    title: "EU CBAM Filing Due",
    shipmentId: "SHP-2024-002",
    severity: "Warning",
    description:
      "Quarterly Carbon Border Adjustment report due 30 May 2026 for cotton yarn under CN 5205.",
    time: "1d ago",
  },
  {
    id: "AL-004",
    title: "USFDA Prior Notice Filed",
    shipmentId: "SHP-2024-003",
    severity: "Info",
    description: "Prior Notice acknowledged. Awaiting FDA hold release at JFK.",
    time: "1d ago",
  },
];

export interface ValidationResult {
  status: "MISMATCH" | "MISSING" | "WARNING" | "OK";
  field: string;
  document: string;
  expected: string;
  extracted: string;
  severity: "Critical" | "Warning" | "Info";
  suggestion: string;
}

export const validationResults: ValidationResult[] = [
  {
    status: "MISMATCH",
    field: "Consignee Name",
    document: "Bill of Lading",
    expected: "Global Tech Logistics LLC",
    extracted: "Global Tech Logistcs",
    severity: "Critical",
    suggestion: "Auto-correct typo and re-issue B/L from carrier portal.",
  },
  {
    status: "MISSING",
    field: "HS Code",
    document: "Commercial Invoice",
    expected: "8517.62.00",
    extracted: "—",
    severity: "Critical",
    suggestion: "Add HS 8517.62.00 to invoice line item 3. Required for EU TARIC clearance.",
  },
  {
    status: "WARNING",
    field: "Total Weight",
    document: "Packing List",
    expected: "1,250 kg",
    extracted: "1,248 kg",
    severity: "Warning",
    suggestion: "2kg variance within tolerance. Acceptable but flag for carrier weighing dispute.",
  },
  {
    status: "OK",
    field: "Container Number",
    document: "Bill of Lading",
    expected: "MSCU-7821445",
    extracted: "MSCU-7821445",
    severity: "Info",
    suggestion: "Validated.",
  },
  {
    status: "OK",
    field: "Port of Loading",
    document: "Commercial Invoice",
    expected: "INNSA (Nhava Sheva)",
    extracted: "INNSA (Nhava Sheva)",
    severity: "Info",
    suggestion: "Validated.",
  },
];

export interface GeoSignal {
  id: string;
  type:
    | "Port Strike"
    | "Tariff Hike"
    | "Sanction"
    | "Border Closure"
    | "Conflict Zone"
    | "Policy Shock";
  region: string;
  affectedCountries: string[];
  description: string;
  severity: "High" | "Medium" | "Low";
  affectedHsCodes: string[];
  yourShipments: number;
  time: string;
}

export const geoSignals: GeoSignal[] = [
  {
    id: "GS-001",
    type: "Conflict Zone",
    region: "Red Sea / Bab-el-Mandeb",
    affectedCountries: ["DE", "NL", "GB", "BE", "FR"],
    description:
      "Continued Houthi targeting of merchant vessels. Major carriers (Maersk, MSC, CMA-CGM) routing via Cape of Good Hope. Add 12–14 days to Asia–Europe transit. Bunker surcharges +$450/TEU.",
    severity: "High",
    affectedHsCodes: ["5205", "5208", "1006"],
    yourShipments: 2,
    time: "Updated 2h ago",
  },
  {
    id: "GS-002",
    type: "Tariff Hike",
    region: "United States",
    affectedCountries: ["US"],
    description:
      "USTR Section 301 review proposes additional 25% duty on Indian pharmaceutical excipients (HS 8517 spillover). Comment period closes 28 May.",
    severity: "High",
    affectedHsCodes: ["8517", "3003", "3004"],
    yourShipments: 1,
    time: "Updated 5h ago",
  },
  {
    id: "GS-003",
    type: "Port Strike",
    region: "Hamburg, Germany",
    affectedCountries: ["DE"],
    description:
      "Ver.di union 48hr warning strike at Eurogate and HHLA terminals. Vessel berthing windows pushed by 36–60h. Use Bremerhaven as fallback.",
    severity: "Medium",
    affectedHsCodes: ["*"],
    yourShipments: 1,
    time: "Updated 8h ago",
  },
  {
    id: "GS-004",
    type: "Policy Shock",
    region: "European Union",
    affectedCountries: ["DE", "NL", "FR", "IT", "ES"],
    description:
      "CBAM definitive period begins Jan 2026. Embedded emissions reporting now mandatory for cement, steel, fertiliser, aluminium, hydrogen, electricity. Default values withdrawn.",
    severity: "Medium",
    affectedHsCodes: ["72", "73", "76", "25", "31"],
    yourShipments: 0,
    time: "Updated 1d ago",
  },
  {
    id: "GS-005",
    type: "Border Closure",
    region: "Pakistan–Afghanistan (Torkham)",
    affectedCountries: ["AF", "PK"],
    description:
      "Torkham crossing closed indefinitely. Reroute Central Asia cargo via Bandar Abbas (Iran) — INSTC corridor. Add 9 days.",
    severity: "Low",
    affectedHsCodes: ["*"],
    yourShipments: 0,
    time: "Updated 2d ago",
  },
];
