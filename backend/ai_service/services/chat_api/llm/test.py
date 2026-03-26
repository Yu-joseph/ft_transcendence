from concurrent.futures import ThreadPoolExecutor
from langchain_core.messages import HumanMessage , AIMessage
from .config import Config
from .image import ImageGenerator




# class TimeoutException(Exception):
#     pass

class Chatbot():
    def __init__(self):
        self.config = Config()
        self.llm = self.config.llm
        self.history = [self.config.system_message]
        self.is_processing = False
        self.image_gen = ImageGenerator()

    def     _check_rate_limit(self):
        if self.is_processing == True:
            raise Exception("Please wait... AI is still responding")
        
    def _run_with_timeout(self , func  , seconds , *args , **kwargs ):
        with ThreadPoolExecutor(max_workers=1) as executor:
            future =  executor.submit(func , *args , **kwargs)
            try:
                return future.result(timeout=seconds)
            except TimeoutError:
                raise Exception("Request timed out")
            
    
    def ask(self , message):
        try:
            self._check_rate_limit()
            self.is_processing = True

            self.history.append(HumanMessage(content=message))

            responce = self._run_with_timeout(self.llm.invoke , 15 , self.history)

            self.history.append(AIMessage(content=responce.content))
            return responce.content
        except Exception as e:
            self.history.clear() ### --
            return Config.handle_error(e)
        

    def ask_stream(self , message):
        try:

            self._check_rate_limit()
            self.is_processing = True

            self.history.append(HumanMessage(content=message))

            full_response = ""
            for chunk  in self.llm.stream(self.history):
                if chunk.content:
                    # print(chunk.content)
                    full_response += chunk.content
                    yield chunk.content.replace('\n' , '<br>')

        except Exception as e:
            self.history.clear()
            yield Config.handle_error()
        
        finally:
            self.is_processing = False
        

    def reset(self):
        self.history = [self.config.system_message]

    def generate_image(self  , prompt):
        return self.image_gen.generate(prompt)








bot = Chatbot()

while True:
    user_input = input("ask AI : ")
    bot.ask_stream(user_input)
    # response = bot.ask_stream(user_input)
    # print(f"AI  :  {response}")