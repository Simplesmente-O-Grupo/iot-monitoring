// Bibliotecas originais
#include <Wire.h>
#include <Adafruit_BMP280.h>
#include <AS5600.h>
#include <BH1750.h>
#include <DHT.h>
#include <WiFi.h>
#include <PubSubClient.h> // Para MQTT
#include <ArduinoJson.h>  // Para o payload
#include <time.h>         // Para o timestamp NTP
#include "reading.h"

const int velocity_id = 1; // ID da velocidade no banco.
const int lux_id = 2;
const int humidity_id = 3;
const int pressure_id = 4;
const int temperature_id = 5;
const int angle_id = 6;
//wifi
const char* ssid = "GLaDOS";
const char* password = "rosebud12";

//MQTT
const char* mqtt_server = "mqtt.mattthefreeman.xyz"; // Ex: "192.168.1.100" ou "broker.hivemq.com"
const int   mqtt_port = 1883;
const char* station_id = "1"; // <stationid> do seu tópico

//NTP (Timestamp)
const char* ntpServer = "pool.ntp.org";
const long  gmtOffset_sec = -3 * 3600; // Offset GMT (Ex: -3 horas para Brasil)
const int   daylightOffset_sec = 0;     // Horário de verão (0 = desativado)

WiFiClient espClient;
PubSubClient client(espClient);

//codigo sensores

// LM393
const int lm393_id = 1; // ID do sensor no banco de dados.
#define LM393_INTERVAL 1000
#define LM393_SEND_INTERVAL 60000
#define LM393_PIN 35
volatile unsigned long contagem_lm393 = 0; // [cite: 1]
volatile bool prevLm393State = LOW; // [cite: 2]
void isr_lm393() {
  bool state = digitalRead(LM393_PIN);
  if (prevLm393State != state) { // [cite: 3]
    contagem_lm393++;
  }
  prevLm393State = state;
}
unsigned long lastTime_lm393 = 0;
unsigned long lastTime_lm393_send = 0;
ReadingBuffer lm393_buf = {0};

// BH1750
const int bh1750_id = 2; // ID do sensor no banco de dados.
#define BH1750_INTERVAL 2000
#define BH1750_SEND_INTERVAL 60000
BH1750 lightMeter;
unsigned long lastTime_bh1750 = 0;
unsigned long lastTime_bh1750_send = 0;
ReadingBuffer bh1750_buf = {0};

// DHT11
const int dht11_id = 3;
#define DHT_PIN 32
#define DHTTYPE DHT11
DHT dht(DHT_PIN, DHTTYPE);
#define DHT11_HUM_INTERVAL  4000 // [cite: 5]
#define DHT11_HUM_SEND_INTERVAL 60000
unsigned long lastTime_dht11_hum = 0;
unsigned long lastTime_dht11_hum_send = 0;
ReadingBuffer dht11_buf = {0};

// BMP280
const int bmp280_id = 4;
Adafruit_BMP280 bmp;
#define BMP280_PRESSURE_INTERVAL 2000
#define BMP280_PRESSURE_SEND_INTERVAL 60000

#define BMP280_TEMPERATURE_INTERVAL 2000
#define BMP280_TEMPERATURE_SEND_INTERVAL 60000
unsigned long lastTime_bmp280_press = 0;
unsigned long lastTime_bmp280_press_send = 0;

unsigned long lastTime_bmp280_temp = 0; // [cite: 6]
unsigned long lastTime_bmp280_temp_send = 0;

ReadingBuffer bmp280_pres_buf = {0};
ReadingBuffer bmp280_temp_buf = {0};

// AS5600 Direção do vento
const int as5600_id = 5;
#define AS5600_INTERVAL 4000
#define AS5600_SEND_INTERVAL 60000
AS5600 as5600;
unsigned long lastTime_as5600 = 0;
unsigned long lastTime_as5600_send = 0;
ReadingBuffer as5600_buf = {0};

// Função para obter o timestamp Unix (segundos desde 1970)
unsigned long getTimestamp() {
  time_t now;
  struct tm timeinfo;
  if (!getLocalTime(&timeinfo)) {
    Serial.println("Falha ao obter hora local (NTP)");
    return 0;
  }
  time(&now);
  return (unsigned long)now;
}

// Função para publicar a mensagem no formato solicitado
void publishMqttMessages(int sensor_id, int unit_id, ReadingBuffer *buf) {
  // Nada para enviar, pula.
  if (buf->size <= 0) return;

  if (!client.connected()) {
    Serial.println("Cliente MQTT desconectado. Ignorando publicação.");
    return;
  }

  // Monta o tópico: /weather/<stationid>
  String topic = "weather/" + String(station_id);

  // Monta o Payload JSON
  StaticJsonDocument<256> doc;
  doc["sensor"] = sensor_id;
  doc["unit"] = unit_id;
  JsonArray values = doc.createNestedArray("reading_values");
  JsonArray timestamps = doc.createNestedArray("reading_timestamps");

  for (int i = 0; i < buf->size; i++) {
    timestamps.add(buf->timestamps[i]);
    values.add(buf->values[i]);
  }

  // Serializa o JSON para uma string
  String payload;
  serializeJson(doc, payload);
  Serial.print(payload.c_str());

  // Publica a mensagem
  if (client.publish(topic.c_str(), payload.c_str())) {
    Serial.print("Mensagem MQTT publicada [");
    Serial.print(topic);
    Serial.print("]: ");
    Serial.println(payload);
    buffer_clear(buf);
  } else {
    Serial.println("Falha ao publicar mensagem MQTT.");
  }
}

// Função de Callback do MQTT
void mqttCallback(char* topic, byte* payload, unsigned int length) {
  Serial.print("Mensagem recebida [");
  Serial.print(topic);
  Serial.print("]: ");
  for (int i = 0; i < length; i++) {
    Serial.print((char)payload[i]);
  }
  Serial.println();
}

// Conecta ao WiFi
void setupWiFi() {
  delay(10);
  Serial.println();
  Serial.print("Conectando em ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi Conectado!");
  Serial.print("Endereco IP: ");
  Serial.println(WiFi.localIP());
}

// Sincroniza o relógio com o servidor NTP
void setupNTP() {
  Serial.println("Sincronizando hora com NTP...");
  configTime(gmtOffset_sec, daylightOffset_sec, ntpServer);
  
  // Espera até que o tempo seja sincronizado
  unsigned long startAttempt = millis();
  while (getTimestamp() < 1672531200) { // Espera até ser um timestamp válido (após 2023)
    delay(500);
    Serial.print(".");
    if (millis() - startAttempt > 10000) { // Timeout de 10s
        Serial.println("\nFalha ao sincronizar NTP. Reiniciando...");
        ESP.restart();
    }
  }
  Serial.println("\nNTP Sincronizado!");
}

// Reconecta ao Broker MQTT
void reconnectMQTT() {
  while (!client.connected()) {
    Serial.print("Tentando conexao MQTT...");
    // Tenta conectar
    // (Pode adicionar usuário/senha aqui se precisar)
    if (client.connect(station_id)) {
      Serial.println("conectado!");
      // Você pode se inscrever em tópicos aqui, se necessário
      // client.subscribe("seu/topico/de/comando");
    } else {
      Serial.print("falha, rc=");
      Serial.print(client.state());
      Serial.println(" tentando novamente em 5 segundos");
      delay(5000);
    }
  }
}

void manage_lm393(unsigned long now);
void manage_bht1750(unsigned long now);
void manage_dht11(unsigned long now);
void manage_bmp280_press(unsigned long now);
void manage_bmp280_temp(unsigned long now);
void manage_as5600(unsigned long now);


//SETUP
void setup() {
  Serial.begin(115200);
  Wire.begin(21, 22);

  // Inicia WiFi
  setupWiFi();
  
  // Inicia NTP
  setupNTP();

  // Configura o cliente MQTT
  client.setServer(mqtt_server, mqtt_port);
  client.setBufferSize(1024);
  client.setCallback(mqttCallback);

  // LM393
  pinMode(LM393_PIN, INPUT);
  attachInterrupt(digitalPinToInterrupt(LM393_PIN), isr_lm393, CHANGE);
  
  // BH1750
  lightMeter.begin(); // [cite: 7]

  // DHT11
  dht.begin();

  // BMP280
  bmp.begin(0x76);

  // AS5600
  as5600.begin();

  Serial.println("Estacao iniciada"); // [cite: 8]
}

//LOOP
void loop() {
  unsigned long now = millis();

  // Garante que o MQTT está conectado
  if (!client.connected()) {
    reconnectMQTT();
  }
  client.loop(); // Essencial para o PubSubClient

  manage_lm393(now);

  manage_bht1750(now);

  manage_dht11(now);

  manage_bmp280_press(now);

  manage_bmp280_temp(now);
  
  manage_as5600(now);
}

void manage_lm393(unsigned long now) {
  // Leitura
  if (now - lastTime_lm393 >= LM393_INTERVAL) {
    int pulsos;
    const float FATOR_KHM = 2.4; // [cite: 9]
    
    noInterrupts();
    pulsos = contagem_lm393;
    contagem_lm393 = 0;
    interrupts();
    
    int giros = pulsos / 10;
    float rps = ((float)pulsos/10.0f) / (LM393_INTERVAL / 1000.0f); // [cite: 10]
    float velocidade = rps * FATOR_KHM;

    Serial.print("Velocidade do vento: "); // (Corrigi de "tempo")
    Serial.print(velocidade);
    Serial.println(" km/h"); // [cite: 11]
    
    // (sensor_id, unit_id, valor)
    //publishMqttMessage(2, 2, velocidade);
    
    // Adiciona leitura no buffer.
    buffer_add(&lm393_buf, getTimestamp(), velocidade, 1);
    
    lastTime_lm393 = now;
  }

  // Envio
  if (buffer_full(&lm393_buf) || (now - lastTime_lm393_send >= LM393_SEND_INTERVAL)) {

    publishMqttMessages(lm393_id, velocity_id, &lm393_buf);

    lastTime_lm393_send = now;
  }
}

void manage_bht1750(unsigned long now) {
  // Leitura
  if (now - lastTime_bh1750 >= BH1750_INTERVAL) {
    float luz = lightMeter.readLightLevel(); // [cite: 12]
    
    Serial.print("Luz: ");
    Serial.print(luz);
    Serial.println(" lux");

    //PUBLICA MQTT
    //publishMqttMessage(3, 1, luz);

    // Adiciona no buffer
    buffer_add(&bh1750_buf, getTimestamp(),  luz, 10);

    lastTime_bh1750 = now;
  }

  // Envio
  if (buffer_full(&bh1750_buf) || (now - lastTime_bh1750_send >= BH1750_SEND_INTERVAL)) {

    publishMqttMessages(bh1750_id, lux_id, &bh1750_buf);

    lastTime_bh1750_send = now;
  }
}

void manage_dht11(unsigned long now) {
  // Leitura
  if (now - lastTime_dht11_hum >= DHT11_HUM_INTERVAL) {
    float umidade = dht.readHumidity(); // [cite: 13]
    
    Serial.print("Umidade: ");
    Serial.print(umidade);
    Serial.println(" %");
    
    // --- PUBLICA MQTT ---
    //publishMqttMessage(1, 4, umidade);
    

    // Adiciona no buffer
    buffer_add(&dht11_buf, getTimestamp(), umidade, 5);
    
    lastTime_dht11_hum = now;
  }

  // Envio
  if (buffer_full(&dht11_buf) || (now - lastTime_dht11_hum_send >= DHT11_HUM_SEND_INTERVAL)) {

    publishMqttMessages(dht11_id, humidity_id, &dht11_buf);

    lastTime_dht11_hum_send = now;
  }
}

void manage_bmp280_press(unsigned long now) {
  // Leitura
  if (now - lastTime_bmp280_press >= BMP280_PRESSURE_INTERVAL) {
    float pressao = bmp.readPressure() / 100.0f; // [cite: 14]
    
    Serial.print("Pressao: ");
    Serial.print(pressao);
    Serial.println(" hPa");
    
    //PUBLICA MQTT
    //publishMqttMessage(4, 3, pressao);

    // Adiciona no buffer
    buffer_add(&bmp280_pres_buf, getTimestamp(), pressao, 5);
    
    lastTime_bmp280_press = now;
  }

  // Envio
  if (buffer_full(&bmp280_pres_buf) || (now - lastTime_bmp280_press_send >= BMP280_PRESSURE_SEND_INTERVAL)) {

    publishMqttMessages(bmp280_id, pressure_id, &bmp280_pres_buf);

    lastTime_bmp280_press_send = now;
  }
}

void manage_bmp280_temp(unsigned long now) {
  // Leitura
  if (now - lastTime_bmp280_temp >= BMP280_TEMPERATURE_INTERVAL) {
    float temperatura = bmp.readTemperature(); // [cite: 15]
    
    Serial.print("Temperatura: ");
    Serial.print(temperatura);
    Serial.println(" C");
    
    //PUBLICA MQTT
    //publishMqttMessage(4, 5, temperatura);
    
    // Adiciona no buffer
    buffer_add(&bmp280_temp_buf, getTimestamp(), temperatura, 0.5f);

    lastTime_bmp280_temp = now;
  }

  // Envio
  if (buffer_full(&bmp280_temp_buf) || (now - lastTime_bmp280_temp_send >= BMP280_TEMPERATURE_SEND_INTERVAL)) {

    publishMqttMessages(bmp280_id, temperature_id, &bmp280_temp_buf);

    lastTime_bmp280_temp_send = now;
  }
}

void manage_as5600(unsigned long now) {
  // Leitura
  if (now - lastTime_as5600 >= AS5600_INTERVAL) {
    float angulo = as5600.readAngle() * AS5600_RAW_TO_DEGREES; // Ângulo em graus (0–360 aprox.)
    
    Serial.print("Direcao do vento (angulo): ");
    Serial.println(angulo);

    buffer_add(&as5600_buf, getTimestamp(), angulo, 15);

    lastTime_as5600 = now;
  }

  // Envio MQTT
  if (buffer_full(&as5600_buf) || (now - lastTime_as5600_send >= AS5600_SEND_INTERVAL)) {
    publishMqttMessages(as5600_id, angle_id, &as5600_buf);
    lastTime_as5600_send = now;
  }
}
