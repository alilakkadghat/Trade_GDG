# Graph Report - . (2026-04-28)

## Corpus Check

- 113 files · ~199,676 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary

- 318 nodes · 311 edges · 29 communities detected
- Extraction: 87% EXTRACTED · 13% INFERRED · 0% AMBIGUOUS · INFERRED: 39 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)

- [[_COMMUNITY_Backend Models & Schemas|Backend Models & Schemas]]
- [[_COMMUNITY_Data Storage & Ingestion|Data Storage & Ingestion]]
- [[_COMMUNITY_Frontend API Clients & Pages|Frontend API Clients & Pages]]
- [[_COMMUNITY_RAG & Vectorstore Services|RAG & Vectorstore Services]]
- [[_COMMUNITY_FastAPI Core Application|FastAPI Core Application]]
- [[_COMMUNITY_Trade Compliance Rules Engine|Trade Compliance Rules Engine]]
- [[_COMMUNITY_Document Cross-Validation|Document Cross-Validation]]
- [[_COMMUNITY_Docling Parsing Service|Docling Parsing Service]]
- [[_COMMUNITY_Pagination UI Component|Pagination UI Component]]
- [[_COMMUNITY_Menubar UI Component|Menubar UI Component]]
- [[_COMMUNITY_AI Field Extractor|AI Field Extractor]]
- [[_COMMUNITY_Drawer UI Component|Drawer UI Component]]
- [[_COMMUNITY_Sidebar UI Component|Sidebar UI Component]]
- [[_COMMUNITY_Landing Globe Animation|Landing Globe Animation]]
- [[_COMMUNITY_Breadcrumb UI Component|Breadcrumb UI Component]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]

## God Nodes (most connected - your core abstractions)

1. `get_supabase()` - 11 edges
2. `db_select()` - 10 edges
3. `upload_and_process()` - 9 edges
4. `validate_transaction()` - 9 edges
5. `check_compliance()` - 9 edges
6. `db_insert()` - 9 edges
7. `chunk_and_store()` - 7 edges
8. `parse_document()` - 7 edges
9. `main()` - 6 edges
10. `search_similar()` - 6 edges

## Surprising Connections (you probably didn't know these)

- `create_transaction()` --calls--> `db_insert()` [INFERRED]
  /Users/apple/Trade_GDG/backend/main.py → /Users/apple/Trade_GDG/backend/services/storage.py
- `upload_and_process()` --calls--> `parse_document()` [INFERRED]
  /Users/apple/Trade_GDG/backend/main.py → /Users/apple/Trade_GDG/backend/services/parser.py
- `get_document()` --calls--> `db_select_one()` [INFERRED]
  /Users/apple/Trade_GDG/backend/main.py → /Users/apple/Trade_GDG/backend/services/storage.py
- `run_validation()` --calls--> `validate_transaction()` [INFERRED]
  /Users/apple/Trade_GDG/backend/main.py → /Users/apple/Trade_GDG/backend/services/validator.py
- `run_compliance()` --calls--> `check_compliance()` [INFERRED]
  /Users/apple/Trade_GDG/backend/main.py → /Users/apple/Trade_GDG/backend/services/compliance.py

## Communities

### Community 0 - "Backend Models & Schemas"

Cohesion: 0.19
Nodes (20): BaseModel, Enum, DocumentListResponse, DocumentRecord, DocumentStatus, DocumentType, ExtractedField, ExtractionResponse (+12 more)

### Community 1 - "Data Storage & Ingestion"

Cohesion: 0.19
Nodes (18): main(), Upload a document, parse it with Docling, classify, extract fields, embed for RA, upload_and_process(), db_delete(), db_insert(), db_rpc(), db_select_one(), db_update() (+10 more)

### Community 2 - "Frontend API Clients & Pages"

Cohesion: 0.22
Nodes (14): createTransaction(), getDocument(), listDocuments(), listTransactions(), ragQuery(), runCompliance(), runValidation(), uploadDocument() (+6 more)

### Community 3 - "RAG & Vectorstore Services"

Cohesion: 0.18
Nodes (12): query_documents(), RAG pipeline — Agentic approach using Gemini to route between direct answers and, Robust Direct RAG query: Embeds query, retrieves chunks from Supabase, and gener, generate_embedding(), generate_query_embedding(), Vector store — embeds document chunks and stores in Supabase pgvector. Uses Goog, Generate embedding using Google's text-embedding-004., Generate embedding optimized for search queries. (+4 more)

### Community 4 - "FastAPI Core Application"

Cohesion: 0.3
Nodes (12): create_transaction(), get_compliance(), get_document(), get_validations(), health(), list_documents(), list_transactions(), rag_query() (+4 more)

### Community 5 - "Trade Compliance Rules Engine"

Cohesion: 0.44
Nodes (7): check_compliance(), \_check_date_logic(), \_make_check(), Compliance engine — validates documents against destination-country rules. Cover, Run compliance checks for a transaction against destination country rules., Check that document dates are in logical order., \_resolve_country()

### Community 6 - "Document Cross-Validation"

Cohesion: 0.5
Nodes (6): \_get_field_value(), \_is_match(), \_normalize(), Cross-document validator — compares extracted fields across all documents in a t, Run cross-document validation on all documents in a transaction., validate_transaction()

### Community 7 - "Docling Parsing Service"

Cohesion: 0.43
Nodes (5): \_get_converter(), parse_document(), Document parser using Docling. Reads PDFs, images, Word docs, Excel files and ex, Lazily initialize the Docling converter (downloads models on first use)., Parse a document file and return structured content. Args: file_pat

### Community 8 - "Pagination UI Component"

Cohesion: 0.48
Nodes (5): Pagination(), PaginationEllipsis(), PaginationLink(), PaginationNext(), PaginationPrevious()

### Community 9 - "Menubar UI Component"

Cohesion: 0.48
Nodes (5): MenubarGroup(), MenubarMenu(), MenubarPortal(), MenubarRadioGroup(), MenubarSub()

### Community 10 - "AI Field Extractor"

Cohesion: 0.5
Nodes (3): analyze_document(), Document analyzer — uses Gemini to classify and extract structured fields in a s, Classify document and extract fields in a single Gemini call.

### Community 11 - "Drawer UI Component"

Cohesion: 0.6
Nodes (3): Drawer(), DrawerFooter(), DrawerHeader()

### Community 12 - "Sidebar UI Component"

Cohesion: 0.6
Nodes (3): cn(), handleKeyDown(), useSidebar()

### Community 13 - "Landing Globe Animation"

Cohesion: 0.6
Nodes (3): latLonToVec3(), useEarthTexture(), useIsClient()

### Community 14 - "Breadcrumb UI Component"

Cohesion: 0.67
Nodes (2): BreadcrumbEllipsis(), BreadcrumbSeparator()

### Community 15 - "Community 15"

Cohesion: 0.67
Nodes (1): search_knowledge()

### Community 16 - "Community 16"

Cohesion: 0.67
Nodes (1): Central configuration — reads .env.local from project root.

### Community 17 - "Community 17"

Cohesion: 0.67
Nodes (1): RootLayout()

### Community 18 - "Community 18"

Cohesion: 0.67
Nodes (1): DashboardLayout()

### Community 19 - "Community 19"

Cohesion: 0.67
Nodes (1): DelayResolution()

### Community 20 - "Community 20"

Cohesion: 0.67
Nodes (1): Card()

### Community 21 - "Community 21"

Cohesion: 0.67
Nodes (1): useChart()

### Community 22 - "Community 22"

Cohesion: 0.67
Nodes (1): Toaster()

### Community 23 - "Community 23"

Cohesion: 0.67
Nodes (1): cn()

### Community 24 - "Community 24"

Cohesion: 0.67
Nodes (1): useFormField()

### Community 25 - "Community 25"

Cohesion: 0.67
Nodes (1): useCarousel()

### Community 26 - "Community 26"

Cohesion: 0.67
Nodes (1): SignalTicker()

### Community 27 - "Community 27"

Cohesion: 0.67
Nodes (1): useIsMobile()

### Community 28 - "Community 28"

Cohesion: 0.67
Nodes (1): cn()

## Knowledge Gaps

- **22 isolated node(s):** `Upload a document, parse it with Docling, classify, extract fields, embed for RA`, `A single field extracted from a document.`, `A processed document with metadata and extracted fields.`, `Response after uploading a document.`, `Response after extracting data from a document.` (+17 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Breadcrumb UI Component`** (4 nodes): `BreadcrumbEllipsis()`, `BreadcrumbSeparator()`, `breadcrumb.tsx`, `breadcrumb.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 15`** (3 nodes): `test_model.py`, `search_knowledge()`, `test_model.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 16`** (3 nodes): `config.py`, `Central configuration — reads .env.local from project root.`, `config.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 17`** (3 nodes): `RootLayout()`, `layout.tsx`, `layout.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 18`** (3 nodes): `DashboardLayout()`, `layout.tsx`, `layout.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 19`** (3 nodes): `DelayResolution()`, `page.tsx`, `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 20`** (3 nodes): `ui-bits.tsx`, `Card()`, `ui-bits.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 21`** (3 nodes): `useChart()`, `chart.tsx`, `chart.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 22`** (3 nodes): `Toaster()`, `sonner.tsx`, `sonner.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 23`** (3 nodes): `cn()`, `calendar.tsx`, `calendar.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 24`** (3 nodes): `useFormField()`, `form.tsx`, `form.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 25`** (3 nodes): `useCarousel()`, `carousel.tsx`, `carousel.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 26`** (3 nodes): `SignalTicker()`, `SignalTicker.tsx`, `SignalTicker.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 27`** (3 nodes): `use-mobile.tsx`, `useIsMobile()`, `use-mobile.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 28`** (3 nodes): `utils.ts`, `utils.ts`, `cn()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions

_Questions this graph is uniquely positioned to answer:_

- **Why does `upload_and_process()` connect `Data Storage & Ingestion` to `Backend Models & Schemas`, `FastAPI Core Application`, `Docling Parsing Service`?**
  _High betweenness centrality (0.031) - this node is a cross-community bridge._
- **Why does `db_insert()` connect `Data Storage & Ingestion` to `FastAPI Core Application`, `Trade Compliance Rules Engine`, `Document Cross-Validation`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **Why does `validate_transaction()` connect `Document Cross-Validation` to `Data Storage & Ingestion`, `FastAPI Core Application`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `str` (e.g. with `upload_and_process()` and `main()`) actually correct?**
  _`str` has 6 INFERRED edges - model-reasoned connections that need verification._
- **Are the 7 inferred relationships involving `db_select()` (e.g. with `list_transactions()` and `list_documents()`) actually correct?**
  _`db_select()` has 7 INFERRED edges - model-reasoned connections that need verification._
- **Are the 6 inferred relationships involving `upload_and_process()` (e.g. with `str` and `upload_file()`) actually correct?**
  _`upload_and_process()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **Are the 4 inferred relationships involving `validate_transaction()` (e.g. with `run_validation()` and `db_delete()`) actually correct?**
  _`validate_transaction()` has 4 INFERRED edges - model-reasoned connections that need verification._
