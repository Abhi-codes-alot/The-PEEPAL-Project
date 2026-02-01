import os
from neo4j import GraphDatabase
from dotenv import load_dotenv

load_dotenv()

class PeepalDatabase:
    def __init__(self):
        # Using the verified Bolt protocol for local Windows setup
        self.driver = GraphDatabase.driver(
            os.getenv("NEO4J_URI"), 
            auth=(os.getenv("NEO4J_USER"), os.getenv("NEO4J_PASSWORD"))
        )

    def close(self):
        self.driver.close()

    # --- USER LOGIC ---
    def create_user_profile(self, user_data):
        with self.driver.session() as session:
            query = """
            MERGE (p:Person {uid: $uid})
            SET p.name = $name, p.gender = $gender, p.age = $age, 
                p.residence = $residence, p.phone = $phone, p.status = 'INACTIVE'
            """
            session.run(query, **user_data)

    def set_user_active(self, uid):
        with self.driver.session() as session:
            session.run("MATCH (p:Person {uid: $uid}) SET p.status = 'ACTIVE'", uid=uid)

    def user_exists(self, uid):
        with self.driver.session() as session:
            result = session.run("MATCH (p:Person {uid: $uid}) RETURN p", uid=uid)
            return result.single() is not None

    # --- RELATIONSHIP LOGIC ---
    def create_relationship(self, sub_id, tar_id, rel_type):
        with self.driver.session() as session:
         if rel_type == "FATHER":
            # Parent -> Child AND Child -> Parent
            query = """
            MATCH (p:Person {uid: $sub}), (c:Person {uid: $tar})
            MERGE (p)-[:FATHER_OF]->(c)
            MERGE (c)-[:CHILD_OF]->(p)
            """
         elif rel_type == "MOTHER":
            query = """
            MATCH (p:Person {uid: $sub}), (c:Person {uid: $tar})
            MERGE (p)-[:MOTHER_OF]->(c)
            MERGE (c)-[:CHILD_OF]->(p)
            """
         elif rel_type == "SPOUSE":
            # Bidirectional link
            query = """
            MATCH (p1:Person {uid: $sub}), (p2:Person {uid: $tar})
            MERGE (p1)-[:SPOUSE_OF]->(p2)
            MERGE (p2)-[:SPOUSE_OF]->(p1)
            """
         elif rel_type == "CHILD":
            # Subject is Child, Target is Parent
            query = """
            MATCH (c:Person {uid: $sub}), (p:Person {uid: $tar})
            MERGE (c)-[:CHILD_OF]->(p)
            MERGE (p)-[:PARENT_OF]->(c)
            """
         else:
            return "Invalid relationship type."

         session.run(query, sub=sub_id, tar=tar_id)
         return f"Reciprocal {rel_type} relation established."

# --- Add this new method for the "Find Relation" feature ---
    def get_relations_by_type(self, uid, rel_label):
        with self.driver.session() as session:
        # rel_label will be like 'FATHER_OF', 'CHILD_OF', etc.
            query = f"MATCH (p:Person {{uid: $uid}})-[:{rel_label}]->(relative:Person) RETURN relative.name AS name, relative.uid AS uid"
            result = session.run(query, uid=uid)
            return [dict(record) for record in result]
    # --- LEGACY LOGIC ---
    def add_legacy_member(self, name, gender, voter_uid):
        with self.driver.session() as session:
            query = """
            CREATE (p:Person:Legacy {
                uid: randomUUID(), name: $name, gender: $gender,
                vouch_count: 1, vouched_by: [$voter], verified: false
            })
            RETURN p.uid AS l_id
            """
            result = session.run(query, name=name, gender=gender, voter=voter_uid)
            return result.single()["l_id"]

    def add_vouch(self, legacy_id, voter_uid):
        with self.driver.session() as session:
            query = """
            MATCH (p:Legacy {uid: $l_id})
            WHERE NOT $voter IN p.vouched_by
            SET p.vouched_by = p.vouched_by + $voter, p.vouch_count = p.vouch_count + 1
            SET p.verified = (p.vouch_count >= 3)
            RETURN p.verified AS status
            """
            result = session.run(query, l_id=legacy_id, voter=voter_uid)
            return result.single()["status"]
    def get_family_tree(self, uid):
        with self.driver.session() as session:
            # This query finds the person, then optionally finds their parents and children
            query = """
            MATCH (p:Person {uid: $uid})
            OPTIONAL MATCH (parent:Person)-[:FATHER_OF|MOTHER_OF|PARENT_OF]->(p)
            OPTIONAL MATCH (p)-[:FATHER_OF|MOTHER_OF|PARENT_OF]->(child:Person)
            RETURN 
                p.name AS name, 
                p.status AS status,
                collect(DISTINCT parent.name) AS parents, 
                collect(DISTINCT child.name) AS children
            """
            result = session.run(query, uid=uid)
            record = result.single()
            
            if not record or not record["name"]:
                return None
                
            return {
                "name": record["name"],
                "status": record["status"],
                "parents": record["parents"],
                "children": record["children"]
            }
def create_family_group(self, creator_uid, family_name, member_uids):
    with self.driver.session() as session:
        # 1. Create the Family node
        # 2. Link the members to it
        query = """
        CREATE (f:Family {fid: randomUUID(), name: $name, created_at: timestamp()})
        WITH f
        MATCH (p:Person) WHERE p.uid IN $members
        MERGE (p)-[:MEMBER_OF]->(f)
        RETURN f.fid AS family_id
        """
        result = session.run(query, name=family_name, members=member_uids + [creator_uid])
        return result.single()["family_id"]

def get_family_members(self, uid):
    with self.driver.session() as session:
        # Finds all people who share a 'Family' node with the user
        query = """
        MATCH (me:Person {uid: $uid})-[:MEMBER_OF]->(f:Family)<-[:MEMBER_OF]-(member:Person)
        RETURN member.uid AS uid, member.name AS name
        """
        result = session.run(query, uid=uid)
db = PeepalDatabase()