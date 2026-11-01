import datetime
import uuid
from fastapi import APIRouter, HTTPException, status, Depends
from app.schemas.user import UserRegister, UserLogin, UserResponse, TokenResponse
from app.database import users_col
from app.utils.security import hash_password, verify_password, create_access_token
from app.utils.auth_deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(user_in: UserRegister):
    """Register a new user account with hashed password and return JWT."""
    # Check if user already exists
    existing_user = users_col.find_one({"email": user_in.email.lower()})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )

    user_id = str(uuid.uuid4())
    now = datetime.datetime.now(datetime.timezone.utc).isoformat()
    new_user = {
        "_id": user_id,
        "full_name": user_in.full_name.strip(),
        "email": user_in.email.lower().strip(),
        "password": hash_password(user_in.password),
        "target_career_role": None,
        "learning_preferences": None,
        "created_at": now
    }
    users_col.insert_one(new_user)

    token = create_access_token({"sub": user_id, "email": new_user["email"]})
    user_response = UserResponse(
        id=user_id,
        full_name=new_user["full_name"],
        email=new_user["email"],
        target_career_role=new_user["target_career_role"],
        learning_preferences=new_user["learning_preferences"],
        created_at=new_user["created_at"]
    )
    return TokenResponse(access_token=token, user=user_response)

@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    """Authenticate user with email and password and return JWT."""
    user = users_col.find_one({"email": credentials.email.lower().strip()})
    if not user or not verify_password(credentials.password, user.get("password", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    user_id = user["_id"]
    token = create_access_token({"sub": user_id, "email": user["email"]})
    user_response = UserResponse(
        id=user_id,
        full_name=user["full_name"],
        email=user["email"],
        target_career_role=user.get("target_career_role"),
        learning_preferences=user.get("learning_preferences"),
        created_at=user.get("created_at")
    )
    return TokenResponse(access_token=token, user=user_response)

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    """Get profile information for current authenticated user."""
    return UserResponse(
        id=current_user["_id"],
        full_name=current_user["full_name"],
        email=current_user["email"],
        target_career_role=current_user.get("target_career_role"),
        learning_preferences=current_user.get("learning_preferences"),
        created_at=current_user.get("created_at")
    )
