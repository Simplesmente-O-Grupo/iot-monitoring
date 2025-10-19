#include <Wire.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_BMP280.h>

Adafruit_BMP280 bmp; // cria o objeto do sensor

void setup() {
  Serial.begin(115200);
  Wire.begin(21, 22);  // SDA e SCL
  Serial.println("Teste do Sensor BMP280 - Pressão e Temperatura");

  if (!bmp.begin(0x76)) { // endereço I2C padrão
    Serial.println("Erro: BMP280 não encontrado!");
    while (1);
  }
}

void loop() {
  float temp = bmp.readTemperature();
  float press = bmp.readPressure() / 100.0F; // converte Pa para hPa

  Serial.print("Temperatura: ");
  Serial.print(temp);
  Serial.print(" °C  |  Pressão: ");
  Serial.print(press);
  Serial.println(" hPa");

  delay(2000); // leitura a cada 2 segundos
}