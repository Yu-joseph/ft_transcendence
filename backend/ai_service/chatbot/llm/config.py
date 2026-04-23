import os
import logging
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage

load_dotenv()


class Config:
    def __init__(self):
        self.llm = ChatOpenAI(
            model="meta-llama/llama-3.3-70b-instruct",
            temperature=0.7,
            api_key=os.getenv("OPENROUTER_API_KEY"),
            base_url="https://openrouter.ai/api/v1",
            streaming=True,
            default_headers={
                "HTTP-Referer": "https://localhost:5000",
                "X-Title": "LLM Studio",
            },
        )

        self.system_message = SystemMessage(
            content=(
                "You are a helpful and knowledgeable AI assistant. "
                "Always respond in the same language as the user's question. "
                "Give clear and well-structured answers with explanations and examples when helpful. "
                "Use simple plain text only. "
                "For lists, use numbers like 1. 2. 3. only. "
                "Do NOT use any markdown formatting (no **, no *, no #, no -, no backticks). "
                "Do NOT use symbols for styling. "
                "Write everything in clean readable sentences. "
                "If you are unsure, say you don't know."
            )
        )

    @staticmethod
    def handle_error(e: Exception) -> str:
        logging.error(f"LLM Error: {e}")
        msg = str(e).lower()
        if "timed out" in msg:
            return "The AI is taking too long to respond. Please try again."
        elif "rate limit" in msg:
            return "Too many requests. Please wait a moment and try again."
        elif "quota" in msg or "exhausted" in msg:
            return "API quota exceeded. Please try again later."
        return f"Error: {e}"
    

