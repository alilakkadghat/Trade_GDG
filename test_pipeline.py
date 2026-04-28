import logging
logging.basicConfig(level=logging.DEBUG)
from backend.services.rag import query_documents

print("Testing RAG pipeline...")
try:
    res = query_documents("what is SCOMET?", None)
    print(res)
except Exception as e:
    print(f"Error: {e}")
