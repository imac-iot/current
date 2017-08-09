var mqtt = require('mqtt');
var client = mqtt.connect();

A = {
    "V_a": 1,
    "I_a": 2,
    "kW_a": 3,
    "kvar_a": 4,
    "kVA_a": 5
}

Ajson = JSON.stringify(A);
console.log(typeof(Ajson));
AjsonStr = Ajson.toString();
console.log(Ajson);



B = {
    "V_b": 1,
    "I_b": 2,
    "kW_b": 3,
    "kvar_b": 4,
    "kVA_b": 5
}

Bjson = JSON.stringify(A);
console.log(typeof(Bjson));
BjsonStr = Ajson.toString();
console.log(Ajson);


C = {
    "V_c": 1,
    "I_c": 2,
    "kW_c": 3,
    "kvar_c": 4,
    "kVA_c": 5
}

Bjson = JSON.stringify(A);
console.log(typeof(Bjson));
BjsonStr = Ajson.toString();
console.log(Ajson);


client.on('connect', function () {
    console.log('connect to MQTT server');
    client.publish('PM3133/A', Ajson);
    client.publish('PM3133/B', Bjson);
    client.publish('PM3133/B', Bjson);
});
