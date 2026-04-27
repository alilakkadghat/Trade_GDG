import Link from "next/link";
import { Card, Badge, StatusDot, statusToTone } from "@/components/ui-bits";
import { shipments, alerts } from "@/lib/mock-data";
import { ArrowUpRight, Plus, Bell, BookOpen, Clock, CalendarDays } from "lucide-react";

export default function Overview() {
  const metrics = [
    { label: "Shipments processed YTD", value: "1,284", delta: "+12.4%" },
    { label: "Compliance issues prevented", value: "318", delta: "+47 this month" },
    { label: "Avg. customs clearance", value: "2.1d", delta: "−0.8d vs Q1" },
  ];

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto">
      {/* Hero */}
      <section className="pt-4">
        <div className="flex items-end justify-between flex-wrap gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2">
              Export Intelligence at your fingertips
            </p>
            <h2 className="text-4xl font-semibold tracking-tight text-foreground max-w-2xl">
              Good morning, Rohan. Three shipments need your attention today.
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/documents"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-primary-container text-primary-foreground text-sm font-medium hover:bg-primary transition-colors"
            >
              <Plus className="h-4 w-4" /> New Shipment
            </Link>
            <Link
              href="/signals"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-surface-high text-foreground text-sm font-medium hover:bg-surface-highest"
            >
              <Bell className="h-4 w-4" /> View Alerts
            </Link>
            <button className="inline-flex items-center gap-1 px-2 py-2.5 text-sm text-muted-foreground hover:text-foreground">
              <BookOpen className="h-4 w-4" /> Documentation
            </button>
          </div>
        </div>

        {/* Metrics — editorial large/small pairing */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-px bg-surface-container rounded-lg overflow-hidden">
          {metrics.map((m) => (
            <div key={m.label} className="bg-surface-lowest p-7">
              <div className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                {m.label}
              </div>
              <div className="mt-3 text-5xl font-semibold tracking-tight text-foreground">
                {m.value}
              </div>
              <div className="mt-2 text-xs text-on-secondary-container flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3" /> {m.delta}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Asymmetric grid: 70/30 */}
      <section className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        {/* Active Shipments table */}
        <Card className="p-0 overflow-hidden">
          <div className="px-6 pt-6 pb-4 flex items-baseline justify-between">
            <div>
              <h3 className="text-base font-semibold text-foreground">Active Shipments</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Live status from carriers, customs, and your CHA.
              </p>
            </div>
            <Link href="/documents" className="text-xs text-on-secondary-container hover:underline">
              View all →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  <th className="text-left font-medium px-6 py-2.5">Shipment</th>
                  <th className="text-left font-medium px-3 py-2.5">Product</th>
                  <th className="text-left font-medium px-3 py-2.5">Destination</th>
                  <th className="text-left font-medium px-3 py-2.5">Status</th>
                  <th className="text-left font-medium px-3 py-2.5 pr-6">ETA</th>
                </tr>
              </thead>
              <tbody>
                {shipments.map((s) => {
                  const tone = statusToTone(s.status);
                  return (
                    <tr key={s.id} className="hover:bg-surface transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-mono text-xs text-foreground">{s.id}</div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">
                          HS {s.hsCode}
                        </div>
                      </td>
                      <td className="px-3 py-4">
                        <div className="text-foreground">{s.product}</div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">
                          {s.quantity} · {s.value}
                        </div>
                      </td>
                      <td className="px-3 py-4 text-foreground">{s.destination}</td>
                      <td className="px-3 py-4">
                        <span className="inline-flex items-center gap-1.5">
                          <StatusDot tone={tone} />
                          <span className="text-foreground">{s.status}</span>
                        </span>
                      </td>
                      <td className="px-3 py-4 pr-6 text-muted-foreground">{s.eta}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Editorial column */}
        <div className="space-y-6">
          <Card>
            <h3 className="text-base font-semibold text-foreground">Recent Alerts</h3>
            <div className="mt-4 space-y-5">
              {alerts.slice(0, 4).map((a) => {
                const tone =
                  a.severity === "Critical"
                    ? "critical"
                    : a.severity === "Warning"
                      ? "warning"
                      : "info";
                return (
                  <div key={a.id} className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Badge tone={tone}>{a.severity}</Badge>
                      <span className="text-xs text-muted-foreground font-mono">
                        {a.shipmentId}
                      </span>
                      <span className="text-[11px] text-muted-foreground ml-auto">{a.time}</span>
                    </div>
                    <div className="text-sm font-medium text-foreground">{a.title}</div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{a.description}</p>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card>
            <h3 className="text-base font-semibold text-foreground">Upcoming</h3>
            <div className="mt-4 space-y-4">
              {[
                { icon: Clock, label: "ETA Rotterdam", detail: "SHP-2024-001 · 12 May" },
                {
                  icon: CalendarDays,
                  label: "CBAM filing due",
                  detail: "Q1 emissions report · 30 May",
                },
                { icon: Clock, label: "ETA Hamburg", detail: "SHP-2024-002 · 08 May" },
                { icon: CalendarDays, label: "CoO renewal", detail: "GSP+ certificate · 18 Jun" },
              ].map((e) => (
                <div key={e.detail} className="flex items-start gap-3">
                  <div className="h-7 w-7 rounded-md bg-surface-low grid place-items-center shrink-0">
                    <e.icon className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="text-sm text-foreground">{e.label}</div>
                    <div className="text-[11px] text-muted-foreground">{e.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
