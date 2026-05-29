import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from database import Base, engine
from routers import items, inventory, alerts

load_dotenv()
Base.metadata.create_all(bind=engine)

app = FastAPI(title="MedTrack API")

frontend_origin = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(items.router)
app.include_router(inventory.router)
app.include_router(alerts.router)

@app.get("/")
def health_check():
    return {"status": "ok", "app": "MedTrack API"}
