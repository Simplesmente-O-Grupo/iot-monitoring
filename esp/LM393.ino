#define SENSOR_PIN 35  // pino de sinal (DO)

unsigned long lastTime = 0;
unsigned int pulsos = 0;
int estadoAnterior = HIGH;  // começa em HIGH (sem interrupção)

// Configurações do sensor
const int PULSOS_POR_VOLTA = 10;   // 10 furos = 10 pulsos por volta
const float FATOR_KMH = 2.4;       // km/h por rotação por segundo (ajuste conforme calibração)

void setup() {
  Serial.begin(115200);
  pinMode(SENSOR_PIN, INPUT);
  Serial.println("Anemômetro LM393 - Velocidade do vento");
}

void loop() {
  int estadoAtual = digitalRead(SENSOR_PIN);

  // Detecta borda de descida: HIGH → LOW
  if (estadoAnterior == HIGH && estadoAtual == LOW) {
    pulsos++;
  }

  estadoAnterior = estadoAtual;  // atualiza para próxima leitura

  // A cada 1 segundo calcula RPM e velocidade
  if (millis() - lastTime >= 1000) {
    float rps = (float)pulsos / PULSOS_POR_VOLTA;
    float rpm = rps * 60.0;
    float velocidade = rps * FATOR_KMH;

    Serial.print("RPM: ");
    Serial.print(rpm);
    Serial.print(" | Velocidade: ");
    Serial.print(velocidade);
    Serial.println(" km/h");

    pulsos = 0;
    lastTime = millis();
  }
}