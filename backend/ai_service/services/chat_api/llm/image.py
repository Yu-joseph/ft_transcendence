import os
import uuid
from huggingface_hub import InferenceClient
from dotenv import load_dotenv
from .config import Config
<<<<<<< HEAD
<<<<<<< HEAD
from database import save_image
=======

>>>>>>> 22d4bda (adding getuser endpoint in nginx)
=======
from database import save_image
>>>>>>> dd5f97c (merging current changes with all team members)
load_dotenv()


class ImageGenerator:
<<<<<<< HEAD
<<<<<<< HEAD
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
=======
    def __init__(self):
=======
    def __init__(self):                                   
>>>>>>> dd5f97c (merging current changes with all team members)
        self.image_count = 0
        self.static_dir = os.path.join(os.path.dirname(__file__), '..', 'static', 'generated')
        os.makedirs(self.static_dir, exist_ok=True)
        self.client = InferenceClient(provider="hf-inference", api_key=os.getenv("HF_API_KEY"))

    def generate(self, prompt, session_id=None, user_id=None):  
        model_name = "stabilityai/stable-diffusion-xl-base-1.0"

        try:
            image = self.client.text_to_image(prompt, model=model_name)

        except Exception as e:
<<<<<<< HEAD
            return Config.handle_error(e)
>>>>>>> 22d4bda (adding getuser endpoint in nginx)
=======
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
>>>>>>> dd5f97c (merging current changes with all team members)
