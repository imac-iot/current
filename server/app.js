var koa = require('koa');
var Router = require('koa-router');
var logger = require('koa-logger');
var SerialPort = require("serialport");
var app = koa();
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
var voMeasured = 0;
port.on('open', function () {
  console.log('connect');
  setTimeout(function(){
    io.sockets.on('connection', function (client) {
    port.on('data', function (data) {
      console.log(data);
      SerialPort_data = JSON.parse(data);
      humi = SerialPort_data.Humidity;
      temp = SerialPort_data.Temperature;
      currents = SerialPort_data.currents;
      voMeasured = SerialPort_data.RawSignalValue;
          power = power + currents * 110 / 3600 / 1000;
          money = power * price;
          console.log("Humidity: " + humi);
          console.log("Temperature: " + temp);
          console.log("---------------------");
          console.log("Currents: " + currents);
          console.log("power: "+power);
          console.log("money: "+money);
          console.log("---------------------");
          console.log('Raw Signal Value (0-1023): '+voMeasured);
          calcVoltage = voMeasured * (5.0 /1024.0);
          console.log('calcVoltage: '+calcVoltage);
          dustDensity = (0.17 * calcVoltage -0.1)*1000;
          console.log('dustDensity: '+dustDensity);
          console.log("---------------------");

           client.emit('dustDensity', {
            date: dustDensity
          })
          client.emit('voMeasured', {
            date: voMeasured
          })
           client.emit('calcVoltage', {
            date: calcVoltage
          })
          client.emit('dustDensity', {
            date: dustDensity
          })
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
          console.log(typeof (data));
          client.on('client_data', function (data) { // 接收來自於瀏覽器的資料
            price = data.data;
          });
        });
    });
  },3000);
});

router.get('/', function* index() {
  this.body = yield render('index');
});
app.use(serve('./views'));
app.use(router.middleware());
server.listen(3000, function () {
  console.log('listening on port 3000');
});
