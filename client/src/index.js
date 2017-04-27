import {connect} from './puck';

const pucks = [];

function render() {
  const html = [
    '<button id="add">Add a device</button>',
    '<ul>',
      pucks.map(renderPuck).join(''),
    '</ul>',
  ].join('');

  document.documentElement.innerHTML = html;

  document
    .querySelector('#add')
    .addEventListener('click', createPuck);
}

function renderPuck(p, i) {
  return `<li>Puck ${i}</li>`
}

function createPuck() {
  connect().then(puck => {
    pucks.push(puck);

    puck.on('characteristicvaluechanged', e => {
      const sound = chooseSound(parseFloat(e));
      playSound(sound);
    });

    puck.on('gattserverdisconnected', () => {
      const index = pucks.findIndex(puck);
      pucks.splice(index, 1);
    });

    render();
  }).catch(e => {
    console.error(e);
  });
}

const context = new AudioContext();
const sounds = [
  {name: 'yeepee.mp3'},
  {name: 'ididit.mp3'}
];
function chooseSound(f) {
  return sounds[Math.floor(Math.min(f, sounds.length * 250 - 1) / 250)]
}

function playSound(sound) {

  (sound.file ? Promise.resolve(sound.file) : new Promise((res, rej) => {
    fetch(`sounds/${sound.name}`)
      .then(r => r.arrayBuffer())
      .then(buffer => {
        context.decodeAudioData(buffer, data => {
          sound.file = data;
          res(data);
        });
      })
      .catch(rej);
  })).then(fileBuffer => {
    var source = context.createBufferSource();
    source.buffer = fileBuffer;
    source.connect(context.destination);
    source.start();
  });
}

render();

