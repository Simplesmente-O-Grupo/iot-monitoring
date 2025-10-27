#include <Arduino.h>
#include "lm393.h"

#define SENSOR_PIN 32  // ou 35 se preferir

void setupLM393() {
  pinMode(SENSOR_PIN, INPUT);
}

int lerLM393() {
  static int contagem = 0;
  static unsigned long lastTime = 0;

  if (digitalRead(SENSOR_PIN) == LOW) {
    contagem++;
    delay(10);
  }

  if (millis() - lastTime >= 1000) {
    int pulsos = contagem;
    contagem = 0;
    lastTime = millis();
    return pulsos;
  }
  return 0;
}
