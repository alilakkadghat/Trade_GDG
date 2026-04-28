from pathlib import Path
from dotenv import load_dotenv
import os
import google.generativeai as genai

load_dotenv(Path(__file__).parent.parent / ".env.local")
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

try:
    print("Testing gemini-2.0-flash-lite...")
    model = genai.GenerativeModel('gemini-2.0-flash-lite')
    res = model.generate_content("Say hello world!")
    print(f"Success! Response: {res.text}")
except Exception as e:
    print(f"Error: {e}")
