from fastapi import FastAPI
from pydantic import BaseModel 
from llm import Chatbot


APP = FastAPI()
bot = Chatbot()


class Request(BaseModel):
    message: str


@APP.post("/chat")
def chat(req : Request):
    response = bot.ask(req.message)
    return {"response" : response}