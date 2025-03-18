from pydantic import BaseModel,EmailStr
from typing import Optional


class UserRegister(BaseModel):
    username: str
    email: EmailStr
    password: str
    
class ChatRequest(BaseModel):
    user_message: str
    response_format: Optional[str] = "text"
    
class UserLogin(BaseModel):
    email: EmailStr
    password: str
