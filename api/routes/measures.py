from fastapi import APIRouter
from sqlalchemy import select
from ..database import SessionLocal
from ..models import Measure

router = APIRouter(
    prefix='/measures',
    tags=['measures']
)

@router.get('/')
async def get_measures():
    dc = {'measures': []}
    session = SessionLocal()
    stmt = select(Measure)
    measures = session.execute(stmt)
    for measure in measures.scalars():
        mem = {
            'id': measure.id,
            'name': measure.name,
            'unit_code': measure.unit_code
        }
        dc['measures'].append(mem)
    dc['size'] = len(dc['measures'])
    return dc
