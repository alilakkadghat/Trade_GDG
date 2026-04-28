"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const Map = dynamic(() => import("@/components/Map"), { ssr: false });

export default function SignalsPage() {
  const [signals, setSignals] = useState<any[]>([]);
  const [ports, setPorts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/signals").then((r) => r.json()),
      fetch("/api/port-risk").then((r) => r.json()),
    ])
      .then(([signalsData, portsData]) => {
        setSignals(signalsData);
        setPorts(portsData);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch data:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 max-w-[1800px] mx-auto">
        <h1 className="text-4xl font-semibold">Geopolitical Signals</h1>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1800px] mx-auto">
      {/* Page header */}
      <div className="pt-2">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2">
          Real-time intelligence
        </p>
        <h2 className="text-4xl font-semibold tracking-tight text-foreground">
          Geopolitical Signals
        </h2>
      </div>

      {/* Side-by-side layout */}
      <div className="flex gap-6 items-start">
        {/* LEFT: Map — sticky so it stays visible while scrolling signals */}
        <div className="w-[520px] xl:w-[600px] shrink-0 sticky top-6">
          <Map ports={ports} />
        </div>

        {/* RIGHT: Signals list */}
        <div className="flex-1 min-w-0 space-y-10">
          {(() => {
            if (signals.length === 0) {
              return (
                <p className="text-muted-foreground text-center py-12">No signals available</p>
              );
            }

            const groupedSignals = signals.reduce((acc: any, s: any) => {
              acc[s.category] = acc[s.category] || [];
              acc[s.category].push(s);
              return acc;
            }, {});

            return Object.entries(groupedSignals).map(([category, catSignals]: [string, any]) => (
              <div key={category} className="space-y-4">
                <h3 className="text-sm font-semibold tracking-[0.15em] text-muted-foreground uppercase border-b border-ghost pb-2">
                  {category}
                </h3>

                {catSignals.map((s: any, i: number) => (
                  <div
                    key={i}
                    className="border border-ghost rounded-lg p-6 hover:border-secondary transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground mb-2">{s.title}</h3>
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">
                            <strong>Source:</strong> {s.source}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            <strong>Location:</strong> {s.location}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            <strong>Event:</strong> {s.event}
                          </p>
                        </div>
                      </div>
                      <div className="shrink-0 text-right flex flex-col items-end">
                        <div
                          className={`inline-flex items-center px-4 py-2 rounded-md font-medium text-sm ${
                            s.impact === "HIGH"
                              ? "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
                              : s.impact === "MEDIUM"
                                ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20"
                                : "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20"
                          }`}
                        >
                          <span className="mr-2">
                            {s.impact === "HIGH" ? "🔴" : s.impact === "MEDIUM" ? "🟡" : "🟢"}
                          </span>
                          {s.impact}
                        </div>
                        {s.impact !== "LOW" && s.event !== "General" && (
                          <div className="mt-2 text-left bg-surface-high px-3 py-2 rounded text-[12px] text-muted-foreground border border-ghost">
                            <strong>Reason:</strong> {s.event} detected
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ));
          })()}
        </div>
      </div>
    </div>
  );
}
