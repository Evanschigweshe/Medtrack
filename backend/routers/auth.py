import os

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from database import get_db
from models import Facility
from auth import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["auth"])


class RegisterRequest(BaseModel):
    name: str = Field(min_length=2)
    username: str = Field(min_length=3)
    password: str = Field(min_length=6)
    email: str
    confirm_password: str


class LoginRequest(BaseModel):
    username: str
    password: str


class ResetPasswordRequest(BaseModel):
    username: str
    reset_code: str
    new_password: str = Field(min_length=6)
    confirm_password: str


@router.post("/register")
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    if payload.password != payload.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")

    existing = db.query(Facility).filter(
        Facility.username == payload.username
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    existing_email = db.query(Facility).filter(
        Facility.email == payload.email
    ).first()

    if existing_email:
        raise HTTPException(status_code=400, detail="Email already exists")

    facility = Facility(
        name=payload.name,
        username=payload.username,
        password_hash=hash_password(payload.password),
        email=payload.email,
        
    )

    db.add(facility)
    db.commit()
    db.refresh(facility)

    return {
        "message": "Account created successfully",
        "facility": {
            "id": facility.id,
            "name": facility.name,
            "username": facility.username,
        },
    }


@router.post("/login")
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    facility = db.query(Facility).filter(
        Facility.username == payload.username
    ).first()

    if not facility or not verify_password(payload.password, facility.password_hash):
        raise HTTPException(status_code=401, detail="Invalid username or password")

    token = create_access_token({
        "facility_id": facility.id,
        "facility_name": facility.name,
    })

    return {
        "access_token": token,
        "token_type": "bearer",
        "facility": {
            "id": facility.id,
            "name": facility.name,
            "username": facility.username,
        },
    }


@router.post("/reset-password")
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    reset_code = os.getenv("RESET_CODE", "MEDTRACK_RESET_2026")

    if payload.reset_code != reset_code:
        raise HTTPException(status_code=403, detail="Invalid reset code")

    if payload.new_password != payload.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")

    facility = db.query(Facility).filter(
        Facility.username == payload.username
    ).first()

    if not facility:
        raise HTTPException(status_code=404, detail="Account not found")

    facility.password_hash = hash_password(payload.new_password)

    db.commit()

    return {
        "message": "Password reset successfully"
    }