/* eslint-disable no-console, spaced-comment */

// create an empty modbus client
var ModbusRTU = require("modbus-serial");
var mqtt = require('mqtt');
var client = new ModbusRTU();
var ans=new Array();
var a=new Array();
var l=0;
var pm3133_a;
var t=0;
var j=0;
var mqttclient = mqtt.connect('mqtt://10.120.28.17');
// open connection to a serial port
setInterval(function(){  
client.connectRTU("COM2", {baudrate: 9600})
//client.connectTCP("127.0.0.1", { port: 8502 })
    .then(setClient)
    .then(function() {
        console.log("Connected"); })
    .catch(function(e) {
        console.log(e.message); });
    }, 5000);

function setClient() {
    client.setID(1);
    client.setTimeout(1000);
     mqttclient.on('connect',function(){
        console.log('connect to MQTT server');
        mqttclient.subscribe("PM3133/A");
    });
    // run program
//    while(1)
//    {
//        setTimeout(run(),5000);
//    }
    run();
   
}


function run() {
    i=4352;
    var t=0;
    i=i+j;
    //console.log(i);
    if(j==10){
                close();
                j=0;
                return 0;
            }
    client.readInputRegisters(i,1)
         //client.readHoldingRegisters(i, 1)
        .then(function(d) {
            for(t=0;t<2;t++){
              c = d.buffer[t].toString(16);
              a[l+t]=c;      
            }
            console.log(d);
            console.log("v_a1:", d.data);
            l=l+2;
            j++;
            
        })
        .catch(function(e) {
            console.log("test:",e.message);
            
        }).then(run);
        
}

function close() {
    for(var j=0;j<l;j=j+4){
        var buffer = new ArrayBuffer(4);
        var bytes = new Uint8Array(buffer);
        bytes[0] = "0x"+a[j+2];
        bytes[1] = "0x"+a[j+3];
        bytes[2] = "0x"+a[j];
        bytes[3] = "0x"+a[j+1]; 
        var view = new DataView(buffer);
        ans[t]=view.getFloat32(0, false);
        t++;
    }
    /*console.log(a[6],a[7],a[4],a[5],t);
    
    var o;
    for(o=0;o<l+1;o++){
        console.log(a[o]);
    }   
    for(o=0;o<t;o++){
        console.log(ans[o]);
    }  */
        pm3133_a= JSON.stringify({ "V_a": ans[0],
                                 "I_a": ans[1],
                                 "kW_a": ans[2],
                                 "kvar_a": ans[3],
                                 "kVA_a": ans[4]
                                 });
    console.log(pm3133_a);
    mqttclient.publish('PM3133/A',pm3133_a);
    client.close();
}

    
 
