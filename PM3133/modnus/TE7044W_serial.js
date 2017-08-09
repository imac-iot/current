// create an empty modbus client
var mqtt = require('mqtt');
var ModbusRTU = require("modbus-serial");
var client = new ModbusRTU();
var timeoutRunRef = null;
var timeoutConnectRef = null;
var networkErrors = ["ESOCKETTIMEDOUT", "ETIMEDOUT", "ECONNRESET", "ECONNREFUSED"];
var writeData = [false,false,false,false,false,false,false,false];

function checkError(e) {
    if (e.errno && networkErrors.includes(e.errno)) {
        console.log("we have to reconnect");
        // close port
        client.close();
        // re open client
        client = new ModbusRTU();
        timeoutConnectRef = setTimeout(connect, 1000);
    }
}
function connect() {
    // clear pending timeouts
    clearTimeout(timeoutConnectRef);
    // if client already open, just run
    if (client.isOpen()) {
        run();
    }
// open connection to a serial port
//    client.connectRTU("COM2", {
//            baudrate: 9600
//        })
        client.connectTCP("10.20.0.2", { port: 502 })
        .then(setClient)
        .then(function () {
            console.log("Connected");
        })
        .catch(function (e) {
            console.log(e.message);
        });
}
function setClient() {
    // set the client's unit id
    // set a timout for requests default is null (no timeout)
    client.setID(1);
    client.setTimeout(3000);
    // run program
    run();
}
var DOstatus;
function run() {
    // clear pending timeouts
    clearTimeout(timeoutRunRef);
    client.writeCoils(0,writeData);
    client.readCoils(0, 8)
        .then(function (d) {
//            DOstatus = d.data.toString();
                    DOstatus = JSON.stringify(d.data);
            console.log(DOstatus);
            console.log("Receive:", d.data);
            mqttClient.publish('ET7044/DOstatus', DOstatus );
        })
        .then(function () {
            timeoutRunRef = setTimeout(run, 5000);
        })
        .catch(function (e) {
            checkError(e);
            console.log(e.message);
        });
    
}
// connect and start logging
connect();
// Mqtt connecting and pub
var mqttClient = mqtt.connect('mqtt://10.28.120.17:1883');
mqttClient.on('connect',function(){
    console.log('connect to MQTT server');
    mqttClient.subscribe('ET7044/write');
  //  mqttClient.publish('ET7044/DOstatus', DOstatus );
});

mqttClient.on('message', function (topic, message) {
  // message is Buffer
  writeData=JSON.parse(message);
  console.log(writeData);
});
