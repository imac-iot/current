var koa = require('koa');
var Router = require('koa-router');
var logger = require('koa-logger');
var SerialPort = require("serialport");
var views = require('co-views');
var app = koa();
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var db;
MongoClient.connect("mongodb://localhost:27017/sensors",function(err,pDb){
  if(err){
    return console.dir(err);
  }
  db = pDb;
});
var server = require('http').createServer(app.callback());
var io = require('socket.io')(server);
var serve = require('koa-static');
var config = require('./config.js');
var render = require('./lib/render.js');
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
// arduino data insert
function plusdata(){
  var collection = db.collection('datas');
     collection.insert({
      Humidity:humi,
      Temperature:temp,
      Currents:currents,
      inserttime:date,
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
var currents = new Array();
var temp = new Array();
var humi = new Array();
var time = new Array();
var num = new Array();
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
          client.on('client_data', function (data) { // 接收來自於瀏覽器的資料
            price = data.data;
          });
        });
    });
  },2000);
<<<<<<< HEAD
});

router.get('/', function* index() {
  this.body = yield render('index');
});
=======
});

router.get('/', function* index() {
  this.body = yield render('index');
});
>>>>>>> 31e5223170b74bdd2469d5ade32df813419491e5
app.use(serve('./views'));
app.use(router.middleware());
server.listen(3000, function () {
  console.log('listening on port 3000');
});