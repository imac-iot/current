/* eslint-disable no-console, spaced-comment */

// create an empty modbus client
var ModbusRTU = require("modbus-serial");
var mqtt = require('mqtt');
//var client = new ModbusRTU();
//var ans=new Array();
//var a=new Array();
//var l=0;
//var pm3133_a,pm3133_b,pm3133_c;
//var t=0;
//var j=0;
//var i=4352;
var mqttClient  = mqtt.connect('mqtt://60.249.15.85');
mqttClient.on('connect',function(){
        console.log('connect to MQTT server');
        mqttClient.subscribe("PM3133/A");
        mqttClient.subscribe("PM3133/B");
        mqttClient.subscribe("PM3133/C");

        //aclient.publish('PM3133/C',JSON.stringify({V_c:0,I_c:0,kW_c:0,kvar_c:0,kVA_c:0}));
});

setInterval(function(){
var client = new ModbusRTU();
var ans=new Array();
var a=new Array();
var l=0;
var pm3133_a,pm3133_b,pm3133_c;
var t=0;
var j=0;
var i=4352;
connect1();
// open connection to a serial port
function connect1(){
client.connectRTU("COM1", {baudrate: 9600})
//client.connectTCP("127.0.0.1", { port: 8502 })
    .then(setClient)
    .then(function() {
        console.log("Connected"); })
    .catch(function(e) {
        console.log(e.message); });
}

function setClient() {
    client.setID(1);
//    client.setTimeout(1000)
    // run program
//    while(1)
//    {
//        setTimeout(run(),5000);
//    }
    run();

}


function run() {

    var t=0;
    i=i+1;
   if(j==0){
        i=4352;
    }else if(j==10){
     i=4370;
    }else if(j==20){
         i=4388;
    }else if(j==30){
         j=0;
        close();
        return 0;
    }
//    console.log(i);
    /*var i=4370;
    i=i+num;
    if(j==10){
        j=0;
        close();
        return 0;
    }*/
    client.readInputRegisters(i,1)
         //client.readHoldingRegisters(i, 1)
        .then(function(d) {
            for(t=0;t<2;t++){
              c = d.buffer[t].toString(16);
              a[l+t]=c;
            }
//            console.log(d);
//            console.log(j+"  "+d.data);
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

    pm3133_a= JSON.stringify({ "V_a": new Number(ans[0]/100).toFixed(3),
                                "I_a": new Number(ans[1]).toFixed(3),
                                "kW_a": new Number(ans[2]).toFixed(3),
                                "kvar_a": new Number(ans[3]).toFixed(3),
                                "kVA_a": new Number(ans[4]).toFixed(3)
                                 });
    pm3133_b= JSON.stringify({ "V_b": new Number(ans[5]/100).toFixed(3),
                                "I_b": new Number(ans[6]).toFixed(3),
                                "kW_b": new Number(ans[7]).toFixed(3),
                                "kvar_b": new Number(ans[8]).toFixed(3),
                                "kVA_b": new Number(ans[9]).toFixed(3)
                                 });
    pm3133_c= JSON.stringify({ "V_c": new Number(ans[10]/100).toFixed(3),
                                "I_c": new Number(ans[11]).toFixed(3),
                                "kW_c": new Number(ans[12]).toFixed(3),
                                "kvar_c": new Number(ans[13]).toFixed(3),
                                "kVA_c": new Number(ans[14]).toFixed(3)
                                 });
    console.log(pm3133_a);
    console.log(pm3133_b);
    console.log(pm3133_c);
    mqttClient.publish('PM3133/A',pm3133_a);
    mqttClient.publish('PM3133/B',pm3133_b);
    mqttClient.publish('PM3133/C',pm3133_c);
    client.close(function(){
        console.log('close');
    });
}
},5000);

//mqttClient.on('close',function(){
//    mqttClient.on('connect',function(){
//        console.log('connect to MQTT server');
//        mqttClient.subscribe("PM3133/A");
//        mqttClient.subscribe("PM3133/B");
//        mqttClient.subscribe("PM3133/C");
////    connect1();
//        //aclient.publish('PM3133/C',JSON.stringify({V_c:0,I_c:0,kW_c:0,kvar_c:0,kVA_c:0}));
//});
//});

 
