import paho.mqtt.client as mqtt
from paho.mqtt.enums import MQTTProtocolVersion
import json
from time import sleep
from database import engine, SessionLocal
from models import Base, Reading
import os
from time import sleep
from datetime import datetime

print("Sleeping for 10 seconds to wait for db setup...")
sleep(10)

print("Creating ORM SQL Tables..")
Base.metadata.create_all(bind=engine)
print("Tables created successfully.")


def on_connect(client, userdata, flags, reason_code, properties):
    print(f"Conectado: {reason_code}")
    # Me inscrevo em todos os tópicos sobre clima
    client.subscribe("weather/#")

# TODO: Avisar o time do ESP para usar este formato:
# Tópico MQTT: /weather/<stationid>
# Corpo:
# {
#   "sensor": <sensor device id>,
#   "unit": <measure id>",
#   "reading_values: [
#        <valor da medida, pode ser inteiro ou decimal>,
#       . . .
#    ],
#   "reading_timestamps": [
#        <timestamp das medidas>,
#       . . .
#    ]
# }
# Simplesmente imprime a mensagem como texto.
def on_message(client, userdata, msg):
    payload = json.loads(msg.payload)
    topic = msg.topic.split('/')[-1]
    if topic.isnumeric():
        stationId = int(topic)
    else:
        stationId = None

    try:
        sensor = int(payload["sensor"])
        measure = int(payload["unit"])
        readings = []
        # É para reading_values e reading_timestamps terem o mesmo tamanho,
        # Mas não dá para saber.
        for i in range(0, min(len(payload["reading_values"]), len(payload["reading_timestamps"]))):
            readings.append({
                "value": float(payload["reading_values"][i]),
                "timestamp": int(payload["reading_timestamps"][i])
            })

    except:
        print(f"ERRO! Leitura mal formatada {payload}")
        return

    session = SessionLocal()
    session.begin()
    for reading in readings:
        print(reading)
        session.add(Reading(sensor_device_id=stationId, measure_id=measure, value=reading['value'], time=datetime.fromtimestamp(reading['timestamp'],)))
    session.commit()
    session.close()

try:
    user_name = os.environ["MQTT_CLIENT_USER"]
    user_pass = os.environ["MQTT_CLIENT_PASSWORD"]
except KeyError:
    print("credentials not supplied in environment variables. Going unauthenticated...")
    user_name = None
    user_pass = None

mqttc = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2, protocol=MQTTProtocolVersion.MQTTv5)
mqttc.on_connect = on_connect
mqttc.on_message = on_message
mqttc.username_pw_set(user_name, user_pass)

connected = False

while(not connected):
    try:
        mqttc.connect("mosquitto", 1883, 60, '', 0, True)
        connected = True
    except ConnectionRefusedError:
        print("Failed to connect. Retrying...")
        sleep(5)

mqttc.loop_forever()
