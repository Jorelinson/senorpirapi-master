#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>

const char* ssid = "Xyz.co";
const char* password = "1508Kamil@";

const int PIR_SENSOR_OUTPUT_PIN = 18;

String servidor = "http://localhost:3000/movimiento";

bool movimientoAnterior = false;

void setup() {
  Serial.begin(115200);
  delay(2000);

  pinMode(PIR_SENSOR_OUTPUT_PIN, INPUT);

  WiFi.mode(WIFI_STA);
  WiFi.disconnect(true, true);
  delay(1000);

  Serial.println("\n==============================");
  Serial.println("Buscando redes WiFi...");
  Serial.println("==============================");

  int n = WiFi.scanNetworks();

  if (n == 0) {
    Serial.println("No se encontraron redes");
  } else {
    for (int i = 0; i < n; i++) {
      Serial.print(i + 1);
      Serial.print(". ");
      Serial.print(WiFi.SSID(i));
      Serial.print(" | RSSI: ");
      Serial.print(WiFi.RSSI(i));
      Serial.print(" | Canal: ");
      Serial.println(WiFi.channel(i));
    }
  }

  Serial.println("\n==============================");
  Serial.print("Conectando a: ");
  Serial.println(ssid);
  Serial.println("==============================");

  WiFi.begin(ssid, password);

  int intentos = 0;

  while (WiFi.status() != WL_CONNECTED && intentos < 30) {
    delay(1000);
    Serial.print("Intento ");
    Serial.print(intentos + 1);
    Serial.print(" - Estado WiFi: ");
    Serial.println(WiFi.status());
    intentos++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi conectado correctamente");
    Serial.print("IP asignada: ");
    Serial.println(WiFi.localIP());
    Serial.println("Esperando 20 segundos para estabilizar el PIR...");
    delay(20000);
    Serial.println("Sensor listo");
  } else {
    Serial.println("\nNo se pudo conectar al WiFi");
    Serial.println("Verifica:");
    Serial.println("- Que la red exista");
    Serial.println("- Que sea 2.4 GHz");
    Serial.println("- Que la contraseña sea correcta");
  }
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi desconectado, intentando reconectar...");
    WiFi.disconnect(true, true);
    delay(1000);
    WiFi.begin(ssid, password);
    delay(5000);
    return;
  }

  int sensor_output = digitalRead(PIR_SENSOR_OUTPUT_PIN);

  if (sensor_output == HIGH) {
    if (!movimientoAnterior) {
      Serial.println("Movimiento detectado");
      enviarMovimiento();
      movimientoAnterior = true;
    }
  } else {
    if (movimientoAnterior) {
      Serial.println("Sin movimiento");
      movimientoAnterior = false;
    }
  }

  delay(300);
}

void enviarMovimiento() {
  WiFiClientSecure client;
  client.setInsecure();

  HTTPClient http;

  Serial.println("Enviando datos a Render...");

  if (!http.begin(client, servidor)) {
    Serial.println("No se pudo iniciar la conexión HTTP");
    return;
  }

  http.addHeader("Content-Type", "application/json");
  http.setTimeout(30000);

  String json = "{\"sensor\":\"PIR\",\"movimiento\":true}";

  int codigo = http.POST(json);

  Serial.print("Código HTTP: ");
  Serial.println(codigo);

  if (codigo > 0) {
    String respuesta = http.getString();
    Serial.println("Respuesta del servidor:");
    Serial.println(respuesta);
  } else {
    Serial.print("Error HTTP: ");
    Serial.println(http.errorToString(codigo));
  }

  http.end();
}