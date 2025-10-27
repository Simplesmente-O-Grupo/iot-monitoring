#include <Wire.h>
#include <BH1750.h>
#include "bh1750.h"

BH1750 lightMeter;

void setupBH1750() {
  lightMeter.begin();
}

float lerBH1750() {
  return lightMeter.readLightLevel();
}
