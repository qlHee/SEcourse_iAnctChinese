from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..schemas import Document, DocumentCreate, DocumentWithAnnotations
from ..crud import create_document, get_documents, get_document, delete_document
from ..nlp_processor import nlp_processor

router = APIRouter(prefix="/api/documents", tags=["documents"])

@router.post("/", response_model=Document)
def create_new_document(document: DocumentCreate, db: Session = Depends(get_db)):
    return create_document(db, document)

@router.get("/", response_model=List[Document])
def read_documents(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    documents = get_documents(db, skip=skip, limit=limit)
    return documents

@router.get("/{document_id}", response_model=DocumentWithAnnotations)
def read_document(document_id: str, db: Session = Depends(get_db)):
    document = get_document(db, document_id)
    if document is None:
        raise HTTPException(status_code=404, detail="Document not found")
    return document

@router.delete("/{document_id}")
def delete_document_by_id(document_id: str, db: Session = Depends(get_db)):
    document = delete_document(db, document_id)
    if document is None:
        raise HTTPException(status_code=404, detail="Document not found")
    return {"message": "Document deleted successfully"}

@router.post("/{document_id}/segment")
def segment_document(document_id: str, db: Session = Depends(get_db)):
    document = get_document(db, document_id)
    if document is None:
        raise HTTPException(status_code=404, detail="Document not found")
    
    segments = nlp_processor.segment_text(document.content)
    return segments

@router.post("/{document_id}/auto-annotate")
def auto_annotate_document(document_id: str, db: Session = Depends(get_db)):
    document = get_document(db, document_id)
    if document is None:
        raise HTTPException(status_code=404, detail="Document not found")
    
    annotations = nlp_processor.auto_annotate(document.content)
    return annotations