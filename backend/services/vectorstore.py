"""
Vector store — embeds document chunks and stores in Supabase pgvector.
Uses Google's text-embedding-004 model via Langchain.
"""
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from backend.config import GEMINI_API_KEY, EMBEDDING_MODEL
from backend.services.storage import db_insert, db_rpc, db_delete

_splitter = RecursiveCharacterTextSplitter(
    chunk_size=800,
    chunk_overlap=100,
    separators=["\n\n", "\n", ". ", " ", ""],
)

_embeddings = GoogleGenerativeAIEmbeddings(
    model=EMBEDDING_MODEL,
    google_api_key=GEMINI_API_KEY,
)

def generate_embedding(text: str) -> list[float]:
    """Generate embedding using Google's text-embedding-004."""
    emb = _embeddings.embed_documents([text])[0]
    return emb[:768] if len(emb) > 768 else emb

def generate_query_embedding(text: str) -> list[float]:
    """Generate embedding optimized for search queries."""
    emb = _embeddings.embed_query(text)
    return emb[:768] if len(emb) > 768 else emb

def chunk_and_store(document_id: str, text: str, metadata: dict | None = None):
    """Split text into chunks, embed each, store in Supabase pgvector."""
    db_delete("document_chunks", {"document_id": document_id})
    chunks = _splitter.split_text(text)
    meta = metadata or {}

    if not chunks:
        return 0

    # Bulk embed all chunks at once (much faster and avoids rate limits per chunk)
    embeddings = _embeddings.embed_documents(chunks)

    for i, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
        # Truncate embedding to 768 dimensions to match database schema
        truncated_emb = embedding[:768] if len(embedding) > 768 else embedding
        db_insert("document_chunks", {
            "document_id": document_id,
            "chunk_text": chunk,
            "chunk_index": i,
            "embedding": truncated_emb,
            "metadata": {**meta, "chunk_index": i},
        })
    return len(chunks)

def search_similar(query: str, transaction_id: str | None = None, top_k: int = 5) -> list[dict]:
    """Search for document chunks similar to the query."""
    query_emb = generate_query_embedding(query)
    results = db_rpc("match_document_chunks", {
        "query_embedding": query_emb,
        "match_count": top_k,
        "filter_transaction_id": transaction_id,
    })
    return results

def search_all_relevant(query: str, transaction_id: str | None = None, top_k_txn: int = 3, top_k_kb: int = 3) -> list[dict]:
    """Search both the transaction documents and the global knowledge base."""
    import uuid
    KB_TXN_ID = str(uuid.uuid5(uuid.NAMESPACE_URL, "KNOWLEDGE_BASE_TXN"))
    
    chunks = []
    
    # 1. Search transaction documents
    if transaction_id:
        chunks.extend(search_similar(query, transaction_id=transaction_id, top_k=top_k_txn))
        
    # 2. Search Global Knowledge Base
    chunks.extend(search_similar(query, transaction_id=KB_TXN_ID, top_k=top_k_kb))
    
    # Deduplicate by chunk text just in case
    seen = set()
    final_chunks = []
    for c in chunks:
        if c["chunk_text"] not in seen:
            seen.add(c["chunk_text"])
            final_chunks.append(c)
            
    # Sort by similarity
    final_chunks.sort(key=lambda x: x.get("similarity", 0), reverse=True)
    return final_chunks
