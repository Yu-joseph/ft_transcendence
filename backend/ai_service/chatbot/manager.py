import uuid
from database.queries import save_message, get_messages
from llm.bot import ChatBot


class ChatManager:
    def __init__(self, session_id: str = None, user_id: str = None):
        self.session_id = session_id or str(uuid.uuid4())
        self.user_id = user_id
        self.bot = ChatBot()
        if session_id:
            history = get_messages(session_id)
            self.bot.load_history(history)

    def chat_stream(self, message: str):
        full_response = []
        for chunk in self.bot.ask_stream(message):
            full_response.append(chunk)
            yield f"data: {chunk}\n\n"
        
        if not self.bot.error:
            complete = "".join(full_response).replace('<br>', '\n')
            save_message(self.session_id, "user", message, user_id=self.user_id)
            save_message(self.session_id, "assistant", complete, user_id=self.user_id)
        
        yield "data: [DONE]\n\n"

    def new_session(self) -> str:
        self.session_id = str(uuid.uuid4())
        return self.session_id

    def generate_title(self, message: str) -> str:
        return self.bot.generate_title(message)

