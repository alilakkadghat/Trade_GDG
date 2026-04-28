"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, Badge, statusToTone } from "@/components/ui-bits";
import {
  uploadDocument,
  listDocuments,
  listTransactions,
  runValidation,
  runCompliance,
  ragQuery,
  type DocRecord,
  type ExtractedField,
  type ValidationResult,
  type ComplianceCheck,
  type Transaction,
} from "@/lib/doc-api";
import {
  UploadCloud,
  Plus,
  Eye,
  FileText,
  Ship,
  Package,
  ScrollText,
  ShieldCheck,
  Search,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Send,
  ChevronDown,
  ChevronUp,
  RefreshCw,
} from "lucide-react";

const DOC_ICONS: Record<string, typeof FileText> = {
  "Commercial Invoice": FileText,
  "Bill of Lading": Ship,
  "Packing List": Package,
  "Certificate of Origin": ScrollText,
  "Letter of Credit": FileText,
  "Export Declaration": ShieldCheck,
};

const STATUS_TONE: Record<string, "success" | "critical" | "warning" | "info"> = {
  Extracted: "success",
  Validated: "success",
  Cleared: "success",
  Processing: "warning",
  Uploaded: "info",
  Error: "critical",
  "Discrepancy Found": "critical",
};

export default function DocumentIntelligence() {
  /* ── State ──────────────────────────────────────────── */
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadQueue, setUploadQueue] = useState<
    { name: string; status: "pending" | "uploading" | "done" | "error" }[]
  >([]);
  const [currentUploadIndex, setCurrentUploadIndex] = useState(0);
  const [docs, setDocs] = useState<DocRecord[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeTransaction, setActiveTransaction] = useState<string>("");
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [validationSummary, setValidationSummary] = useState<{
    critical: number;
    warnings: number;
  } | null>(null);
  const [complianceChecks, setComplianceChecks] = useState<ComplianceCheck[]>([]);
  const [complianceSummary, setComplianceSummary] = useState<{ failures: number } | null>(null);
  const [validating, setValidating] = useState(false);
  const [checkingCompliance, setCheckingCompliance] = useState(false);
  const [ragQuestion, setRagQuestion] = useState("");
  const [ragAnswer, setRagAnswer] = useState("");
  const [ragLoading, setRagLoading] = useState(false);
  const [pipelineStep, setPipelineStep] = useState(0);

  // New Shipment State
  const [showNewShipment, setShowNewShipment] = useState(false);
  const [newShipmentData, setNewShipmentData] = useState({ reference_id: "", destination: "" });
  const [creatingShipment, setCreatingShipment] = useState(false);

  // Accordion State
  const [expandedSection, setExpandedSection] = useState<string | null>("extracted");

  /* ── Load data ──────────────────────────────────────── */
  const refreshDocs = useCallback(async () => {
    if (!activeTransaction) return;
    try {
      const d = await listDocuments(activeTransaction);
      const { getDocument } = await import("@/lib/doc-api");
      const fullDocs = await Promise.all(d.map((doc) => getDocument(doc.id).catch(() => doc)));
      setDocs(fullDocs as DocRecord[]);
    } catch {
      /* backend might be offline */
    }
  }, [activeTransaction]);

  useEffect(() => {
    listTransactions()
      .then((t) => {
        setTransactions(t);
        if (t.length > 0) setActiveTransaction(t[0].id);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    refreshDocs();
  }, [refreshDocs]);

  /* ── Handlers ───────────────────────────────────────── */
  const handleFiles = async (files: FileList | File[]) => {
    if (!activeTransaction) return;
    setUploading(true);
    setPipelineStep(1);
    const fileArr = Array.from(files);

    setUploadQueue(fileArr.map((f) => ({ name: f.name, status: "pending" })));
    setCurrentUploadIndex(0);

    for (let i = 0; i < fileArr.length; i++) {
      const f = fileArr[i];
      setCurrentUploadIndex(i + 1);
      setUploadQueue((prev) =>
        prev.map((item, idx) => (idx === i ? { ...item, status: "uploading" } : item)),
      );
      setPipelineStep(2);

      try {
        await uploadDocument(f, activeTransaction);
        setUploadQueue((prev) =>
          prev.map((item, idx) => (idx === i ? { ...item, status: "done" } : item)),
        );
      } catch (err) {
        console.error("Upload failed:", err);
        setUploadQueue((prev) =>
          prev.map((item, idx) => (idx === i ? { ...item, status: "error" } : item)),
        );
      }
    }

    setPipelineStep(3);
    setTimeout(async () => {
      setUploading(false);
      setUploadQueue([]);
      await refreshDocs();
    }, 1000);
  };

  const handleValidate = async () => {
    if (!activeTransaction) return;
    setValidating(true);
    setPipelineStep(3);
    try {
      const data = await runValidation(activeTransaction);
      setValidationResults(data.results);
      setValidationSummary(data.summary);
      setExpandedSection("mismatches");
      setPipelineStep(4);
    } catch (err) {
      console.error("Validation failed:", err);
    }
    setValidating(false);
  };

  const handleCompliance = async () => {
    if (!activeTransaction) return;
    setCheckingCompliance(true);
    try {
      const data = await runCompliance(activeTransaction);
      setComplianceChecks(data.checks);
      setComplianceSummary(data.summary);
      setExpandedSection("compliance");
    } catch (err) {
      console.error("Compliance check failed:", err);
    }
    setCheckingCompliance(false);
  };

  const handleRag = async () => {
    if (!ragQuestion.trim()) return;
    setRagLoading(true);
    try {
      const data = await ragQuery(ragQuestion, activeTransaction || undefined);
      setRagAnswer(data.answer);
    } catch {
      setRagAnswer("Failed to get answer. Is the backend running?");
    }
    setRagLoading(false);
  };

  const handleCreateShipment = async () => {
    if (!newShipmentData.reference_id) return;
    setCreatingShipment(true);
    try {
      const { createTransaction } = await import("@/lib/doc-api");
      const txn = await createTransaction({
        reference_id: newShipmentData.reference_id,
        destination: newShipmentData.destination,
      });
      setTransactions((prev) => [...prev, txn]);
      setActiveTransaction(txn.id);
      setShowNewShipment(false);
      setNewShipmentData({ reference_id: "", destination: "" });
    } catch (err) {
      console.error("Failed to create shipment:", err);
    }
    setCreatingShipment(false);
  };

  const toggleSection = (section: string) => {
    setExpandedSection((prev) => (prev === section ? null : section));
  };

  /* ── Render ─────────────────────────────────────────── */
  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10">
      {/* New Shipment Modal */}
      {showNewShipment && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md shadow-xl border border-ghost">
            <h3 className="text-lg font-semibold text-foreground mb-4">Create New Shipment</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Reference ID
                </label>
                <input
                  type="text"
                  value={newShipmentData.reference_id}
                  onChange={(e) =>
                    setNewShipmentData({ ...newShipmentData, reference_id: e.target.value })
                  }
                  placeholder="e.g. SHP-2026-001"
                  className="w-full bg-surface-low border border-ghost rounded-md px-3 py-2 text-sm text-foreground focus:border-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Destination
                </label>
                <input
                  type="text"
                  value={newShipmentData.destination}
                  onChange={(e) =>
                    setNewShipmentData({ ...newShipmentData, destination: e.target.value })
                  }
                  placeholder="e.g. Jebel Ali, UAE"
                  className="w-full bg-surface-low border border-ghost rounded-md px-3 py-2 text-sm text-foreground focus:border-primary outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={() => setShowNewShipment(false)}
                  className="px-4 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-surface-low"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateShipment}
                  disabled={creatingShipment || !newShipmentData.reference_id}
                  className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 inline-flex items-center gap-2"
                >
                  {creatingShipment && <Loader2 className="h-4 w-4 animate-spin" />}
                  Create Shipment
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Page header */}
      <div className="flex items-end justify-between flex-wrap gap-4 pt-2">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2">
            {transactions.find((t) => t.id === activeTransaction)?.reference_id ||
              "Select Shipment"}{" "}
            · {transactions.find((t) => t.id === activeTransaction)?.destination || ""}
          </p>
          <h2 className="text-4xl font-semibold tracking-tight text-foreground">
            Document Intelligence
          </h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-xl">
            Upload, analyze, validate, and cross-check shipping documentation. AI-powered extraction
            and compliance validation.
          </p>
        </div>

        {/* Transaction selector */}
        <div className="flex items-center gap-3">
          <select
            value={activeTransaction}
            onChange={(e) => setActiveTransaction(e.target.value)}
            className="bg-surface-low text-foreground text-sm rounded-md px-3 py-2 border border-ghost min-w-[200px]"
          >
            {transactions.map((t) => (
              <option key={t.id} value={t.id}>
                {t.reference_id} — {t.destination}
              </option>
            ))}
            {transactions.length === 0 && <option value="">No shipments available</option>}
          </select>
          <button
            onClick={() => setShowNewShipment(true)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-surface-low text-foreground text-sm font-medium hover:bg-surface-high border border-ghost"
          >
            <Plus className="h-4 w-4" /> New Shipment
          </button>

          <div className="h-6 w-px bg-ghost mx-1" />

          <button
            onClick={handleValidate}
            disabled={validating || docs.length < 2}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-primary-container text-primary-foreground text-sm font-medium hover:bg-primary disabled:opacity-50"
          >
            {validating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Validate All
          </button>
          <button
            onClick={handleCompliance}
            disabled={checkingCompliance}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-surface-high text-foreground text-sm font-medium hover:bg-surface-highest disabled:opacity-50"
          >
            {checkingCompliance ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ShieldCheck className="h-4 w-4" />
            )}
            Compliance
          </button>
        </div>
      </div>

      {/* Upload zone */}
      <Card className={`transition-colors ${dragOver ? "bg-secondary-container/40" : ""}`}>
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handleFiles(e.dataTransfer.files);
          }}
          className="py-14 flex flex-col items-center text-center"
        >
          {uploading ? (
            <div className="w-full max-w-md mx-auto text-left">
              <div className="flex items-center gap-3 mb-6 justify-center">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
                <div>
                  <div className="text-xl font-medium text-foreground">Processing Documents…</div>
                  <p className="text-sm text-muted-foreground text-center">
                    Uploading {currentUploadIndex}/{uploadQueue.length}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                {uploadQueue.map((item, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-foreground font-medium truncate pr-2 flex-1">
                        {idx + 1}/{uploadQueue.length} — {item.name}
                      </span>
                      <span
                        className={`w-16 text-right ${item.status === "done" ? "text-green-500" : item.status === "error" ? "text-red-500" : "text-muted-foreground"}`}
                      >
                        {item.status === "done"
                          ? "Done"
                          : item.status === "uploading"
                            ? "Uploading"
                            : item.status === "error"
                              ? "Error"
                              : "Waiting"}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-surface-highest rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          item.status === "done"
                            ? "w-full bg-green-500"
                            : item.status === "uploading"
                              ? "w-[60%] bg-primary animate-pulse"
                              : item.status === "error"
                                ? "w-full bg-red-500"
                                : "w-0 bg-primary"
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className="h-14 w-14 rounded-md bg-surface-low grid place-items-center">
                <UploadCloud className="h-6 w-6 text-on-secondary-container" strokeWidth={1.5} />
              </div>
              <div className="mt-5 text-lg font-medium text-foreground">
                Drag and drop documents here
              </div>
              <p className="mt-2 text-sm text-muted-foreground max-w-md">
                Supports PDF, JPG, PNG, TIFF, DOCX, XLSX. Max 50MB. AI will automatically classify,
                extract fields, and validate.
              </p>
              <div className="mt-6">
                <label className="cursor-pointer inline-flex items-center px-4 py-2 rounded-md bg-surface-high text-foreground text-sm font-medium hover:bg-surface-highest">
                  Browse Files
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.png,.jpg,.jpeg,.tiff,.tif,.docx,.xlsx"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files) handleFiles(e.target.files);
                    }}
                  />
                </label>
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Pipeline */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground px-1">
        {["Upload", "Extraction", "Cross-Validation", "Report"].map((step, i) => (
          <div key={step} className="flex items-center gap-2">
            <span
              className={`h-5 w-5 grid place-items-center rounded-full text-[10px] font-medium ${
                i < pipelineStep
                  ? "bg-secondary-container text-on-secondary-container"
                  : "bg-surface-high text-muted-foreground"
              }`}
            >
              {i < pipelineStep ? "✓" : i + 1}
            </span>
            <span className={i < pipelineStep ? "text-foreground" : ""}>{step}</span>
            {i < 3 && <span className="w-12 h-px bg-surface-highest" />}
          </div>
        ))}
      </div>

      {/* Documents in shipment */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">
          Documents in this Shipment ({docs.length})
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {docs.map((d) => {
            const Icon = DOC_ICONS[d.document_type || ""] || FileText;
            const tone = STATUS_TONE[d.status] || "muted";
            return (
              <Card key={d.id} className="hover:ring-1 hover:ring-ghost">
                <div className="flex items-start justify-between">
                  <div className="h-9 w-9 rounded-md bg-surface-low grid place-items-center">
                    <Icon className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
                  </div>
                  <Badge tone={tone}>{d.status}</Badge>
                </div>
                <div className="mt-4 text-sm font-medium text-foreground">
                  {d.document_type || d.original_filename}
                </div>
                <div
                  className="mt-1 text-xs text-muted-foreground truncate"
                  title={d.original_filename}
                >
                  {d.original_filename}
                </div>
                {d.field_count !== undefined && d.field_count > 0 && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    {d.field_count} fields extracted · {d.page_count} page
                    {d.page_count !== 1 ? "s" : ""}
                  </div>
                )}
                {d.processing_time_seconds && (
                  <div className="mt-1 text-[10px] text-muted-foreground">
                    Processed in {d.processing_time_seconds}s
                  </div>
                )}
              </Card>
            );
          })}
          <label className="rounded-xl p-6 bg-surface-low hover:bg-surface-container border border-dashed border-ghost flex flex-col items-center justify-center text-muted-foreground text-sm cursor-pointer min-h-[140px]">
            <Plus className="h-5 w-5 mb-2" />
            Add Document
            <input
              type="file"
              multiple
              className="hidden"
              accept=".pdf,.png,.jpg,.jpeg,.tiff,.tif,.docx,.xlsx"
              onChange={(e) => {
                if (e.target.files) handleFiles(e.target.files);
              }}
            />
          </label>
        </div>
      </div>

      {/* Shipment Data Intelligence Hub */}
      <div className="mt-10 space-y-4">
        <h3 className="text-xl font-semibold text-foreground flex items-center gap-2 mb-4">
          <Search className="h-5 w-5 text-primary" /> Intelligence & Validation Hub
        </h3>

        {/* Extracted Data Dropdown */}
        <Card className="p-0 overflow-hidden">
          <button
            onClick={() => toggleSection("extracted")}
            className="w-full px-6 py-4 flex items-center justify-between bg-surface-low hover:bg-surface-high transition-colors text-left"
          >
            <div>
              <h4 className="text-base font-semibold text-foreground flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" /> Extracted Documents Data
              </h4>
              <p className="text-xs text-muted-foreground mt-1">
                Segregated data extracted from all uploaded documents.
              </p>
            </div>
            {expandedSection === "extracted" ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </button>

          {expandedSection === "extracted" && (
            <div className="p-6 border-t border-ghost space-y-6 bg-background">
              {docs.filter((d) => d.fields && d.fields.length > 0).length === 0 ? (
                <p className="text-sm text-muted-foreground">No extracted data available yet.</p>
              ) : (
                docs
                  .filter((d) => d.fields && d.fields.length > 0)
                  .map((d) => (
                    <div key={d.id} className="space-y-3">
                      <h5 className="text-sm font-semibold text-foreground border-b border-ghost pb-2">
                        {d.document_type || d.original_filename}
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {(d.fields || [])
                          .filter((f) => f.field_value)
                          .map((f, i) => (
                            <div
                              key={i}
                              className="py-2 px-3 rounded-md bg-surface-low flex flex-col justify-center"
                            >
                              <span className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                                {f.field_name.replace(/_/g, " ")}
                              </span>
                              <span
                                className="text-sm text-foreground font-mono truncate"
                                title={f.field_value || ""}
                              >
                                {f.field_value}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))
              )}
            </div>
          )}
        </Card>

        {/* Mismatches Dropdown */}
        <Card className="p-0 overflow-hidden">
          <button
            onClick={() => toggleSection("mismatches")}
            className="w-full px-6 py-4 flex items-center justify-between bg-surface-low hover:bg-surface-high transition-colors text-left"
          >
            <div>
              <h4 className="text-base font-semibold text-foreground flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" /> Cross-Document Mismatches &
                Errors
              </h4>
              <p className="text-xs text-muted-foreground mt-1">
                Field-by-field comparison and conflicting information across documents.
              </p>
            </div>
            <div className="flex items-center gap-3">
              {validationSummary && validationSummary.critical > 0 && (
                <Badge tone="critical">{validationSummary.critical} Critical</Badge>
              )}
              {validationSummary && validationSummary.warnings > 0 && (
                <Badge tone="warning">{validationSummary.warnings} Warnings</Badge>
              )}
              {expandedSection === "mismatches" ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
          </button>

          {expandedSection === "mismatches" && (
            <div className="border-t border-ghost bg-background overflow-x-auto">
              {validationResults.length === 0 ? (
                <div className="p-6 text-sm text-muted-foreground">
                  Run validation to check for cross-document mismatches.
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-[11px] uppercase tracking-wider text-muted-foreground">
                      <th className="text-left font-medium px-6 py-2.5">Status</th>
                      <th className="text-left font-medium px-3 py-2.5">Field</th>
                      <th className="text-left font-medium px-3 py-2.5">Document</th>
                      <th className="text-left font-medium px-3 py-2.5">Expected</th>
                      <th className="text-left font-medium px-3 py-2.5">Extracted</th>
                      <th className="text-left font-medium px-3 py-2.5 pr-6">Suggestion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {validationResults.map((r, i) => {
                      const tone =
                        r.status === "OK"
                          ? "success"
                          : r.severity === "Critical"
                            ? "critical"
                            : "warning";
                      return (
                        <tr key={i} className="align-top hover:bg-surface">
                          <td className="px-6 py-4">
                            <Badge tone={tone}>{r.status}</Badge>
                          </td>
                          <td className="px-3 py-4 text-foreground">{r.field}</td>
                          <td className="px-3 py-4 text-muted-foreground">{r.document_name}</td>
                          <td className="px-3 py-4 font-mono text-xs text-foreground">
                            {r.expected_value}
                          </td>
                          <td
                            className={`px-3 py-4 font-mono text-xs ${r.status !== "OK" ? "text-red-500" : "text-foreground"}`}
                          >
                            {r.extracted_value}
                          </td>
                          <td className="px-3 py-4 pr-6 text-xs text-muted-foreground max-w-xs">
                            {r.suggestion}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </Card>

        {/* Compliance Dropdown */}
        <Card className="p-0 overflow-hidden">
          <button
            onClick={() => toggleSection("compliance")}
            className="w-full px-6 py-4 flex items-center justify-between bg-surface-low hover:bg-surface-high transition-colors text-left"
          >
            <div>
              <h4 className="text-base font-semibold text-foreground flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-red-500" /> Compliance Violations
              </h4>
              <p className="text-xs text-muted-foreground mt-1">
                Regulatory violations, missing documentation, and destination-specific rules.
              </p>
            </div>
            <div className="flex items-center gap-3">
              {complianceSummary && complianceSummary.failures > 0 && (
                <Badge tone="critical">{complianceSummary.failures} Issues</Badge>
              )}
              {expandedSection === "compliance" ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
          </button>

          {expandedSection === "compliance" && (
            <div className="p-6 border-t border-ghost space-y-3 bg-background">
              {complianceChecks.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  Run compliance checks to check for regulatory errors.
                </div>
              ) : (
                complianceChecks.map((c, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-3 p-3 rounded-md border ${
                      c.status === "FAIL"
                        ? "bg-red-500/5 border-red-500/20"
                        : c.status === "PASS"
                          ? "bg-green-500/5 border-green-500/20"
                          : "bg-yellow-500/5 border-yellow-500/20"
                    }`}
                  >
                    {c.status === "PASS" ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    ) : c.status === "FAIL" ? (
                      <XCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{c.description}</p>
                      {c.resolution && (
                        <p className="text-xs text-muted-foreground mt-1">{c.resolution}</p>
                      )}
                    </div>
                    <Badge
                      tone={
                        c.severity === "Critical"
                          ? "critical"
                          : c.severity === "Warning"
                            ? "warning"
                            : "info"
                      }
                    >
                      {c.severity}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          )}
        </Card>
      </div>

      {/* RAG Query */}
      <Card className="mt-8">
        <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
          <Search className="h-4 w-4" /> Ask about your documents
        </h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={ragQuestion}
            onChange={(e) => setRagQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleRag();
            }}
            placeholder="e.g. What is the consignee name on the Bill of Lading?"
            className="flex-1 bg-surface-low border border-ghost rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary"
          />
          <button
            onClick={handleRag}
            disabled={ragLoading || !ragQuestion.trim()}
            className="px-4 py-2 rounded-md bg-primary-container text-primary-foreground text-sm font-medium hover:bg-primary disabled:opacity-50"
          >
            {ragLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </div>
        {ragAnswer && (
          <div className="mt-4 p-4 rounded-md bg-surface-low text-sm text-foreground whitespace-pre-wrap">
            {ragAnswer}
          </div>
        )}
      </Card>
    </div>
  );
}
