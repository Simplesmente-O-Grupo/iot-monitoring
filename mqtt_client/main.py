import paho.mqtt.client as mqtt
from paho.mqtt.enums import MQTTProtocolVersion
import json
from time import sleep

def on_connect(client, userdata, flags, reason_code, properties):
    print(f"Conectado: {reason_code}")
    # Me inscrevo em todos os tópicos sobre clima
    client.subscribe("weather/#")

# Simplesmente imprime a mensagem como texto.
def on_message(client, userdata, msg):
    payload = json.loads(msg.payload)
    print(msg.topic)
    print(f"Value: {payload["value"]}")
    print(f"Unit: {payload["unit"]}")
    print(f"Timestamp: {payload["timestamp"]}")

mqttc = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2, protocol=MQTTProtocolVersion.MQTTv5)
mqttc.on_connect = on_connect
mqttc.on_message = on_message
mqttc.username_pw_set('tester', 'rosebud')

connected = False

while(not connected):
    try:
        mqttc.connect("127.0.0.1", 1883, 60, '', 0, True)
        connected = True
    except ConnectionRefusedError:
        print("Failed to connect. Retrying...")
        sleep(5)

mqttc.loop_forever()
