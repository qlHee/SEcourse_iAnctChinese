from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..schemas import Tag, TagCreate
from ..crud import create_tag, get_tags

router = APIRouter(prefix="/api/tags", tags=["tags"])

@router.post("/", response_model=Tag)
def create_new_tag(tag: TagCreate, db: Session = Depends(get_db)):
    return create_tag(db, tag)

@router.get("/", response_model=List[Tag])
def read_tags(db: Session = Depends(get_db)):
    return get_tags(db)