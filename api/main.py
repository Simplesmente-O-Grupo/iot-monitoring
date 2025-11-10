from fastapi import FastAPI
from .routes import locations, measures, stations, sensors, readings
from fastapi.middleware.cors import CORSMiddleware  

app = FastAPI()

 
origins = [
    "http://localhost:5173", # A porta do frontend React
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"], 
)
# ------------------------------------

app.include_router(locations.router)
app.include_router(measures.router)
app.include_router(stations.router)
app.include_router(sensors.router)
app.include_router(readings.router)


@app.get('/')
async def root():
    return {'msg': 'You will never be happy.'}