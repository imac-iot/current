#include "DHT.h"
#include "EmonLib.h" 
#define DHTPIN A0 
#define DHTTYPE DHT11   // DHT 11 
// Connect pin 1 (on the left) of the sensor to +5V
// Connect pin 2 of the sensor to whatever your DHTPIN is
// Connect pin 4 (on the right) of the sensor to GROUND
// Connect a 10K resistor from pin 2 (data) to pin 1 (power) of the sensor

DHT dht(DHTPIN, DHTTYPE);
EnergyMonitor emon1; 
void setup() 
{
    Serial.begin(9600);
    emon1.current(1, 26);   
    dht.begin();// Current: input pin, calibration.
}

void loop() 
{
    float h = dht.readHumidity();
    float t = dht.readTemperature();
    double Irms = emon1.calcIrms(1480);  // Calculate Irms only
    // check if returns are valid, if they are NaN (not a number) then something went wrong!
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
