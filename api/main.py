from fastapi import FastAPI
from .routes import locations, measures, stations, sensors, readings

app = FastAPI()
app.include_router(locations.router)
app.include_router(measures.router)
app.include_router(stations.router)
app.include_router(sensors.router)
app.include_router(readings.router)


@app.get('/')
async def root():
    return {'msg': 'You will never be happy.'}

