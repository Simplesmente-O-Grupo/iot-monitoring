from fastapi import APIRouter, HTTPException
from sqlalchemy import select
from ..database import SessionLocal
from ..models import Station, SensorDevice, Location
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(
    prefix='/stations',
    tags=['stations']
)

@router.get('/')
async def get_stations():
    dc = {'stations': []}
    session = SessionLocal()
    stmt = select(Station)
    stations = session.execute(stmt)
    for station in stations.scalars():
        stmt_devices = select(SensorDevice.id).where(SensorDevice.station_id == station.id)
        ids_res = session.execute(stmt_devices).all()
        ids = []
        for id in ids_res:
            ids.append(id.id)
        stat = {
            'id': station.id,
            'name': station.name,
            'installation_date': station.installation_date,
            'location_id': station.location_id,
            'is_active': station.is_active,
            'sensor_device_ids': ids
        }
        dc['stations'].append(stat)
    dc['size'] = len(dc['stations'])
    session.close()
    return dc

class PostStation(BaseModel):
    name: str
    installation_date: int
    location_id: int

@router.post('/')
async def post_station(station: PostStation):
    session = SessionLocal()
    session.begin()
    location = session.get(Location, station.location_id)
    if not location:
        session.close()
        raise HTTPException(
            status_code=404,
            detail=f"Location {station.location_id} não encontrada."
        )
    session.add(Station(name=station.name, installation_date=datetime.fromtimestamp(station.installation_date), location_id=station.location_id, is_active=True))
    session.commit()
    session.close()
    return {'msg': 'Estação adicionada com sucesso.'}
