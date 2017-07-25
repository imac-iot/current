#include "DHT.h"
#include "EmonLib.h" 
#define DHTPIN A1 
#define DHTTYPE DHT11   // DHT 11 
DHT dht(DHTPIN, DHTTYPE); 
EnergyMonitor emon1; 

//air quality
int measurePin = 0; //Connect dust sensor to Arduino A0 pin
int ledPower = 2; //Connect 3 led driver pins of dust sensor to Arduino D2int samplingTime = 280;
int sleepTime = 9680;
float voMeasured = 0;
float calcVoltage = 0;
float dustDensity = 0;

void setup() 
{
    Serial.begin(9600); 
    emon1.current(2, 26);  //Current: input pin, calibration.
    dht.begin(); // dht
    pinMode(ledPower,OUTPUT); 
}

void loop() 
{   
    digitalWrite(ledPower,LOW); // power on the LED
    delayMicroseconds(280);
    voMeasured = analogRead(measurePin); // read the dust value
    delayMicroseconds(40);
    digitalWrite(ledPower,HIGH); // turn the LED off
    delayMicroseconds(40);
    calcVoltage = voMeasured * (5.0 / 1024.0);
    dustDensity = 0.17 * calcVoltage - 0.1;
    float h = dht.readHumidity();
    float t = dht.readTemperature();
    double Irms = emon1.calcIrms(1480);  // Calculate Irms only

//    calcVoltage = voMeasured * (5.0 / 1024.0);
//    dustDensity = 0.17 * calcVoltage - 0.1;
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
   Serial.print(",\"RawSignalValue\":");
   Serial.print(voMeasured);
   Serial.println("}");// Irms
   delay(1000);
}
