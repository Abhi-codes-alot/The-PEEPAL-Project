from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from database import db
from enum import Enum 

class RelationType(str, Enum):
    FATHER = "FATHER"
    MOTHER = "MOTHER"
    SPOUSE = "SPOUSE"
    CHILD = "CHILD"

class GenderType(str, Enum):
    MALE = "Male"
    FEMALE = "Female"
    OTHER = "Other"

class FamilyCreateRequest(BaseModel):
    creator_uid: str
    family_name: str
    member_uids: List[str]

app = FastAPI(title="Peepal Project: Family Genealogy API")

origins = [
    "http://localhost:5173",   
    "http://127.0.0.1:5173",  
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,      # Use the specific list instead of "*"
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- DATA MODELS ---
class UserSignup(BaseModel):
    uid: str
    name: str
    gender: GenderType  # Added dropdown for Gender too!
    age: int
    residence: str
    phone: str

class RelationRequest(BaseModel):
    subject_uid: str
    target_uid: str
    relation_type: RelationType # Use the Enum here (ONE DEFINITION ONLY)

class LegacyCreate(BaseModel):
    name: str
    gender: GenderType
    vouched_by: str

# --- AUTH & ONBOARDING ---

@app.post("/auth/signup", status_code=status.HTTP_201_CREATED)
async def signup(user: UserSignup):
    try:
        db.create_user_profile(user.dict())
        return {"status": "pending_verification", "message": "Profile created."}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/auth/verify")
async def verify(uid: str, code: str):
    db.set_user_active(uid)
    return {"status": "active", "message": "Welcome to your Dashboard."}

# --- DASHBOARD ACTIONS ---

@app.get("/dashboard/tree/{uid}")
async def get_tree(uid: str):
    tree = db.get_family_tree(uid)
    if not tree:
        raise HTTPException(status_code=404, detail="User not found.")
    return tree

@app.post("/dashboard/relate")
async def add_relationship(req: RelationRequest):
    if not db.user_exists(req.target_uid):
        raise HTTPException(status_code=404, detail="Target user does not exist.")
    
    # .value is correct here because req.relation_type is now an Enum!
    msg = db.create_relationship(req.subject_uid, req.target_uid, req.relation_type.value)
    return {"status": "success", "message": msg}

# --- LEGACY & VOUCHING ---

@app.post("/legacy/create")
async def create_legacy(data: LegacyCreate):
    legacy_id = db.add_legacy_member(data.name, data.gender.value, data.vouched_by)
    return {"legacy_id": legacy_id, "vouch_count": 1, "verified": False}

@app.post("/legacy/vouch")
async def vouch(legacy_id: str, voter_uid: str):
    is_verified = db.add_vouch(legacy_id, voter_uid)
    return {"verified": is_verified, "message": "Vouch recorded."}

@app.post("/family/create")
async def create_family(req: FamilyCreateRequest):
    """Logic for Feature #4: Create a Family"""
    try:
        f_id = db.create_family_group(req.creator_uid, req.family_name, req.member_uids)
        return {"status": "success", "family_id": f_id}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/dashboard/relations/{uid}/{rel_type}")
async def find_relations(uid: str, rel_type: str):
    """Feature: Find all relations of a specific type"""
    # Mapping friendly names to DB labels
    mapping = {
        "Fathers": "FATHER_OF",
        "Mothers": "MOTHER_OF",
        "Children": "CHILD_OF",
        "Spouses": "SPOUSE_OF"
    }
    label = mapping.get(rel_type)
    if not label:
        raise HTTPException(status_code=400, detail="Invalid filter type.")
        
    relations = db.get_relations_by_type(uid, label)
    return relations