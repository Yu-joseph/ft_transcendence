import os
import uuid
from huggingface_hub import InferenceClient
from dotenv import load_dotenv
from .config import Config
from database import save_image
load_dotenv()


class ImageGenerator:
    def __init__(self):                                   
        self.image_count = 0
        self.static_dir = os.path.join(os.path.dirname(__file__), '..', 'static', 'generated')
        os.makedirs(self.static_dir, exist_ok=True)
        self.client = InferenceClient(provider="hf-inference", api_key=os.getenv("HF_API_KEY"))

    def generate(self, prompt, session_id=None, user_id=None):  
        model_name = "stabilityai/stable-diffusion-xl-base-1.0"

        try:
            image = self.client.text_to_image(prompt, model=model_name)

        except Exception as e:
            error_messg = str(e).lower()
            if "limit" in error_messg or "quota" in error_messg:
                model_name = "runwayml/stable-diffusion-v1-5"
                image = self.client.text_to_image(prompt, model=model_name)
            else:
                return Config.handle_error(e)

        existing_file = [
            f for f in os.listdir(self.static_dir)
            if f.startswith("image_") and f.endswith(".jpg")
        ]
        self.image_count = len(existing_file) + 1

        filename = f"image_{self.image_count}.jpg"

        filepath = os.path.join(self.static_dir, filename)
        url = f"/static/generated/{filename}"

        image.save(filepath)

        # ← save to DB right after saving to disk
        save_image(
            prompt=prompt,
            filename=filename,
            url=url,
            model_used=model_name,
            session_id=session_id,
            user_id=user_id
        )

        return url
