from pydantic import BaseModel

class PostLocation(BaseModel):
    street: str
    avenue: str
    zip_code:str