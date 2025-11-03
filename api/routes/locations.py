from fastapi import APIRouter
from sqlalchemy import select
from ..database import SessionLocal
from ..models import Location

from pydantic import BaseModel

router = APIRouter(
    prefix='/locations',
    tags=['locations']
)

@router.get('/')
async def get_locations():
    dc = {'locations': []}
    session = SessionLocal()
    stmt = select(Location)
    locs = session.execute(stmt) # TODO: Page results
    for loc in locs.scalars():
        l = {
            'id': loc.id,
            'street': loc.street,
            'avenue': loc.avenue,
            'zip_code': loc.zip_code
        }
        dc['locations'].append(l)
    dc['size'] = len(dc['locations'])
    session.close()
    return dc
    

class PostLocation(BaseModel):
    street: str
    avenue: str
    zip_code:str

@router.post('/')
async def create_location(location: PostLocation):
    session = SessionLocal()
    session.begin()
    session.add(Location(street=location.street, avenue=location.avenue, zip_code=location.zip_code))
    session.commit()
    session.close()
    return {'msg': 'Localização adicionada com sucesso.'}

