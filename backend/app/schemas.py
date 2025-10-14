from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class TagBase(BaseModel):
    name: str
    color: str
    description: Optional[str] = None

class TagCreate(TagBase):
    pass

class Tag(TagBase):
    id: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class DocumentBase(BaseModel):
    title: str
    content: str

class DocumentCreate(DocumentBase):
    pass

class Document(DocumentBase):
    id: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class AnnotationBase(BaseModel):
    start_pos: int
    end_pos: int
    text: str
    tag_id: str
    note: Optional[str] = None

class AnnotationCreate(AnnotationBase):
    document_id: str

class Annotation(AnnotationBase):
    id: str
    document_id: str
    created_at: datetime
    tag: Tag  # 包含标签信息
    
    class Config:
        from_attributes = True

class DocumentWithAnnotations(Document):
    annotations: List[Annotation] = []

class SegmentResult(BaseModel):
    text: str
    start: int
    end: int
    pos: Optional[str] = None  # 词性标注