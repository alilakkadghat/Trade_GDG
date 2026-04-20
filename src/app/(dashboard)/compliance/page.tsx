"use client";

import { useState } from "react";
import { Card, Badge } from "@/components/ui-bits";
import { Check, AlertTriangle, ChevronDown, ExternalLink, ShieldCheck } from "lucide-react";

const countries = [
    { code: "NL", name: "Netherlands (EU)" },
    { code: "DE", name: "Germany (EU)" },
    { code: "US", name: "United States" },
    { code: "GB", name: "United Kingdom" },
    { code: "AE", name: "United Arab Emirates" },
];

const sections = [
    {
        id: "import",
        title: "Import Regulations",
        status: "ok" as const,
        detail:
            "Basmati rice (HS 1006.30.20) is permitted under EU TARIC with reduced duty 0% under GSP+. Requires phytosanitary certificate from APEDA-recognised lab.",
        items: [
            "EU 2019/787 (Geographical Indication: Basmati protected status)",
            "Aflatoxin B1 limit: 5 µg/kg (EU 1881/2006)",
            "Tricyclazole MRL: 0.01 mg/kg",
        ],
    },
    {
        id: "label",
        title: "Labelling & Packaging",
        status: "warn" as const,
        detail:
            "EU 1169/2011 requires nutrition declaration in EN + local language (NL). Your current label is missing Dutch translation for allergen statement.",
        items: [
            "Country of origin: India (in Dutch: 'India')",
            "Net quantity in metric units, minimum font 1.2mm x-height",
            "Lot/batch identifier required (Directive 2011/91/EU)",
        ],
    },
    {
        id: "prohibited",
        title: "Prohibited / Restricted Items",
        status: "ok" as const,
        detail: "No restrictions for this consignment under current EU sanctions framework.",
        items: ["Russia/Belarus origin checks: not applicable", "Dual-use screening: cleared"],
    },
    {
        id: "duty",
        title: "Duty & FTA Benefits",
        status: "ok" as const,
        detail:
            "MFN duty for HS 1006.30.20 is €175/MT. India qualifies for GSP+ — duty reduced to 0%. Estimated savings on this shipment: €4,200.",
        items: [
            "Form A / REX self-certification number required on invoice",
            "Direct shipment rule: cargo must not be re-invoiced from third country",
        ],
    },
    {
        id: "dgft",
        title: "Export Policy (DGFT, India)",
        status: "warn" as const,
        detail:
            "Notification 20/2023 requires Minimum Export Price (MEP) of $950/MT for Basmati. Your invoice shows $2,008/MT — compliant. RCMC certificate required from APEDA.",
        items: [
            "Shipping Bill must reference APEDA RCMC number",
            "Quality certificate from EIA (Export Inspection Agency) — mandatory",
        ],
    },
];

const checklist = [
    "Phytosanitary certificate (APEDA)",
    "Certificate of Origin (Form A / REX)",
    "EUR.1 / Invoice declaration",
    "Aflatoxin & pesticide test report",
    "Dutch-language allergen declaration",
    "Insurance certificate (CIF terms)",
];

export default function ComplianceChecker() {
    const [country, setCountry] = useState("NL");
    const [open, setOpen] = useState<string>("import");
    const [done, setDone] = useState<Record<string, boolean>>({});

    return (
        <div className="space-y-6 max-w-[1400px] mx-auto">
            <div className="pt-2">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2">
                    Live destination check · TARIC + DGFT cross-reference
                </p>
                <h2 className="text-4xl font-semibold tracking-tight text-foreground">
                    Destination Compliance Check
                </h2>
                <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
                    Country-specific import norms, prohibited item screens, duty calculations, and FTA
                    benefits — verified against your shipment record.
                </p>
            </div>

            <Card>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="text-[11px] uppercase tracking-wider text-muted-foreground">
                            Destination Country
                        </label>
                        <div className="relative mt-2">
                            <select
                                value={country}
                                onChange={(e) => setCountry(e.target.value)}
                                className="w-full appearance-none bg-transparent text-foreground text-sm pb-2 outline-none border-b-2 border-ghost focus:border-secondary"
                            >
                                {countries.map((c) => (
                                    <option key={c.code} value={c.code}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="h-4 w-4 absolute right-0 top-1 text-muted-foreground pointer-events-none" />
                        </div>
                    </div>
                    <div>
                        <label className="text-[11px] uppercase tracking-wider text-muted-foreground">
                            Product / HS Code
                        </label>
                        <div className="mt-2 text-sm text-foreground pb-2 border-b-2 border-ghost">
                            Basmati Rice · 1006.30.20
                        </div>
                    </div>
                    <div>
                        <label className="text-[11px] uppercase tracking-wider text-muted-foreground">
                            Estimated Duty
                        </label>
                        <div className="mt-2 text-sm text-foreground pb-2 border-b-2 border-ghost">
                            <span className="text-on-secondary-container font-medium">€0</span>{" "}
                            <span className="text-muted-foreground">(GSP+ · saved €4,200)</span>
                        </div>
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
                {/* Accordion */}
                <Card className="p-0 overflow-hidden">
                    {sections.map((s, i) => {
                        const isOpen = open === s.id;
                        return (
                            <div
                                key={s.id}
                                className={i > 0 ? "bg-surface-lowest" : "bg-surface-lowest"}
                                style={{ background: i % 2 === 1 ? "#f9f9f7" : "#ffffff" }}
                            >
                                <button
                                    onClick={() => setOpen(isOpen ? "" : s.id)}
                                    className="w-full px-6 py-5 flex items-center gap-4 text-left"
                                >
                                    <span
                                        className={`h-7 w-7 rounded-md grid place-items-center ${s.status === "ok"
                                                ? "bg-secondary-container text-on-secondary-container"
                                                : "bg-warning-container text-on-warning-container"
                                            }`}
                                    >
                                        {s.status === "ok" ? (
                                            <Check className="h-3.5 w-3.5" />
                                        ) : (
                                            <AlertTriangle className="h-3.5 w-3.5" />
                                        )}
                                    </span>
                                    <span className="flex-1 text-sm font-medium text-foreground">{s.title}</span>
                                    <ChevronDown
                                        className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""
                                            }`}
                                    />
                                </button>
                                {isOpen && (
                                    <div className="px-6 pb-6 pl-[68px] space-y-3">
                                        <p className="text-sm text-foreground leading-relaxed">{s.detail}</p>
                                        <ul className="space-y-1.5">
                                            {s.items.map((it) => (
                                                <li
                                                    key={it}
                                                    className="text-xs text-muted-foreground flex items-start gap-2"
                                                >
                                                    <span className="mt-1.5 h-1 w-1 rounded-full bg-muted-foreground shrink-0" />
                                                    {it}
                                                </li>
                                            ))}
                                        </ul>
                                        <a className="inline-flex items-center gap-1 text-xs text-on-secondary-container hover:underline">
                                            View source regulation <ExternalLink className="h-3 w-3" />
                                        </a>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </Card>

                {/* Action items */}
                <div className="space-y-6">
                    <Card>
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4 text-on-secondary-container" />
                            <h3 className="text-sm font-semibold text-foreground">Pre-shipment Checklist</h3>
                        </div>
                        <div className="mt-4 space-y-3">
                            {checklist.map((item) => (
                                <label
                                    key={item}
                                    className="flex items-start gap-3 text-sm cursor-pointer group"
                                >
                                    <input
                                        type="checkbox"
                                        checked={!!done[item]}
                                        onChange={(e) => setDone((p) => ({ ...p, [item]: e.target.checked }))}
                                        className="mt-0.5 h-4 w-4 rounded accent-secondary"
                                    />
                                    <span
                                        className={`text-foreground ${done[item] ? "line-through text-muted-foreground" : ""
                                            }`}
                                    >
                                        {item}
                                    </span>
                                </label>
                            ))}
                        </div>
                        <div className="mt-5 text-xs text-muted-foreground">
                            {Object.values(done).filter(Boolean).length} of {checklist.length} complete
                        </div>
                    </Card>

                    <Card>
                        <h3 className="text-sm font-semibold text-foreground">Risk Score</h3>
                        <div className="mt-3 flex items-baseline gap-2">
                            <div className="text-4xl font-semibold text-foreground">Low</div>
                            <Badge tone="success">2/10</Badge>
                        </div>
                        <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
                            Two minor items pending: Dutch label translation and APEDA RCMC reference on
                            shipping bill. Resolve before vessel cut-off (06 May, 18:00 IST).
                        </p>
                    </Card>
                </div>
            </div>
        </div>
    );
}
