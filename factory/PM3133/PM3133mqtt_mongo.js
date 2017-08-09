
//connect mqtt
var mqtt = require('mqtt')
//var mqttClient = mqtt.connect('mqtt://10.28.120.17:1883')
var mqttClient = mqtt.connect();
mqttClient.on('connect', function () {
    console.log('mqtt connect');
    mqttClient.subscribe('PM3133/#')
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

//PM3133
var PM3133_A;
var PM3133_B;
var PM3133_C;

//mqtt client
mqttClient.on('message', function (topic, message) {
    console.log(topic);
    switch (topic) {
        case 'PM3133/A':
            PM3133_A = JSON.parse(message);
            //console.log(PM3133_A);
            console.log('get PM3133/A message: %s', message)
            break;
        case 'PM3133/B':
            PM3133_B = JSON.parse(message);
            //console.log(PM3133_B);
            console.log('get PM3133/B message: %s', message)
            break;
        case 'PM3133/C':
            PM3133_C = JSON.parse(message);
            //console.log(PM3133_C);
            console.log('get PM3133/C message: %s', message)
            break;        
    }
    topic = ""; //目前topic歸零 
    //判斷資料有收到 !=null
     if (PM3133_A!=null && PM3133_B!=null && PM3133_C!=null ){
         insertPM3133Data();  
     }else{
         console.log('err!');
     }
})

//Insert PM3133 mqtt data to mongo
function insertPM3133Data() {
    var date = new Date();
    dataInsertTime = date.getTime();
    console.log('insert PM3133\'s data to mongodb...');
    var collection = db.collection('PM3133');
    collection.insert({
        PM3133_A:PM3133_A,
        PM3133_B:PM3133_B,
        PM3133_C:PM3133_C,
    })
    //清除資料
    PM3133_A=null;
    PM3133_B=null;
    PM3133_C=null;
};


