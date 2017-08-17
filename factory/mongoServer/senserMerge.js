
//connect mqtt
var mqtt = require('mqtt')
var mqttClient = mqtt.connect('mqtt://60.249.15.85:1883')
//var mqttClient = mqtt.connect();
mqttClient.on('connect', function () {
    console.log('mqtt connect');
    mqttClient.subscribe('DL303/#') 
    mqttClient.subscribe('ET7044/#')
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

// DL303 dev's var
var DL303_co2;
var DL303_humi;
var DL303_temp;
var DL303_dewp;

// ET7044 dev's var
var ET7044_DOstatus;
var temp_DOcontrol;

//PM3133
var PM3133_A_Json;
var PM3133_B_Json;
var PM3133_C_Json;

//input post var 
var checkSelect;
var tempSettiong;

//mqtt client
mqttClient.on('message', function (topic, message) {
    console.log(topic);
    switch (topic) {
        case 'DL303/CO2':
            DL303_co2 = message.toString();
            //console.log('get DL303/CO2 message: %s', message)
            break;
        case 'DL303/RH':
            DL303_humi = message.toString();
            //console.log('get DL303/RH message: %s', message)
            break;
        case 'DL303/TC':
            DL303_temp = message.toString();
            var collection = db.collection('selectCheckbox');
            collection.find({}).limit(1).sort( { InsertTime: -1 } ).toArray(function (err, data) {
                checkSelect = data[0].checkSelect,
                tempSettiong = data[0].tempAutoSetting,
                console.log('checkBox status: '+checkSelect);
                console.log('temp Auto Setting: '+tempSettiong);
            });
            if(checkSelect == 'on'){
                if(message >tempSettiong ){
                    temp_DOcontrol[2] = true;            
                    mqttClient.publish('ET7044/write',JSON.stringify(temp_DOcontrol));
                }else{
                    temp_DOcontrol[2] = false;            
                    mqttClient.publish('ET7044/write',JSON.stringify(temp_DOcontrol));
                }
            }     
            console.log('get DL303/TF message: %s', message)
            break;
        case 'DL303/DC':
            DL303_dewp = message.toString();
            //console.log('get DL303/DC message: %s', message) 
            break;  
        case 'ET7044/DOstatus':
            ET7044_DOstatus = message.toString();
            temp_DOcontrol = JSON.parse(message);
            //console.log('get ET7044/DOstatus message: %s', message)
            break;
        case 'PM3133/A':
            PM3133_A_Json = JSON.parse(message);
            //console.log('get PM3133/A message: %s', message)
            break; 
        case 'PM3133/B':
            PM3133_B_Json = JSON.parse(message);
            //console.log('get PM3133/B message: %s', message)
            break; 
        case 'PM3133/C':
            PM3133_C_Json = JSON.parse(message);
            //console.log('get PM3133/C message: %s', message)
            break;      
        
    }
    topic = ""; //目前topic歸零 
    //判斷資料有收到 !=null
    if (DL303_co2!=null && DL303_humi!=null && DL303_temp!=null && DL303_dewp!=null  ){
        insertDL303Data();  
    }
    if (ET7044_DOstatus != null){
        insertET7044Data();
    }
    if (PM3133_A_Json!=null && PM3133_B_Json!=null && PM3133_C_Json!=null ){
        insertPM3133Data();  
    }
})

//Insert DL303 mqtt data to mongo
function insertDL303Data() {
    var date = new Date();
    dataInsertTime = date.getTime();
    //onsole.log('insert DL303\'s data to mongodb...');
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

//Insert ET7044 mqtt data to mongo
function insertET7044Data() {
    var date = new Date();
    et7044dataInsertTime = date.getTime();
    //console.log('insert ET7044\'s  data to mongodb...');
    //console.log(ET7044_DOstatus);
    var collection = db.collection('ET7044');
    collection.insert({
        DOstatus:ET7044_DOstatus,
        InsertTime:et7044dataInsertTime,
    })
    //清除資料
    ET7044_DOstatus=null;
};

//Insert PM3133 mqtt data to mongo
function insertPM3133Data() {
    var date = new Date();
    dataInsertTime = date.getTime();
    //console.log('insert PM3133\'s data to mongodb...');
    var collection = db.collection('PM3133');
    collection.insert({
        PM3133_A:PM3133_A_Json,
        PM3133_B:PM3133_B_Json,
        PM3133_C:PM3133_C_Json,
    })
    //清除資料
    PM3133_A_Json=null;
    PM3133_B_Json=null;
    PM3133_C_Json=null;
};

