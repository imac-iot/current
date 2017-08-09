#include "DHT.h"
#include "EmonLib.h" 
#define DHTPIN A1 
#define DHTTYPE DHT11   // DHT 11 
DHT dht(DHTPIN, DHTTYPE); 
EnergyMonitor emon1; 
void setup() 
{
    Serial.begin(9600); 
    emon1.current(2, 26);  //Current: input pin, calibration.
    dht.begin(); // dht
}

void loop() 
{   

    float h = dht.readHumidity();
    float t = dht.readTemperature();
    double Irms = emon1.calcIrms(1480);  // Calculate Irms only

    if (isnan(t) || isnan(h)) 
    {
        Serial.println("Failed to read from DHT");
    } 
    else 
    {
        Serial.print("{\"Humidity\":"); 
        Serial.print(h);
        Serial.print(",\"Temperature\":"); 
        Serial.print(t);
        //Serial.println("}");
    }
   Serial.print(",\"currents\":");
   Serial.print(Irms);
   Serial.println("}");// Irms
   delay(1000);
}
