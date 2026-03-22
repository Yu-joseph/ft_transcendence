import uuid
import re
from datetime import datetime

from database import save_message, get_messages
from llm.chains import ask_llm, ask_llm_stream, reset_chat, generate_image


class ChatManager:
    def __init__(self):
        self.chat_history = []
        self.session_id = str(uuid.uuid4())

    def _format(self, text):
        return re.sub(r'\*+', '', text).replace('\n', '<br>')

    def _save(self, role, content):
        self.chat_history.append({
            "role": role,
            "content": content
        })
        save_message(self.session_id, role, content)

    def chat(self, message):
        if not message:
            return {"error": "empty message"}

        self._save("user", message)

        try:
            response = ask_llm(message)
            response = self._format(response)
        except Exception as e:
            response = str(e)

        self._save("assistant", response)

        return {"role": "assistant", "content": response}

    def chat_stream(self, message):
        def generate():
            for chunk in ask_llm_stream(message):
                yield f"data: {chunk}\n\n"
            yield "data: [DONE]\n\n"

        return generate

    def new_session(self):
        self.chat_history.clear()
        self.session_id = str(uuid.uuid4())
        return self.session_id

    def set_session(self, session_id):
        self.session_id = session_id
        self.chat_history = get_messages(session_id)
        return self.chat_history

    def clear(self):
        self.chat_history.clear()
        reset_chat()