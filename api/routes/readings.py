from fastapi import APIRouter
from sqlalchemy import select
from ..database import SessionLocal
from ..models import Reading

router = APIRouter(
    prefix='/readings',
    tags=['readings']
)

@router.get('/')
async def get_readings():
    dc = {'readings': []}
    session = SessionLocal()
    stmt = select(Reading)
    readings = session.execute(stmt)
    for reading in readings.scalars():
        re = {
            'id': reading.id,
            'sensor_device_id': reading.sensor_device_id,
            'measure_id': reading.measure_id,
            'value': reading.value,
            'time': reading.time
        }
        dc['readings'].append(re)
    dc['size'] = len(dc['readings'])
    return dc

