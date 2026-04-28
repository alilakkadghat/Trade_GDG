"""
Document parser using Docling.
Reads PDFs, images, Word docs, Excel files and extracts structured text + tables.
"""

from pathlib import Path
from docling.document_converter import DocumentConverter


# Reuse a single converter instance (loads models once)
_converter: DocumentConverter | None = None


def _get_converter() -> DocumentConverter:
    """Lazily initialize the Docling converter (downloads models on first use)."""
    global _converter
    if _converter is None:
        _converter = DocumentConverter()
    return _converter


def parse_document(file_path: str | Path) -> dict:
    """
    Parse a document file and return structured content.

    Args:
        file_path: Absolute path to the document file.

    Returns:
        {
            "markdown": str,        # Full document as Markdown
            "text": str,            # Plain text (fallback)
            "page_count": int,      # Number of pages detected
            "tables": list[str],    # Extracted tables as Markdown
        }
    """
    file_path = Path(file_path)
    if not file_path.exists():
        raise FileNotFoundError(f"Document not found: {file_path}")

    converter = _get_converter()
    result = converter.convert(str(file_path))
    doc = result.document

    # Extract markdown (best format for LLM consumption)
    markdown_text = doc.export_to_markdown()

    # Extract tables separately for structured analysis
    tables = []
    for table in doc.tables:
        try:
            tables.append(table.export_to_markdown(doc=doc))
        except Exception:
            pass  # skip malformed tables

    # Count pages
    page_count = 0
    try:
        if hasattr(doc, 'pages'):
            page_count = len(doc.pages)
        elif hasattr(doc, 'num_pages'):
            page_count = doc.num_pages()
    except Exception:
        pass

    # Fallback: estimate from content if 0
    if not page_count or page_count == 0:
        page_count = max(1, len(markdown_text) // 3000)

    return {
        "markdown": markdown_text,
        "text": markdown_text,  # Docling markdown is clean enough for text use
        "page_count": page_count,
        "tables": tables,
    }
