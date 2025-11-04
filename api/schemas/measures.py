from pydantic import BaseModel

class PostMeasure(BaseModel):
    name: str
    unit_code: str