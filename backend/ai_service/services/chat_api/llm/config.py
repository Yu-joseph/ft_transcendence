import os
import logging
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_groq import ChatGroq
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage

load_dotenv()
logging.basicConfig(level=logging.INFO)


class Config:
    def __init__(self):
        self.llm = ChatOpenAI(
            model="meta-llama/llama-3.3-70b-instruct",
            temperature=0.7,
            api_key=os.getenv("OPENROUTER_API_KEY"),
            base_url="https://openrouter.ai/api/v1",
            streaming=True,
            default_headers={
                "HTTP-Referer": "https://yourapp.com",
                "X-Title": "LLM Studio",
            }
        )


        # self.llm = ChatGroq(
        #     model="llama-3.3-70b-versatile",
        #     temperature=0.7,
        #     groq_api_key=os.getenv("GROQ_API_KEY"),
        #     streaming=True
        # )

        # self.llm = ChatGoogleGenerativeAI(
        #     model="gemini-2.5-flash",
        #     temperature=0.7,
        #     google_api_key=os.getenv("GOOGLE_API_KEY"),
        #     streaming=True
        # )

        self.system_message = SystemMessage(
            content=(
                "You are a helpful and knowledgeable AI assistant like ChatGPT. "
                "Always respond in the same language as the user's question. "
                "Give detailed, thorough answers with explanations and examples when helpful. "
                "Use clear structure: introduce the topic, explain it, give examples if needed. "
                "For lists use numbers like 1. 2. 3. or dashes - only. "
                "Do not use markdown formatting like ###, **, or ---. "
                "Use plain text only. "
                "If unsure, say you don't know. "
            )
        )

    @staticmethod
    def handle_error(e):
        logging.error(f"LLM Error: {str(e)}")
        error_str = str(e).lower()
        if "timed out" in error_str:
            return "The AI is taking too long to respond. Please try again."
        elif "rate limit" in error_str:
            return "Too many requests. Please wait a moment and try again."
        elif "quota" in error_str or "exhausted" in error_str:
            return "API quota exceeded. Please try again later."
        else:
            return f"Error: {str(e)}"