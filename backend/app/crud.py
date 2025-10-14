from sqlalchemy.orm import Session
from .models import Document, Tag, Annotation
from .schemas import DocumentCreate, TagCreate, AnnotationCreate
from typing import List, Optional

# Document CRUD
def create_document(db: Session, document: DocumentCreate):
    db_document = Document(**document.dict())
    db.add(db_document)
    db.commit()
    db.refresh(db_document)
    return db_document

def get_document(db: Session, document_id: str):
    return db.query(Document).filter(Document.id == document_id).first()

def get_documents(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Document).offset(skip).limit(limit).all()

def delete_document(db: Session, document_id: str):
    document = db.query(Document).filter(Document.id == document_id).first()
    if document:
        db.delete(document)
        db.commit()
    return document

# Tag CRUD
def create_tag(db: Session, tag: TagCreate):
    db_tag = Tag(**tag.dict())
    db.add(db_tag)
    db.commit()
    db.refresh(db_tag)
    return db_tag

def get_tags(db: Session):
    return db.query(Tag).all()

def get_tag(db: Session, tag_id: str):
    return db.query(Tag).filter(Tag.id == tag_id).first()

# Annotation CRUD
def create_annotation(db: Session, annotation: AnnotationCreate):
    db_annotation = Annotation(**annotation.dict())
    db.add(db_annotation)
    db.commit()
    db.refresh(db_annotation)
    return db_annotation

def get_annotations_by_document(db: Session, document_id: str):
    return db.query(Annotation).filter(Annotation.document_id == document_id).all()

def delete_annotation(db: Session, annotation_id: str):
    annotation = db.query(Annotation).filter(Annotation.id == annotation_id).first()
    if annotation:
        db.delete(annotation)
        db.commit()
    return annotation