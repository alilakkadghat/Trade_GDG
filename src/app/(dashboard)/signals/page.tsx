"use client";

import { useState } from "react";
import { Card, Badge, statusToTone } from "@/components/ui-bits";
import { Search, Filter, Bookmark, MapPin, Activity, Bell } from "lucide-react";

// Expanded mock data for the feed
const signals = [
  {
    id: "SIG-091",
    type: "Geopolitical",
    severity: "High",
    title: "Red Sea Transit Disruption",
    desc: "Major carriers re-routing via Cape of Good Hope. Expect +12 days transit and $800/TEU surcharge on Asia-Europe lane.",
    date: "2h ago",
    impact: ["SHP-001 (Rotterdam)", "SHP-008 (Hamburg)"],
  },
  {
    id: "SIG-090",
    type: "Regulatory",
    severity: "Medium",
    title: "EU CBAM Transition Phase",
    desc: "Q1 emissions report due by May 30. Ensure default values are not used for >20% of complex goods.",
    date: "5h ago",
    impact: ["All EU Exports"],
  },
  {
    id: "SIG-089",
    type: "Port Ops",
    severity: "Medium",
    title: "Congestion at Jebel Ali",
    desc: "Terminal 3 operating at 92% capacity. Berthing delays of 2-3 days for feeder vessels.",
    date: "1d ago",
    impact: ["SHP-004 (Dubai)", "SHP-011 (Doha)"],
  },
  {
    id: "SIG-088",
    type: "Weather",
    severity: "Low",
    title: "Monsoon Forecast: West Coast India",
    desc: "Early onset predicted. Anticipate minor CFS operations delays at Nhava Sheva/Mundra in early June.",
    date: "2d ago",
    impact: ["Future Bookings (Jun)"],
  },
  {
    id: "SIG-087",
    type: "Freight Rates",
    severity: "High",
    title: "GRI Announcement: Transpacific",
    desc: "Carriers announce $1000/FEU General Rate Increase effective June 1st. Lock in capacity now.",
    date: "3d ago",
    impact: ["US Bound Shipments"],
  },
  {
    id: "SIG-086",
    type: "Regulatory",
    severity: "Medium",
    title: "India: RoDTEP Scheme Update",
    desc: "Rates revised for Chapter 87 (Auto parts). Expect ~0.5% reduction in export incentive.",
    date: "4d ago",
    impact: ["SHP-002 (Auto Parts)"],
  },
];

const categories = ["All", "Geopolitical", "Regulatory", "Port Ops", "Weather", "Freight Rates"];

export default function IntelligenceFeed() {
  const [filter, setFilter] = useState("All");

  const filtered = filter === "All" ? signals : signals.filter((s) => s.type === filter);

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div className="pt-2 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2">
            Macro-level alerts & actionable context
          </p>
          <h2 className="text-4xl font-semibold tracking-tight text-foreground">
            Intelligence Feed
          </h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
            Real-time supply chain signals filtered for relevance to your active lanes and product
            categories. See around the corner.
          </p>
        </div>

        {/* Global actions */}
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {["EU", "US", "AE", "IN"].map((reg, i) => (
              <div
                key={reg}
                className="h-8 w-8 rounded-full border-2 border-surface-lowest bg-surface-high grid place-items-center text-[10px] font-bold text-muted-foreground"
                style={{ zIndex: 10 - i }}
              >
                {reg}
              </div>
            ))}
          </div>
          <button className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-surface-high text-foreground text-sm font-medium hover:bg-surface-highest">
            <Bell className="h-4 w-4 text-muted-foreground" /> Manage Subscriptions
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
        {/* Main Feed */}
        <div className="space-y-4">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between pb-4 border-b border-ghost">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto hide-scrollbar">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setFilter(c)}
                  className={`px-3 py-1.5 rounded-full text-[13px] whitespace-nowrap transition-colors ${
                    filter === c
                      ? "bg-foreground text-surface-lowest font-medium"
                      : "bg-surface text-muted-foreground hover:bg-surface-high"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search signals..."
                  className="w-full pl-9 pr-4 py-2 rounded-md bg-surface text-sm text-foreground outline-none border border-transparent focus:border-secondary transition-colors"
                />
              </div>
              <button className="h-9 w-9 grid place-items-center rounded-md bg-surface hover:bg-surface-high text-muted-foreground shrink-0 border border-transparent">
                <Filter className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Feed Items */}
          <div className="space-y-4">
            {filtered.map((sig) => {
              const tone =
                sig.severity === "High"
                  ? "critical"
                  : sig.severity === "Medium"
                    ? "warning"
                    : "info";

              return (
                <Card key={sig.id} className="group hover:border-ghost transition-colors">
                  <div className="flex flex-col sm:flex-row gap-5">
                    {/* Meta col */}
                    <div className="sm:w-48 shrink-0 flex flex-row sm:flex-col justify-between sm:justify-start gap-3">
                      <div>
                        <div className="text-xs font-mono text-muted-foreground">{sig.id}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{sig.date}</div>
                      </div>
                      <div className="flex sm:flex-col gap-2 items-end sm:items-start">
                        <Badge tone="info">{sig.type}</Badge>
                        <Badge tone={tone}>{sig.severity}</Badge>
                      </div>
                    </div>

                    {/* Content col */}
                    <div className="flex-1 space-y-3">
                      <div>
                        <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                          {sig.title}
                        </h3>
                        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                          {sig.desc}
                        </p>
                      </div>

                      {/* Impacts */}
                      {sig.impact.length > 0 && (
                        <div className="pt-3 border-t border-ghost flex flex-wrap gap-2">
                          <span className="text-[11px] uppercase tracking-wider text-muted-foreground flex items-center mr-1">
                            Impact:
                          </span>
                          {sig.impact.map((imp) => (
                            <span
                              key={imp}
                              className="px-2 py-0.5 rounded bg-surface-low text-xs text-foreground font-medium"
                            >
                              {imp}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex sm:flex-col gap-2 justify-end sm:justify-start shrink-0">
                      <button className="h-8 w-8 rounded hover:bg-surface-high grid place-items-center text-muted-foreground hover:text-foreground">
                        <Bookmark className="h-4 w-4" />
                      </button>
                      <button className="h-8 px-3 rounded hover:bg-surface-high text-xs font-medium text-foreground whitespace-nowrap">
                        Analyze
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6 hidden lg:block">
          <Card>
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" /> Active Disruptions
            </h3>
            <div className="mt-4 space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-foreground">Red Sea Routing</span>
                  <span className="font-mono text-xs text-on-destructive-container">82%</span>
                </div>
                <div className="h-1.5 w-full bg-surface rounded-full overflow-hidden">
                  <div className="h-full bg-destructive w-[82%]" />
                </div>
                <p className="text-[10px] text-muted-foreground text-right">Probability of delay</p>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-foreground">Panama Canal Draft</span>
                  <span className="font-mono text-xs text-on-warning-container">45%</span>
                </div>
                <div className="h-1.5 w-full bg-surface rounded-full overflow-hidden">
                  <div className="h-full bg-warning w-[45%]" />
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" /> Lane Pricing Index
            </h3>
            <div className="mt-4 space-y-3">
              {[
                { lane: "Asia → N. Europe", cost: "$4,200", trend: "+12%" },
                { lane: "Asia → US WC", cost: "$5,100", trend: "+5%" },
                { lane: "India → USEC", cost: "$6,800", trend: "0%" },
                { lane: "India → ME", cost: "$450", trend: "-2%" },
              ].map((l) => (
                <div key={l.lane} className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{l.lane}</span>
                  <div className="text-right">
                    <div className="text-sm font-mono text-foreground">{l.cost}</div>
                    <div
                      className={`text-[10px] uppercase font-bold ${
                        l.trend.startsWith("+")
                          ? "text-on-destructive-container"
                          : "text-muted-foreground"
                      }`}
                    >
                      {l.trend}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-ghost">
              <a
                href="#"
                className="text-xs font-medium text-on-secondary-container hover:underline"
              >
                View detailed freight intelligence →
              </a>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
