from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

# ----------------------------
# Location
# ----------------------------
class Location(Base):
    __tablename__ = "locations"

    id = Column(Integer, primary_key=True, index=True)
    street = Column(String(200), nullable=True, index=True)
    avenue = Column(String(200), nullable=True, index=True)
    zip_code = Column(String(20), nullable=True, index=True)

    # Relationship: One location to many stations
    stations = relationship("Station", back_populates="location")


# ----------------------------
# Station
# ----------------------------
class Station(Base):
    __tablename__ = "stations"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, index=True)
    location_id = Column(Integer, ForeignKey("locations.id"), nullable=True, index=True)
    installation_date = Column(DateTime, server_default=func.now())
    is_active = Column(Boolean, default=True)

    # Relationships
    location = relationship("Location", back_populates="stations")
    sensor_devices = relationship("SensorDevice", back_populates="station")


# ----------------------------
# SensorDevice
# ----------------------------
class SensorDevice(Base):
    __tablename__ = "sensor_devices"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=True, index=True)
    installation_date = Column(DateTime, server_default=func.now())
    station_id = Column(Integer, ForeignKey("stations.id"), nullable=True, index=True)
    is_active = Column(Boolean, default=True)

    # Relationships
    station = relationship("Station", back_populates="sensor_devices")
    readings = relationship("Reading", back_populates="sensor_device")


# ----------------------------
# Measure
# ----------------------------
class Measure(Base):
    __tablename__ = "measures"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=True, index=True)

    # Relationships
    readings = relationship("Reading", back_populates="measure")


# ----------------------------
# Reading
# ----------------------------
class Reading(Base):
    __tablename__ = "readings"
    
    id = Column(Integer, primary_key=True, index=True)
    sensor_device_id = Column(Integer, ForeignKey("sensor_devices.id"), nullable=True, index=True)
    measure_id = Column(Integer, ForeignKey("measures.id"), nullable=True, index=True)
    value = Column(Float, nullable=True)

    # Relationships
    sensor_device = relationship("SensorDevice", back_populates="readings")
    measure = relationship("Measure", back_populates="readings")
