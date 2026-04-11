import os
import requests
from dotenv import load_dotenv
from .config import Config
from database import save_image

load_dotenv()


class ImageGenerator:
    def __init__(self):
        self.image_count = 0
        self.static_dir = os.path.join(os.path.dirname(__file__), '..', 'static', 'generated')
        os.makedirs(self.static_dir, exist_ok=True)

    def generate(self, prompt, session_id=None, user_id=None):
        try:
            encoded_prompt = requests.utils.quote(prompt)
            url = f"https://image.pollinations.ai/prompt/{encoded_prompt}?width=512&height=512&nologo=true"
            
            response = requests.get(url, timeout=60)

            if response.status_code != 200:
                return f"Image generation failed: {response.status_code}"

            existing_file = [
                f for f in os.listdir(self.static_dir)
                if f.startswith("image_") and f.endswith(".jpg")
            ]
            self.image_count = len(existing_file) + 1
            filename = f"image_{self.image_count}.jpg"
            filepath = os.path.join(self.static_dir, filename)
            image_url = f"/static/generated/{filename}"

            with open(filepath, 'wb') as f:
                f.write(response.content)

            save_image(
                prompt=prompt,
                filename=filename,
                url=image_url,
                model_used="pollinations-ai",
                session_id=session_id,
                user_id=user_id
            )

            return image_url

        except Exception as e:
            return Config.handle_error(e)
        




















# import os
# import requests
# from dotenv import load_dotenv
# from .config import Config
# from database import save_image

# load_dotenv()

# class ImageGenerator:
#     def __init__(self):
#         self.image_count = 0
#         self.static_dir = os.path.join(os.path.dirname(__file__), '..', 'static', 'generated')
#         os.makedirs(self.static_dir, exist_ok=True)

#     def generate(self, prompt, session_id=None, user_id=None):
#         try:
#             encoded_prompt = requests.utils.quote(prompt)
#             url = (
#                 f"https://image.pollinations.ai/prompt/{encoded_prompt}"
#                 f"?width=512&height=512&model=flux&nologo=true"
#             )

#             for attempt in range(3):
#                 try:
#                     response = requests.get(url, timeout=120)
#                     if response.status_code == 200:
#                         break
#                 except requests.exceptions.Timeout:
#                     if attempt == 2:
#                         return "Image generation timed out. Please try again."
#                     continue

#             if response.status_code != 200:
#                 return f"Image generation failed: {response.status_code}"

#             # check it's actually an image
#             content_type = response.headers.get('Content-Type', '')
#             if 'image' not in content_type:
#                 return f"Invalid response from image service: {content_type}"

#             existing_file = [
#                 f for f in os.listdir(self.static_dir)
#                 if f.startswith("image_") and f.endswith(".jpg")
#             ]
#             self.image_count = len(existing_file) + 1
#             filename = f"image_{self.image_count}.jpg"
#             filepath = os.path.join(self.static_dir, filename)
#             image_url = f"/static/generated/{filename}"

#             with open(filepath, 'wb') as f:
#                 f.write(response.content)

#             save_image(
#                 prompt=prompt,
#                 filename=filename,
#                 url=image_url,
#                 model_used="pollinations-flux",
#                 session_id=session_id,
#                 user_id=user_id
#             )

#             return image_url

#         except Exception as e:
#             print(f"[ImageGen ERROR] {e}")
#             return f"Image generation error: {str(e)}"