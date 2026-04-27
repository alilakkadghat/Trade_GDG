"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, Badge } from "@/components/ui-bits";
import { User, Bell, Shield, Key, Database, LogOut, ChevronRight } from "lucide-react";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("profile");

  const tabs = [
    { id: "profile", label: "Profile & Organization", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security & Access", icon: Shield },
    { id: "api", label: "API & Integrations", icon: Key },
    { id: "data", label: "Data Management", icon: Database },
  ];

  return (
    <div className="max-w-[1000px] mx-auto space-y-8">
      <div className="pt-2">
        <h2 className="text-3xl font-semibold tracking-tight text-foreground">Settings</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your account preferences, integrations, and workspace settings.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Tabs sidebar */}
        <div className="w-full md:w-64 shrink-0 space-y-1">
          {tabs.map((t) => {
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  active
                    ? "bg-surface-high text-foreground"
                    : "text-muted-foreground hover:bg-surface hover:text-foreground"
                }`}
              >
                <t.icon className={`h-4 w-4 ${active ? "text-primary" : ""}`} />
                {t.label}
              </button>
            );
          })}

          <div className="pt-4 mt-4 border-t border-ghost">
            <Link
              href="/"
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-md text-sm font-medium text-on-destructive-container hover:bg-destructive/10 transition-colors"
            >
              <div className="flex items-center gap-3">
                <LogOut className="h-4 w-4" />
                Sign Out
              </div>
            </Link>
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1">
          {activeTab === "profile" && (
            <div className="space-y-6">
              <Card>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-base font-semibold text-foreground">Personal Information</h3>
                  <button className="text-sm font-medium text-on-secondary-container hover:underline">
                    Edit
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-8">
                  <Def label="Full Name" value="Rohan Sharma" />
                  <Def label="Email Address" value="rohan.s@acme-exports.com" />
                  <Def label="Job Title" value="Supply Chain Director" />
                  <Def label="Timezone" value="(GMT+05:30) India Standard Time" />
                </div>
              </Card>

              <Card>
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-base font-semibold text-foreground">Organization</h3>
                    <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                      Update your company details. These are used for automated document generation.
                    </p>
                  </div>
                  <button className="text-sm font-medium text-on-secondary-container hover:underline">
                    Manage
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-8">
                  <Def label="Company Name" value="Acme Exports Pvt. Ltd." />
                  <Def label="IEC Code" value="0302049182" />
                  <Def label="GSTIN" value="27AAACA1234A1Z5" />
                  <Def label="AEO Status" value="Tier 2 (Active)" />
                </div>
              </Card>
            </div>
          )}

          {activeTab === "api" && (
            <div className="space-y-6">
              <Card>
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-base font-semibold text-foreground">ERP Integrations</h3>
                    <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                      Connect your existing systems to automatically sync shipment data.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    { name: "SAP S/4HANA", status: "Connected", date: "Last sync: 2m ago" },
                    { name: "Oracle NetSuite", status: "Disconnected", date: "Never synced" },
                  ].map((int) => (
                    <div
                      key={int.name}
                      className="flex items-center justify-between p-4 rounded-md border border-ghost hover:border-surface-highest transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-surface rounded-md grid place-items-center font-bold text-lg text-muted-foreground">
                          {int.name[0]}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-foreground">{int.name}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">{int.date}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge tone={int.status === "Connected" ? "success" : "info"}>
                          {int.status}
                        </Badge>
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-6">
              <Card>
                <h3 className="text-base font-semibold text-foreground mb-6">Alert Preferences</h3>
                <div className="space-y-5">
                  <ToggleGroup
                    title="Critical Disruptions"
                    desc="Port closures, carrier blank sailings, force majeure events."
                    on={true}
                  />
                  <ToggleGroup
                    title="Compliance Warnings"
                    desc="Regulatory changes, missing documents, expiry alerts."
                    on={true}
                  />
                  <ToggleGroup
                    title="Financial Updates"
                    desc="Freight rate changes, GRI announcements, duty updates."
                    on={false}
                  />
                  <ToggleGroup
                    title="Daily Summary"
                    desc="Receive a digest of your active shipments at 08:00 AM."
                    on={true}
                  />
                </div>
              </Card>
            </div>
          )}

          {/* Placeholders for others */}
          {(activeTab === "security" || activeTab === "data") && (
            <Card className="h-64 flex flex-col items-center justify-center text-center">
              <Shield className="h-8 w-8 text-muted-foreground mb-3" />
              <h3 className="text-base font-medium text-foreground">Under Construction</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                This settings pane is currently being migrated.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function Def({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-medium text-foreground">{value}</div>
    </div>
  );
}

function ToggleGroup({ title, desc, on }: { title: string; desc: string; on: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <div className="text-sm font-medium text-foreground">{title}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>
      </div>
      <button
        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors focus:outline-none ring-2 ring-transparent focus:ring-secondary focus:ring-offset-2 focus:ring-offset-surface-lowest ${
          on ? "bg-secondary" : "bg-surface-highest"
        }`}
      >
        <span
          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-surface-lowest shadow ring-0 transition duration-200 ease-in-out ${
            on ? "translate-x-2" : "-translate-x-2"
          }`}
        />
      </button>
    </div>
  );
}
