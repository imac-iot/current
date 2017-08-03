var SerialPort = require("serialport");   //10.28.120.28
var mqtt    = require('mqtt');            //192.168.8.126
var client  = mqtt.connect('mqtt://10.28.120.28:1883');

var port = new SerialPort("/dev/ttyACM1", {
    parser: SerialPort.parsers.readline('\n')
});

client.on('connect', function () {
  console.log('on connect');
  client.subscribe('current');
});

port.on('open', function() {
    port.on('data', function(data) {
        console.log(data);
        client.publish('current', data.toString());
    });
});
