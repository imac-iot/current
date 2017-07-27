var koa = require('koa');
var Router = require('koa-router');
var logger = require('koa-logger');
var SerialPort = require("serialport");
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
var power = 0;
var money = 0;
var price = 1.63;
var humi = 0;
var temp = 0;
var currents = 0;
function plusdata(){
  var collection = db.collection('datas');
     collection.insert({
      Humidity:humi,
      Temperature:temp,
      Currents:currents,
      // inserttime:date,
    });
    console.log('insert ok');
};

port.on('open', function () {
  console.log('connect');
  setTimeout(function(){
    io.sockets.on('connection', function (client) {
    port.on('data', function (data) {
      date = new Date();
      SerialPort_data = JSON.parse(data);
      humi = SerialPort_data.Humidity;
      temp = SerialPort_data.Temperature;
      currents = SerialPort_data.currents;
      plusdata();
          power = power + currents * 110 / 3600 / 1000;
          money = power * price;
          console.log("Humidity: " + humi);
          console.log("Temperature: " + temp);
          console.log("---------------------");
          console.log("Currents: " + currents);
          console.log("power: "+power);
          console.log("money: "+money);
          console.log("---------------------");         
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
});

router.get('/', function* index() {
  this.body = yield render('index');
});
app.use(serve('./views'));
app.use(router.middleware());
server.listen(3000, function () {
  console.log('listening on port 3000');
});