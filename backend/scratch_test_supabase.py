import os
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client

PROJECT_ROOT = Path(__file__).resolve().parent.parent
load_dotenv(PROJECT_ROOT / ".env.local")

sb = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_ROLE_KEY"))

# fetch one chunk to see dimension
res = sb.table("document_chunks").select("embedding").limit(1).execute()
if res.data and res.data[0].get("embedding"):
    emb = res.data[0]["embedding"]
    # embedding might be string or list
    if isinstance(emb, str):
        emb = emb.strip("[]").split(",")
    print(f"Embedding dimension in DB: {len(emb)}")
else:
    print("No chunks found in DB")
