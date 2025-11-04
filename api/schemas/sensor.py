from pydantic import BaseModel

class PostSensor(BaseModel):
    name: str
    installation_date: int | None = None
    station_id: int