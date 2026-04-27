"use client";

import { useState } from "react";
import { runComplianceChecks } from "@/lib/compliance";

export default function DocumentIntelligencePage() {
    const [errors, setErrors] = useState<string[]>([]);
    const [validationResults, setValidationResults] = useState<
        { field: string; expected: string; extracted: string; status: string }[]
    >([]);
    const [complianceIssues, setComplianceIssues] = useState<
        { type: string; message: string }[]
    >([]);
    const [hasAnalyzed, setHasAnalyzed] = useState(false);

    // UI states
    const [loadingStage, setLoadingStage] = useState<string | null>(null);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    // Mock ERP Data expected for this shipment
    const expectedData = {
        hsCode: "8471",
        product: "Electronics",
        docType: "Invoice"
    };

    const runExtraction = (text: string) => {
        // Mock regex extraction mapping against expected
        const extractedHsCode =
            text.includes("999999")
                ? "999999"
                : text.includes("8471")
                    ? "8471"
                    : "None";

        const extractedProduct =
            text.includes("Laptops")
                ? "Laptops"
                : text.includes("Electronics")
                    ? "Electronics"
                    : "Unknown";

        const extractedDoc = text.toLowerCase().includes("invoice")
            ? "Invoice"
            : "Unknown Document";

        const results = [
            {
                field: "HS Code",
                expected: expectedData.hsCode,
                extracted: extractedHsCode
            },
            {
                field: "Product",
                expected: expectedData.product,
                extracted: extractedProduct
            },
            {
                field: "Document Matrix",
                expected: expectedData.docType,
                extracted: extractedDoc
            }
        ].map(item => ({
            ...item,
            status: item.expected === item.extracted ? "OK" : "MISMATCH"
        }));

        setValidationResults(results);

        const newErrors = results
            .filter(r => r.status === "MISMATCH")
            .map(
                r =>
                    `${r.field} inconsistency: Expected '${r.expected}', but extracted '${r.extracted}'.`
            );

        setErrors(newErrors);

        // 🔥 Compliance Checks (Task 42)
        const compliance = runComplianceChecks({
            hsCode: extractedHsCode,
            product: extractedProduct,
            docType: extractedDoc
        });

        setComplianceIssues(compliance);
    };

    const handleFile = async (file: File) => {
        // Front-end File Validation
        if (file.size > 5 * 1024 * 1024) {
            setToastMessage("⚠️ File too large. Maximum size is 5MB.");
            setTimeout(() => setToastMessage(null), 3000);
            return;
        }

        if (!file.type.includes("text") && !file.name.endsWith(".txt")) {
            setToastMessage(
                "🚫 Unsupported file type. Please upload a .txt document."
            );
            setTimeout(() => setToastMessage(null), 3000);
            return;
        }

        setHasAnalyzed(false);

        // Sequence Animations
        setLoadingStage("Uploading…");
        await new Promise(r => setTimeout(r, 600));

        const text = await file.text();

        setLoadingStage("Extracting…");
        await new Promise(r => setTimeout(r, 800));

        setLoadingStage("Validating…");
        await new Promise(r => setTimeout(r, 700));

        runExtraction(text);

        setHasAnalyzed(true);
        setLoadingStage(null);
    };

    return (
        <div className="space-y-6 max-w-[1200px] mx-auto pt-2 relative">
            {toastMessage && (
                <div className="absolute top-4 right-4 bg-red-500/90 text-white px-4 py-3 rounded-lg shadow-lg font-medium animate-in fade-in slide-in-from-top-4 z-50">
                    {toastMessage}
                </div>
            )}

            <div>
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2">
                    Automated Compliance
                </p>
                <h2 className="text-4xl font-semibold tracking-tight text-foreground">
                    Document Intelligence
                </h2>
            </div>

            {/* Upload Box */}
            <div className="border border-ghost rounded-xl p-12 bg-surface/30 flex flex-col items-center justify-center gap-6">
                <div className="text-center">
                    <p className="text-muted-foreground font-medium mb-1">
                        Select a document to analyze
                    </p>
                    <p className="text-xs text-muted-foreground/70">
                        Upload a .txt file to simulate extraction + compliance
                    </p>
                </div>

                {loadingStage ? (
                    <div className="flex flex-col items-center gap-3 py-4">
                        <div className="w-6 h-6 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
                        <p className="text-secondary font-medium tracking-wide animate-pulse">
                            {loadingStage}
                        </p>
                    </div>
                ) : (
                    <input
                        type="file"
                        className="block w-full max-w-sm text-sm text-foreground
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-md file:border-0
                            file:text-sm file:font-semibold
                            file:bg-secondary file:text-secondary-foreground
                            hover:file:bg-secondary/80 cursor-pointer transition-colors"
                        onChange={e => {
                            if (e.target.files?.[0]) {
                                handleFile(e.target.files[0]);
                                e.target.value = "";
                            }
                        }}
                    />
                )}
            </div>

            {/* Results */}
            {hasAnalyzed && (
                <div className="space-y-6 mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Validation Summary */}
                    {errors.length === 0 ? (
                        <div className="bg-green-500/10 border border-green-500/30 p-4 rounded text-green-600 dark:text-green-400">
                            <h2 className="font-bold mb-2">
                                ✅ Document Validated
                            </h2>
                            <p className="text-sm">
                                All extracted data matches expected values.
                            </p>
                        </div>
                    ) : (
                        <div className="bg-red-500/10 border border-red-500/30 p-4 rounded text-red-700 dark:text-red-400">
                            <h2 className="font-bold mb-2">
                                ⚠️ Validation Errors
                            </h2>
                            <ul className="space-y-1 ml-2 list-disc list-inside">
                                {errors.map((err, i) => (
                                    <li key={i} className="text-sm">
                                        {err}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* 🔥 Compliance Panel */}
                    {complianceIssues.length > 0 && (
                        <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded text-yellow-700 dark:text-yellow-400">
                            <h2 className="font-bold mb-2">
                                ⚖️ Compliance Checks
                            </h2>
                            <ul className="space-y-1 ml-2 list-disc list-inside">
                                {complianceIssues.map((issue, i) => (
                                    <li key={i} className="text-sm">
                                        [{issue.type}] {issue.message}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Extracted Data Cards */}
                    <div>
                        <h3 className="text-sm font-semibold tracking-[0.15em] text-muted-foreground uppercase border-b border-ghost pb-2 mb-4">
                            Extracted Entity Map
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {validationResults.map((res, idx) => (
                                <div
                                    key={idx}
                                    className={`border rounded-lg p-5 flex flex-col gap-3 ${res.status === "MISMATCH"
                                            ? "bg-red-500/5 border-red-500/20"
                                            : "bg-surface border-ghost"
                                        }`}
                                >
                                    <div className="flex justify-between">
                                        <span className="text-xs font-semibold uppercase opacity-70">
                                            {res.field}
                                        </span>
                                        <span
                                            className={`text-[10px] font-bold px-2 py-0.5 rounded-sm ${res.status === "MISMATCH"
                                                    ? "bg-red-500/20 text-red-500"
                                                    : "bg-green-500/20 text-green-500"
                                                }`}
                                        >
                                            {res.status}
                                        </span>
                                    </div>

                                    <div className="text-sm">
                                        <div>Extracted: {res.extracted}</div>
                                        <div className="text-muted-foreground">
                                            Expected: {res.expected}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}