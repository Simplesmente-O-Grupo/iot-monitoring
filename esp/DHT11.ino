#include "DHT.h"
#define DHTPIN 32
#define DHTTYPE DHT11

DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(115200);
  dht.begin();
  Serial.println("Teste sensor DHT11 Temperatura e humidade");
}
void loop(){
  float h = dht.readHumidity();
  float t = dht.readTemperature();

  if (isnan(h) || isnan(t)){
    Serial.println("ERRO de leitura");
    return;
  }
  Serial.print("Humidade: ");
  Serial.print(h);
  Serial.print("% | Temperatura:");
  Serial.print(t);
  Serial.println(" °C");
  delay(2000);
}