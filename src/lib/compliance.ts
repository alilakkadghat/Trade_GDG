export interface ComplianceIssue {
    type: string;
    message: string;
}

export function runComplianceChecks(data: {
    hsCode: string;
    product: string;
    docType: string;
}): ComplianceIssue[] {
    const issues: ComplianceIssue[] = [];

    if (data.hsCode === "None" || data.hsCode === "999999") {
        issues.push({
            type: "CRITICAL",
            message: "HS Code does not match product category.",
        });
    }

    if (data.docType !== "Invoice") {
        issues.push({
            type: "WARNING",
            message: `Document type is ${data.docType}, expected Invoice.`,
        });
    }
    
    if (data.product === "Unknown") {
        issues.push({
            type: "ERROR",
            message: "Product category could not be determined.",
        });
    }

    return issues;
}