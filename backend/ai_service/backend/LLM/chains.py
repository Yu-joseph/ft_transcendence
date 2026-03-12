from concurrent.futures import ThreadPoolExecutor, TimeoutError
from langchain_core.messages import HumanMessage, AIMessage
from .config import Config
from .image import ImageGenerator


class TimeoutException(Exception):
    pass


class ChatBot:
    def __init__(self):
        self.config = Config()
        self.llm = self.config.llm
        self.history = [self.config.system_message]
        self.is_processing = False
        self.image_gen = ImageGenerator()

        print(self.history)

    def _check_rate_limit(self):
        if self.is_processing:
            raise Exception("Please wait... AI is still responding")

    def _run_with_timeout(self, func, seconds, *args, **kwargs):
        with ThreadPoolExecutor(max_workers=1) as executor:
            future = executor.submit(func, *args, **kwargs)
            try:
                return future.result(timeout=seconds)
            except TimeoutError:
                raise TimeoutException("Request timed out.")

    def ask(self, message):
        try:
            self._check_rate_limit()
            self.is_processing = True

            self.history.append(HumanMessage(content=message))

            response = self._run_with_timeout(
                self.llm.invoke,
                15,
                self.history
            )

            self.history.append(AIMessage(content=response.content))

            return response.content

        except Exception as e:
            self.history.clear()
            return Config.handle_error(e)

        finally:
            self.is_processing = False

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

    def generate_image(self, prompt):
        return self.image_gen.generate(prompt)


# Create single instance
_bot = ChatBot()


# Functions for app.py (backward compatible)
def ask_llm(message):
    return _bot.ask(message)

def ask_llm_stream(message):
    return _bot.ask_stream(message)

def reset_chat():
    return _bot.reset()

def generate_image(prompt):
    return _bot.generate_image(prompt)
