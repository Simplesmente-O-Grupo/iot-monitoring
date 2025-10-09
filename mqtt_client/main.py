import paho.mqtt.client as mqtt
import json

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

mqttc = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
mqttc.on_connect = on_connect
mqttc.on_message = on_message

mqttc.connect("127.0.0.1", 1883, 60)

mqttc.loop_forever()
