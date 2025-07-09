from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import get_connection
from .models import create_payments_table, create_students_table
from .routes import router


@asynccontextmanager
async def lifespan(app):
    create_students_table()
    yield


@asynccontextmanager
async def lifespan(app):
    create_payments_table()
    yield


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"message": "Welcome to the FastAPI OracleDB backend!"}


@app.get("/test-db")
def test_db():
    try:
        conn = get_connection()
        conn.close()
        return {"status": "success", "message": "Connected to OracleDB successfully."}
    except Exception as e:
        return {"status": "error", "message": str(e)}


app.include_router(router)
