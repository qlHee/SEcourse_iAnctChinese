from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..schemas import Annotation, AnnotationCreate
from ..crud import create_annotation, get_annotations_by_document, delete_annotation

router = APIRouter(prefix="/api/annotations", tags=["annotations"])

@router.post("/", response_model=Annotation)
def create_new_annotation(annotation: AnnotationCreate, db: Session = Depends(get_db)):
    return create_annotation(db, annotation)

@router.get("/document/{document_id}", response_model=list[Annotation])
def read_document_annotations(document_id: str, db: Session = Depends(get_db)):
    return get_annotations_by_document(db, document_id)

@router.delete("/{annotation_id}")
def delete_annotation_by_id(annotation_id: str, db: Session = Depends(get_db)):
    annotation = delete_annotation(db, annotation_id)
    if annotation is None:
        raise HTTPException(status_code=404, detail="Annotation not found")
    return {"message": "Annotation deleted successfully"}