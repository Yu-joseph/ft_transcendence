from flask import request, jsonify, redirect, url_for, send_from_directory, Response, stream_with_context
from datetime import datetime
import os
import re
import uuid

from LLM.chains import ask_llm, ask_llm_stream, reset_chat, generate_image


class ChatManager:
    def __init__(self, db):
        self.db = db
        self.chat_history = []
        self.session_id = str(uuid.uuid4())
        self.image_keywords = [
            "generate image", "create image", "draw", "make image",
            "imagine", "visualize", "image of", "picture of", "photo of"
        ]

    def _is_image_request(self, message):
        return any(kw in message.lower() for kw in self.image_keywords)

    def _clean_image_prompt(self, message):
        clean = message.lower()
        for kw in self.image_keywords:
            clean = clean.replace(kw, "").strip()
        return clean or message

    def _format_response(self, response):
        response = re.sub(r'\*+', '', response)
        response = response.replace('\n', '<br>')
        return response

    def _save(self, role, content):
        self.chat_history.append({
            'role': role,
            'content': content,
            'time': datetime.now().strftime('%H:%M')
        })
        self.db.save_message(self.session_id, role, content)

    def chat(self, user_message):
        if not user_message:
            return {'error': 'Empty message'}, 400

        self._save('user', user_message)

        if self._is_image_request(user_message):
            clean_prompt = self._clean_image_prompt(user_message)
            result = generate_image(clean_prompt)
            if result.startswith("/static/"):
                content = f'<img src="{result}" width="350" style="border-radius:8px;">'
            else:
                content = result
        else:
            try:
                content = ask_llm(user_message)
                content = self._format_response(content)
            except Exception as e:
                content = f"Error: {str(e)}"

        self._save('bot', content)
        return {'role': 'bot', 'content': content, 'time': datetime.now().strftime('%H:%M')}

    def chat_stream(self, user_message):
        if not user_message:
            return None

        self._save('user', user_message)

        def generate():
            full_response = ''
            try:
                for token in ask_llm_stream(user_message):
                    full_response += token
                    yield f'data: {token}\n\n'
                yield 'data: [DONE]\n\n'
            except Exception as e:
                yield f'data: Error: {str(e)}\n\n'
                yield 'data: [DONE]\n\n'
                full_response = f'Error: {str(e)}'

            self._save('bot', full_response)

        return generate

    def new_session(self):
        self.chat_history.clear()
        self.session_id = str(uuid.uuid4())
        reset_chat()
        return self.session_id

    def set_session(self, session_id):
        self.session_id = session_id
        rows = self.db.get_messages(session_id)
        self.chat_history.clear()
        for row in rows:
            self.chat_history.append({
                'role': row['role'],
                'content': row['content'],
                'time': row['timestamp'].strftime('%H:%M') if row.get('timestamp') else ''
            })
        return self.chat_history

    def clear(self):
        self.chat_history.clear()
        self.session_id = str(uuid.uuid4())
        reset_chat()