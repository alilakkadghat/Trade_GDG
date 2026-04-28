import os
import uuid
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client

PROJECT_ROOT = Path(__file__).resolve().parent.parent
load_dotenv(PROJECT_ROOT / ".env.local")

sb = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_ROLE_KEY"))

try:
    fake_id = str(uuid.uuid4())
    fake_embedding = [0.1] * 768
    res = sb.table("document_chunks").insert({
        "document_id": fake_id,
        "chunk_text": "test",
        "chunk_index": 0,
        "embedding": fake_embedding,
        "metadata": {}
    }).execute()
    print("768 insert successful!")
    # cleanup
    sb.table("document_chunks").delete().eq("document_id", fake_id).execute()
except Exception as e:
    print(f"768 insert error: {e}")

try:
    fake_id2 = str(uuid.uuid4())
    fake_embedding = [0.1] * 3072
    res = sb.table("document_chunks").insert({
        "document_id": fake_id2,
        "chunk_text": "test",
        "chunk_index": 0,
        "embedding": fake_embedding,
        "metadata": {}
    }).execute()
    print("3072 insert successful!")
    sb.table("document_chunks").delete().eq("document_id", fake_id2).execute()
except Exception as e:
    print(f"3072 insert error: {e}")
