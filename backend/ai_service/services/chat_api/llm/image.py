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
        model_name = "stabilityai/stable-diffusion-xl-base-1.0"

        try:
            print("Using model:", model_name , flush=True)

            image = self.client.text_to_image(
                prompt,
                model=model_name
            )

        except Exception as e:
            error_messg = str(e).lower()
            print("ERROR:", error_messg ,  flush=True)

            if "limit" in error_messg or "quota" in error_messg:
                model_name = "runwayml/stable-diffusion-v1-5"

                print("⚠️ Switching to model:", model_name)

                image = self.client.text_to_image(
                    prompt,
                    model=model_name
                )
            else:
                return Config.handle_error(e)

        existing_file = [] 
        for f in os.listdir(self.static_dir):
            if f.startswith("image_") and f.endswith(".jpg"):
                existing_file.append(f)

        self.image_count = len(existing_file) + 1

        filename = f"image_{self.image_count}.jpg"
        filepath = os.path.join(self.static_dir, filename)

        image.save(filepath)

        print("Saved:", filepath ,  flush=True)
        print("Using model:", model_name, flush=True)

        return f"/static/generated/{filename}"

