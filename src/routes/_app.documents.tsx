import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, Badge, statusToTone } from "@/components/ui-bits";
import { validationResults } from "@/lib/mock-data";
import {
  UploadCloud,
  Plus,
  Eye,
  FileText,
  Ship,
  Package,
  ScrollText,
} from "lucide-react";

export const Route = createFileRoute("/_app/documents")({
  component: DocumentIntelligence,
});

const docs = [
  { type: "Commercial Invoice", icon: FileText, status: "Validated" as const },
  { type: "Bill of Lading", icon: Ship, status: "Errors Found" as const },
  { type: "Packing List", icon: Package, status: "Validated" as const },
  { type: "Certificate of Origin", icon: ScrollText, status: "Pending" as const },
];

function DocumentIntelligence() {
  const [dragOver, setDragOver] = useState(false);
  const [files, setFiles] = useState<string[]>([]);

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      {/* Page header */}
      <div className="flex items-end justify-between flex-wrap gap-4 pt-2">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2">
            Shipment SHP-2024-001 · Rotterdam
          </p>
          <h2 className="text-4xl font-semibold tracking-tight text-foreground">
            Document Intelligence
          </h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-xl">
            Analyze, validate, and extract data from shipping documentation. Cross-checks every
            field against your active shipment record.
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-primary-container text-primary-foreground text-sm font-medium hover:bg-primary">
          <Plus className="h-4 w-4" /> New Shipment
        </button>
      </div>

      {/* Upload zone */}
      <Card
        className={`transition-colors ${dragOver ? "bg-secondary-container/40" : ""}`}
      >
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const names = Array.from(e.dataTransfer.files).map((f) => f.name);
            setFiles((p) => [...p, ...names]);
          }}
          className="py-14 flex flex-col items-center text-center"
        >
          <div className="h-14 w-14 rounded-md bg-surface-low grid place-items-center">
            <UploadCloud className="h-6 w-6 text-on-secondary-container" strokeWidth={1.5} />
          </div>
          <div className="mt-5 text-lg font-medium text-foreground">
            Drag and drop documents here
          </div>
          <p className="mt-2 text-sm text-muted-foreground max-w-md">
            Supports PDF, JPG, PNG, TIFF. Max 50MB. TradeBot AI will automatically extract and
            validate data against active shipments.
          </p>
          <div className="mt-6 flex items-center gap-5">
            <label className="cursor-pointer inline-flex items-center px-4 py-2 rounded-md bg-surface-high text-foreground text-sm font-medium hover:bg-surface-highest">
              Browse Files
              <input
                type="file"
                multiple
                className="hidden"
                onChange={(e) => {
                  const names = Array.from(e.target.files ?? []).map((f) => f.name);
                  setFiles((p) => [...p, ...names]);
                }}
              />
            </label>
            <button className="text-sm text-on-secondary-container hover:underline">
              Import from ERP
            </button>
          </div>
          {files.length > 0 && (
            <div className="mt-6 text-xs text-muted-foreground">
              Queued: {files.join(", ")}
            </div>
          )}
        </div>
      </Card>

      {/* Pipeline */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground px-1">
        {["Upload", "Extraction", "Cross-Validation", "Report"].map((step, i) => (
          <div key={step} className="flex items-center gap-2">
            <span
              className={`h-5 w-5 grid place-items-center rounded-full text-[10px] font-medium ${
                i < 3
                  ? "bg-secondary-container text-on-secondary-container"
                  : "bg-surface-high text-muted-foreground"
              }`}
            >
              {i + 1}
            </span>
            <span className={i < 3 ? "text-foreground" : ""}>{step}</span>
            {i < 3 && <span className="w-12 h-px bg-surface-highest" />}
          </div>
        ))}
      </div>

      {/* Documents in shipment */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">
          Documents in this Shipment
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {docs.map((d) => {
            const tone =
              d.status === "Validated"
                ? "success"
                : d.status === "Errors Found"
                ? "critical"
                : "warning";
            return (
              <Card key={d.type}>
                <div className="flex items-start justify-between">
                  <div className="h-9 w-9 rounded-md bg-surface-low grid place-items-center">
                    <d.icon className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
                  </div>
                  <button className="text-muted-foreground hover:text-foreground">
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-4 text-sm font-medium text-foreground">{d.type}</div>
                <div className="mt-3">
                  <Badge tone={tone}>{d.status}</Badge>
                </div>
              </Card>
            );
          })}
          <button className="rounded-lg p-6 bg-surface-low hover:bg-surface-container border border-dashed border-ghost flex flex-col items-center justify-center text-muted-foreground text-sm">
            <Plus className="h-5 w-5 mb-2" />
            Add Document
          </button>
        </div>
      </div>

      {/* Validation results */}
      <Card className="p-0 overflow-hidden">
        <div className="px-6 pt-6 pb-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-foreground">Validation Results</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Cross-document field validation powered by extraction AI.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge tone="critical">2 Critical Errors</Badge>
            <Badge tone="warning">1 Warning</Badge>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="text-left font-medium px-6 py-2.5">Status</th>
                <th className="text-left font-medium px-3 py-2.5">Field</th>
                <th className="text-left font-medium px-3 py-2.5">Document</th>
                <th className="text-left font-medium px-3 py-2.5">Expected</th>
                <th className="text-left font-medium px-3 py-2.5">Extracted</th>
                <th className="text-left font-medium px-3 py-2.5 pr-6">Action</th>
              </tr>
            </thead>
            <tbody>
              {validationResults.map((r, i) => {
                const tone = statusToTone(r.status);
                return (
                  <tr key={i} className="align-top hover:bg-surface">
                    <td className="px-6 py-4">
                      <Badge tone={tone}>{r.status}</Badge>
                    </td>
                    <td className="px-3 py-4 text-foreground">{r.field}</td>
                    <td className="px-3 py-4 text-muted-foreground">{r.document}</td>
                    <td className="px-3 py-4 font-mono text-xs text-foreground">{r.expected}</td>
                    <td
                      className={`px-3 py-4 font-mono text-xs ${
                        r.status === "MISMATCH" || r.status === "MISSING"
                          ? "text-on-destructive-container"
                          : "text-foreground"
                      }`}
                    >
                      {r.extracted}
                    </td>
                    <td className="px-3 py-4 pr-6">
                      {r.status === "OK" ? (
                        <span className="text-xs text-muted-foreground">—</span>
                      ) : (
                        <button
                          className={`text-xs font-medium hover:underline ${
                            tone === "critical"
                              ? "text-on-destructive-container"
                              : "text-on-warning-container"
                          }`}
                        >
                          {r.status === "WARNING" ? "Review" : "Resolve"}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
