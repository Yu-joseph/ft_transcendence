from flask import Blueprint, request, jsonify
from api.auth import get_user_id
from manager import ChatManager
from database.queries import get_images
from langchain_core.messages import HumanMessage

image_bp = Blueprint('image', __name__, url_prefix='/api')

chat = ChatManager()


@image_bp.get('/images')
def api_images():
    return jsonify(get_images(user_id=get_user_id()))


@image_bp.post('/is-image-request')
def api_is_image_request():
    message = request.get_json().get('message', '')
    chat.set_user(get_user_id())
    try:
        bot = chat._bot()
        response = bot.llm.invoke([
            HumanMessage(
                content=f'Is this message asking to generate, create, or draw an image or picture? '
                        f'Reply only "yes" or "no": "{message}"'
            )
        ])
        answer = response.content.strip().lower()
        print(f"[ImageCheck] message='{message}' answer='{answer}'")
        return jsonify({'is_image': 'yes' in answer})
    except Exception as e:
        print(f"[ImageCheck ERROR] {e}")
        return jsonify({'is_image': False})