from concurrent.futures import ThreadPoolExecutor, TimeoutError
from langchain_core.messages import HumanMessage, AIMessage
from .config import Config
from .image import ImageGenerator


class ChatBot:
    def __init__(self):
        self.config = Config()
        self.llm = self.config.llm
        self.history = [self.config.system_message]
        self.is_processing = False
        self.image_gen = ImageGenerator()


    def _check_rate_limit(self):
        if self.is_processing:
            raise Exception("Please wait... AI is still responding")

    def _run_with_timeout(self, func, seconds, *args, **kwargs):
        with ThreadPoolExecutor(max_workers=1) as executor:
            future = executor.submit(func, *args, **kwargs)
            try:
                return future.result(timeout=seconds)
            except TimeoutError:
                raise Exception("Request timed out.")

    def ask(self  , message):
        return "".join(self.ask_stream(message))

    def ask_stream(self, message):
        try:
            self._check_rate_limit()
            self.is_processing = True

            self.history.append(HumanMessage(content=message))
            full_response = ""

            for chunk in self.llm.stream(self.history):
                if chunk.content:
                    full_response += chunk.content
                    yield chunk.content.replace('\n', '<br>')

            self.history.append(AIMessage(content=full_response))

        except Exception as e:
            self.history.clear()
            yield Config.handle_error(e)

        finally:
            self.is_processing = False

    def reset(self):
        self.history = [self.config.system_message]

<<<<<<< HEAD
    def generate_image(self, prompt, session_id=None, user_id=None):
        return self.image_gen.generate(prompt, session_id=session_id, user_id=user_id)
=======
    def generate_image(self, prompt):
        return self.image_gen.generate(prompt)
>>>>>>> cbabebc (merging chat-system with main project)





bot = ChatBot()


def ask_llm(message):
    return bot.ask(message)

def ask_llm_stream(message):
    return bot.ask_stream(message)

def reset_chat():
    return bot.reset()

def load_history(messages):        
    bot.history = [bot.config.system_message]
    for m in messages:
        if m["role"] == "user":
            bot.history.append(HumanMessage(content=m["content"]))
        elif m["role"] == "assistant":
            bot.history.append(AIMessage(content=m["content"]))

<<<<<<< HEAD
def generate_image(prompt, session_id=None, user_id=None):
    return bot.generate_image(prompt, session_id=session_id, user_id=user_id)
=======
def generate_image(prompt):
    return bot.generate_image(prompt)
>>>>>>> cbabebc (merging chat-system with main project)

def generate_title(message):
    try:
        prompt = f"Generate a short title (max 5 words) for this message:\n{message}"

        response = bot.llm.invoke([
            bot.config.system_message,
            HumanMessage(content=prompt)
        ])

        title = response.content.strip()
        return title

    except Exception as e:
        return "New Chat"