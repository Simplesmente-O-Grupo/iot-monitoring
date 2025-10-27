#include <Wire.h>
#include <AS5600.h>
#include "as5600.h"

AS5600 as5600;

void setupAS5600() {
  as5600.begin(21, 22);
}

float lerAS5600() {
  return as5600.readAngle();
}
