
//connect mqtt
var mqtt = require('mqtt')
var client = mqtt.connect('mqtt://10.28.120.17:1883')

client.on('connect', function () {
    console.log('connect');
    client.subscribe('DL303/#') //co2
        client.on('offline', function() {
        console.log('on offline');
        });
    // client.subscribe('DL303/RH') // humidity
    // client.subscribe('DL303/TC') // temperature *c
    // client.subscribe('DL303/DC') // dew point *c
})

//mongo db client
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var db;
MongoClient.connect("mongodb://localhost:27017/Factory", function (err, pDb) {
    if (err) {
        return console.dir(err);
    }
    db = pDb;
});

var DL303_co2;
var DL303_humi;
var DL303_temp;
var DL303_dewp; 

//mqtt client
client.on('message', function (topic, message) {
    console.log(topic);
    switch (topic) {
        case 'DL303/CO2':
            DL303_co2 = message.toString();
            console.log('get DL303/CO2 message: %s', message)
            break;
        case 'DL303/RH':
            DL303_humi = message.toString();
            console.log('get DL303/RH message: %s', message)
            break;
        case 'DL303/TC':
            DL303_temp = message.toString();
            console.log('get DL303/TF message: %s', message)
            break;
        case 'DL303/DC':
            DL303_dewp = message.toString();
            console.log('get DL303/DC message: %s', message) 
            break;    
    }
    topic = ""; //目前topic歸零 
    console.log('----------------------'); 
    //判斷資料有收到 !=null
    if (DL303_co2!=null && DL303_humi!=null && DL303_temp!=null && DL303_dewp!=null  ){
            insertData();  
    }      
})

client.on('error', function(err) {
  console.log('MQTT on error', err);
});

client.on('offline', function() {
  console.log('on offline');
});

client.on('reconnect', function() {
  console.log('on reconnect');
});

function insertData() {
    var date = new Date();
    dataInsertTime = date.getTime();
    //console.log('insert data to mongodb...');
    var collection = db.collection('DL303');
    collection.insert({
        CO2:DL303_co2,
        Temperature:DL303_temp,
        Humidity:DL303_humi,
        Dewpoint:DL303_dewp,
        InsertTime:dataInsertTime,
    })
    //清除資料
    DL303_co2=null;
    DL303_humi=null;
    DL303_temp=null;
    DL303_dewp=null;
};
