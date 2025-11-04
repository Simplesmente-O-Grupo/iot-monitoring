#include <Wire.h>
#include <Adafruit_BMP280.h>
#include <BH1750.h>
#include <DHT.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// LM393
#define LM393_INTERVAL 1000
#define LM393_PIN 35  // ou 35 se preferir

volatile unsigned long contagem_lm393 = 0;

volatile bool prevLm393State = LOW;
void isr_lm393() {
  bool state = digitalRead(LM393_PIN);

  if (prevLm393State != state) {
    contagem_lm393++;
  }

  prevLm393State = state;
}

unsigned long lastTime_lm393 = 0;
///////////////////////////////////////////////////////////////////////////

// BH1750
#define BH1750_INTERVAL 2000

BH1750 lightMeter;

unsigned long lastTime_bh1750 = 0;
///////////////////////////////////////////////////////////////////////////

// DHT11
#define DHT_PIN 32
#define DHTTYPE DHT11
DHT dht(DHT_PIN, DHTTYPE);

#define DHT11_HUM_INTERVAL  4000

unsigned long lastTime_dht11_hum = 0;

///////////////////////////////////

// BMP280
Adafruit_BMP280 bmp;
#define BMP280_PRESSURE_INTERVAL 5000
#define BMP280_TEMPERATURE_INTERVAL 3000

unsigned long lastTime_bmp280_press = 0;
unsigned long lastTime_bmp280_temp = 0;
/////////////////////////////////////

void setup() {
  Serial.begin(115200);
  Wire.begin(21, 22);

  // LM393
  pinMode(LM393_PIN, INPUT);
  attachInterrupt(digitalPinToInterrupt(LM393_PIN), isr_lm393, CHANGE);

  // BH1750
  lightMeter.begin();

  // DHT11
  dht.begin();

  // BMP280
  bmp.begin(0x76);

  Serial.println("Estacao iniciada");
}


void loop() {

  unsigned long now = millis();

  // LM393
  if (now - lastTime_lm393 >= LM393_INTERVAL) {
    int pulsos;

    const float FATOR_KHM = 2.4;
    
    noInterrupts();
    pulsos = contagem_lm393;
    contagem_lm393 = 0;
    interrupts();
    
    int giros = pulsos / 10;

    float rps = ((float)pulsos/10.0f) / (LM393_INTERVAL / 1000.0f);
    float velocidade = rps * FATOR_KHM;

    Serial.print("Velocidade do tempo: ");
    Serial.print(velocidade);
    Serial.println(" km/h");
    lastTime_lm393 = now;
  }

  // BH1750
  if (now - lastTime_bh1750 >= BH1750_INTERVAL) {
    Serial.print("Luz: ");
    Serial.print(lightMeter.readLightLevel());
    Serial.println(" lux");

    lastTime_bh1750 = now;
  }

  // DHT11 - Umidade
  if (now - lastTime_dht11_hum >= DHT11_HUM_INTERVAL) {
    Serial.print("Umidade: ");
    Serial.print(dht.readHumidity());
    Serial.println(" %");
    lastTime_dht11_hum = now;
  }

  // BMP280 - AIR PRESSURE
  if (now - lastTime_bmp280_press >= BMP280_PRESSURE_INTERVAL) {
    Serial.print("Pressao: ");
    Serial.print(bmp.readPressure() / 100.0f);
    Serial.println(" hPa");
    
    lastTime_bmp280_press = now;
  }

  // BMP280 - TEMPERATURE
  if (now - lastTime_bmp280_temp >= BMP280_TEMPERATURE_INTERVAL) {
    Serial.print("Temperatura: ");
    Serial.print(bmp.readTemperature());
    Serial.println(" C");
    
    lastTime_bmp280_temp = now;
  }
}
