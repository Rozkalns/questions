const converter = new showdown.Converter();
const reloadButton = document.querySelector( '.reload' );
const reloadSvg = document.querySelector( 'svg' );
const question = document.getElementById('question');
const links = document.querySelector('.links');

const mapping = {
  'interview12': {
    'gid': 165972876,
    'ejuz' : 'g4et'
  }, // grade 12, 10/60
  'monologue12': {
    'gid': 606603779,
    'ejuz' : 'i5gp'
  } , // grade 12 120/300
  'dialogue9': {
    'gid': 361983600,
    'ejuz' : 'pzzm'
  }, // grade 9 60/420
  'interview9': {
    'gid': 1311882750,
    'ejuz' : 'y2ex'
  }, // grade 10/60
}

let array = [];

var rotation = 0;
var palettes = [
  "#B3CC57",
  "#ECF081",
  "#FFBE40",
  "#EF746F",
  "#AB3E5B"
]
var currentPalette = 0;

// Functions

Array.prototype.diff = function(a) {
    return this.filter(function(i) {return a.indexOf(i) < 0;});
};

String.prototype.unquoted = function () {
  return this.replace (/(^")|("$)/g, '');
}

String.prototype.capitalize = function() {
  return this.charAt(0).toUpperCase() + this.slice(1)
}

function reload() {
  reloadClick();
  pause(200).then(write);
}

function reloadClick() {
  reloadEnabled = false;
  rotation -= 180;
  
  // Eh, this works.
  reloadSvg.style.webkitTransform = 'translateZ(0px) rotateZ( ' + rotation + 'deg )';
  reloadSvg.style.MozTransform  = 'translateZ(0px) rotateZ( ' + rotation + 'deg )';
  reloadSvg.style.transform  = 'translateZ(0px) rotateZ( ' + rotation + 'deg )';
  
  currentPalette = currentPalette + 1;
  currentPalette = currentPalette % palettes.length;
  document.body.style.background = palettes[currentPalette];
  
  question.style.opacity = 0;
}

function fetchClass() {
  links.style.display = 'none';

  let pickedLesson = hash();
  question.classList.add(pickedLesson);
  fetchItem(mapping[pickedLesson]);
}

function fetchItem(id) {
  if (id === null || typeof id !== 'object') {
    question.innerHTML = 'Izvēlies klasi...';
    return;
  }

  let url = `https://docs.google.com/spreadsheets/d/1C8wqEI2iXL50fE3CwU5VDS_FZbvOeFy8UwQuhKD7jaQ/export?exportFormat=csv&single=true&gid=${id.gid}`;
  
  fetch(url).then(function(response){
      return response.text();
    })
    .then(function(text){
      if (!text.length) {
        write();
        return;
      }
      array = text.match(/[^\r\n]+/g).map(t => t.unquoted());
      write();
    })
    .catch(function(err){
      console.log(err);  
    });
}

function write() {
  let text = '';
  if (!array.length) {
    text = 'te nekā nav...'
  } else {
    text = pickText(); 
  }
  
  question.style.opacity = 1;
  question.innerHTML = text;
}

function makeLinks() {
  if (!hash()) {
    Object.keys(mapping).forEach(function (key) {
      const item = mapping[key];
      const human = key.match(/\d+|\D+/g).map(i => i.capitalize()).join(' ');
      const short = `https://ej.uz/${item.ejuz}`;

      let copy = document.createElement('span');
      copy.innerText = '🔗';
      copy.classList.add('copy');

      copy.addEventListener('click', (e) => {
        copyToClipboard(short)
        successCopy(e.target);
      });

      let box = document.createElement('div');
      box.innerHTML = `
        <a href="#${key}" class="title">${human}</a><br>
        ${short} 
      `

      box.append(copy);
      links.append(box)
    });
  }
}

function hash() {
  return window.location.hash.replace(/^#/, '');
}

function qs(param) {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  return urlParams.get(param)
}

function pickText() {
  if (!hash()) {
    return;
  }

  const topics = array.filter(t => t.length && t.toUpperCase() === t);
  const questions = array.diff(topics);
  const randomQuestionIndex =  Math.floor(Math.random() * questions.length)
  
  let pickedLine = questions[randomQuestionIndex];
  if (hash() === 'dialogue9') {
    pickedLine = pickedLine.replace(/\s\u2022\s/g, "\n- ");
  }

  if (topics.length) {
    const lookupPart = array.slice(0,array.indexOf(pickedLine)).reverse();
    const topicIndex = lookupPart.findIndex(isTopicName);
    const topic = lookupPart[topicIndex];

    pickedLine =  `**${topic}**<br>${pickedLine}`;
  }

  return converter.makeHtml(pickedLine);
}

function successCopy(el) {
  let ok = document.createElement('span');
  ok.innerText = "👍";
  ok.style.fontSize = '1em';

  el.after(ok);

  pause(1200).then(() => {
    ok.remove();
  });

}

const copyToClipboard = str => {
  const el = document.createElement('textarea');
  el.value = str;
  el.setAttribute('readonly', '');
  el.style.position = 'absolute';
  el.style.left = '-9999px';
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
};

const pause = time => new Promise(resolve => setTimeout(resolve, time))
const isTopicName = t => t.toUpperCase() === t;

makeLinks();
if (hash()) {
  fetchClass();
}

// Events
reloadButton.addEventListener('click', reload);
window.addEventListener("hashchange", fetchClass, false);

// Show button.
setTimeout(function() {
  reloadButton.classList.add('active');
}, 1);
