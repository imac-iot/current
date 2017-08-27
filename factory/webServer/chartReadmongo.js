var koa = require('koa');
var app = koa();
var server = require('http').createServer(app.callback());
var Router = require('koa-router');
var bodyparser = require('koa-bodyparser');
var chart = require('chart.js');
var views = require('co-views');
var mqtt = require('mqtt');
var io = require('socket.io')(server);
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var db;
MongoClient.connect("mongodb://localhost:27017/Factory", function (err, pDb) {
    if (err) {
        return console.dir(err);
    }
    db = pDb;
});
var router = new Router();
const logger = require('koa-logger');
//mqtt
var client = mqtt.connect('mqtt://60.249.15.85:1883');
//var client = mqtt.connect('mqtt://10.28.120.17');
client.on('connect', function () {
    console.log('connect to MQTT server');
    client.subscribe('ET7044/DOstatus');
});
//socket.io on
var DO_json ;
var DO1;
var D02;
var D03;
var D04;
var D05;
var D06;
var D07;
var D08;
var selectStatus = "";
var tempSetting;
io.on('connection', function (socket) {
    console.log('socket.io connected');
    client.on('message', function (topic, msg) {
        //console.log('receive topic: ' + topic );
        DO_json = JSON.parse(msg);
        //console.log(DO_json);
        D01 = DO_json[0];
        D02 = DO_json[1];
        D03 = DO_json[2];
        D04 = DO_json[3];
        D05 = DO_json[4];
        D06 = DO_json[5];
        D07 = DO_json[6];
        D08 = DO_json[7];
        socket.emit('DO3btn',{
            data:selectStatus
        })
        socket.emit('isAuto',{
            data:selectStatus
        })
        socket.emit('tempSetting',{
            data:tempSetting
        })
        socket.emit('ET7044_DO1', {
            data: D01
        })
        socket.emit('ET7044_DO2', {
            data: D02
        })
        socket.emit('ET7044_DO3', {
            data: D03
        })
        socket.emit('ET7044_DO4', {
            data: D04
        })
        socket.emit('ET7044_DO5', {
            data: D05
        })
        socket.emit('ET7044_DO6', {
            data: D06
        })
        socket.emit('ET7044_DO7', {
            data: D07
        })
        socket.emit('ET7044_DO8', {
            data: D08
        })
    });
});

//mongo db DL303 collection data array
var temp = new Array();
var humi = new Array();
var time = new Array();
var co2 = new Array();
var dl303num = new Array();

//mongo db PM3133 collection data array
var A_JSON = new Array();
var B_JSON = new Array();
var C_JSON = new Array();
// PM3133_A DATA:
var PM3133V_a = new Array();
var PM3133I_a = new Array();
var PM3133kW_a = new Array();
var PM3133kvar_a = new Array();
var PM3133kVA_a = new Array();
// PM3133_B DATA:
var PM3133V_b = new Array();
var PM3133I_b = new Array();
var PM3133kW_b = new Array();
var PM3133kvar_b = new Array();
var PM3133kVA_b = new Array();

// PM3133_C DATA:
var PM3133V_c = new Array();
var PM3133I_c = new Array();
var PM3133kW_c = new Array();
var PM3133kvar_c = new Array();
var PM3133kVA_c = new Array();
var pm3133num = new Array();

var showPM3133data = function showPM3133data(done) {
    var collection = db.collection('PM3133');
    collection.find({}).sort( { InsertTime: -1 }).limit(30).toArray(function (err, data) {
        for (var i = 0; i < data.length; i++) {
            A_JSON[i] = data[i].PM3133_A,
            B_JSON[i] = data[i].PM3133_B,
            C_JSON[i] = data[i].PM3133_C,
            pm3133num[i] = i;
            // PM3133 A
            PM3133V_a[i] = A_JSON[i]['V_a'];
            PM3133I_a[i] = A_JSON[i]['I_a'];
            PM3133kW_a[i] = A_JSON[i]['kW_a'];
            PM3133kvar_a[i] = A_JSON[i]['kvar_a'];
            PM3133kVA_a[i] = A_JSON[i]['kVA_a'];

            // PM3133 B
            PM3133V_b[i] = B_JSON[i]['V_b'];
            PM3133I_b[i] = B_JSON[i]['I_b'];
            PM3133kW_b[i] = B_JSON[i]['kW_b'];
            PM3133kvar_b[i] = B_JSON[i]['kvar_b'];
            PM3133kVA_b[i] = B_JSON[i]['kVA_b'];

            // PM3133 C
            PM3133V_c[i] = C_JSON[i]['V_c'];
            PM3133I_c[i] = C_JSON[i]['I_c'];
            PM3133kW_c[i] = C_JSON[i]['kW_c'];
            PM3133kvar_c[i] = C_JSON[i]['kvar_c'];
            PM3133kVA_c[i] = C_JSON[i]['kVA_c'];

        }
        done();
    });
};

//SHOW DL303 DATA FUNC
var showDL303data = function showDL303data(done) {
    var collection = db.collection('DL303');
    collection.find({}).limit(20).sort( { InsertTime: -1 } ).toArray(function (err, data) {
        for (var i = 0; i < data.length; i++) {
            co2[i] = data[i].CO2,
                temp[i] = data[i].Temperature,
                humi[i] = data[i].Humidity,
                time[i] = data[i].InsertTime,
                dl303num[i] = i;
        }
        done();
    });
};

var render = views(__dirname, {
    map: {
        html: 'swig'
    }
});
router.get('/', function* () {
    yield showDL303data;
    this.body = yield render("index", {
        //KEY:Currents ; Value:currents
        "CO2": co2,
        "Temperature": temp,
        "Humidity": humi,
        "Inserttime": time,
        "dl303num": dl303num,
        "selectStatus": selectStatus,
    });
});

router.get('/PM3133', function* () {
    yield showPM3133data;
    this.body = yield render("PM3133", {
        //"KEY": Value:
        "PM3133V_a": PM3133V_a,
        "PM3133I_a": PM3133I_a,
        "PM3133kvar_a": PM3133kvar_a,
        "PM3133kW_a": PM3133kW_a,
        "PM3133kVA_a": PM3133kVA_a,

        "PM3133V_b": PM3133V_b,
        "PM3133I_b": PM3133I_b,
        "PM3133kvar_b": PM3133kvar_b,
        "PM3133kW_b": PM3133kW_b,
        "PM3133kVA_b": PM3133kVA_b,

        "PM3133V_c": PM3133V_c,
        "PM3133I_c": PM3133I_c,
        "PM3133kvar_c": PM3133kvar_c,
        "PM3133kW_c": PM3133kW_c,
        "PM3133kVA_c": PM3133kVA_c,
        "pm3133num": pm3133num,
    });
});
//btn control I/O dev
var DObtnSwitch;
router.post('/', function* () {
    DO = this.request.body.dataBtn;
    console.log(DO_json);
    var a;
    if(DO == "DO1")
    { a = 0;}
     if(DO == "DO2")
    { a = 1;}
    if(DO == "DO3")
    {a = 2;}
    if(DO == "DO4")
    {a = 3;}
    if(DO == "DO5")
    {a = 4;}
    if(DO == "DO6")
    {a = 5;}
    if(DO == "DO7")
    { a = 6;}
    if(DO == "DO8")
    {a = 7;}
    DO_json[a] = !DO_json[a];
    console.log(DO_json);
    mqttpub_DO= JSON.stringify(DO_json);
    client.publish('ET7044/write',mqttpub_DO);
    this.redirect('/');
});

//get input , checkbox msg  and then insert to mongo;
router.post('/isAuto',function * (){
    isAutoSelect = this.request.body;
    selectStatus = isAutoSelect["checkSelect"];// input name = tempSet
    tempSetting = isAutoSelect["tempSet"];//input name = checkSelect
    var date = new Date();
    selectInsertTime = date.getTime();
    var collection = db.collection('selectCheckbox');
    if(selectStatus != "on"){ 
        selectStatus = "off"
    }
    if(tempSetting != ""){ 
        collection.insert({
            checkSelect:selectStatus,
            tempAutoSetting:isAutoSelect["tempSet"],
            InsertTime:selectInsertTime,
        })
    }else{
      collection.insert({
          checkSelect:selectStatus,
          tempAutoSetting:"0",
          InsertTime:selectInsertTime,
      })
    }
    this.redirect('/');
})
app.use(bodyparser());
app.use(router.middleware());
server.listen(5500, function () {
    console.log('listening on port 5500');
});
