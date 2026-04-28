"use client";

import { useState, useEffect } from "react";
import { Card, Badge } from "@/components/ui-bits";
import { shipments } from "@/lib/mock-data";
import { Sparkles, FileDown, Clock, ChevronDown } from "lucide-react";

const getDelayStatus = (shipment: any) => {
  if (shipment.status !== "INPROGRESS") {
    return "Delayed / Attention Needed";
  }
  return "On Track";
};

const delayTypes = [
  "Blank Sailing",
  "Customs Hold",
  "Documentation Issue",
  "Port Closure / Strike",
  "Weather / Force Majeure",
  "Other",
];

const cargoLocations = [
  "At Warehouse",
  "At CFS / ICD",
  "Port Terminal",
  "On Vessel",
  "At Destination Port",
];

export default function DelayResolution() {
  const [shown, setShown] = useState(false);
  const [shipment, setShipment] = useState("SHP-2024-001");
  const [delayType, setDelayType] = useState("Blank Sailing");

  const [apiShipments, setApiShipments] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/shipsgo")
      .then((res) => res.json())
      .then((data) => {
        console.log("Shipments:", data.data?.shipments);
        if (data.data?.shipments) {
          setApiShipments(data.data.shipments);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div className="pt-2">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2">
          Logistics-aware resolution engine
        </p>
        <h2 className="text-4xl font-semibold tracking-tight text-foreground">Delay Resolution</h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
          Report a delay and get ground-level, executable steps — not abstract advice. Every
          recommendation is benchmarked against historical resolutions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-6 items-start">
        <div className="space-y-6">
          {/* Form */}
          <Card>
            <h3 className="text-sm font-semibold text-foreground">Incident Report</h3>
            <div className="mt-6 space-y-6">
              <Field label="Shipment ID">
                <Select value={shipment} onChange={setShipment}>
                  {shipments.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.id} — {s.destination}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Cargo Location">
                <Select value={cargoLocations[1]} onChange={() => {}}>
                  {cargoLocations.map((l) => (
                    <option key={l}>{l}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Delay Type">
                <Select value={delayType} onChange={setDelayType}>
                  {delayTypes.map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Description">
                <textarea
                  rows={4}
                  defaultValue="Carrier notified blank sailing for vessel MSC LORETO V.428W. Container gated-in at Nhava Sheva CFS, awaiting next available vessel."
                  className="w-full bg-transparent outline-none text-sm text-foreground border-b-2 border-ghost focus:border-secondary pb-2 resize-none"
                />
              </Field>
              <button
                onClick={() => setShown(true)}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-primary-container text-primary-foreground text-sm font-medium hover:bg-primary"
              >
                <Sparkles className="h-4 w-4" /> Analyze
              </button>
            </div>
          </Card>

          {/* ShipsGo Integrations Data */}
          <Card>
            <h3 className="text-sm font-semibold text-foreground">Live Tracking Feed</h3>
            <div className="mt-4 space-y-3">
              {apiShipments.length === 0 ? (
                <p className="text-xs text-muted-foreground">Fetching shipments from ShipsGo...</p>
              ) : (
                apiShipments.map((s) => (
                  <div key={s.id} className="p-3 bg-surface border border-ghost rounded-md">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-mono text-sm font-medium">{s.reference}</p>
                      <Badge tone={s.status !== "INPROGRESS" ? "warning" : "success"}>
                        {getDelayStatus(s)}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>Status: {s.status}</p>
                      <p>Container: {s.container_number}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Output */}
        {!shown ? (
          <Card className="min-h-[400px] grid place-items-center text-center">
            <div className="max-w-sm">
              <div className="h-12 w-12 mx-auto rounded-md bg-surface-low grid place-items-center">
                <Sparkles className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Submit an incident to receive a resolution playbook with cost-time tradeoffs and
                ready-to-send templates.
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card>
              <Badge tone="warning">Situation Summary</Badge>
              <p className="mt-3 text-sm text-foreground leading-relaxed">
                Your container <span className="font-mono">MSCU-7821445</span> at Nhava Sheva CFS is
                affected by an MSC blank sailing for the Asia–North Europe AE-7 service. Next direct
                sailing departs 12 May. A transhipment routing via Colombo (Maersk SAFARI service)
                is available 09 May with 5 additional days transit and €700/TEU premium.
              </p>
            </Card>

            <Card>
              <h3 className="text-sm font-semibold text-foreground">Recommended Action Steps</h3>
              <ol className="mt-4 space-y-4">
                {[
                  {
                    title: "Notify consignee within 24h",
                    body: "Send revised ETA email using Force Majeure / Carrier Disruption template (auto-drafted below). Reference original B/L and proposed routing.",
                  },
                  {
                    title: "Lock in alternate slot",
                    body: "Contact Maersk Mumbai (forwarder rate code WB-IN-NL) and confirm SAFARI vessel space by 07 May 14:00 IST. Equipment swap to Maersk container required.",
                  },
                  {
                    title: "Amend Shipping Bill",
                    body: "File SB amendment via ICEGATE for vessel + voyage change. Use Annexure-C with reason code 'CARRIER_BLANK_SAILING'. CHA can complete in 2–3h.",
                  },
                  {
                    title: "Update insurance + Letter of Indemnity",
                    body: "Notify insurer of routing change (transhipment clause). Issue LoI to Maersk for switch B/L if buyer demands clean routing.",
                  },
                ].map((step, i) => (
                  <li key={i} className="flex gap-4">
                    <div className="h-7 w-7 rounded-md bg-secondary-container text-on-secondary-container grid place-items-center text-sm font-semibold shrink-0">
                      {i + 1}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground">{step.title}</div>
                      <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                        {step.body}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <h3 className="text-sm font-semibold text-foreground">Cost–Time Tradeoff</h3>
                <table className="mt-4 w-full text-sm">
                  <thead>
                    <tr className="text-[11px] uppercase tracking-wider text-muted-foreground">
                      <th className="text-left font-medium pb-3">Option</th>
                      <th className="text-left font-medium pb-3">Transit</th>
                      <th className="text-right font-medium pb-3">Cost</th>
                    </tr>
                  </thead>
                  <tbody className="text-foreground">
                    <tr>
                      <td className="py-3">A · Wait for direct (MSC)</td>
                      <td className="py-3 text-muted-foreground">+7 days delay</td>
                      <td className="py-3 text-right font-mono">€1,500</td>
                    </tr>
                    <tr className="bg-surface">
                      <td className="py-3 px-2 rounded-l-md">
                        B · Tranship via Colombo
                        <span className="ml-2">
                          <Badge tone="success">Recommended</Badge>
                        </span>
                      </td>
                      <td className="py-3 px-2 text-muted-foreground">+3 days delay</td>
                      <td className="py-3 px-2 text-right font-mono rounded-r-md">€2,200</td>
                    </tr>
                    <tr>
                      <td className="py-3">C · Air freight (partial)</td>
                      <td className="py-3 text-muted-foreground">+0 days</td>
                      <td className="py-3 text-right font-mono">€18,400</td>
                    </tr>
                  </tbody>
                </table>
              </Card>

              <Card>
                <h3 className="text-sm font-semibold text-foreground">Templates Ready</h3>
                <div className="mt-4 space-y-3">
                  {[
                    "Force Majeure notice to consignee (DOCX)",
                    "Letter of Indemnity for switch B/L (PDF)",
                    "Shipping Bill amendment Annexure-C (PDF)",
                    "Insurance routing change notification (DOCX)",
                  ].map((t) => (
                    <button
                      key={t}
                      className="w-full flex items-center gap-3 text-left p-3 rounded-md bg-surface hover:bg-surface-container"
                    >
                      <FileDown className="h-4 w-4 text-on-secondary-container shrink-0" />
                      <span className="text-sm text-foreground flex-1">{t}</span>
                      <span className="text-[11px] text-muted-foreground">Download</span>
                    </button>
                  ))}
                </div>
              </Card>
            </div>

            <Card>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-foreground">Timeline Forecast</h3>
              </div>
              <div className="mt-5 grid grid-cols-4 gap-px bg-surface-container rounded-md overflow-hidden">
                {[
                  { d: "06 May", e: "Confirm alt slot" },
                  { d: "07 May", e: "Equipment swap @ CFS" },
                  { d: "09 May", e: "Vessel departs INNSA" },
                  { d: "15 May", e: "Arrive Rotterdam" },
                ].map((p, i) => (
                  <div key={i} className="bg-surface-lowest p-4">
                    <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                      {p.d}
                    </div>
                    <div className="mt-1 text-sm text-foreground">{p.e}</div>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                Based on 142 historical resolutions of MSC blank sailings on AE-7 service in last 18
                months. 89% confidence interval.
              </p>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</label>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function Select({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none bg-transparent text-foreground text-sm pb-2 outline-none border-b-2 border-ghost focus:border-secondary"
      >
        {children}
      </select>
      <ChevronDown className="h-4 w-4 absolute right-0 top-0 text-muted-foreground pointer-events-none" />
    </div>
  );
}
