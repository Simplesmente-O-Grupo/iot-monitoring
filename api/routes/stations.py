from fastapi import APIRouter
from sqlalchemy import select
from ..database import SessionLocal
from ..models import Station

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
