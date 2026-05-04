from langchain_core.messages import HumanMessage, AIMessage
from llm.config import Config
 

class ChatBot:
    def __init__(self):
        self.config = Config()
        self.llm    = self.config.llm
        self.history = [self.config.system_message]
        self.error = False

    def ask_stream(self, message: str):
        self.error  = False
        try:
            self.history.append(HumanMessage(content=message))
            full_response = ""
            for chunk in self.llm.stream(self.history):
                if chunk.content:
                    full_response += chunk.content
                    yield chunk.content.replace('\n', '<br>')
            self.history.append(AIMessage(content=full_response))
        except Exception as e:
            if self.history and isinstance(self.history[-1] , HumanMessage):
                self.history.pop()
            self.error = True
            yield "ERROR" ,  Config.handle_error(e)

    def reset(self):
        self.history = [self.config.system_message]

    def load_history(self, messages: list):
        self.history = [self.config.system_message]
        for m in messages:
            if m["role"] == "user":
                self.history.append(HumanMessage(content=m["content"]))
            elif m["role"] == "assistant":
                self.history.append(AIMessage(content=m["content"]))


    def generate_title(self, message: str) -> str:
        try:
            response = self.llm.invoke([
                self.config.system_message,
                HumanMessage(content=f"Generate a short title (max 5 words) for this message:\n{message}"),
            ])
            return response.content.strip()
        except Exception:
            return "New Chat"

