from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

class ChatRequest(BaseModel):
    message: str

client = Groq(
    api_key=os.environ.get("GROQ_API_KEY"),
)

@router.post("/chat")
async def chat_with_groq(request: ChatRequest):
    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful AI assistant for the Gangas-River flood management system. You help citizens with flood alerts, safe routes, and reporting incidents. Keep your answers concise and helpful."
                },
                {
                    "role": "user",
                    "content": request.message,
                }
            ],
            model="llama3-8b-8192",
            temperature=0.7,
            max_tokens=150,
            top_p=1,
            stream=False,
            stop=None,
        )
        return {"reply": chat_completion.choices[0].message.content}
    except Exception as e:
        print(f"Groq Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
