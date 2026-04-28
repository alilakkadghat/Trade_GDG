import logging
logging.basicConfig(level=logging.DEBUG)
from backend.services.rag import query_documents

print("Testing RAG...")
res = query_documents("what is SCOMET?", None)
print(res)
