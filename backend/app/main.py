from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.chatbot import router as chatbot_router
from app.auth import router as auth_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chatbot_router, prefix="/chat", tags=["Chatbot"])
app.include_router(auth_router, prefix="/auth", tags=["Authentication"])
@app.get("/")
async def root():
    return {"message": "Welcome to SereniMind – Your AI Companion for Calm, Clarity, and Support."}
