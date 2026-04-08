import uuid
import re
from database import save_message, get_messages
from llm.config import Config
from llm.image import ImageGenerator
from langchain_core.messages import HumanMessage, AIMessage


class ChatBot:
    def __init__(self):
        self.config = Config()
        self.llm = self.config.llm
        self.history = [self.config.system_message]
        self.image_gen = ImageGenerator()

    def ask_stream(self, message):
        try:
            self.history.append(HumanMessage(content=message))
            full_response = ""
            for chunk in self.llm.stream(self.history):
                if chunk.content:
                    full_response += chunk.content
                    yield chunk.content.replace('\n', '<br>')
            self.history.append(AIMessage(content=full_response))
        except Exception as e:
            self.history = [self.config.system_message]
            yield Config.handle_error(e)

    def reset(self):
        self.history = [self.config.system_message]

    def load_history(self, messages):
        self.history = [self.config.system_message]
        for m in messages:
            if m["role"] == "user":
                self.history.append(HumanMessage(content=m["content"]))
            elif m["role"] == "assistant":
                self.history.append(AIMessage(content=m["content"]))

    def generate_image(self, prompt, session_id=None, user_id=None):
        return self.image_gen.generate(prompt, session_id=session_id, user_id=user_id)

    def generate_title(self, message):
        try:
            prompt = f"Generate a short title (max 5 words) for this message:\n{message}"
            response = self.llm.invoke([
                self.config.system_message,
                HumanMessage(content=prompt)
            ])
            return response.content.strip()
        except Exception:
            return "New Chat"


# one ChatBot per user_id
_bots: dict[str, ChatBot] = {}

def get_bot(user_id: str) -> ChatBot:
    if user_id not in _bots:
        _bots[user_id] = ChatBot()
    return _bots[user_id]


class ChatManager:
    def __init__(self):
        self.chat_history = []
        self.session_id = str(uuid.uuid4())
        self.user_id = None

    def set_user(self, user_id):
        self.user_id = user_id

    def _bot(self) -> ChatBot:
        return get_bot(self.user_id or 'anonymous')

    def _format(self, text):
        return re.sub(r'\*+', '', text).replace('\n', '<br>')

    def _save(self, role, content):
        self.chat_history.append({"role": role, "content": content})
        save_message(self.session_id, role, content, user_id=self.user_id)

    def chat(self, message):
        if not message:
            return {"error": "empty message"}
        self._save("user", message)
        try:
            response = "".join(self._bot().ask_stream(message))
            response = self._format(response)
        except Exception as e:
            response = str(e)
        self._save("assistant", response)
        return {"role": "assistant", "content": response}

    def chat_stream(self, message):
        self._save("user", message)
        full_response = []

        def generate():
            for chunk in self._bot().ask_stream(message):
                full_response.append(chunk)
                yield f"data: {chunk}\n\n"
            complete = "".join(full_response).replace('<br>', '\n')
            self._save("assistant", complete)
            yield "data: [DONE]\n\n"

        return generate

    def new_session(self):
        self.chat_history.clear()
        self.session_id = str(uuid.uuid4())
        self._bot().reset()
        return self.session_id

    def set_session(self, session_id):
        self.session_id = session_id
        self.chat_history = get_messages(session_id)
        self._bot().load_history(self.chat_history)
        return self.chat_history

    def clear(self):
        self.chat_history.clear()
        self._bot().reset()

    def generate_image(self, prompt, user_id=None):
        return self._bot().generate_image(
            prompt,
            session_id=self.session_id,
            user_id=self.user_id
        )

    def generate_title(self, message):
        return self._bot().generate_title(message)