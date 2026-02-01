from pydantic import BaseModel, Field
from typing import Optional, List

class UserSignup(BaseModel):
    uid: str
    name: str
    gender: str
    age: int
    residence: str
    phone: str

class LegacyUserCreate(BaseModel):
    name: str
    gender: str
    vouched_by: str  # The UID of the first family member adding them

class RelationRequest(BaseModel):
    target_uid: str
    relation_type: str  # FATHER, MOTHER, SPOUSE, CHILD