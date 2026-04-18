import re
import uuid
from database.queries import save_message, get_messages
from llm.bot import get_bot, ChatBot



class ChatManager:
    def __init__(self):
        self.chat_history = []
        self.session_id   = str(uuid.uuid4())
        self.user_id      = None

    def set_user(self, user_id):
        self.user_id = user_id

    def _bot(self) -> ChatBot:
        return get_bot(self.user_id)

    @staticmethod
    def _clean(text: str) -> str:
        return re.sub(r'\*+', '', text).replace('\n', '<br>')

    def _save(self, role: str, content: str):
        self.chat_history.append({"role": role, "content": content})
        save_message(self.session_id, role, content, user_id=self.user_id)


    def chat_stream(self, message: str):
        self._save("user", message)
        full_response = []

        for chunk in self._bot().ask_stream(message):
            full_response.append(chunk)
            yield f"data: {chunk}\n\n"

        complete = "".join(full_response).replace('<br>', '\n')
        self._save("assistant", complete)
        yield "data: [DONE]\n\n"

    def new_session(self) -> str:
        self.chat_history.clear()
        self.session_id = str(uuid.uuid4())
        self._bot().reset()
        return self.session_id

    def set_session(self, session_id: str) -> list:
        self.session_id   = session_id
        self.chat_history = get_messages(session_id)
        self._bot().load_history(self.chat_history)
        return self.chat_history

    def clear(self):
        self.chat_history.clear()
        self._bot().reset()

    def generate_title(self, message: str) -> str:
        return self._bot().generate_title(message)