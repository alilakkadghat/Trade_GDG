import os
import sys
import time
import uuid
import logging
from pathlib import Path
from dotenv import load_dotenv

# Ensure backend module is in path
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

load_dotenv(PROJECT_ROOT / ".env.local")

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

from backend.services.parser import parse_document
from backend.services.vectorstore import chunk_and_store
from backend.services.storage import db_delete

def main():
    kb_dir = PROJECT_ROOT / "data_for_RAG"
    if not kb_dir.exists():
        logger.error(f"Directory not found: {kb_dir}")
        return

    files = [f for f in kb_dir.iterdir() if f.is_file() and not f.name.startswith(".")]
    
    logger.info(f"Found {len(files)} files in {kb_dir}")
    
    # Using a deterministic UUID generation method based on filename.
    # This ensures no duplicate chunks are created if you restart the script,
    # because it will automatically overwrite the old chunks for that file!
    
    KB_TXN_ID = str(uuid.uuid5(uuid.NAMESPACE_URL, "KNOWLEDGE_BASE_TXN"))
    
    # 0. Create a dummy transaction for the Knowledge Base so foreign keys don't fail
    try:
        from backend.services.storage import db_insert
        db_insert("transactions", {
            "id": KB_TXN_ID,
            "reference_id": "GLOBAL_KNOWLEDGE_BASE",
            "destination": "GLOBAL",
        })
    except Exception:
        pass  # Transaction already exists
        
    success_count = 0
    fail_count = 0

    for i, filepath in enumerate(files, 1):
        filename = filepath.name
        # Generate a deterministic UUID5 so it's a valid UUID, but stable per-file!
        doc_id = str(uuid.uuid5(uuid.NAMESPACE_URL, f"KB_{filename}"))
        
        logger.info(f"[{i}/{len(files)}] Processing {filename} ({filepath.stat().st_size / 1024 / 1024:.2f} MB)...")
        
        try:
            # 0. Create document record to satisfy foreign key constraint
            from backend.services.storage import db_insert
            try:
                db_insert("documents", {
                    "id": doc_id,
                    "transaction_id": KB_TXN_ID,
                    "filename": filename,
                    "original_filename": filename,
                    "status": "Extracted",
                    "storage_path": f"KNOWLEDGE_BASE/{filename}",
                    "file_size_bytes": filepath.stat().st_size,
                })
            except Exception:
                pass # document might already exist if restarting
            
            # 1. Parse Document
            logger.info(f"  - Parsing with Docling...")
            parsed = parse_document(str(filepath))
            text = parsed.get("markdown", "")
            
            if not text.strip():
                logger.warning(f"  - Warning: Extracted text is empty for {filename}")
                fail_count += 1
                continue
                
            # 2. Chunk and Store
            logger.info(f"  - Chunking and Embedding...")
            num_chunks = chunk_and_store(
                document_id=doc_id,
                text=text,
                metadata={
                    "document_type": "Knowledge Base Article",
                    "filename": filename,
                    "transaction_id": KB_TXN_ID
                }
            )
            logger.info(f"  - Success! Stored {num_chunks} chunks.")
            success_count += 1
            
            # Optional sleep to respect Gemini RPM (15 RPM)
            # Embedding many chunks at once consumes RPM and TPM, so a small delay is safe.
            time.sleep(2)
            
        except Exception as e:
            logger.error(f"  - Failed to process {filename}: {e}")
            fail_count += 1

    logger.info(f"--- Ingestion Complete ---")
    logger.info(f"Successfully processed: {success_count}/{len(files)}")
    logger.info(f"Failed: {fail_count}/{len(files)}")


if __name__ == "__main__":
    main()
