from fastapi import APIRouter
from sqlalchemy import select
from ..database import SessionLocal
from ..models import SensorDevice

router = APIRouter(
    prefix='/sensors',
    tags=['sensors']
)

@router.get('/')
async def get_sensors():
    dc = {'sensors': []}
    session = SessionLocal()
    stmt = select(SensorDevice)
    devices = session.execute(stmt)
    for device in devices.scalars():
         dev = {
             'id': device.id,
             'name': device.name,
             'installation_date': device.installation_date,
             'station_id': device.station_id,
             'is_active': device.is_active
             }
         dc['sensors'].append(dev)
    dc['size'] = len(dc['sensors'])
    return dc
