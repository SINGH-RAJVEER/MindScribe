from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
import jwt
import bcrypt
import datetime
import sqlite3  
from app.config import SECRET_KEY, ALGORITHM
from app.database import cursor, conn
from app.models import UserRegister, UserLogin

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def create_jwt_token(data: dict):
    payload = data.copy()
    payload.update({"exp": datetime.datetime.utcnow() + datetime.timedelta(hours=24)})
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("user_id")
        if user_id is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
        return user_id
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

@router.post("/register")
async def register(user: UserRegister):
    try:
        cursor.execute("SELECT id FROM users WHERE email = ?", (user.email,))
        existing_user = cursor.fetchone()
        if existing_user:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

        hashed_password = bcrypt.hashpw(user.password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

        cursor.execute("INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
                       (user.username, user.email, hashed_password))
        conn.commit()
        return {"message": "User registered successfully"}
    
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already exists")
    
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.post("/login")
async def login(user_data: UserLogin):
    """
    Login endpoint that accepts JSON { "email": "user@example.com", "password": "mypassword" }
    """
    try:
        # Fetch user by email
        cursor.execute("SELECT id, username, password FROM users WHERE email = ?", (user_data.email,))
        user = cursor.fetchone()
        
        if not user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

        user_id, username,stored_password = user

        if not bcrypt.checkpw(user_data.password.encode("utf-8"), stored_password.encode("utf-8")):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

        token = create_jwt_token({"user_id": user_id})

        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {"id": user_id, "username": username,"email": user_data.email} 
        }
    
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
