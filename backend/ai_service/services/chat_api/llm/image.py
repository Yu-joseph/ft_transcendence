import os
import uuid
import requests
from dotenv import load_dotenv
from database.queries import save_image

load_dotenv()


class ImageGenerator:
    def __init__(self):
        self.static_dir = os.path.join(os.path.dirname(__file__), '..', 'static', 'generated')
        os.makedirs(self.static_dir, exist_ok=True)
        self.hf_token = os.getenv("HF_TOKEN")

    def generate(self, prompt: str, session_id: str = None, user_id: str = None) -> str:
        if self.hf_token:
            for model_id, model_name in [
                ("stabilityai/stable-diffusion-xl-base-1.0", "sdxl"),
                ("runwayml/stable-diffusion-v1-5",           "sd-1.5"),
                ("CompVis/stable-diffusion-v1-4",            "sd-1.4"),
            ]:
                result = self._try_huggingface(prompt, model_id, model_name, session_id, user_id)
                if result:
                    return result

        return self._try_pollinations(prompt, session_id, user_id)

    def _try_huggingface(self, prompt, model_id, model_name, session_id, user_id):
        try:
            response = requests.post(
                f"https://api-inference.huggingface.co/models/{model_id}",
                headers={"Authorization": f"Bearer {self.hf_token}"},
                json={"inputs": prompt},
                timeout=120,
            )
            if response.status_code in (503, 429):
                print(f"[HF] {model_name} unavailable, trying next...")
                return None
            if response.status_code != 200:
                print(f"[HF] {model_name} failed: {response.status_code}")
                return None
            if 'image' not in response.headers.get('Content-Type', ''):
                print(f"[HF] {model_name} returned non-image")
                return None
            return self._persist(response.content, ".png", prompt, model_name, session_id, user_id)
        except Exception as e:
            print(f"[HF {model_name} ERROR] {e}")
            return None

    def _try_pollinations(self, prompt, session_id, user_id):
        try:
            encoded  = requests.utils.quote(prompt)
            url      = (
                f"https://image.pollinations.ai/prompt/{encoded}"
                f"?width=512&height=512&nologo=true&enhance=true"
            )
            response = requests.get(url, timeout=90)
            if response.status_code != 200:
                return "All image services failed"
            return self._persist(response.content, ".jpg", prompt, "pollinations", session_id, user_id)
        except Exception as e:
            print(f"[Pollinations ERROR] {e}")
            return f"Error: {e}"

    def _persist(self, content: bytes, ext: str, prompt, model_name, session_id, user_id) -> str:
        filename  = f"image_{uuid.uuid4().hex[:8]}{ext}"
        filepath  = os.path.join(self.static_dir, filename)
        image_url = f"/static/generated/{filename}"
        with open(filepath, 'wb') as f:
            f.write(content)
        save_image(prompt, filename, image_url, model_name, session_id, user_id)
        print(f"[ImageGen] Saved via {model_name}: {filename}")
        return image_url