#include "DHT.h"
#include "dht11.h"

#define DHTPIN 32
#define DHTTYPE DHT11
DHT dht(DHTPIN, DHTTYPE);

void setupDHT11() {
  dht.begin();
}

float lerTemperaturaDHT11() {
  return dht.readTemperature();
}

float lerUmidadeDHT11() {
  return dht.readHumidity();
}
