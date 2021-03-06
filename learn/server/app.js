var koa = require('koa');
var Router = require('koa-router');
var logger = require('koa-logger');
var SerialPort = require("serialport");
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

MongoClient.connect("mongodb://localhost:27017/sensors",function(err,pDb){
  if(err){
    return console.dir(err);
  }
  db = pDb;
});

var port = new SerialPort(config.serialport, {
  parser: SerialPort.parsers.readline('\r\n')
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
var currentAry = new Array(24);
// var currents = new Array();
// var temp = new Array();
// var humi = new Array();
// var time = new Array();
// var num = new Array();
// arduino data insert
function plusdata(){
  var collection = db.collection('datas');
     collection.insert({
      Humidity:humi,
      Temperature:temp,
      Currents:currents,
      inserttime:date.getTime(),
    });
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

//open arduino port
port.on('open', function () {
  console.log('connect');
  setTimeout(function(){
    io.sockets.on('connection', function (client) {
    port.on('data', function (data) {
      date = new Date(); //get serial port data
      SerialPort_data = JSON.parse(data); //serial print turn to JSON -> serialPort_data
      humi = SerialPort_data.Humidity;  //get data.Humidity (json)
      temp = SerialPort_data.Temperature; //get data.Temperature (json)
      currents = SerialPort_data.currents; //get data.currents (json)
      currentAry.shift();
      currentAry.push(currents);
      plusdata(); // call mongo insert func
          power = power + currents * 110 / 3600 / 1000;
          money = power * price;
          // console.log("Humidity: " + humi);
          // console.log("Temperature: " + temp);
          // console.log("---------------------");
          // console.log("Currents: " + currents);
          // console.log("power: "+power);
          // console.log("money: "+money);
          // console.log("---------------------");

         //socket.io s
          client.emit('humi', {
            date: humi
          })
          client.emit('temp', {
            date: temp
          })
          client.emit('event', {
            date: currents
          }); //發送資料
          client.emit('power', {
            date: power
          }); //發送資料
          client.emit('price', {
            date: price
          }); //發送資料
          client.emit('money', {
            date: money
          }); //發送資料
          // client.emit('currentLine', {
          //   data: currentAry
          // }); //發送資料
          client.on('client_data', function (data) { // 接收來自於瀏覽器的資料
            price = data.data;
          });
        });
    });
  },2000);
});

router.get('/', function* index() {
  this.body = yield render('index');
});
router.get('/line',function * (){
  var startTime = new Date().getTime() - 86400000;
  var endTime = new Date().getTime();
  var countAry = 23 - new Date().getHours();
  var currentAry = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
  var temperatureAry = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
  var humidityAry = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
  var timeAry = new Array();

  console.log(startTime);
  console.log(endTime);
  console.log(countAry);
  yield function count(done){
    var collection = db.collection('datas');
    collection.find({"inserttime":{"$gte":startTime,"$lte":endTime}}).toArray(function (err, data) {
        for(var i=0 ; i<data.length ; i++){
          var hours = new Date(data[i].inserttime).getHours();
          currentAry[hours+countAry]=currentAry[hours+countAry]+data[i].Currents*220/1000/60/60;
          temperatureAry[hours+countAry]=(temperatureAry[hours+countAry]+data[i].Temperature)/2;
          humidityAry[hours+countAry]=(humidityAry[hours+countAry]+data[i].Humidity)/2;
        }
        console.log(currentAry);
        console.log(temperatureAry);
        console.log(humidityAry);
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
                                        temperatureAry:temperatureAry,
                                        humidityAry:humidityAry,
                                        timeAry:timeAry});
});

app.use(serve('./views'));
app.use(router.middleware());
server.listen(3000, function () {
  console.log('listening on port 3000');
});
