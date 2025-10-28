#include <Wire.h>
#include <Adafruit_BMP280.h>
#include "bmp280.h"

Adafruit_BMP280 bmp;

void setupBMP280() {
  if (!bmp.begin(0x76)) {
    Serial.println("BMP280 nao achado");
    while (1);
  }
}

float lerTemperaturaBMP280() {
  return bmp.readTemperature();
}

float lerPressaoBMP280() {
  return bmp.readPressure() / 100.0F;
}
