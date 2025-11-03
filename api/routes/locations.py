from fastapi import APIRouter
from sqlalchemy import select
from ..database import SessionLocal
from ..models import Location

router = APIRouter(
    prefix='/locations',
    tags=['locations']
)

@router.get('/')
async def get_locations():
    dc = {'locations': []}
    session = SessionLocal()
    stmt = select(Location.street, Location.avenue, Location.zip_code)
    locs = session.execute(stmt).all() # TODO: Page results
    for loc in locs:
        l = {
            'street': loc.street,
            'avenue': loc.avenue,
            'zip_code': loc.zip_code
        }
        dc['locations'].append(l)
    dc['size'] = len(dc['locations'])
    return dc
    
