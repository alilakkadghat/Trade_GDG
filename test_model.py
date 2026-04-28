from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage, HumanMessage, ToolMessage
from langchain_core.tools import tool
from backend.config import GEMINI_API_KEY
import logging
logging.basicConfig(level=logging.ERROR)

@tool
def search_knowledge(query: str) -> str:
    """Search knowledge."""
    return "The SCOMET list is a list of special chemicals, organisms, materials, equipment and technologies."

print("Initializing...")
llm = ChatGoogleGenerativeAI(
    model="gemini-1.5-flash",
    google_api_key=GEMINI_API_KEY,
    temperature=0.2,
)
llm_with_tools = llm.bind_tools([search_knowledge])

messages = [
    HumanMessage(content="what is SCOMET?")
]

print("Calling AI...")
try:
    ai_msg = llm_with_tools.invoke(messages)
    print("Tool calls:", ai_msg.tool_calls)
    messages.append(ai_msg)

    if ai_msg.tool_calls:
        for tc in ai_msg.tool_calls:
            print("Tool call args:", tc["args"])
            output = search_knowledge.invoke(tc["args"])
            messages.append(ToolMessage(tool_call_id=tc["id"], name=tc["name"], content=output))
        
        final = llm_with_tools.invoke(messages)
        print("Final answer:", final.content)
except Exception as e:
    print("Error:", str(e))
