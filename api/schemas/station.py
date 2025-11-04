from pydantic import BaseModel

class PostStation(BaseModel):
    name: str
    installation_date: int
    location_id: int