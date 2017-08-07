var buffer = new ArrayBuffer(4);
var bytes = new Uint8Array(buffer);
bytes[0] = 0;
bytes[1] = 0;
bytes[2] = 0;
bytes[3] = 1; 
var view = new DataView(buffer);

console.log(view.getFloat32(0, false));