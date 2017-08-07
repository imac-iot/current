/* eslint-disable no-console, spaced-comment */

// create an empty modbus client
var ModbusRTU = require("modbus-serial");
var client = new ModbusRTU();

// open connection to a serial port
client.connectRTU("COM2", {baudrate: 9600})
//client.connectTCP("127.0.0.1", { port: 8502 })
    .then(setClient)
    .then(function() {
        console.log("Connected"); })
    .catch(function(e) {
        console.log(e.message); });

function setClient() {
    client.setID(1);
    client.setTimeout(1000);
    // run program
    run();
}


function run() {
    var i=0x1102;
    var j=0x1114;
         client.readInputRegisters(i, 1)
         //client.readHoldingRegisters(i, 1)
        .then(function(d) {
            console.log(d);
            console.log("Receive:", d.data);
        })
        .catch(function(e) {
            console.log(e.message);
        }).then(close);
    
    client.readInputRegisters(j, 1)
         //client.readHoldingRegisters(i, 1)
        .then(function(d) {
            console.log(d);
            console.log("Receive:", d.data);
        })
        .catch(function(e) {
            console.log(e.message);
        }).then(close);
}

function close() {
    client.close();
}