#include <Wire.h>
#include <BH1750.h>

BH1750 lightMeter;

void setup(){
  Serial.begin(115200);
  Wire.begin(21, 22);
  lightMeter.begin();
  Serial.println("Teste sensor luminosidade");
}
void loop(){
  float lux =
  lightMeter.readLightLevel();

  Serial.print("Luminosidade: ");
  Serial.print(lux);
  Serial.println(" lux");

  delay(1000);
}