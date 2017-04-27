const EventEmitter = require('events');

const NORDIC_SERVICE = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";
const NORDIC_TX = "6e400002-b5a3-f393-e0a9-e50e24dcca9e";
const NORDIC_RX = "6e400003-b5a3-f393-e0a9-e50e24dcca9e";
const CHUNKSIZE = 16;

class Puck extends EventEmitter {
  constructor(device) {
    super();

    this.device = device;
    this.queue = [];

    device.addEventListener('gattserverdisconnected', e => {
      this.emit('gattserverdisconnected', e);
      this.close();
    });

    this.addCharacteristic = this.addCharacteristic.bind(this);
    this.write = this.write.bind(this);
    this._writeChunk = this._writeChunk.bind(this);
    this.close = this.close.bind(this);
  }

  addCharacteristic(characteristic) {
    this.characteristic = characteristic;

    characteristic.addEventListener('characteristicvaluechanged', e => {
      this.emit('characteristicvaluechanged', ab2str(e.target.value.buffer), e);
    });
  }

  write(data) {
    return new Promise((resolve, reject) => {
      this.queue.push({data, resolve, reject});
      if (this.queue.length === 1) {
        this._writeChunk();
      }
    });
  }

  _writeChunk() {
    const item = this.queue[0];
    let chunk;

    if (item.data.length <= CHUNKSIZE) {
      chunk = item.data;
      item.data = '';
    } else {
      chunk = item.data.substr(0, CHUNKSIZE);
      txItem.data = txItem.data.substr(CHUNKSIZE);
    }

    this.characteristic.writeValue(str2ab(chunk)).then(() => {
      if (!item.data) {
        this.queue.shift();
        item.resolve();
      }

      this._writeChunk();
    }).catch(() => {
      item.reject();
      this.close();
      this.queue = [];
    });
  }

  close() {
    this.server.disconnect();
  }
}

export function connect() {
  let puck;

  return navigator.bluetooth.requestDevice({
    filters:[
      { namePrefix: 'Puck.js' },
      { namePrefix: 'Espruino' },
      { services: [ NORDIC_SERVICE ] }
    ], optionalServices: [ NORDIC_SERVICE ]
  }).then(device => {
    puck = new Puck(device);
    return device.gatt.connect();
  }).then(server => {
    puck.server = server;
    return server.getPrimaryService(NORDIC_SERVICE);
  }).then(service => {
    puck.service = service;
    return service.getCharacteristic(NORDIC_RX);
  }).then(characteristic => {
    puck.addCharacteristic(characteristic);
    return characteristic.startNotifications();
  }).then(() => puck);
}

function ab2str(buf) {
  return String.fromCharCode.apply(null, new Uint8Array(buf));
}

function str2ab(str) {
  const buffer = new ArrayBuffer(str.length);
  const bufView = new Uint8Array(buf);

  for (var i=0, strLen=str.length; i<strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }

  return buffer;
}

