import time 
import serial
import sys, os, time
reload(sys)
sys.setdefaultencoding('utf-8')
import paho.mqtt.client as mqtt
# If broker asks client ID.
client_id = ""
client = mqtt.Client(client_id=client_id)
# If broker asks user/password.
user = ""
password = ""
client.username_pw_set(user, password)
client.connect("192.168.8.120")
topic = "current"
ser = serial.Serial(
        port='/dev/ttyACM0',
        baudrate = 9600,
        parity=serial.PARITY_NONE,
        stopbits=serial.STOPBITS_ONE,
        bytesize=serial.EIGHTBITS,
        timeout=1
    )

while 1:
    x=ser.readline()  
    if x:
        print x
        client.publish(topic, "%s"% (x))
        time.sleep(0.01)
#for i in xrange(10):
    #client.publish(topic, "%s - %d" % (payload, i))
    #time.sleep(0.01)