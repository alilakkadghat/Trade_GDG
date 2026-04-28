import os
from pathlib import Path
from dotenv import load_dotenv
from langchain_google_genai import GoogleGenerativeAIEmbeddings

PROJECT_ROOT = Path(__file__).resolve().parent.parent
load_dotenv(PROJECT_ROOT / ".env.local")

try:
    embeddings = GoogleGenerativeAIEmbeddings(
        model="models/gemini-embedding-001",
        google_api_key=os.getenv("GEMINI_API_KEY"),
    )
    # Test single
    res1 = embeddings.embed_query("hello")
    print(f"Single embed successful: {len(res1)} dims")
    
    # Test batch
    res2 = embeddings.embed_documents(["hello", "world"])
    print(f"Batch embed successful: {len(res2)} docs, {len(res2[0])} dims")
except Exception as e:
    print(f"Error: {e}")
