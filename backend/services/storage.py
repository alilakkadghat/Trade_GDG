"""
Supabase file storage + DB helper.
"""
from supabase import create_client, Client
from backend.config import SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

_client: Client | None = None
BUCKET = "trade-documents"


def get_supabase() -> Client:
    global _client
    if _client is None:
        _client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    return _client


def ensure_bucket():
    """Create the storage bucket if it doesn't exist."""
    sb = get_supabase()
    try:
        sb.storage.get_bucket(BUCKET)
    except Exception:
        try:
            sb.storage.create_bucket(BUCKET, options={"public": False})
        except Exception:
            pass  # bucket may already exist


def upload_file(file_bytes: bytes, path: str, content_type: str) -> str:
    """Upload file to Supabase Storage. Returns the storage path."""
    sb = get_supabase()
    ensure_bucket()
    sb.storage.from_(BUCKET).upload(path, file_bytes, {"content-type": content_type})
    return path


def download_file(path: str) -> bytes:
    """Download file from Supabase Storage."""
    sb = get_supabase()
    return sb.storage.from_(BUCKET).download(path)


# ── Database helpers ─────────────────────────────────────

def db_insert(table: str, data: dict) -> dict:
    sb = get_supabase()
    result = sb.table(table).insert(data).execute()
    return result.data[0] if result.data else {}


def db_select(table: str, filters: dict | None = None, order_by: str = "created_at") -> list[dict]:
    sb = get_supabase()
    query = sb.table(table).select("*")
    if filters:
        for key, val in filters.items():
            query = query.eq(key, val)
    result = query.order(order_by, desc=True).execute()
    return result.data or []


def db_select_one(table: str, id: str) -> dict | None:
    sb = get_supabase()
    result = sb.table(table).select("*").eq("id", id).execute()
    return result.data[0] if result.data else None


def db_update(table: str, id: str, data: dict) -> dict:
    sb = get_supabase()
    result = sb.table(table).update(data).eq("id", id).execute()
    return result.data[0] if result.data else {}


def db_delete(table: str, filters: dict) -> None:
    sb = get_supabase()
    query = sb.table(table).delete()
    for key, val in filters.items():
        query = query.eq(key, val)
    query.execute()


def db_rpc(function_name: str, params: dict) -> list[dict]:
    sb = get_supabase()
    result = sb.rpc(function_name, params).execute()
    return result.data or []
