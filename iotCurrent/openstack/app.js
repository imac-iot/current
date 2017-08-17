var koa = require('koa');
var Router = require('koa-router');
var logger = require('koa-logger');
var mqtt  = require('mqtt');            //192.168.8.126
var views = require('co-views');
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var app = koa();
var server = require('http').createServer(app.callback());
var io = require('socket.io')(server);
var serve = require('koa-static');
var config = require('./config.js');
var render = require('./lib/render.js');
var db;

MongoClient.connect("mongodb://10.28.120.39:27017/sensors",function(err,pDb){
  if(err){
    return console.dir(err);
  }
  db = pDb;
});

var mqttClient  = mqtt.connect('mqtt://10.28.120.17');
mqttClient.on('connect', function () {
  console.log('on connect');
  mqttClient.subscribe('current');
});

var router = new Router();
app.use(logger());

// define init value
var power = 0;
var money = 0;
var price = 1.63;
var humi = 0;
var temp = 0;
var currents = 0;

// arduino data insert
function plusdata(){
  var collection = db.collection('datas');
  if(humi && temp && currents){
     collection.insert({
      Humidity:humi,
      Temperature:temp,
      Currents:currents,
      inserttime:date.getTime(),
    });
  }
    console.log('insert ok');
};
//mongo data find
function showdata() {
    var collection = db.collection('datas');
    collection.find({}).toArray(function (err, data) {
        for (var i = 0; i < data.length; i++) {
            currents[i] = data[i].Currents,
                temp[i] = data[i].Temperature,
                humi[i] = data[i].Humidity,
                time[i] = data[i].inserttime,
                num[i] = i;
            console.log('current: '+currents[i]);
            console.log('Temperature: '+temp[i]);
            console.log('Humidity: '+humi[i]);
            console.log('Inserttime: '+time[i]);
        }
    });
};

mqttClient.on('message', function (topic, message) {
  date = new Date(); //get serial port data
  mqtt_data = JSON.parse(message); //serial print turn to JSON -> serialPort_data
  // console.log(typeof(mqtt_data.Humidity));
  if(typeof(mqtt_data.Humidity) == "number" && typeof(mqtt_data.Temperature) == "number" && typeof(mqtt_data.currents)=="number"){
    // console.log(mqtt_data);
    humi = mqtt_data.Humidity;  //get data.Humidity (json)
    temp = mqtt_data.Temperature; //get data.Temperature (json)
    currents = mqtt_data.currents; //get data.currents (json)
    plusdata(); // call mongo insert func
    // console.log(power);
    power = power + currents * 220 / 3600 / 1000;
    money = power * price;
  }
});

io.sockets.on('connection', function (client) {
    mqttClient.on('message', function (topic, message) {
      if(typeof(mqtt_data.Humidity) == "number" && typeof(mqtt_data.Temperature) == "number" && typeof(mqtt_data.currents)=="number"){
        // console.log(message.toString());
         //socket.io s
          client.emit('humi', {
            data: humi
          })
          client.emit('temp', {
            data: temp
          })
          client.emit('event', {
            data: currents
          }); //發送資料
          client.emit('power', {
            data: power
          }); //發送資料
          client.emit('price', {
            data: price
          }); //發送資料
          client.emit('money', {
            data: money
          }); //發送資料
          client.on('client_data', function (data) { // 接收來自於瀏覽器的資料
            price = data.data;
          });
      }
    });
});

router.get('/', function* index() {
  var collection = db.collection('datas');
  yield function(done){
    var countPower = 0;
    collection.find({}).toArray(function (err, data) {
        // console.log(data);
        for(var i=0 ; i<data.length ; i++){
          countPower = countPower + data[i].Currents*220/3600/1000;
        }
        console.log(countPower);
        power=countPower;
        done();
    });
    // setTimeout(function(){
    //   done();
    // },6000);
  }
  this.body = yield render('home');
});

router.get('/line',function * (){
  var nowMinute = new Date().getMinutes() * 60 * 1000;
  var nowSeconds = new Date().getSeconds() * 1000;
  var startTime = new Date().getTime() - (82800000+nowMinute+nowSeconds);
  var endTime = new Date().getTime();
  var todayHours = 23 - new Date().getHours();
  var yesterdayHours = new Date().getHours() + 1;
  var currentAry = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
  var powerAry = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
  var temperatureAry = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
  var humidityAry = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
  var timeAry = new Array();

  // console.log(startTime);
  // console.log(endTime);
  // console.log(todayHours);
  // console.log(yesterdayHours);
  yield function count(done){
    var collection = db.collection('datas');
    collection.find({"inserttime":{"$gte":startTime,"$lte":endTime}}).toArray(function (err, data) {
        for(var i=0 ; i<data.length ; i++){
          var hours = new Date(data[i].inserttime).getHours();
          // console.log(hours);
          if(hours<=new Date().getHours()){
            currentAry[hours+todayHours]=(currentAry[hours+todayHours]+data[i].Currents)/2;
            powerAry[hours+todayHours]=powerAry[hours+todayHours]+data[i].Currents*220/1000/60/60;
            temperatureAry[hours+todayHours]=(temperatureAry[hours+todayHours]+data[i].Temperature)/2;
            humidityAry[hours+todayHours]=(humidityAry[hours+todayHours]+data[i].Humidity)/2;
          }else{
            currentAry[hours-yesterdayHours]=(currentAry[hours-yesterdayHours]+data[i].Currents)/2;
            powerAry[hours-yesterdayHours]=powerAry[hours-yesterdayHours]+data[i].Currents*220/1000/60/60;
            temperatureAry[hours-yesterdayHours]=(temperatureAry[hours-yesterdayHours]+data[i].Temperature)/2;
            humidityAry[hours-yesterdayHours]=(humidityAry[hours-yesterdayHours]+data[i].Humidity)/2;
          }
        }
        // console.log(powerAry);
        // console.log(temperatureAry);
        // console.log(humidityAry);
        for(var i=23 ; i>=0 ; i--){
          var count = new Date(endTime).getHours()+i-23;
          if(count>=0){
            timeAry[i]=count;
          }else{
            timeAry[i]=24+count;
          }
          done();
        }
    });
  }
  this.body = yield render('lineChart',{currentAry:currentAry,
                                        powerAry:powerAry,
                                        temperatureAry:temperatureAry,
                                        humidityAry:humidityAry,
                                        timeAry:timeAry});
});

app.use(serve('./views'));
app.use(router.middleware());
server.listen(3000, function () {
  console.log('listening on port 3000');
});
