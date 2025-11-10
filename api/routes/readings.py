from fastapi import APIRouter, HTTPException
from sqlalchemy import select
from ..database import SessionLocal
from ..models import Reading, SensorDevice, Measure 
from ..schemas.readings import PostReading  
from datetime import datetime  

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
    session.close()
    return dc

# --- rota para testes
@router.post('/')
async def post_reading(reading: PostReading):
    session = SessionLocal()
    session.begin() 

    sensor = session.get(SensorDevice, reading.sensor_device_id)
    if not sensor:
        session.close()
        raise HTTPException(
            status_code=404,
            detail=f"Sensor com id {reading.sensor_device_id} não encontrado."
        )
 
    measure = session.get(Measure, reading.measure_id)
    if not measure:
        session.close()
        raise HTTPException(
            status_code=404,
            detail=f"Medida com id {reading.measure_id} não encontrada."
        )

   
    new_reading = Reading(
        sensor_device_id=reading.sensor_device_id,
        measure_id=reading.measure_id,
        value=reading.value,
        time=datetime.now()  
    )
    
    session.add(new_reading)
    session.commit()
    session.close()
    
    return {'msg': 'Leitura de teste adicionada com sucesso.'}