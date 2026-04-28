from pathlib import Path
from dotenv import load_dotenv
import os

load_dotenv(Path(__file__).parent.parent / ".env.local")

from langchain_google_genai import ChatGoogleGenerativeAI
import time

try:
    print("Testing gemini-1.5-flash...")
    llm = ChatGoogleGenerativeAI(
        model="gemini-1.5-flash",
        google_api_key=os.getenv("GEMINI_API_KEY"),
        temperature=0.0,
    )
    res = llm.invoke("Say hello world!")
    print(f"Success! Response: {res.content}")
except Exception as e:
    print(f"Error: {e}")
