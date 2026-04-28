# Graph Report - Trade_GDG  (2026-04-28)

## Corpus Check
- 97 files · ~200,878 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 243 nodes · 229 edges · 11 communities detected
- Extraction: 82% EXTRACTED · 18% INFERRED · 0% AMBIGUOUS · INFERRED: 41 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 92|Community 92]]

## God Nodes (most connected - your core abstractions)
1. `get_supabase()` - 10 edges
2. `fetchWithAuth()` - 10 edges
3. `db_select()` - 9 edges
4. `upload_and_process()` - 8 edges
5. `validate_transaction()` - 8 edges
6. `check_compliance()` - 8 edges
7. `db_insert()` - 8 edges
8. `chunk_and_store()` - 6 edges
9. `parse_document()` - 6 edges
10. `main()` - 5 edges

## Surprising Connections (you probably didn't know these)
- `create_transaction()` --calls--> `db_insert()`  [INFERRED]
  backend/main.py → backend/services/storage.py
- `list_transactions()` --calls--> `db_select()`  [INFERRED]
  backend/main.py → backend/services/storage.py
- `upload_and_process()` --calls--> `parse_document()`  [INFERRED]
  backend/main.py → backend/services/parser.py
- `list_documents()` --calls--> `db_select()`  [INFERRED]
  backend/main.py → backend/services/storage.py
- `get_document()` --calls--> `db_select_one()`  [INFERRED]
  backend/main.py → backend/services/storage.py

## Communities

### Community 0 - "Community 0"
Cohesion: 0.13
Nodes (19): missing_backend_env_keys(), Central configuration — reads .env.local from project root., create_transaction(), get_compliance(), get_document(), get_validations(), health(), list_documents() (+11 more)

### Community 1 - "Community 1"
Cohesion: 0.15
Nodes (20): BaseModel, Enum, DocumentListResponse, DocumentRecord, DocumentStatus, DocumentType, ExtractedField, ExtractionResponse (+12 more)

### Community 2 - "Community 2"
Cohesion: 0.17
Nodes (18): main(), Upload a document, parse it with Docling, classify, extract fields, embed for RA, upload_and_process(), db_delete(), db_insert(), db_rpc(), db_select_one(), db_update() (+10 more)

### Community 3 - "Community 3"
Cohesion: 0.2
Nodes (15): createTransaction(), fetchWithAuth(), getAccessToken(), getDocument(), listDocuments(), listTransactions(), ragQuery(), runCompliance() (+7 more)

### Community 4 - "Community 4"
Cohesion: 0.15
Nodes (13): rag_query(), query_documents(), RAG pipeline — Agentic approach using Gemini to route between direct answers and, Robust Direct RAG query: Embeds query, retrieves chunks from Supabase, and gener, generate_embedding(), generate_query_embedding(), Vector store — embeds document chunks and stores in Supabase pgvector. Uses Goog, Generate embedding using Google's text-embedding-004. (+5 more)

### Community 5 - "Community 5"
Cohesion: 0.33
Nodes (8): check_compliance(), _check_date_logic(), _make_check(), Compliance engine — validates documents against destination-country rules. Cover, Run compliance checks for a transaction against destination country rules., Check that document dates are in logical order., _resolve_country(), run_compliance()

### Community 6 - "Community 6"
Cohesion: 0.4
Nodes (5): _get_converter(), parse_document(), Document parser using Docling. Reads PDFs, images, Word docs, Excel files and ex, Lazily initialize the Docling converter (downloads models on first use)., Parse a document file and return structured content.      Args:         file_pat

### Community 9 - "Community 9"
Cohesion: 0.67
Nodes (3): _fetch_user_from_supabase(), Supabase token validation dependency for FastAPI routes., require_auth()

### Community 10 - "Community 10"
Cohesion: 0.5
Nodes (3): analyze_document(), Document analyzer — uses Gemini to classify and extract structured fields in a s, Classify document and extract fields in a single Gemini call.

### Community 14 - "Community 14"
Cohesion: 1.0
Nodes (2): getSupabaseEnv(), middleware()

### Community 92 - "Community 92"
Cohesion: 1.0
Nodes (1): Upload a document, parse it with Docling, classify, extract fields, embed for RA

## Knowledge Gaps
- **34 isolated node(s):** `Central configuration — reads .env.local from project root.`, `Trade GDG — Document Intelligence API FastAPI backend powering the full document`, `Upload a document, parse it with Docling, classify, extract fields, embed for RA`, `Pydantic schemas for the Document Intelligence API. These define the shape of da`, `A single field extracted from a document.` (+29 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 14`** (3 nodes): `getSupabaseEnv()`, `middleware()`, `middleware.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 92`** (1 nodes): `Upload a document, parse it with Docling, classify, extract fields, embed for RA`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `upload_and_process()` connect `Community 2` to `Community 0`, `Community 1`, `Community 6`?**
  _High betweenness centrality (0.052) - this node is a cross-community bridge._
- **Why does `db_insert()` connect `Community 2` to `Community 0`, `Community 5`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **Why does `validate_transaction()` connect `Community 0` to `Community 2`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `str` (e.g. with `upload_and_process()` and `main()`) actually correct?**
  _`str` has 6 INFERRED edges - model-reasoned connections that need verification._
- **Are the 7 inferred relationships involving `db_select()` (e.g. with `list_transactions()` and `list_documents()`) actually correct?**
  _`db_select()` has 7 INFERRED edges - model-reasoned connections that need verification._
- **Are the 6 inferred relationships involving `upload_and_process()` (e.g. with `str` and `upload_file()`) actually correct?**
  _`upload_and_process()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Central configuration — reads .env.local from project root.`, `Trade GDG — Document Intelligence API FastAPI backend powering the full document`, `Upload a document, parse it with Docling, classify, extract fields, embed for RA` to the rest of the system?**
  _34 weakly-connected nodes found - possible documentation gaps or missing edges._