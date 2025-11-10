from pydantic import BaseModel

class PostReading(BaseModel):
    sensor_device_id: int
    measure_id: int
    value: float