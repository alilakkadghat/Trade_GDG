"""
Pydantic schemas for the Document Intelligence API.
These define the shape of data flowing through the system.
"""

from __future__ import annotations
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum


# ── Enums ─────────────────────────────────────────────────

class DocumentType(str, Enum):
    BILL_OF_LADING = "Bill of Lading"
    COMMERCIAL_INVOICE = "Commercial Invoice"
    LETTER_OF_CREDIT = "Letter of Credit"
    PACKING_LIST = "Packing List"
    CERTIFICATE_OF_ORIGIN = "Certificate of Origin"
    PHYTOSANITARY_CERTIFICATE = "Phytosanitary Certificate"
    INSURANCE_CERTIFICATE = "Insurance Certificate"
    EXPORT_DECLARATION = "Export Declaration"
    OTHER = "Other"


class DocumentStatus(str, Enum):
    UPLOADED = "Uploaded"
    PROCESSING = "Processing"
    EXTRACTED = "Extracted"
    VALIDATED = "Validated"
    DISCREPANCY_FOUND = "Discrepancy Found"
    CLEARED = "Cleared"
    ERROR = "Error"


class Severity(str, Enum):
    CRITICAL = "Critical"
    WARNING = "Warning"
    INFO = "Info"


class ValidationStatus(str, Enum):
    OK = "OK"
    MISMATCH = "MISMATCH"
    MISSING = "MISSING"
    WARNING = "WARNING"


# ── Request / Response Models ─────────────────────────────

class ExtractedField(BaseModel):
    """A single field extracted from a document."""
    field_name: str
    value: Optional[str] = None
    confidence: float = Field(default=0.0, ge=0.0, le=1.0)
    page_number: Optional[int] = None


class DocumentRecord(BaseModel):
    """A processed document with metadata and extracted fields."""
    id: str
    filename: str
    original_filename: str
    document_type: Optional[str] = None
    status: DocumentStatus = DocumentStatus.UPLOADED
    transaction_id: Optional[str] = None
    file_size_bytes: int = 0
    page_count: int = 0
    extracted_fields: list[ExtractedField] = []
    raw_text: str = ""
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    processing_time_seconds: Optional[float] = None
    error_message: Optional[str] = None


class UploadResponse(BaseModel):
    """Response after uploading a document."""
    id: str
    filename: str
    status: DocumentStatus
    message: str


class ExtractionResponse(BaseModel):
    """Response after extracting data from a document."""
    id: str
    document_type: str
    status: DocumentStatus
    fields: list[ExtractedField]
    page_count: int
    processing_time_seconds: float


class DocumentListResponse(BaseModel):
    """Response for listing documents."""
    documents: list[DocumentRecord]
    total: int


class ValidationResult(BaseModel):
    """A single cross-document validation finding."""
    status: ValidationStatus
    field: str
    document: str
    expected: str
    extracted: str
    severity: Severity
    suggestion: str
