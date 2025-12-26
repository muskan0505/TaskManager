from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List

from database import engine, SessionLocal
from models import Task
import models

# -------------------- DB INIT --------------------

models.Base.metadata.create_all(bind=engine)

# -------------------- APP INIT --------------------

app = FastAPI()

# -------------------- CORS (IMPORTANT FOR REACT) --------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],        # allow all for now (safe for demo)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------- DB DEPENDENCY --------------------

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# -------------------- SCHEMAS --------------------

class TaskCreate(BaseModel):
    id: int
    title: str
    completed: bool = False

class TaskResponse(BaseModel):
    id: int
    title: str
    completed: bool

    class Config:
        orm_mode = True   # VERY IMPORTANT for SQLAlchemy

# -------------------- ROUTES --------------------

@app.get("/")
def root():
    return {"message": "Task Manager with SQLite running"}

@app.get("/tasks", response_model=List[TaskResponse])
def get_tasks(db: Session = Depends(get_db)):
    return db.query(Task).all()

@app.post("/tasks", response_model=TaskResponse)
def add_task(task: TaskCreate, db: Session = Depends(get_db)):
    new_task = Task(
        id=task.id,
        title=task.title,
        completed=task.completed,
    )
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    return new_task

@app.delete("/tasks/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    db.delete(task)
    db.commit()
    return {"message": "Task deleted"}

@app.put("/tasks/{task_id}", response_model=TaskResponse)
def toggle_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    task.completed = not task.completed
    db.commit()
    db.refresh(task)
    return task
