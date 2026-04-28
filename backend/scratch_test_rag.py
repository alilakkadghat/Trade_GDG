import os
import sys
from pathlib import Path
from dotenv import load_dotenv

PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))
load_dotenv(PROJECT_ROOT / ".env.local")

from backend.services.rag import query_documents

try:
    print("Testing RAG Query...")
    result = query_documents("what is the weight of the goods in the packing list?")
    print("Result:", result)
except Exception as e:
    import traceback
    traceback.print_exc()
