#include <Wire.h>
#include "dht11.h"
#include "bh1750.h"
#include "bmp280.h"
#include "lm393.h"
#include "as5600.h"

void setup() {
  Serial.begin(115200);
  Wire.begin(21, 22); // SDA, SCL

  setupDHT11();
  setupBH1750();
  setupBMP280();
  setupLM393();
  setupAS5600();

  Serial.println("Estacao iniciada");
}

void loop() {
  float tempDHT = lerTemperaturaDHT11();
  float umid = lerUmidadeDHT11();
  float lux = lerBH1750();
  float tempBMP = lerTemperaturaBMP280();
  float press = lerPressaoBMP280();
  int pulsos = lerLM393();
  float angulo = lerAS5600();

  Serial.println("----");
  Serial.print("Umid: "); Serial.print(umid); Serial.println(" %");
  Serial.print("Temp DHT: "); Serial.print(tempDHT); Serial.println(" C");
  Serial.print("Temp BMP: "); Serial.print(tempBMP); Serial.println(" C");
  Serial.print("Pressao: "); Serial.print(press); Serial.println(" hPa");
  Serial.print("Lux: "); Serial.print(lux); Serial.println(" lx");
  Serial.print("Pulsos: "); Serial.println(pulsos);
  Serial.print("Angulo: "); Serial.println(angulo);
  delay(30000);
}
