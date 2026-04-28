/**
 * Document Intelligence API client.
 * Talks to the FastAPI backend at localhost:8000.
 */

import { supabase } from "@/lib/supabase";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/* ── Types ─────────────────────────────────────────────── */

export interface ExtractedField {
  id?: string;
  field_name: string;
  field_value: string | null;
  confidence: number;
}

export interface DocRecord {
  id: string;
  filename: string;
  original_filename: string;
  document_type: string | null;
  status: string;
  transaction_id: string;
  file_size_bytes: number;
  page_count: number;
  field_count?: number;
  fields?: ExtractedField[];
  processing_time_seconds?: number;
  error_message?: string;
  created_at: string;
}

export interface ValidationResult {
  status: "OK" | "MISMATCH" | "MISSING" | "WARNING";
  field: string;
  document_name: string;
  expected_value: string;
  extracted_value: string;
  severity: "Critical" | "Warning" | "Info";
  suggestion: string;
}

export interface ComplianceCheck {
  check_type: string;
  status: string;
  description: string;
  severity: string;
  resolution: string;
}

export interface Transaction {
  id: string;
  reference_id: string;
  product: string;
  destination: string;
  destination_country_code: string;
}

/* ── API calls ─────────────────────────────────────────── */

async function getAccessToken(): Promise<string | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}

async function fetchWithAuth(input: string, init?: RequestInit): Promise<Response> {
  const token = await getAccessToken();
  const headers = new Headers(init?.headers ?? {});

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(input, {
    ...init,
    headers,
  });

  if (response.status === 401) {
    await supabase.auth.signOut();
    if (typeof window !== "undefined") {
      const redirectTo = `${window.location.pathname}${window.location.search}`;
      window.location.href = `/login?redirectTo=${encodeURIComponent(redirectTo)}`;
    }
  }

  return response;
}

export async function uploadDocument(
  file: File,
  transactionId: string,
): Promise<DocRecord & { fields: ExtractedField[] }> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("transaction_id", transactionId);
  const res = await fetchWithAuth(`${API}/api/documents/upload`, {
    method: "POST",
    body: fd,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Upload failed");
  }
  return res.json();
}

export async function listDocuments(transactionId?: string) {
  const url = transactionId
    ? `${API}/api/documents?transaction_id=${transactionId}`
    : `${API}/api/documents`;
  const res = await fetchWithAuth(url);
  const data = await res.json();
  return data.documents as DocRecord[];
}

export async function getDocument(id: string) {
  const res = await fetchWithAuth(`${API}/api/documents/${id}`);
  return res.json() as Promise<DocRecord & { fields: ExtractedField[] }>;
}

export async function listTransactions() {
  const res = await fetchWithAuth(`${API}/api/transactions`);
  const data = await res.json();
  return data.transactions as Transaction[];
}

export async function runValidation(transactionId: string) {
  const res = await fetchWithAuth(`${API}/api/transactions/${transactionId}/validate`, {
    method: "POST",
  });
  const data = await res.json();
  return data as {
    results: ValidationResult[];
    summary: { total: number; critical: number; warnings: number };
  };
}

export async function runCompliance(transactionId: string) {
  const res = await fetchWithAuth(`${API}/api/transactions/${transactionId}/compliance`, {
    method: "POST",
  });
  const data = await res.json();
  return data as {
    checks: ComplianceCheck[];
    summary: { total: number; failures: number };
  };
}

export async function createTransaction(data: {
  reference_id: string;
  product?: string;
  hs_code?: string;
  destination?: string;
  destination_country_code?: string;
}): Promise<Transaction> {
  const fd = new FormData();
  fd.append("reference_id", data.reference_id);
  fd.append("product", data.product || "");
  fd.append("hs_code", data.hs_code || "");
  fd.append("destination", data.destination || "");
  fd.append("destination_country_code", data.destination_country_code || "");
  const res = await fetchWithAuth(`${API}/api/transactions`, { method: "POST", body: fd });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to create shipment");
  }
  return res.json() as Promise<Transaction>;
}

export async function ragQuery(question: string, transactionId?: string) {
  const fd = new FormData();
  fd.append("question", question);
  if (transactionId) fd.append("transaction_id", transactionId);
  const res = await fetchWithAuth(`${API}/api/query`, { method: "POST", body: fd });
  return res.json() as Promise<{ answer: string; sources: unknown[] }>;
}
