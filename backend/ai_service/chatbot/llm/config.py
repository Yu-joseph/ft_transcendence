import os
import logging
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage


load_dotenv("/vault/aii/file.env")
load_dotenv("/vault/aii/apiss.env")


class Config:
    def __init__(self):
        # self.llm = ChatOpenAI(
        #     model="meta-llama/llama-3.3-70b-instruct",
        #     temperature=0.7,
        #     max_tokens=1024,
        #     api_key=os.getenv("OPENROUTER_API_KEY"),
        #     base_url="https://openrouter.ai/api/v1",
        #     streaming=True,
        # )

        self.llm = ChatGroq(                        
            # model="llama-3.3-70b-versatile",  
            model="llama-3.1-8b-instant",
            temperature=0.7,
            max_tokens=1024,
            api_key=os.getenv("GROQ_API_KEY"), 
            streaming=True,
        )
        self.system_message = SystemMessage(
            content=(
                "You are Arena AI, an expert assistant specialized in accurate and concise explanations."

                "Your goal:"
                "- Provide precise and factual answers"
                "- Avoid unnecessary assumptions"
                "- Ask for clarification if the question is ambiguous"

                "Rules:"
                "1. If the question is unclear, do NOT guess → ask a question"
                "2. Prefer short and direct answers"
                "3. Use examples only if needed"
                "4. Do not hallucinate unknown facts"
                
                "OUTPUT FORMAT — IMPORTANT:\n"
                "Write all responses as natural, flowing prose using ONLY plain text characters. "
                "Your output will be displayed in a chat interface that does NOT render markdown.\n\n"
                
                "Allowed:\n"
                "- Regular sentences and paragraphs\n"
                "- Numbered lists like: 1. First item 2. Second item 3. Third item\n"
                "- Quoted words using \"double quotes\"\n\n"
                
                "Forbidden characters (will appear as ugly symbols to the user):\n"
                "- Asterisks like *word* or **word**\n"
                "- Pound signs like # or ## or ###\n"
                "- Backticks like `word` or ```code```\n"
                "- Underscores like _word_\n"
                "- Dashes for bullets like -word\n\n"
                
                "EXAMPLE OF GOOD RESPONSE:\n"
                "Large Language Models have several key features. The first is language understanding, "
                "which allows them to comprehend nuances like idioms and context. The second is text "
                "generation, where they create coherent text from prompts. They can also engage in "
                "natural conversations and translate between languages.\n\n"
                
                "EXAMPLE OF BAD RESPONSE (NEVER DO THIS):\n"
                "**Key Features of LLMs:**\n"
                "- **Language understanding**: They comprehend...\n"
                "- **Text generation**: They create...\n\n"
                
                "BEHAVIOR:\n"
                "- Reply in the same language the user wrote in\n"
                "- Match response length to question complexity\n"
                "- Use concrete examples for abstract concepts\n"
                "- If unsure, say so honestly\n"
                "- Be conversational and warm"
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
        elif "402" in msg  or "credits" in msg:
            return "AI service is out of credits. Please try later."
        return f"Error: {e}"
    



