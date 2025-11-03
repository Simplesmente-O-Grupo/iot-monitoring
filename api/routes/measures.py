from fastapi import APIRouter
from sqlalchemy import select
from ..database import SessionLocal
from ..models import Measure
from pydantic import BaseModel

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
    session.close()
    return dc

class PostMeasure(BaseModel):
    name: str
    unit_code: str

@router.post('/')
async def post_measure(measure: PostMeasure):
    session = SessionLocal()
    session.begin()
    session.add(Measure(name=measure.name, unit_code=measure.unit_code))
    session.commit()
    session.close()
    return {'msg': 'Unidade adicionada com sucesso.'}
