"""
RAG pipeline — Agentic approach using Gemini to route between direct answers
and vector search across documents and global knowledge base.
"""
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage, HumanMessage, ToolMessage
from langchain_core.tools import tool
from backend.config import GEMINI_API_KEY, GEMINI_MODEL
from backend.services.vectorstore import search_all_relevant

def query_documents(question: str, transaction_id: str | None = None) -> dict:
    """Robust Direct RAG query: Embeds query, retrieves chunks from Supabase, and generates answer."""
    from langchain_google_genai import ChatGoogleGenerativeAI
    from langchain_core.messages import SystemMessage, HumanMessage
    from backend.config import GEMINI_API_KEY, GEMINI_MODEL
    from backend.services.vectorstore import search_all_relevant
    
    try:
        # 1. Retrieve relevant context using vector store
        chunks = search_all_relevant(question, transaction_id=transaction_id, top_k_txn=5, top_k_kb=5)
        
        context_parts = []
        sources = []
        seen_docs = set()
        
        for c in chunks:
            meta = c.get("metadata", {})
            label = meta.get("document_type", "Document")
            filename = meta.get("filename", "unknown")
            doc_id = c.get("document_id")
            
            context_parts.append(f"[{label} - {filename}]\n{c['chunk_text']}")
            
            if doc_id and doc_id not in seen_docs:
                seen_docs.add(doc_id)
                sources.append({
                    "document_id": doc_id,
                    "filename": filename,
                    "similarity": round(c.get("similarity", 0), 3),
                })
                
        context = "\n\n---\n\n".join(context_parts) if context_parts else "No relevant documents found in the system."
        
        # 2. Synthesize the response using Gemini
        system_prompt = """You are an intelligent trade document assistant. 
Answer the user's question thoroughly and professionally based on the provided context snippets.

If the user's query is just conversational (like 'hello', 'who are you?'), respond naturally.
Otherwise, use the context to give accurate insights about transaction documents, trade compliance, or policies.
When citing information, mention the document filename where possible."""

        user_prompt = f"""Context retrieved from Trade GDG Database:
{context}

User Question: {question}
"""
        
        llm = ChatGoogleGenerativeAI(
            model=GEMINI_MODEL,
            google_api_key=GEMINI_API_KEY,
            temperature=0.2,
        )
        
        response = llm.invoke([
            SystemMessage(content=system_prompt),
            HumanMessage(content=user_prompt)
        ])
        
        answer = response.content
        if isinstance(answer, list):
            answer = " ".join([str(b.get("text", b)) if isinstance(b, dict) else str(b) for b in answer])
            
        if not answer:
            answer = "I searched your documents but couldn't compile an answer. Please try rephrasing your question."
            
        return {"answer": answer.strip(), "sources": sources}
        
    except Exception as e:
        return {"answer": f"Error querying documents: {str(e)}", "sources": []}
