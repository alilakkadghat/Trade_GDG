import os
from pathlib import Path
from dotenv import load_dotenv
import google.generativeai as genai

PROJECT_ROOT = Path(__file__).resolve().parent.parent
load_dotenv(PROJECT_ROOT / ".env.local")

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

try:
    res = genai.embed_content(model="models/text-embedding-004", content="hello")
    print(f"Success! {len(res['embedding'])} dims")
except Exception as e:
    print(f"Error: {e}")
