from fastapi import APIRouter, HTTPException
from sqlalchemy import select
from ..database import SessionLocal
from ..models import SensorDevice, Station
from pydantic import BaseModel
from datetime import datetime

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
    session.close()
    return dc

class PostSensor(BaseModel):
    name: str
    installation_date: int | None = None
    station_id: int

@router.post('/')
async def post_sensor(sensor: PostSensor):
    session = SessionLocal()
    station = session.get(Station, sensor.station_id)
    if not station:
        session.close()
        raise HTTPException(
            status_code=404,
            detail=f"Não existe estação com id {sensor.station_id}"
        )
    if not sensor.installation_date:
        installation_date = station.installation_date
    else:
        installation_date = datetime.fromtimestamp(sensor.installation_date)

    session.add(SensorDevice(name=sensor.name, installation_date=installation_date, station_id=sensor.station_id, is_active=True))
    session.commit()
    session.close()
    return {'msg': 'Sensor criado com sucesso.'}

