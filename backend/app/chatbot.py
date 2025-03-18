from fastapi import APIRouter, Body, Depends
from uuid import uuid4
import ollama
from app.mood_crisis_data import CRISIS_WORDS, DETECT_MOOD
from app.chat_history import store_chat, get_chat_history, create_new_conversation
from app.auth import get_current_user

router = APIRouter()

system_prompt = """
You are an empathetic mental health chatbot. Your role is to listen, support, and provide self-help strategies. 
You do NOT provide medical advice. If a user is in crisis, encourage them to seek professional help. Moreover, don't return your thinking part just return response.
"""

def get_chat_response(user_message, max_tokens=1000, temperature=0.7):
    messages = [{"role": "system", "content": system_prompt}, {"role": "user", "content": user_message}]
    response = ollama.chat(model="deepseek-r1", messages=messages, options={"max_tokens": max_tokens, "temperature": temperature})
    return response["message"]["content"]

def detect_mood(user_message):
    """
    Detects mood based on keywords in the user's message.
    DETECT_MOOD is a dictionary mapping mood keywords to a mood type.
    """
    for mood, keywords in DETECT_MOOD.items():
        if any(word in user_message.lower() for word in keywords):
            return mood
    return None  

@router.post("/")
async def chat(
    user_message: str = Body(..., embed=True),
    conversation_id: str = Body(None, embed=True),
    user_id: int = Depends(get_current_user)
):
    is_crisis = any(word in user_message.lower() for word in CRISIS_WORDS)
    mood = detect_mood(user_message) 

    if not conversation_id:
        conversation_id = str(uuid4())
        create_new_conversation(user_id, conversation_id)

    if is_crisis:
        response_text = "Please seek professional help. You're not alone ❤️."
    else:
        response_text = get_chat_response(user_message)

    store_chat(user_id, conversation_id, user_message, response_text, mood, is_crisis)

    return {"response": response_text, "conversation_id": conversation_id, "mood": mood}

@router.get("/history")
async def chat_history(limit: int = 10, user_id: int = Depends(get_current_user)):
    history = get_chat_history(user_id, limit)
    conversations = {}

    for row in history:
        conversation_id, user_message, bot_response, mood, is_crisis, timestamp = row
        if conversation_id not in conversations:
            conversations[conversation_id] = {
                "id": conversation_id,
                "messages": [],
                "timestamp": timestamp,
            }
        conversations[conversation_id]["messages"].append({
            "id": str(uuid4()),
            "user_message": user_message,
            "bot_response": bot_response,
            "mood": mood,
            "timestamp": timestamp,
            "is_crisis": is_crisis, 
        })
    
    return {"history": list(conversations.values())}
