"""
Trade GDG — Document Intelligence API
FastAPI backend powering the full document processing pipeline.
"""
import uuid
import time
import tempfile
import asyncio
from pathlib import Path
from datetime import datetime, timezone
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

# Global lock to serialize Gemini API calls across concurrent uploads
gemini_lock = asyncio.Lock()

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Query, Depends
from fastapi.middleware.cors import CORSMiddleware

from backend.config import SUPPORTED_EXTENSIONS, MAX_FILE_SIZE_MB, UPLOAD_DIR, missing_backend_env_keys
from backend.services.auth import require_auth

app = FastAPI(title="Trade GDG Document Intelligence", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup_checks() -> None:
    missing = missing_backend_env_keys()
    if missing:
        logger.warning("Missing backend env vars: %s", ", ".join(missing))
    else:
        logger.info("Backend configuration check passed.")


# ── Health ────────────────────────────────────────────────

@app.get("/api/health")
def health():
    missing = missing_backend_env_keys()
    return {
        "status": "ok" if not missing else "degraded",
        "service": "document-intelligence",
        "missing_env": missing,
    }


# ── Transactions ──────────────────────────────────────────

@app.get("/api/transactions")
def list_transactions(_user=Depends(require_auth)):
    from backend.services.storage import db_select
    txns = db_select("transactions")
    return {"transactions": txns, "total": len(txns)}


@app.post("/api/transactions")
def create_transaction(
    reference_id: str = Form(...),
    product: str = Form(""),
    hs_code: str = Form(""),
    destination: str = Form(""),
    destination_country_code: str = Form(""),
    _user=Depends(require_auth),
):
    from backend.services.storage import db_insert
    txn = db_insert("transactions", {
        "reference_id": reference_id,
        "product": product,
        "hs_code": hs_code,
        "destination": destination,
        "destination_country_code": destination_country_code,
    })
    return txn


# ── Document Upload + Full Processing ─────────────────────

@app.post("/api/documents/upload")
async def upload_and_process(
    file: UploadFile = File(...),
    transaction_id: str = Form(...),
    _user=Depends(require_auth),
):
    """Upload a document, parse it with Docling, classify, extract fields, embed for RAG."""
    # Validate extension
    ext = Path(file.filename or "").suffix.lower()
    if ext not in SUPPORTED_EXTENSIONS:
        raise HTTPException(400, f"Unsupported file type: {ext}")

    file_bytes = await file.read()
    if len(file_bytes) > MAX_FILE_SIZE_MB * 1024 * 1024:
        raise HTTPException(400, f"File exceeds {MAX_FILE_SIZE_MB}MB limit")

    start = time.time()
    doc_id = str(uuid.uuid4())
    safe_name = f"{doc_id}{ext}"

    # 1. Save to Supabase Storage
    from backend.services.storage import upload_file, db_insert, db_update
    storage_path = f"{transaction_id}/{safe_name}"
    try:
        logger.info(f"[{file.filename}] 1/8: Uploading to Supabase Storage at {storage_path}")
        upload_file(file_bytes, storage_path, file.content_type or "application/octet-stream")
    except Exception as e:
        logger.warning(f"[{file.filename}] Storage upload failed: {e}. Continuing with local processing...")
        pass

    # 2. Create document record
    logger.info(f"[{file.filename}] 2/8: Creating document record in database...")
    doc_record = db_insert("documents", {
        "id": doc_id,
        "transaction_id": transaction_id,
        "filename": safe_name,
        "original_filename": file.filename or "unknown",
        "status": "Processing",
        "storage_path": storage_path,
        "file_size_bytes": len(file_bytes),
    })

    # 3. Save locally for Docling processing
    local_path = UPLOAD_DIR / safe_name
    local_path.write_bytes(file_bytes)

    try:
        # 4. Parse with Docling
        logger.info(f"[{file.filename}] 3/8: Parsing document with Docling (this may take a moment)...")
        from backend.services.parser import parse_document
        parsed = parse_document(str(local_path))
        text = parsed["markdown"]
        page_count = parsed["page_count"]
        logger.info(f"[{file.filename}] - Parsed successfully. {page_count} pages detected.")

        # 5. Classify and Extract fields in a single prompt
        logger.info(f"[{file.filename}] 4/8: Analyzing document (Classification + Extraction)... waiting for lock.")
        from backend.services.extractor import analyze_document
        
        async with gemini_lock:
            logger.info(f"[{file.filename}] - Acquired lock. Waiting 3 seconds to avoid rate limits...")
            await asyncio.sleep(3)
            logger.info(f"[{file.filename}] - Analyzing document now...")
            # Run the synchronous analyze_document in a thread pool to avoid blocking the event loop
            result = await asyncio.to_thread(analyze_document, text)
            
        doc_type = result.get("document_type", "Other")
        fields = result.get("fields", [])
        
        logger.info(f"[{file.filename}] - Classified as: {doc_type}")
        logger.info(f"[{file.filename}] - Extracted {len([f for f in fields if f.get('value')])} fields successfully.")

        # 7. Save extracted fields to DB
        logger.info(f"[{file.filename}] 6/8: Saving extracted fields to database...")
        for f in fields:
            db_insert("extracted_fields", {
                "document_id": doc_id,
                "field_name": f["field_name"],
                "field_value": f.get("value"),
                "confidence": f.get("confidence", 0.0),
            })

        # 8. Chunk and embed for RAG
        logger.info(f"[{file.filename}] 7/8: Chunking text and generating embeddings using text-embedding-004...")
        try:
            from backend.services.vectorstore import chunk_and_store
            num_chunks = chunk_and_store(doc_id, text, metadata={
                "document_type": doc_type,
                "filename": file.filename,
                "transaction_id": transaction_id,
            })
            logger.info(f"[{file.filename}] - Embedded {num_chunks} chunks successfully.")
        except Exception as embed_e:
            logger.error(f"[{file.filename}] Embedding failed: {embed_e}")
            num_chunks = 0

        elapsed = round(time.time() - start, 2)

        # 9. Update document record
        logger.info(f"[{file.filename}] 8/8: Finalizing database record... Done in {elapsed}s.")
        db_update("documents", doc_id, {
            "status": "Extracted",
            "document_type": doc_type,
            "page_count": page_count,
            "raw_text": text[:10000],  # store first 10k chars
            "processing_time_seconds": elapsed,
        })

        return {
            "id": doc_id,
            "filename": file.filename,
            "document_type": doc_type,
            "status": "Extracted",
            "page_count": page_count,
            "fields_extracted": len([f for f in fields if f.get("value")]),
            "chunks_embedded": num_chunks,
            "processing_time_seconds": elapsed,
            "fields": fields,
        }

    except Exception as e:
        elapsed = round(time.time() - start, 2)
        logger.error(f"[{file.filename}] PIPELINE ERROR after {elapsed}s: {str(e)}", exc_info=True)
        db_update("documents", doc_id, {
            "status": "Error",
            "error_message": str(e),
            "processing_time_seconds": elapsed,
        })
        raise HTTPException(500, f"Processing failed: {str(e)}")
    finally:
        # Clean up local file
        if local_path.exists():
            local_path.unlink()


# ── Document Queries ──────────────────────────────────────

@app.get("/api/documents")
def list_documents(
    transaction_id: str = Query(None),
    _user=Depends(require_auth),
):
    from backend.services.storage import db_select
    filters = {"transaction_id": transaction_id} if transaction_id else None
    docs = db_select("documents", filters)
    # Attach field count
    for doc in docs:
        fields = db_select("extracted_fields", {"document_id": doc["id"]})
        doc["field_count"] = len([f for f in fields if f.get("field_value")])
    return {"documents": docs, "total": len(docs)}


@app.get("/api/documents/{doc_id}")
def get_document(
    doc_id: str,
    _user=Depends(require_auth),
):
    from backend.services.storage import db_select_one, db_select
    doc = db_select_one("documents", doc_id)
    if not doc:
        raise HTTPException(404, "Document not found")
    fields = db_select("extracted_fields", {"document_id": doc_id})
    doc["fields"] = fields
    return doc


# ── Cross-Document Validation ─────────────────────────────

@app.post("/api/transactions/{transaction_id}/validate")
def run_validation(
    transaction_id: str,
    _user=Depends(require_auth),
):
    from backend.services.validator import validate_transaction
    results = validate_transaction(transaction_id)
    critical = len([r for r in results if r.get("severity") == "Critical" and r.get("status") != "OK"])
    warnings = len([r for r in results if r.get("severity") == "Warning" and r.get("status") != "OK"])
    return {
        "results": results,
        "summary": {"total": len(results), "critical": critical, "warnings": warnings},
    }


# ── Compliance Check ──────────────────────────────────────

@app.post("/api/transactions/{transaction_id}/compliance")
def run_compliance(
    transaction_id: str,
    _user=Depends(require_auth),
):
    from backend.services.compliance import check_compliance
    checks = check_compliance(transaction_id)
    fails = len([c for c in checks if c.get("status") == "FAIL"])
    return {
        "checks": checks,
        "summary": {"total": len(checks), "failures": fails},
    }


# ── RAG Query ─────────────────────────────────────────────

@app.post("/api/query")
def rag_query(
    question: str = Form(...),
    transaction_id: str = Form(None),
    _user=Depends(require_auth),
):
    from backend.services.rag import query_documents
    return query_documents(question, transaction_id)


# ── Validation Results (read) ─────────────────────────────

@app.get("/api/transactions/{transaction_id}/validations")
def get_validations(
    transaction_id: str,
    _user=Depends(require_auth),
):
    from backend.services.storage import db_select
    results = db_select("validation_results", {"transaction_id": transaction_id})
    return {"results": results, "total": len(results)}


@app.get("/api/transactions/{transaction_id}/compliance")
def get_compliance(
    transaction_id: str,
    _user=Depends(require_auth),
):
    from backend.services.storage import db_select
    checks = db_select("compliance_checks", {"transaction_id": transaction_id})
    return {"checks": checks, "total": len(checks)}
