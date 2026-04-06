import uuid
import re
from datetime import datetime
<<<<<<< HEAD
<<<<<<< HEAD
from database import save_message, get_messages
from llm.chains import ask_llm, ask_llm_stream, reset_chat, generate_image , load_history , generate_title
=======

from database import save_message, get_messages
from llm.chains import ask_llm, ask_llm_stream, reset_chat, generate_image , load_history
>>>>>>> 22d4bda (adding getuser endpoint in nginx)
=======
from database import save_message, get_messages
from llm.chains import ask_llm, ask_llm_stream, reset_chat, generate_image , load_history , generate_title
>>>>>>> dd5f97c (merging current changes with all team members)

class ChatManager:
    def __init__(self):
        self.chat_history = []
        self.session_id = str(uuid.uuid4())
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> dd5f97c (merging current changes with all team members)
        self.user_id = None

    def set_user(self , user_id):
        self.user_id  = user_id
<<<<<<< HEAD
=======
>>>>>>> 22d4bda (adding getuser endpoint in nginx)
=======
>>>>>>> dd5f97c (merging current changes with all team members)

    def _format(self, text):
        return re.sub(r'\*+', '', text).replace('\n', '<br>')

    def _save(self, role, content):
        self.chat_history.append({
            "role": role,
            "content": content
        })
<<<<<<< HEAD
<<<<<<< HEAD
        save_message(self.session_id, role, content , user_id=self.user_id)
=======
        save_message(self.session_id, role, content)
>>>>>>> 22d4bda (adding getuser endpoint in nginx)
=======
        save_message(self.session_id, role, content , user_id=self.user_id)
>>>>>>> dd5f97c (merging current changes with all team members)

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
        self._save("user", message)          
        full_response = []  

        def generate():
            for chunk in ask_llm_stream(message):
                full_response.append(chunk)  
                yield f"data: {chunk}\n\n"
            
            complete = "".join(full_response).replace('<br>', '\n')
            self._save("assistant", complete) 
            yield "data: [DONE]\n\n"

        return generate

    def new_session(self):
        self.chat_history.clear()
        self.session_id = str(uuid.uuid4())
        return self.session_id

    def set_session(self, session_id):
        self.session_id = session_id
        self.chat_history = get_messages(session_id)
        load_history(self.chat_history)
        return self.chat_history

    def clear(self):
        self.chat_history.clear()
        reset_chat()

<<<<<<< HEAD
<<<<<<< HEAD
    def generate_image(self, prompt, user_id=None):
        return generate_image(prompt, session_id=self.session_id, user_id=self.user_id)
=======
    def generate_image(self, prompt):
        return generate_image(prompt)
>>>>>>> 22d4bda (adding getuser endpoint in nginx)
=======
    def generate_image(self, prompt, user_id=None):
        return generate_image(prompt, session_id=self.session_id, user_id=self.user_id)
>>>>>>> dd5f97c (merging current changes with all team members)
