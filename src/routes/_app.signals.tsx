import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, Badge } from "@/components/ui-bits";
import { geoSignals } from "@/lib/mock-data";
import {
  Zap,
  TrendingUp,
  Ban,
  ShieldX,
  Swords,
  Gavel,
  ArrowRight,
} from "lucide-react";

export const Route = createFileRoute("/_app/signals")({
  component: GeopoliticalSignals,
});

const iconMap = {
  "Port Strike": Zap,
  "Tariff Hike": TrendingUp,
  Sanction: Ban,
  "Border Closure": ShieldX,
  "Conflict Zone": Swords,
  "Policy Shock": Gavel,
} as const;

const filters = ["All", "Critical", "Your Shipments", "Policy Changes"] as const;

function GeopoliticalSignals() {
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");

  const filtered = geoSignals.filter((s) => {
    if (filter === "All") return true;
    if (filter === "Critical") return s.severity === "High";
    if (filter === "Your Shipments") return s.yourShipments > 0;
    if (filter === "Policy Changes") return s.type === "Policy Shock" || s.type === "Tariff Hike";
    return true;
  });

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div className="pt-2 flex items-end justify-between flex-wrap gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2">
            Real-time disruption intelligence
          </p>
          <h2 className="text-4xl font-semibold tracking-tight text-foreground">
            Geopolitical Signals
          </h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
            Trade-impacting events from carriers, customs authorities, and political risk feeds —
            mapped to your active shipments and HS codes.
          </p>
        </div>
        <div className="flex items-baseline gap-8">
          <Stat label="Active signals" value={geoSignals.length.toString()} />
          <Stat label="Affecting your cargo" value="3" tone />
          <Stat label="Critical" value="2" tone />
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
              filter === f
                ? "bg-primary-container text-primary-foreground"
                : "bg-surface-low text-muted-foreground hover:bg-surface-container hover:text-foreground"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filtered.map((s) => {
          const Icon = iconMap[s.type];
          const sev =
            s.severity === "High"
              ? "critical"
              : s.severity === "Medium"
              ? "warning"
              : "info";
          return (
            <Card key={s.id}>
              <div className="flex items-start gap-4">
                <div
                  className={`h-10 w-10 rounded-md grid place-items-center shrink-0 ${
                    sev === "critical"
                      ? "bg-destructive-container text-on-destructive-container"
                      : sev === "warning"
                      ? "bg-warning-container text-on-warning-container"
                      : "bg-surface-high text-muted-foreground"
                  }`}
                >
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-foreground">{s.type}</span>
                    <Badge tone={sev}>{s.severity} impact</Badge>
                    <span className="text-[11px] text-muted-foreground ml-auto">{s.time}</span>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">{s.region}</div>
                  <p className="mt-3 text-sm text-foreground leading-relaxed">{s.description}</p>

                  <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                    <span>
                      Countries:{" "}
                      <span className="text-foreground">{s.affectedCountries.join(", ")}</span>
                    </span>
                    <span>
                      HS:{" "}
                      <span className="font-mono text-foreground">
                        {s.affectedHsCodes.join(", ")}
                      </span>
                    </span>
                  </div>

                  <div className="mt-5 flex items-center justify-between">
                    {s.yourShipments > 0 ? (
                      <Badge tone="critical">
                        {s.yourShipments} of your shipment{s.yourShipments > 1 ? "s" : ""} impacted
                      </Badge>
                    ) : (
                      <span className="text-[11px] text-muted-foreground">
                        No direct exposure
                      </span>
                    )}
                    <button className="text-xs font-medium text-on-secondary-container hover:underline inline-flex items-center gap-1">
                      Impact analysis <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: boolean }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div
        className={`text-2xl font-semibold ${
          tone ? "text-on-destructive-container" : "text-foreground"
        }`}
      >
        {value}
      </div>
    </div>
  );
}
