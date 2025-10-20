#include <Wire.h>

#define AS5600_ADDR 0x36  // endereço I2C do AS5600
#define RAW_ANGLE_REG 0x0C

unsigned long lastTime = 0;

String direcaoCardinal(float angulo) {
  if (angulo >= 337.5 || angulo < 22.5) return "Norte";
  else if (angulo < 67.5) return "Nordeste";
  else if (angulo < 112.5) return "Leste";
  else if (angulo < 157.5) return "Sudeste";
  else if (angulo < 202.5) return "Sul";
  else if (angulo < 247.5) return "Sudoeste";
  else if (angulo < 292.5) return "Oeste";
  else return "Noroeste";
}

uint16_t readRawAngle() {
  Wire.beginTransmission(AS5600_ADDR);
  Wire.write(RAW_ANGLE_REG);
  Wire.endTransmission();
  Wire.requestFrom(AS5600_ADDR, 2);
  uint16_t high = Wire.read();
  uint16_t low = Wire.read();
  return (high << 8) | low;
}

void setup() {
  Serial.begin(115200);
  Wire.begin(); // SDA e SCL padrão do ESP32 (21 e 22)
  Serial.println("Leitura do AS5600 - Direcao do Vento");
}

void loop() {
  uint16_t raw = readRawAngle();
  // O AS5600 fornece 12 bits (0–4095) para 0–360°
  float angulo = (raw & 0x0FFF) * 360.0 / 4096.0;

  if (millis() - lastTime >= 1000) {
    Serial.print("Angulo: ");
    Serial.print(angulo, 2);
    Serial.print("° | Direcao: ");
    Serial.println(direcaoCardinal(angulo));
    lastTime = millis();
  }
}
