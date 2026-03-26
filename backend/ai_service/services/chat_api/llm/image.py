import os
import uuid
from huggingface_hub import InferenceClient
from dotenv import load_dotenv
from .config import Config

load_dotenv()


class ImageGenerator:
    def __init__(self):
        self.image_count = 0
        self.static_dir = os.path.join(os.path.dirname(__file__), '..', 'static', 'generated')
        os.makedirs(self.static_dir, exist_ok=True)

        self.client = InferenceClient(provider="hf-inference", api_key=os.getenv("HF_API_KEY"))

    def generate(self, prompt):
        try:
            image = self.client.text_to_image(
                prompt,
                model="black-forest-labs/FLUX.1-schnell"
            )

            self.image_count +=1
            filename = f"image_{self.image_count}.jpg"
            filepath = os.path.join(self.static_dir, filename)
            image.save(filepath)
            return f"/static/generated/{filename}"
        except Exception as e:
            return Config.handle_error(e)