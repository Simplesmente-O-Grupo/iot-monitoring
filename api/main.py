from fastapi import FastAPI
from .routes import locations

app = FastAPI()
app.include_router(locations.router)


@app.get('/')
async def root():
    return {'msg': 'You will never be happy.'}

